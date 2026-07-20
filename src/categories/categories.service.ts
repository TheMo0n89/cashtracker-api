import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import {
  CreateCategoryDto,
  ReorderCategoriesDto,
  UpdateCategoryDto,
} from './dto';
import {
  ResourceNotFoundException,
  CategoryHasTransactionsException,
  CategoryGroupMismatchException,
} from '../shared/exceptions';
import { CategoryGroupsService } from '../category-groups/category-groups.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    private readonly categoryGroupsService: CategoryGroupsService,
  ) {}

  async findAllByUser(
    userId: string,
    type?: 'income' | 'expense',
  ): Promise<Category[]> {
    return this.repo.find({
      where: type ? { userId, type } : { userId },
      relations: { categoryGroup: true },
      order: { type: 'ASC', categoryGroupId: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Category> {
    const category = await this.repo.findOne({
      where: { id, userId },
      relations: { categoryGroup: true },
    });
    if (!category) {
      throw new ResourceNotFoundException('Categoría');
    }
    return category;
  }

  async getDeletionImpact(
    id: string,
    userId: string,
  ): Promise<{ canDelete: boolean; activeTransactions: number }> {
    await this.findByIdAndUser(id, userId);

    const transactionCount = await this.countActiveTransactions(id);
    const activeTransactions = parseInt(transactionCount.count, 10);

    return {
      canDelete: activeTransactions === 0,
      activeTransactions,
    };
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    if (dto.categoryGroupId) {
      await this.validateCategoryGroup(userId, dto.categoryGroupId, dto.type);
    }

    const category = this.repo.create({ ...dto, userId });
    return this.repo.save(category);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findByIdAndUser(id, userId);

    if (dto.categoryGroupId) {
      await this.validateCategoryGroup(
        userId,
        dto.categoryGroupId,
        category.type,
      );
    }

    await this.repo.update({ id, userId }, dto);
    return this.findByIdAndUser(id, userId);
  }

  /**
   * Soft-delete a category.
   * RESTRICT: Cannot delete if it has associated transactions.
   * The transaction count check is done via a raw query to include
   * non-deleted transactions only.
   */
  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findByIdAndUser(id, userId);

    const transactionCount = await this.countActiveTransactions(id);

    if (parseInt(transactionCount.count, 10) > 0) {
      throw new CategoryHasTransactionsException();
    }

    await this.repo.softRemove(category);
  }

  async reorder(userId: string, dto: ReorderCategoriesDto): Promise<Category[]> {
    const uniqueIds = [...new Set(dto.orderedCategoryIds)];
    if (uniqueIds.length !== dto.orderedCategoryIds.length) {
      throw new CategoryGroupMismatchException();
    }

    const categories = await this.repo.find({
      where: { userId, type: dto.type },
    });

    const targetGroupId = dto.categoryGroupId || null;
    const targetCategories = categories.filter(
      (category) => (category.categoryGroupId || null) === targetGroupId,
    );

    const targetIds = targetCategories.map((category) => category.id).sort();
    const receivedIds = [...dto.orderedCategoryIds].sort();
    const isSameSet =
      targetIds.length === receivedIds.length &&
      targetIds.every((id, index) => id === receivedIds[index]);

    if (!isSameSet) {
      throw new CategoryGroupMismatchException();
    }

    await this.repo.manager.transaction(async (manager) => {
      for (const [index, id] of dto.orderedCategoryIds.entries()) {
        await manager.update(Category, { id, userId }, { sortOrder: index });
      }
    });

    return this.findAllByUser(userId, dto.type);
  }

  private async validateCategoryGroup(
    userId: string,
    categoryGroupId: string,
    categoryType: 'income' | 'expense',
  ): Promise<void> {
    const group = await this.categoryGroupsService.findByIdAndUser(
      categoryGroupId,
      userId,
    );

    if (group.type !== categoryType) {
      throw new CategoryGroupMismatchException();
    }
  }

  private async countActiveTransactions(
    categoryId: string,
  ): Promise<{ count: string }> {
    const result = await this.repo.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('transactions', 't')
      .where('t."categoryId" = :categoryId', { categoryId })
      .andWhere('t."deletedAt" IS NULL')
      .getRawOne();

    return result || { count: '0' };
  }
}
