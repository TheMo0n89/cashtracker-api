"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const fs_1 = require("fs");
const path_1 = require("path");
const supabase_js_1 = require("@supabase/supabase-js");
const transaction_entity_1 = require("./entities/transaction.entity");
const exceptions_1 = require("../shared/exceptions");
const categories_service_1 = require("../categories/categories.service");
const transaction_events_1 = require("./events/transaction.events");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    repo;
    categoriesService;
    eventEmitter;
    configService;
    logger = new common_1.Logger(TransactionsService_1.name);
    invoiceRoot = (0, path_1.join)(process.cwd(), 'storage', 'invoices');
    invoiceBucket;
    supabase;
    constructor(repo, categoriesService, eventEmitter, configService) {
        this.repo = repo;
        this.categoriesService = categoriesService;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        const supabaseUrl = this.configService.get('supabase.url') || '';
        const supabaseSecretKey = this.configService.get('supabase.secretKey') || '';
        this.invoiceBucket =
            this.configService.get('supabase.storageBucket') ||
                'transaction-invoices';
        this.supabase =
            supabaseUrl && supabaseSecretKey
                ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseSecretKey, {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                    },
                })
                : null;
    }
    async findAll(userId, filters) {
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
            qb.andWhere(`(t.description ILIKE :search OR t."paymentPlace" ILIKE :search OR t."invoiceNumber" ILIKE :search OR category.name ILIKE :search OR categoryGroup.name ILIKE :search)`, { search });
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
    async findByIdAndUser(id, userId) {
        const transaction = await this.repo.findOne({
            where: { id, userId },
            relations: { category: true },
        });
        if (!transaction) {
            throw new exceptions_1.ResourceNotFoundException('Transacción');
        }
        return transaction;
    }
    async create(userId, dto) {
        const category = await this.categoriesService.findByIdAndUser(dto.categoryId, userId);
        if (dto.type !== category.type) {
            throw new exceptions_1.TransactionTypeMismatchException();
        }
        const transaction = this.repo.create({
            ...dto,
            amount: dto.amount.toFixed(2),
            date: this.normalizeCalendarDate(dto.date),
            userId,
        });
        const saved = await this.repo.save(transaction);
        this.eventEmitter.emit('transaction.created', new transaction_events_1.TransactionCreatedEvent(userId, saved.id));
        this.logger.log(`Transaction created: ${saved.id} for user ${userId}`);
        return saved;
    }
    async update(id, userId, dto) {
        const transaction = await this.findByIdAndUser(id, userId);
        const newCategoryId = dto.categoryId || transaction.categoryId;
        const newType = dto.type || transaction.type;
        if (dto.categoryId || dto.type) {
            const category = await this.categoriesService.findByIdAndUser(newCategoryId, userId);
            if (newType !== category.type) {
                throw new exceptions_1.TransactionTypeMismatchException();
            }
        }
        const updateData = {};
        if (dto.type !== undefined)
            updateData.type = dto.type;
        if (dto.categoryId !== undefined)
            updateData.categoryId = dto.categoryId;
        if (dto.amount !== undefined)
            updateData.amount = dto.amount.toFixed(2);
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
        this.eventEmitter.emit('transaction.updated', new transaction_events_1.TransactionUpdatedEvent(userId, saved.id));
        return saved;
    }
    async remove(id, userId) {
        const transaction = await this.findByIdAndUser(id, userId);
        await this.deleteInvoiceFile(transaction.invoiceFilePath);
        await this.repo.softRemove(transaction);
        this.eventEmitter.emit('transaction.deleted', new transaction_events_1.TransactionDeletedEvent(userId, id));
    }
    async attachInvoice(id, userId, file) {
        const transaction = await this.findByIdAndUser(id, userId);
        if (!file) {
            throw new common_1.BadRequestException('El archivo PDF es requerido.');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Solo se permiten archivos PDF.');
        }
        const maxBytes = 10 * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new common_1.BadRequestException('El PDF no puede superar 10 MB.');
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
                this.logger.error(`Supabase invoice upload failed for transaction ${id}: ${error.message}`);
                throw new common_1.BadRequestException('No se pudo guardar el PDF de factura en Supabase Storage. Verifica que el bucket exista y que la clave secreta tenga permisos de escritura.');
            }
            transaction.invoiceFilePath = this.toSupabaseFilePath(storagePath);
        }
        else {
            const transactionDir = (0, path_1.join)(this.invoiceRoot, userId, id);
            const absolutePath = (0, path_1.join)(transactionDir, safeName);
            try {
                await fs_1.promises.mkdir(transactionDir, { recursive: true });
                await fs_1.promises.writeFile(absolutePath, file.buffer);
            }
            catch (error) {
                this.logger.error(`Invoice storage write failed for transaction ${id}: ${error instanceof Error ? error.message : String(error)}`);
                throw new common_1.BadRequestException('No se pudo guardar el PDF de factura. Verifica que el backend tenga permisos de escritura sobre la carpeta local storage/invoices.');
            }
            transaction.invoiceFilePath = (0, path_1.join)('storage', 'invoices', userId, id, safeName);
        }
        transaction.invoiceOriginalName = (0, path_1.basename)(file.originalname);
        transaction.invoiceMimeType = file.mimetype;
        transaction.invoiceUploadedAt = new Date();
        return this.repo.save(transaction);
    }
    async getInvoiceFile(id, userId) {
        const transaction = await this.findByIdAndUser(id, userId);
        if (!transaction.invoiceFilePath) {
            throw new exceptions_1.ResourceNotFoundException('Factura');
        }
        const supabaseFile = this.parseSupabaseFilePath(transaction.invoiceFilePath);
        if (supabaseFile) {
            if (!this.supabase) {
                throw new exceptions_1.ResourceNotFoundException('Factura');
            }
            const { data, error } = await this.supabase.storage
                .from(supabaseFile.bucket)
                .download(supabaseFile.path);
            if (error || !data) {
                throw new exceptions_1.ResourceNotFoundException('Factura');
            }
            return {
                buffer: Buffer.from(await data.arrayBuffer()),
                fileName: transaction.invoiceOriginalName || `factura-${id}.pdf`,
                mimeType: transaction.invoiceMimeType || 'application/pdf',
            };
        }
        const absolutePath = (0, path_1.join)(process.cwd(), transaction.invoiceFilePath);
        const buffer = await fs_1.promises.readFile(absolutePath).catch(() => {
            throw new exceptions_1.ResourceNotFoundException('Factura');
        });
        return {
            buffer,
            fileName: transaction.invoiceOriginalName || `factura-${id}.pdf`,
            mimeType: transaction.invoiceMimeType || 'application/pdf',
        };
    }
    async removeInvoice(id, userId) {
        const transaction = await this.findByIdAndUser(id, userId);
        await this.deleteInvoiceFile(transaction.invoiceFilePath);
        transaction.invoiceFilePath = null;
        transaction.invoiceOriginalName = null;
        transaction.invoiceMimeType = null;
        transaction.invoiceUploadedAt = null;
        await this.repo.save(transaction);
    }
    async deleteInvoiceFile(filePath) {
        if (!filePath)
            return;
        const supabaseFile = this.parseSupabaseFilePath(filePath);
        if (supabaseFile) {
            if (!this.supabase)
                return;
            const { error } = await this.supabase.storage
                .from(supabaseFile.bucket)
                .remove([supabaseFile.path]);
            if (error) {
                this.logger.warn(`Supabase invoice delete failed: ${error.message}`);
            }
            return;
        }
        const absolutePath = (0, path_1.join)(process.cwd(), filePath);
        await fs_1.promises.rm(absolutePath, { force: true });
        const parentDir = (0, path_1.dirname)(absolutePath);
        await fs_1.promises.rmdir(parentDir).catch(() => undefined);
    }
    buildInvoiceStoragePath(userId, transactionId, fileName) {
        return `invoices/${userId}/${transactionId}/${fileName}`;
    }
    toSupabaseFilePath(storagePath) {
        return `supabase://${this.invoiceBucket}/${storagePath}`;
    }
    parseSupabaseFilePath(filePath) {
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
    normalizeCalendarDate(value) {
        return value.slice(0, 10);
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        categories_service_1.CategoriesService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map