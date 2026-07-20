import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';
export declare class BudgetsController {
    private readonly service;
    constructor(service: BudgetsService);
    findAll(year: number, month: number, userId: string): Promise<import("./entities/monthly-budget.entity").MonthlyBudget[]>;
    findOne(id: string, userId: string): Promise<import("./entities/monthly-budget.entity").MonthlyBudget>;
    create(dto: CreateBudgetDto, userId: string): Promise<import("./entities/monthly-budget.entity").MonthlyBudget>;
    update(id: string, dto: UpdateBudgetDto, userId: string): Promise<import("./entities/monthly-budget.entity").MonthlyBudget>;
    remove(id: string, userId: string): Promise<void>;
}
