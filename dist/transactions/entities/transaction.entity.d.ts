import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
export declare class Transaction {
    id: string;
    userId: string;
    categoryId: string;
    type: 'income' | 'expense';
    amount: string;
    description: string | null;
    paymentPlace: string | null;
    invoiceNumber: string | null;
    invoiceFilePath: string | null;
    invoiceOriginalName: string | null;
    invoiceMimeType: string | null;
    invoiceUploadedAt: Date | null;
    date: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    user: User;
    category: Category;
}
