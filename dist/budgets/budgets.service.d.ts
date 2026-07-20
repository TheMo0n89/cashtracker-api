import { Repository } from 'typeorm';
import { MonthlyBudget } from './entities/monthly-budget.entity';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';
import { CategoriesService } from '../categories/categories.service';
export declare class BudgetsService {
    private readonly repo;
    private readonly categoriesService;
    constructor(repo: Repository<MonthlyBudget>, categoriesService: CategoriesService);
    findAllByUserAndPeriod(userId: string, year: number, month: number): Promise<MonthlyBudget[]>;
    findByIdAndUser(id: string, userId: string): Promise<MonthlyBudget>;
    create(userId: string, dto: CreateBudgetDto): Promise<MonthlyBudget>;
    update(id: string, userId: string, dto: UpdateBudgetDto): Promise<MonthlyBudget>;
    remove(id: string, userId: string): Promise<void>;
}
