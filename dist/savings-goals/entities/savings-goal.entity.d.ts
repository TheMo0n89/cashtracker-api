import { User } from '../../users/entities/user.entity';
import { SavingsGoalContribution } from './savings-goal-contribution.entity';
export declare class SavingsGoal {
    id: string;
    userId: string;
    name: string;
    targetAmount: string;
    currentAmount: string;
    deadline: string | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    user: User;
    contributions: SavingsGoalContribution[];
}
