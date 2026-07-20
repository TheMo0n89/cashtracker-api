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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const monthly_budget_entity_1 = require("./entities/monthly-budget.entity");
const exceptions_1 = require("../shared/exceptions");
const categories_service_1 = require("../categories/categories.service");
let BudgetsService = class BudgetsService {
    repo;
    categoriesService;
    constructor(repo, categoriesService) {
        this.repo = repo;
        this.categoriesService = categoriesService;
    }
    async findAllByUserAndPeriod(userId, year, month) {
        return this.repo.find({
            where: { userId, year, month },
            relations: { category: true },
            order: { category: { name: 'ASC' } },
        });
    }
    async findByIdAndUser(id, userId) {
        const budget = await this.repo.findOne({
            where: { id, userId },
            relations: { category: true },
        });
        if (!budget) {
            throw new exceptions_1.ResourceNotFoundException('Presupuesto');
        }
        return budget;
    }
    async create(userId, dto) {
        const category = await this.categoriesService.findByIdAndUser(dto.categoryId, userId);
        if (category.type !== 'expense') {
            throw new exceptions_1.BudgetCategoryTypeException();
        }
        const existing = await this.repo.findOne({
            where: {
                userId,
                categoryId: dto.categoryId,
                year: dto.year,
                month: dto.month,
            },
        });
        if (existing) {
            throw new exceptions_1.DuplicateBudgetException();
        }
        const budget = this.repo.create({
            ...dto,
            amount: dto.amount.toFixed(2),
            userId,
        });
        return this.repo.save(budget);
    }
    async update(id, userId, dto) {
        const budget = await this.findByIdAndUser(id, userId);
        if (dto.amount !== undefined) {
            await this.repo.update({ id, userId }, { amount: dto.amount.toFixed(2) });
            budget.amount = dto.amount.toFixed(2);
        }
        return budget;
    }
    async remove(id, userId) {
        const budget = await this.findByIdAndUser(id, userId);
        await this.repo.softRemove(budget);
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(monthly_budget_entity_1.MonthlyBudget)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        categories_service_1.CategoriesService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map