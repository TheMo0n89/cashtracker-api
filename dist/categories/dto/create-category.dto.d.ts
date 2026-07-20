export declare class CreateCategoryDto {
    name: string;
    type: 'income' | 'expense';
    categoryGroupId?: string | null;
    icon?: string;
    color?: string;
}
