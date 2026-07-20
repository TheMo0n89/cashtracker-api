import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryGroup } from './entities/category-group.entity';
import { CreateCategoryGroupDto, UpdateCategoryGroupDto } from './dto';
import {
  ResourceNotFoundException,
  DuplicateResourceException,
} from '../shared/exceptions';

@Injectable()
export class CategoryGroupsService {
  constructor(
    @InjectRepository(CategoryGroup)
    private readonly repo: Repository<CategoryGroup>,
  ) {}

  async findAllByUser(userId: string): Promise<CategoryGroup[]> {
    return this.repo.find({
      where: { userId },
      order: { type: 'ASC', createdAt: 'DESC', name: 'ASC' },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<CategoryGroup> {
    const group = await this.repo.findOne({ where: { id, userId } });
    if (!group) {
      throw new ResourceNotFoundException('Grupo de categorías');
    }
    return group;
  }

  async create(
    userId: string,
    dto: CreateCategoryGroupDto,
  ): Promise<CategoryGroup> {
    // Check uniqueness (userId + name + type)
    const existing = await this.repo.findOne({
      where: { userId, name: dto.name, type: dto.type },
    });
    if (existing) {
      throw new DuplicateResourceException('grupo de categorías', 'nombre');
    }

    const group = this.repo.create({ ...dto, userId });
    return this.repo.save(group);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCategoryGroupDto,
  ): Promise<CategoryGroup> {
    const group = await this.findByIdAndUser(id, userId);

    // If name is being changed, check uniqueness
    if (dto.name && dto.name !== group.name) {
      const existing = await this.repo.findOne({
        where: { userId, name: dto.name, type: group.type },
      });
      if (existing) {
        throw new DuplicateResourceException('grupo de categorías', 'nombre');
      }
    }

    Object.assign(group, dto);
    return this.repo.save(group);
  }

  async remove(id: string, userId: string): Promise<void> {
    const group = await this.findByIdAndUser(id, userId);
    await this.repo.manager
      .createQueryBuilder()
      .update('categories')
      .set({ categoryGroupId: null })
      .where('"categoryGroupId" = :id', { id })
      .andWhere('"userId" = :userId', { userId })
      .execute();
    await this.repo.softRemove(group);
  }
}
