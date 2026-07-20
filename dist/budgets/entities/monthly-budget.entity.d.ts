import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
export declare class MonthlyBudget {
    id: string;
    userId: string;
    categoryId: string;
    year: number;
    month: number;
    amount: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    user: User;
    category: Category;
}
