import { Repository } from 'typeorm';
import { CategoryGroup } from './entities/category-group.entity';
import { CreateCategoryGroupDto, UpdateCategoryGroupDto } from './dto';
export declare class CategoryGroupsService {
    private readonly repo;
    constructor(repo: Repository<CategoryGroup>);
    findAllByUser(userId: string): Promise<CategoryGroup[]>;
    findByIdAndUser(id: string, userId: string): Promise<CategoryGroup>;
    create(userId: string, dto: CreateCategoryGroupDto): Promise<CategoryGroup>;
    update(id: string, userId: string, dto: UpdateCategoryGroupDto): Promise<CategoryGroup>;
    remove(id: string, userId: string): Promise<void>;
}
