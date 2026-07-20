import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction } from './entities/transaction.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionsDto,
} from './dto';
import {
  ResourceNotFoundException,
  TransactionTypeMismatchException,
} from '../shared/exceptions';
import { CategoriesService } from '../categories/categories.service';
import {
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionDeletedEvent,
} from './events/transaction.events';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly invoiceRoot = join(process.cwd(), 'storage', 'invoices');
  private readonly invoiceBucket: string;
  private readonly supabase: SupabaseClient | null;

  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
    private readonly categoriesService: CategoriesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('supabase.url') || '';
    const supabaseSecretKey =
      this.configService.get<string>('supabase.secretKey') || '';

    this.invoiceBucket =
      this.configService.get<string>('supabase.storageBucket') ||
      'transaction-invoices';
    this.supabase =
      supabaseUrl && supabaseSecretKey
        ? createClient(supabaseUrl, supabaseSecretKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          })
        : null;
  }

  /**
   * List transactions with pagination and optional filters.
   */
  async findAll(userId: string, filters: FilterTransactionsDto) {
    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .leftJoinAndSelect('category.categoryGroup', 'categoryGroup')
      .where('t."userId" = :userId', { userId })
      .andWhere('t."deletedAt" IS NULL');

    if (filters.type) {
      qb.andWhere('t.type = :type', { type: filters.type });
    }

    if (filters.categoryId) {
      qb.andWhere('t."categoryId" = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.categoryGroupId) {
      qb.andWhere('category."categoryGroupId" = :categoryGroupId', {
        categoryGroupId: filters.categoryGroupId,
      });
    }

    if (filters.dateFrom) {
      qb.andWhere('t.date >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      qb.andWhere('t.date <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.search) {
      const search = `%${filters.search.trim()}%`;
      qb.andWhere(
        `(t.description ILIKE :search OR t."paymentPlace" ILIKE :search OR t."invoiceNumber" ILIKE :search OR category.name ILIKE :search OR categoryGroup.name ILIKE :search)`,
        { search },
      );
    }

    qb.orderBy('t.date', 'DESC')
      .addOrderBy('t.createdAt', 'DESC')
      .skip(filters.skip)
      .take(filters.perPage);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page: filters.page,
        perPage: filters.perPage,
        lastPage: Math.ceil(total / filters.perPage),
      },
    };
  }

  async findByIdAndUser(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.repo.findOne({
      where: { id, userId },
      relations: { category: true },
    });
    if (!transaction) {
      throw new ResourceNotFoundException('Transacción');
    }
    return transaction;
  }

  /**
   * Create a transaction with TYPE COHERENCE validation.
   * The transaction type must match the category type.
   */
  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Validate category ownership and get category
    const category = await this.categoriesService.findByIdAndUser(
      dto.categoryId,
      userId,
    );

    // CRITICAL RULE: Type coherence check
    if (dto.type !== category.type) {
      throw new TransactionTypeMismatchException();
    }

    const transaction = this.repo.create({
      ...dto,
      amount: dto.amount.toFixed(2),
      date: this.normalizeCalendarDate(dto.date),
      userId,
    });

    const saved = await this.repo.save(transaction);

    // Emit domain event for cache invalidation
    this.eventEmitter.emit(
      'transaction.created',
      new TransactionCreatedEvent(userId, saved.id),
    );

    this.logger.log(`Transaction created: ${saved.id} for user ${userId}`);
    return saved;
  }

  /**
   * Update a transaction with TYPE COHERENCE re-validation.
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findByIdAndUser(id, userId);

    // If category or type is being changed, re-validate coherence
    const newCategoryId = dto.categoryId || transaction.categoryId;
    const newType = dto.type || transaction.type;

    if (dto.categoryId || dto.type) {
      const category = await this.categoriesService.findByIdAndUser(
        newCategoryId,
        userId,
      );

      if (newType !== category.type) {
        throw new TransactionTypeMismatchException();
      }
    }

    const updateData: Partial<Transaction> = {};

    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.amount !== undefined) updateData.amount = dto.amount.toFixed(2);
    if (dto.description !== undefined) {
      updateData.description = dto.description || null;
    }
    if (dto.date !== undefined) {
      updateData.date = this.normalizeCalendarDate(dto.date);
    }
    if (dto.paymentPlace !== undefined) {
      updateData.paymentPlace = dto.paymentPlace || null;
    }
    if (dto.invoiceNumber !== undefined) {
      updateData.invoiceNumber = dto.invoiceNumber || null;
    }

    await this.repo.update({ id, userId }, updateData);
    const saved = await this.findByIdAndUser(id, userId);

    this.eventEmitter.emit(
      'transaction.updated',
      new TransactionUpdatedEvent(userId, saved.id),
    );

    return saved;
  }

  /**
   * Soft-delete a transaction.
   */
  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findByIdAndUser(id, userId);
    await this.deleteInvoiceFile(transaction.invoiceFilePath);
    await this.repo.softRemove(transaction);

    this.eventEmitter.emit(
      'transaction.deleted',
      new TransactionDeletedEvent(userId, id),
    );
  }

  async attachInvoice(
    id: string,
    userId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ): Promise<Transaction> {
    const transaction = await this.findByIdAndUser(id, userId);

    if (!file) {
      throw new BadRequestException('El archivo PDF es requerido.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF.');
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException('El PDF no puede superar 10 MB.');
    }

    await this.deleteInvoiceFile(transaction.invoiceFilePath);

    const safeName = `invoice-${Date.now()}.pdf`;

    if (this.supabase) {
      const storagePath = this.buildInvoiceStoragePath(userId, id, safeName);
      const { error } = await this.supabase.storage
        .from(this.invoiceBucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        this.logger.error(
          `Supabase invoice upload failed for transaction ${id}: ${error.message}`,
        );
        throw new BadRequestException(
          'No se pudo guardar el PDF de factura en Supabase Storage. Verifica que el bucket exista y que la clave secreta tenga permisos de escritura.',
        );
      }

      transaction.invoiceFilePath = this.toSupabaseFilePath(storagePath);
    } else {
      const transactionDir = join(this.invoiceRoot, userId, id);
      const absolutePath = join(transactionDir, safeName);

      try {
        await fs.mkdir(transactionDir, { recursive: true });
        await fs.writeFile(absolutePath, file.buffer);
      } catch (error) {
        this.logger.error(
          `Invoice storage write failed for transaction ${id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        throw new BadRequestException(
          'No se pudo guardar el PDF de factura. Verifica que el backend tenga permisos de escritura sobre la carpeta local storage/invoices.',
        );
      }

      transaction.invoiceFilePath = join(
        'storage',
        'invoices',
        userId,
        id,
        safeName,
      );
    }

    transaction.invoiceOriginalName = basename(file.originalname);
    transaction.invoiceMimeType = file.mimetype;
    transaction.invoiceUploadedAt = new Date();

    return this.repo.save(transaction);
  }

  async getInvoiceFile(id: string, userId: string) {
    const transaction = await this.findByIdAndUser(id, userId);

    if (!transaction.invoiceFilePath) {
      throw new ResourceNotFoundException('Factura');
    }

    const supabaseFile = this.parseSupabaseFilePath(transaction.invoiceFilePath);

    if (supabaseFile) {
      if (!this.supabase) {
        throw new ResourceNotFoundException('Factura');
      }

      const { data, error } = await this.supabase.storage
        .from(supabaseFile.bucket)
        .download(supabaseFile.path);

      if (error || !data) {
        throw new ResourceNotFoundException('Factura');
      }

      return {
        buffer: Buffer.from(await data.arrayBuffer()),
        fileName: transaction.invoiceOriginalName || `factura-${id}.pdf`,
        mimeType: transaction.invoiceMimeType || 'application/pdf',
      };
    }

    const absolutePath = join(process.cwd(), transaction.invoiceFilePath);
    const buffer = await fs.readFile(absolutePath).catch(() => {
      throw new ResourceNotFoundException('Factura');
    });

    return {
      buffer,
      fileName: transaction.invoiceOriginalName || `factura-${id}.pdf`,
      mimeType: transaction.invoiceMimeType || 'application/pdf',
    };
  }

  async removeInvoice(id: string, userId: string): Promise<void> {
    const transaction = await this.findByIdAndUser(id, userId);
    await this.deleteInvoiceFile(transaction.invoiceFilePath);

    transaction.invoiceFilePath = null;
    transaction.invoiceOriginalName = null;
    transaction.invoiceMimeType = null;
    transaction.invoiceUploadedAt = null;

    await this.repo.save(transaction);
  }

  private async deleteInvoiceFile(filePath: string | null): Promise<void> {
    if (!filePath) return;

    const supabaseFile = this.parseSupabaseFilePath(filePath);
    if (supabaseFile) {
      if (!this.supabase) return;

      const { error } = await this.supabase.storage
        .from(supabaseFile.bucket)
        .remove([supabaseFile.path]);

      if (error) {
        this.logger.warn(`Supabase invoice delete failed: ${error.message}`);
      }
      return;
    }

    const absolutePath = join(process.cwd(), filePath);
    await fs.rm(absolutePath, { force: true });

    const parentDir = dirname(absolutePath);
    await fs.rmdir(parentDir).catch(() => undefined);
  }

  private buildInvoiceStoragePath(
    userId: string,
    transactionId: string,
    fileName: string,
  ): string {
    return `invoices/${userId}/${transactionId}/${fileName}`;
  }

  private toSupabaseFilePath(storagePath: string): string {
    return `supabase://${this.invoiceBucket}/${storagePath}`;
  }

  private parseSupabaseFilePath(
    filePath: string,
  ): { bucket: string; path: string } | null {
    const prefix = 'supabase://';
    if (!filePath.startsWith(prefix)) {
      return null;
    }

    const location = filePath.slice(prefix.length);
    const slashIndex = location.indexOf('/');
    if (slashIndex <= 0) {
      return {
        bucket: this.invoiceBucket,
        path: location,
      };
    }

    return {
      bucket: location.slice(0, slashIndex),
      path: location.slice(slashIndex + 1),
    };
  }

  private normalizeCalendarDate(value: string): string {
    return value.slice(0, 10);
  }
}
