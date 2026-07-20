import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SavingsGoal } from './entities/savings-goal.entity';
import { SavingsGoalContribution } from './entities/savings-goal-contribution.entity';
import { CreateSavingsGoalDto, UpdateSavingsGoalDto, CreateContributionDto } from './dto';
export declare class SavingsGoalsService {
    private readonly goalRepo;
    private readonly contribRepo;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(goalRepo: Repository<SavingsGoal>, contribRepo: Repository<SavingsGoalContribution>, dataSource: DataSource, eventEmitter: EventEmitter2);
    findAllByUser(userId: string): Promise<SavingsGoal[]>;
    findByIdAndUser(id: string, userId: string): Promise<SavingsGoal>;
    create(userId: string, dto: CreateSavingsGoalDto): Promise<SavingsGoal>;
    update(id: string, userId: string, dto: UpdateSavingsGoalDto): Promise<SavingsGoal>;
    remove(id: string, userId: string): Promise<void>;
    addContribution(goalId: string, userId: string, dto: CreateContributionDto): Promise<SavingsGoalContribution>;
    getContributions(goalId: string, userId: string): Promise<SavingsGoalContribution[]>;
}
