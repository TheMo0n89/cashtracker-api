import { SavingsGoal } from './savings-goal.entity';
export declare class SavingsGoalContribution {
    id: string;
    savingsGoalId: string;
    amount: string;
    note: string | null;
    createdAt: Date;
    savingsGoal: SavingsGoal;
}
