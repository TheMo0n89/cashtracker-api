import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly service;
    constructor(service: DashboardService);
    getSummary(year: number, month: number, userId: string): Promise<any>;
    getBudgets(year: number, month: number, userId: string): Promise<any>;
    getGoals(userId: string): Promise<any>;
    getDistribution(year: number, month: number, userId: string): Promise<any>;
    getReportSummary(startYear: number, startMonth: number, endYear: number, endMonth: number, type: string, userId: string): Promise<{
        totalIncome: string;
        totalExpense: string;
        balance: string;
    }>;
}
