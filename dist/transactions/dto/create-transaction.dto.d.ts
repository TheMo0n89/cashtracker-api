export declare class CreateTransactionDto {
    type: 'income' | 'expense';
    amount: number;
    categoryId: string;
    date: string;
    description?: string;
    paymentPlace?: string;
    invoiceNumber?: string;
}
