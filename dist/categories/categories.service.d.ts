import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, ReorderCategoriesDto, UpdateCategoryDto } from './dto';
import { CategoryGroupsService } from '../category-groups/category-groups.service';
export declare class CategoriesService {
    private readonly repo;
    private readonly categoryGroupsService;
    constructor(repo: Repository<Category>, categoryGroupsService: CategoryGroupsService);
    findAllByUser(userId: string, type?: 'income' | 'expense'): Promise<Category[]>;
    findByIdAndUser(id: string, userId: string): Promise<Category>;
    getDeletionImpact(id: string, userId: string): Promise<{
        canDelete: boolean;
        activeTransactions: number;
    }>;
    create(userId: string, dto: CreateCategoryDto): Promise<Category>;
    update(id: string, userId: string, dto: UpdateCategoryDto): Promise<Category>;
    remove(id: string, userId: string): Promise<void>;
    reorder(userId: string, dto: ReorderCategoriesDto): Promise<Category[]>;
    private validateCategoryGroup;
    private countActiveTransactions;
}
