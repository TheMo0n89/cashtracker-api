import { PaginationDto } from '../../shared/dto';
export declare class FilterTransactionsDto extends PaginationDto {
    type?: 'income' | 'expense';
    categoryId?: string;
    categoryGroupId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}
