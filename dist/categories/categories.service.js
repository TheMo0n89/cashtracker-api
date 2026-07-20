"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
const exceptions_1 = require("../shared/exceptions");
const category_groups_service_1 = require("../category-groups/category-groups.service");
let CategoriesService = class CategoriesService {
    repo;
    categoryGroupsService;
    constructor(repo, categoryGroupsService) {
        this.repo = repo;
        this.categoryGroupsService = categoryGroupsService;
    }
    async findAllByUser(userId, type) {
        return this.repo.find({
            where: type ? { userId, type } : { userId },
            relations: { categoryGroup: true },
            order: { type: 'ASC', categoryGroupId: 'ASC', sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async findByIdAndUser(id, userId) {
        const category = await this.repo.findOne({
            where: { id, userId },
            relations: { categoryGroup: true },
        });
        if (!category) {
            throw new exceptions_1.ResourceNotFoundException('Categoría');
        }
        return category;
    }
    async getDeletionImpact(id, userId) {
        await this.findByIdAndUser(id, userId);
        const transactionCount = await this.countActiveTransactions(id);
        const activeTransactions = parseInt(transactionCount.count, 10);
        return {
            canDelete: activeTransactions === 0,
            activeTransactions,
        };
    }
    async create(userId, dto) {
        if (dto.categoryGroupId) {
            await this.validateCategoryGroup(userId, dto.categoryGroupId, dto.type);
        }
        const category = this.repo.create({ ...dto, userId });
        return this.repo.save(category);
    }
    async update(id, userId, dto) {
        const category = await this.findByIdAndUser(id, userId);
        if (dto.categoryGroupId) {
            await this.validateCategoryGroup(userId, dto.categoryGroupId, category.type);
        }
        await this.repo.update({ id, userId }, dto);
        return this.findByIdAndUser(id, userId);
    }
    async remove(id, userId) {
        const category = await this.findByIdAndUser(id, userId);
        const transactionCount = await this.countActiveTransactions(id);
        if (parseInt(transactionCount.count, 10) > 0) {
            throw new exceptions_1.CategoryHasTransactionsException();
        }
        await this.repo.softRemove(category);
    }
    async reorder(userId, dto) {
        const uniqueIds = [...new Set(dto.orderedCategoryIds)];
        if (uniqueIds.length !== dto.orderedCategoryIds.length) {
            throw new exceptions_1.CategoryGroupMismatchException();
        }
        const categories = await this.repo.find({
            where: { userId, type: dto.type },
        });
        const targetGroupId = dto.categoryGroupId || null;
        const targetCategories = categories.filter((category) => (category.categoryGroupId || null) === targetGroupId);
        const targetIds = targetCategories.map((category) => category.id).sort();
        const receivedIds = [...dto.orderedCategoryIds].sort();
        const isSameSet = targetIds.length === receivedIds.length &&
            targetIds.every((id, index) => id === receivedIds[index]);
        if (!isSameSet) {
            throw new exceptions_1.CategoryGroupMismatchException();
        }
        await this.repo.manager.transaction(async (manager) => {
            for (const [index, id] of dto.orderedCategoryIds.entries()) {
                await manager.update(category_entity_1.Category, { id, userId }, { sortOrder: index });
            }
        });
        return this.findAllByUser(userId, dto.type);
    }
    async validateCategoryGroup(userId, categoryGroupId, categoryType) {
        const group = await this.categoryGroupsService.findByIdAndUser(categoryGroupId, userId);
        if (group.type !== categoryType) {
            throw new exceptions_1.CategoryGroupMismatchException();
        }
    }
    async countActiveTransactions(categoryId) {
        const result = await this.repo.manager
            .createQueryBuilder()
            .select('COUNT(*)', 'count')
            .from('transactions', 't')
            .where('t."categoryId" = :categoryId', { categoryId })
            .andWhere('t."deletedAt" IS NULL')
            .getRawOne();
        return result || { count: '0' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        category_groups_service_1.CategoryGroupsService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map