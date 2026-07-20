"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
let DashboardService = DashboardService_1 = class DashboardService {
    dataSource;
    configService;
    logger = new common_1.Logger(DashboardService_1.name);
    memoryCache = new Map();
    memoryVersions = new Map();
    cacheTtl;
    constructor(dataSource, configService) {
        this.dataSource = dataSource;
        this.configService = configService;
        this.cacheTtl =
            this.configService.get('app.dashboardCacheTtl') ?? 300;
    }
    async getCache(key) {
        const item = this.memoryCache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiry) {
            this.memoryCache.delete(key);
            return null;
        }
        return item.value;
    }
    async setCache(key, value, ttlSeconds) {
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + ttlSeconds * 1000,
        });
    }
    async getSummary(userId, year, month) {
        const version = await this.getUserVersion(userId);
        const cacheKey = `dashboard:${userId}:v${version}:summary:${year}-${month}`;
        const cached = await this.getCache(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
        const result = await this.dataSource.query(`SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' AND "deletedAt" IS NULL THEN amount ELSE 0 END), 0) AS "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'expense' AND "deletedAt" IS NULL THEN amount ELSE 0 END), 0) AS "totalExpense"
      FROM transactions 
      WHERE "userId" = $1 AND date >= $2 AND date <= $3 AND "deletedAt" IS NULL`, [userId, startDate, endDate]);
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
    async getBudgetProgress(userId, year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
        const budgets = await this.dataSource.query(`SELECT 
        mb.id, mb."categoryId", mb.amount AS "budgetAmount", c.name AS "categoryName", c.icon AS "categoryIcon", c.color AS "categoryColor",
        COALESCE(
          (SELECT SUM(t.amount) FROM transactions t 
           WHERE t."categoryId" = mb."categoryId" AND t."userId" = $1 AND t.date >= $2 AND t.date <= $3
             AND t.type = 'expense' AND t."deletedAt" IS NULL), 0
        ) AS spent
      FROM monthly_budgets mb
      JOIN categories c ON c.id = mb."categoryId"
      WHERE mb."userId" = $4 AND mb.year = $5 AND mb.month = $6 AND mb."deletedAt" IS NULL AND c."deletedAt" IS NULL
      ORDER BY c.name ASC`, [userId, startDate, endDate, userId, year, month]);
        const progress = budgets.map((b) => ({
            id: b.id,
            categoryName: b.categoryName,
            categoryIcon: b.categoryIcon,
            categoryColor: b.categoryColor,
            budgetAmount: parseFloat(b.budgetAmount).toFixed(2),
            spent: parseFloat(b.spent).toFixed(2),
            percentage: parseFloat(b.budgetAmount) > 0
                ? Math.round((parseFloat(b.spent) /
                    parseFloat(b.budgetAmount)) *
                    100)
                : 0,
        }));
        return progress;
    }
    async getGoalsProgress(userId) {
        const goals = await this.dataSource.query(`SELECT id, name, "targetAmount", "currentAmount", deadline, "completedAt"
       FROM savings_goals WHERE "userId" = $1 AND "deletedAt" IS NULL ORDER BY "createdAt" DESC`, [userId]);
        return goals.map((g) => ({
            ...g,
            targetAmount: parseFloat(g.targetAmount).toFixed(2),
            currentAmount: parseFloat(g.currentAmount).toFixed(2),
            percentage: parseFloat(g.targetAmount) > 0
                ? Math.min(100, Math.round((parseFloat(g.currentAmount) /
                    parseFloat(g.targetAmount)) *
                    100))
                : 0,
        }));
    }
    async getExpenseDistribution(userId, year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
        const expenses = await this.dataSource.query(`SELECT c.name, c.color, SUM(t.amount) as value
       FROM transactions t
       JOIN categories c ON c.id = t."categoryId"
       WHERE t."userId" = $1 AND t.date >= $2 AND t.date <= $3 
         AND t.type = 'expense' AND t."deletedAt" IS NULL AND c."deletedAt" IS NULL
       GROUP BY c.id
       ORDER BY value DESC`, [userId, startDate, endDate]);
        return expenses.map((e) => ({
            name: e.name,
            color: e.color || '#6366f1',
            value: parseFloat(e.value),
        }));
    }
    async getReportSummary(userId, startYear, startMonth, endYear, endMonth, type) {
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
        const endDate = new Date(endYear, endMonth, 0).toISOString().slice(0, 10);
        let typeCondition = '';
        if (type === 'income')
            typeCondition = "AND type = 'income'";
        else if (type === 'expense')
            typeCondition = "AND type = 'expense'";
        const result = await this.dataSource.query(`SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS "totalIncome",
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS "totalExpense"
      FROM transactions 
      WHERE "userId" = $1 AND date >= $2 AND date <= $3 AND "deletedAt" IS NULL ${typeCondition}`, [userId, startDate, endDate]);
        const totalIncome = parseFloat(result[0]?.totalIncome || '0');
        const totalExpense = parseFloat(result[0]?.totalExpense || '0');
        return {
            totalIncome: totalIncome.toFixed(2),
            totalExpense: totalExpense.toFixed(2),
            balance: (totalIncome - totalExpense).toFixed(2),
        };
    }
    async invalidateCache(userId) {
        const current = this.memoryVersions.get(userId) || 0;
        this.memoryVersions.set(userId, current + 1);
        this.logger.debug(`Dashboard memory cache invalidated for user ${userId}`);
    }
    async getUserVersion(userId) {
        return this.memoryVersions.get(userId) || 0;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        config_1.ConfigService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map