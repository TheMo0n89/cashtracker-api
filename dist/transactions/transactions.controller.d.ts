import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, FilterTransactionsDto } from './dto';
export declare class TransactionsController {
    private readonly service;
    constructor(service: TransactionsService);
    findAll(filters: FilterTransactionsDto, userId: string): Promise<{
        items: import("./entities/transaction.entity").Transaction[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    getInvoice(id: string, userId: string, res: Response): Promise<void>;
    findOne(id: string, userId: string): Promise<import("./entities/transaction.entity").Transaction>;
    create(dto: CreateTransactionDto, userId: string): Promise<import("./entities/transaction.entity").Transaction>;
    uploadInvoice(id: string, file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }, userId: string): Promise<import("./entities/transaction.entity").Transaction>;
    update(id: string, dto: UpdateTransactionDto, userId: string): Promise<import("./entities/transaction.entity").Transaction>;
    removeInvoice(id: string, userId: string): Promise<void>;
    remove(id: string, userId: string): Promise<void>;
}
