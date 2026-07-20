export declare class ReorderCategoriesDto {
    type: 'income' | 'expense';
    categoryGroupId?: string | null;
    orderedCategoryIds: string[];
}
