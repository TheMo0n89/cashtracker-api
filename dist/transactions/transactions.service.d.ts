import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto, UpdateTransactionDto, FilterTransactionsDto } from './dto';
import { CategoriesService } from '../categories/categories.service';
export declare class TransactionsService {
    private readonly repo;
    private readonly categoriesService;
    private readonly eventEmitter;
    private readonly configService;
    private readonly logger;
    private readonly invoiceRoot;
    private readonly invoiceBucket;
    private readonly supabase;
    constructor(repo: Repository<Transaction>, categoriesService: CategoriesService, eventEmitter: EventEmitter2, configService: ConfigService);
    findAll(userId: string, filters: FilterTransactionsDto): Promise<{
        items: Transaction[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    findByIdAndUser(id: string, userId: string): Promise<Transaction>;
    create(userId: string, dto: CreateTransactionDto): Promise<Transaction>;
    update(id: string, userId: string, dto: UpdateTransactionDto): Promise<Transaction>;
    remove(id: string, userId: string): Promise<void>;
    attachInvoice(id: string, userId: string, file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }): Promise<Transaction>;
    getInvoiceFile(id: string, userId: string): Promise<{
        buffer: Buffer<ArrayBuffer>;
        fileName: string;
        mimeType: string;
    }>;
    removeInvoice(id: string, userId: string): Promise<void>;
    private deleteInvoiceFile;
    private buildInvoiceStoragePath;
    private toSupabaseFilePath;
    private parseSupabaseFilePath;
    private normalizeCalendarDate;
}
