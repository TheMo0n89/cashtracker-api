import { User } from '../../users/entities/user.entity';
import { CategoryGroup } from '../../category-groups/entities/category-group.entity';
export declare class Category {
    id: string;
    userId: string;
    categoryGroupId: string | null;
    name: string;
    type: 'income' | 'expense';
    icon: string | null;
    color: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    user: User;
    categoryGroup: CategoryGroup | null;
}
