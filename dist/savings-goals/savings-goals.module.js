"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsGoalsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const savings_goal_entity_1 = require("./entities/savings-goal.entity");
const savings_goal_contribution_entity_1 = require("./entities/savings-goal-contribution.entity");
const savings_goals_service_1 = require("./savings-goals.service");
const savings_goals_controller_1 = require("./savings-goals.controller");
let SavingsGoalsModule = class SavingsGoalsModule {
};
exports.SavingsGoalsModule = SavingsGoalsModule;
exports.SavingsGoalsModule = SavingsGoalsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([savings_goal_entity_1.SavingsGoal, savings_goal_contribution_entity_1.SavingsGoalContribution])],
        controllers: [savings_goals_controller_1.SavingsGoalsController],
        providers: [savings_goals_service_1.SavingsGoalsService],
        exports: [savings_goals_service_1.SavingsGoalsService],
    })
], SavingsGoalsModule);
//# sourceMappingURL=savings-goals.module.js.map