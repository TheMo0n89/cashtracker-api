import { User } from '../../users/entities/user.entity';
export declare class CategoryGroup {
    id: string;
    userId: string;
    name: string;
    type: 'income' | 'expense';
    icon: string | null;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    user: User;
}
