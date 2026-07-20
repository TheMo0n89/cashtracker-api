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
var SavingsGoalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsGoalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const savings_goal_entity_1 = require("./entities/savings-goal.entity");
const savings_goal_contribution_entity_1 = require("./entities/savings-goal-contribution.entity");
const exceptions_1 = require("../shared/exceptions");
let SavingsGoalsService = SavingsGoalsService_1 = class SavingsGoalsService {
    goalRepo;
    contribRepo;
    dataSource;
    eventEmitter;
    logger = new common_1.Logger(SavingsGoalsService_1.name);
    constructor(goalRepo, contribRepo, dataSource, eventEmitter) {
        this.goalRepo = goalRepo;
        this.contribRepo = contribRepo;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
    }
    async findAllByUser(userId) {
        return this.goalRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByIdAndUser(id, userId) {
        const goal = await this.goalRepo.findOne({ where: { id, userId } });
        if (!goal) {
            throw new exceptions_1.ResourceNotFoundException('Meta de ahorro');
        }
        return goal;
    }
    async create(userId, dto) {
        const goal = this.goalRepo.create({
            ...dto,
            targetAmount: dto.targetAmount.toFixed(2),
            userId,
        });
        return this.goalRepo.save(goal);
    }
    async update(id, userId, dto) {
        const goal = await this.findByIdAndUser(id, userId);
        if (dto.name !== undefined)
            goal.name = dto.name;
        if (dto.targetAmount !== undefined) {
            goal.targetAmount = dto.targetAmount.toFixed(2);
        }
        if (dto.deadline !== undefined)
            goal.deadline = dto.deadline;
        return this.goalRepo.save(goal);
    }
    async remove(id, userId) {
        const goal = await this.findByIdAndUser(id, userId);
        await this.goalRepo.softRemove(goal);
    }
    async addContribution(goalId, userId, dto) {
        return this.dataSource.transaction(async (manager) => {
            const goal = await manager.findOne(savings_goal_entity_1.SavingsGoal, {
                where: { id: goalId, userId },
            });
            if (!goal) {
                throw new exceptions_1.ResourceNotFoundException('Meta de ahorro');
            }
            const currentAmount = parseFloat(goal.currentAmount);
            const newAmount = currentAmount + dto.amount;
            if (dto.amount < 0 && newAmount < 0) {
                throw new exceptions_1.InsufficientGoalBalanceException();
            }
            goal.currentAmount = newAmount.toFixed(2);
            if (newAmount >= parseFloat(goal.targetAmount) && !goal.completedAt) {
                goal.completedAt = new Date();
                this.eventEmitter.emit('savings_goal.completed', {
                    userId,
                    goalId: goal.id,
                    goalName: goal.name,
                });
            }
            await manager.save(savings_goal_entity_1.SavingsGoal, goal);
            const contribution = manager.create(savings_goal_contribution_entity_1.SavingsGoalContribution, {
                savingsGoalId: goalId,
                amount: dto.amount.toFixed(2),
                note: dto.note || null,
            });
            return manager.save(savings_goal_contribution_entity_1.SavingsGoalContribution, contribution);
        });
    }
    async getContributions(goalId, userId) {
        await this.findByIdAndUser(goalId, userId);
        return this.contribRepo.find({
            where: { savingsGoalId: goalId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.SavingsGoalsService = SavingsGoalsService;
exports.SavingsGoalsService = SavingsGoalsService = SavingsGoalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(savings_goal_entity_1.SavingsGoal)),
    __param(1, (0, typeorm_1.InjectRepository)(savings_goal_contribution_entity_1.SavingsGoalContribution)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        event_emitter_1.EventEmitter2])
], SavingsGoalsService);
//# sourceMappingURL=savings-goals.service.js.map