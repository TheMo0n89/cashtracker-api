import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
export declare class DashboardService {
    private readonly dataSource;
    private readonly configService;
    private readonly logger;
    private readonly memoryCache;
    private readonly memoryVersions;
    private readonly cacheTtl;
    constructor(dataSource: DataSource, configService: ConfigService);
    private getCache;
    private setCache;
    getSummary(userId: string, year: number, month: number): Promise<any>;
    getBudgetProgress(userId: string, year: number, month: number): Promise<any>;
    getGoalsProgress(userId: string): Promise<any>;
    getExpenseDistribution(userId: string, year: number, month: number): Promise<any>;
    getReportSummary(userId: string, startYear: number, startMonth: number, endYear: number, endMonth: number, type: string): Promise<{
        totalIncome: string;
        totalExpense: string;
        balance: string;
    }>;
    invalidateCache(userId: string): Promise<void>;
    private getUserVersion;
}
