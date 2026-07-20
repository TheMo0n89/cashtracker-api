import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SavingsGoal } from './entities/savings-goal.entity';
import { SavingsGoalContribution } from './entities/savings-goal-contribution.entity';
import {
  CreateSavingsGoalDto,
  UpdateSavingsGoalDto,
  CreateContributionDto,
} from './dto';
import {
  ResourceNotFoundException,
  InsufficientGoalBalanceException,
} from '../shared/exceptions';

@Injectable()
export class SavingsGoalsService {
  private readonly logger = new Logger(SavingsGoalsService.name);

  constructor(
    @InjectRepository(SavingsGoal)
    private readonly goalRepo: Repository<SavingsGoal>,
    @InjectRepository(SavingsGoalContribution)
    private readonly contribRepo: Repository<SavingsGoalContribution>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAllByUser(userId: string): Promise<SavingsGoal[]> {
    return this.goalRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<SavingsGoal> {
    const goal = await this.goalRepo.findOne({ where: { id, userId } });
    if (!goal) {
      throw new ResourceNotFoundException('Meta de ahorro');
    }
    return goal;
  }

  async create(
    userId: string,
    dto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const goal = this.goalRepo.create({
      ...dto,
      targetAmount: dto.targetAmount.toFixed(2),
      userId,
    });
    return this.goalRepo.save(goal);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const goal = await this.findByIdAndUser(id, userId);

    if (dto.name !== undefined) goal.name = dto.name;
    if (dto.targetAmount !== undefined) {
      goal.targetAmount = dto.targetAmount.toFixed(2);
    }
    if (dto.deadline !== undefined) goal.deadline = dto.deadline;

    return this.goalRepo.save(goal);
  }

  async remove(id: string, userId: string): Promise<void> {
    const goal = await this.findByIdAndUser(id, userId);
    await this.goalRepo.softRemove(goal);
  }

  /**
   * Add a contribution (deposit or withdrawal) to a savings goal.
   * Uses a database transaction to ensure atomicity.
   */
  async addContribution(
    goalId: string,
    userId: string,
    dto: CreateContributionDto,
  ): Promise<SavingsGoalContribution> {
    return this.dataSource.transaction(async (manager) => {
      const goal = await manager.findOne(SavingsGoal, {
        where: { id: goalId, userId },
      });

      if (!goal) {
        throw new ResourceNotFoundException('Meta de ahorro');
      }

      const currentAmount = parseFloat(goal.currentAmount);
      const newAmount = currentAmount + dto.amount;

      // Validate withdrawal doesn't exceed current balance
      if (dto.amount < 0 && newAmount < 0) {
        throw new InsufficientGoalBalanceException();
      }

      // Update current amount
      goal.currentAmount = newAmount.toFixed(2);

      // Check if goal is now completed
      if (newAmount >= parseFloat(goal.targetAmount) && !goal.completedAt) {
        goal.completedAt = new Date();
        this.eventEmitter.emit('savings_goal.completed', {
          userId,
          goalId: goal.id,
          goalName: goal.name,
        });
      }

      await manager.save(SavingsGoal, goal);

      // Create immutable contribution record
      const contribution = manager.create(SavingsGoalContribution, {
        savingsGoalId: goalId,
        amount: dto.amount.toFixed(2),
        note: dto.note || null,
      });

      return manager.save(SavingsGoalContribution, contribution);
    });
  }

  async getContributions(
    goalId: string,
    userId: string,
  ): Promise<SavingsGoalContribution[]> {
    // Verify ownership first
    await this.findByIdAndUser(goalId, userId);

    return this.contribRepo.find({
      where: { savingsGoalId: goalId },
      order: { createdAt: 'DESC' },
    });
  }
}
