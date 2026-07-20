import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto, UpdateSavingsGoalDto, CreateContributionDto } from './dto';
export declare class SavingsGoalsController {
    private readonly service;
    constructor(service: SavingsGoalsService);
    findAll(userId: string): Promise<import("./entities/savings-goal.entity").SavingsGoal[]>;
    findOne(id: string, userId: string): Promise<import("./entities/savings-goal.entity").SavingsGoal>;
    create(dto: CreateSavingsGoalDto, userId: string): Promise<import("./entities/savings-goal.entity").SavingsGoal>;
    update(id: string, dto: UpdateSavingsGoalDto, userId: string): Promise<import("./entities/savings-goal.entity").SavingsGoal>;
    remove(id: string, userId: string): Promise<void>;
    addContribution(id: string, dto: CreateContributionDto, userId: string): Promise<import("./entities/savings-goal-contribution.entity").SavingsGoalContribution>;
    getContributions(id: string, userId: string): Promise<import("./entities/savings-goal-contribution.entity").SavingsGoalContribution[]>;
}
