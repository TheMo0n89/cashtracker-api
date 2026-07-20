import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyBudget } from './entities/monthly-budget.entity';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';
import {
  ResourceNotFoundException,
  DuplicateBudgetException,
  BudgetCategoryTypeException,
} from '../shared/exceptions';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(MonthlyBudget)
    private readonly repo: Repository<MonthlyBudget>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAllByUserAndPeriod(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyBudget[]> {
    return this.repo.find({
      where: { userId, year, month },
      relations: { category: true },
      order: { category: { name: 'ASC' } },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<MonthlyBudget> {
    const budget = await this.repo.findOne({
      where: { id, userId },
      relations: { category: true },
    });
    if (!budget) {
      throw new ResourceNotFoundException('Presupuesto');
    }
    return budget;
  }

  async create(userId: string, dto: CreateBudgetDto): Promise<MonthlyBudget> {
    const category = await this.categoriesService.findByIdAndUser(
      dto.categoryId,
      userId,
    );
    if (category.type !== 'expense') {
      throw new BudgetCategoryTypeException();
    }

    // Check uniqueness (userId + categoryId + year + month)
    const existing = await this.repo.findOne({
      where: {
        userId,
        categoryId: dto.categoryId,
        year: dto.year,
        month: dto.month,
      },
    });
    if (existing) {
      throw new DuplicateBudgetException();
    }

    const budget = this.repo.create({
      ...dto,
      amount: dto.amount.toFixed(2),
      userId,
    });
    return this.repo.save(budget);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateBudgetDto,
  ): Promise<MonthlyBudget> {
    const budget = await this.findByIdAndUser(id, userId);

    if (dto.amount !== undefined) {
      await this.repo.update({ id, userId }, { amount: dto.amount.toFixed(2) });
      budget.amount = dto.amount.toFixed(2);
    }

    return budget;
  }

  async remove(id: string, userId: string): Promise<void> {
    const budget = await this.findByIdAndUser(id, userId);
    await this.repo.softRemove(budget);
  }
}
