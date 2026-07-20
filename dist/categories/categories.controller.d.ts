import { CategoriesService } from './categories.service';
import { CreateCategoryDto, ReorderCategoriesDto, UpdateCategoryDto } from './dto';
export declare class CategoriesController {
    private readonly service;
    constructor(service: CategoriesService);
    findAll(userId: string, type?: 'income' | 'expense'): Promise<import("./entities/category.entity").Category[]>;
    getDeletionImpact(id: string, userId: string): Promise<{
        canDelete: boolean;
        activeTransactions: number;
    }>;
    findOne(id: string, userId: string): Promise<import("./entities/category.entity").Category>;
    create(dto: CreateCategoryDto, userId: string): Promise<import("./entities/category.entity").Category>;
    reorder(dto: ReorderCategoriesDto, userId: string): Promise<import("./entities/category.entity").Category[]>;
    update(id: string, dto: UpdateCategoryDto, userId: string): Promise<import("./entities/category.entity").Category>;
    remove(id: string, userId: string): Promise<void>;
}
