import { CategoryGroupsService } from './category-groups.service';
import { CreateCategoryGroupDto, UpdateCategoryGroupDto } from './dto';
export declare class CategoryGroupsController {
    private readonly service;
    constructor(service: CategoryGroupsService);
    findAll(userId: string): Promise<import("./entities/category-group.entity").CategoryGroup[]>;
    findOne(id: string, userId: string): Promise<import("./entities/category-group.entity").CategoryGroup>;
    create(dto: CreateCategoryGroupDto, userId: string): Promise<import("./entities/category-group.entity").CategoryGroup>;
    update(id: string, dto: UpdateCategoryGroupDto, userId: string): Promise<import("./entities/category-group.entity").CategoryGroup>;
    remove(id: string, userId: string): Promise<void>;
}
