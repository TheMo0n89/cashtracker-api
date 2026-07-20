export declare class CreateSavingsGoalDto {
    name: string;
    targetAmount: number;
    deadline?: string;
}
export declare class UpdateSavingsGoalDto {
    name?: string;
    targetAmount?: number;
    deadline?: string | null;
}
export declare class CreateContributionDto {
    amount: number;
    note?: string;
}
