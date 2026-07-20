import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly memoryCache = new Map<
    string,
    { value: string; expiry: number }
  >();
  private readonly memoryVersions = new Map<string, number>();
  private readonly cacheTtl: number;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl =
      this.configService.get<number>('app.dashboardCacheTtl') ?? 300;
  }

  // --- Helper Cache Methods ---
  private async getCache(key: string): Promise<string | null> {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  private async setCache(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
  // -----------------------------

  /**
   * Get financial summary (total income, total expense, balance) for a period.
   */
  async getSummary(userId: string, year: number, month: number) {
    const version = await this.getUserVersion(userId);
    const cacheKey = `dashboard:${userId}:v${version}:summary:${year}-${month}`;

    const cached = await this.getCache(cacheKey);
    if (cached) return JSON.parse(cached);

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    const result = await this.dataSource.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' AND "deletedAt" IS NULL THEN amount ELSE 0 END), 0) AS "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'expense' AND "deletedAt" IS NULL THEN amount ELSE 0 END), 0) AS "totalExpense"
      FROM transactions 
      WHERE "userId" = $1 AND date >= $2 AND date <= $3 AND "deletedAt" IS NULL`,
      [userId, startDate, endDate],
    );

    const totalIncome = parseFloat(result[0]?.totalIncome || '0');
    const totalExpense = parseFloat(result[0]?.totalExpense || '0');

    const summary = {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      balance: (totalIncome - totalExpense).toFixed(2),
      year,
      month,
    };

    await this.setCache(cacheKey, JSON.stringify(summary), this.cacheTtl);
    return summary;
  }

  /**
   * Get budget progress for all budgets in a period.
   */
  async getBudgetProgress(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    const budgets = await this.dataSource.query(
      `SELECT 
        mb.id, mb."categoryId", mb.amount AS "budgetAmount", c.name AS "categoryName", c.icon AS "categoryIcon", c.color AS "categoryColor",
        COALESCE(
          (SELECT SUM(t.amount) FROM transactions t 
           WHERE t."categoryId" = mb."categoryId" AND t."userId" = $1 AND t.date >= $2 AND t.date <= $3
             AND t.type = 'expense' AND t."deletedAt" IS NULL), 0
        ) AS spent
      FROM monthly_budgets mb
      JOIN categories c ON c.id = mb."categoryId"
      WHERE mb."userId" = $4 AND mb.year = $5 AND mb.month = $6 AND mb."deletedAt" IS NULL AND c."deletedAt" IS NULL
      ORDER BY c.name ASC`,
      [userId, startDate, endDate, userId, year, month],
    );

    const progress = budgets.map((b: Record<string, unknown>) => ({
      id: b.id,
      categoryName: b.categoryName,
      categoryIcon: b.categoryIcon,
      categoryColor: b.categoryColor,
      budgetAmount: parseFloat(b.budgetAmount as string).toFixed(2),
      spent: parseFloat(b.spent as string).toFixed(2),
      percentage:
        parseFloat(b.budgetAmount as string) > 0
          ? Math.round(
              (parseFloat(b.spent as string) /
                parseFloat(b.budgetAmount as string)) *
                100,
            )
          : 0,
    }));

    return progress;
  }

  /**
   * Get savings goals progress.
   */
  async getGoalsProgress(userId: string) {
    const goals = await this.dataSource.query(
      `SELECT id, name, "targetAmount", "currentAmount", deadline, "completedAt"
       FROM savings_goals WHERE "userId" = $1 AND "deletedAt" IS NULL ORDER BY "createdAt" DESC`,
      [userId],
    );

    return goals.map((g: Record<string, unknown>) => ({
      ...g,
      targetAmount: parseFloat(g.targetAmount as string).toFixed(2),
      currentAmount: parseFloat(g.currentAmount as string).toFixed(2),
      percentage:
        parseFloat(g.targetAmount as string) > 0
          ? Math.min(
              100,
              Math.round(
                (parseFloat(g.currentAmount as string) /
                  parseFloat(g.targetAmount as string)) *
                  100,
              ),
            )
          : 0,
    }));
  }

  /**
   * Get Expense Distribution for Pie Chart.
   */
  async getExpenseDistribution(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    const expenses = await this.dataSource.query(
      `SELECT c.name, c.color, SUM(t.amount) as value
       FROM transactions t
       JOIN categories c ON c.id = t."categoryId"
       WHERE t."userId" = $1 AND t.date >= $2 AND t.date <= $3 
         AND t.type = 'expense' AND t."deletedAt" IS NULL AND c."deletedAt" IS NULL
       GROUP BY c.id
       ORDER BY value DESC`,
      [userId, startDate, endDate],
    );

    return expenses.map((e: any) => ({
      name: e.name,
      color: e.color || '#6366f1',
      value: parseFloat(e.value),
    }));
  }

  /**
   * Get Report Summary aggregating across multiple months.
   */
  async getReportSummary(
    userId: string,
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number,
    type: string,
  ) {
    const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
    const endDate = new Date(endYear, endMonth, 0).toISOString().slice(0, 10);

    let typeCondition = '';
    if (type === 'income') typeCondition = "AND type = 'income'";
    else if (type === 'expense') typeCondition = "AND type = 'expense'";

    const result = await this.dataSource.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS "totalExpense"
      FROM transactions 
      WHERE "userId" = $1 AND date >= $2 AND date <= $3 AND "deletedAt" IS NULL ${typeCondition}`,
      [userId, startDate, endDate],
    );

    const totalIncome = parseFloat(result[0]?.totalIncome || '0');
    const totalExpense = parseFloat(result[0]?.totalExpense || '0');

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      balance: (totalIncome - totalExpense).toFixed(2),
    };
  }

  /**
   * Invalidate dashboard cache for a user by incrementing their version.
   */
  async invalidateCache(userId: string): Promise<void> {
    const current = this.memoryVersions.get(userId) || 0;
    this.memoryVersions.set(userId, current + 1);
    this.logger.debug(`Dashboard memory cache invalidated for user ${userId}`);
  }

  /**
   * Get the current cache version for a user.
   */
  private async getUserVersion(userId: string): Promise<number> {
    return this.memoryVersions.get(userId) || 0;
  }
}
