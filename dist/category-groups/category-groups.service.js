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
exports.CategoryGroupsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_group_entity_1 = require("./entities/category-group.entity");
const exceptions_1 = require("../shared/exceptions");
let CategoryGroupsService = class CategoryGroupsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAllByUser(userId) {
        return this.repo.find({
            where: { userId },
            order: { type: 'ASC', createdAt: 'DESC', name: 'ASC' },
        });
    }
    async findByIdAndUser(id, userId) {
        const group = await this.repo.findOne({ where: { id, userId } });
        if (!group) {
            throw new exceptions_1.ResourceNotFoundException('Grupo de categorías');
        }
        return group;
    }
    async create(userId, dto) {
        const existing = await this.repo.findOne({
            where: { userId, name: dto.name, type: dto.type },
        });
        if (existing) {
            throw new exceptions_1.DuplicateResourceException('grupo de categorías', 'nombre');
        }
        const group = this.repo.create({ ...dto, userId });
        return this.repo.save(group);
    }
    async update(id, userId, dto) {
        const group = await this.findByIdAndUser(id, userId);
        if (dto.name && dto.name !== group.name) {
            const existing = await this.repo.findOne({
                where: { userId, name: dto.name, type: group.type },
            });
            if (existing) {
                throw new exceptions_1.DuplicateResourceException('grupo de categorías', 'nombre');
            }
        }
        Object.assign(group, dto);
        return this.repo.save(group);
    }
    async remove(id, userId) {
        const group = await this.findByIdAndUser(id, userId);
        await this.repo.manager
            .createQueryBuilder()
            .update('categories')
            .set({ categoryGroupId: null })
            .where('"categoryGroupId" = :id', { id })
            .andWhere('"userId" = :userId', { userId })
            .execute();
        await this.repo.softRemove(group);
    }
};
exports.CategoryGroupsService = CategoryGroupsService;
exports.CategoryGroupsService = CategoryGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_group_entity_1.CategoryGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryGroupsService);
//# sourceMappingURL=category-groups.service.js.map