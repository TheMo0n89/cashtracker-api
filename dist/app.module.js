"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const event_emitter_1 = require("@nestjs/event-emitter");
const core_1 = require("@nestjs/core");
const config_2 = require("./config");
const shared_module_1 = require("./shared/shared.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const category_groups_module_1 = require("./category-groups/category-groups.module");
const categories_module_1 = require("./categories/categories.module");
const transactions_module_1 = require("./transactions/transactions.module");
const budgets_module_1 = require("./budgets/budgets.module");
const savings_goals_module_1 = require("./savings-goals/savings-goals.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const user_entity_1 = require("./users/entities/user.entity");
const category_group_entity_1 = require("./category-groups/entities/category-group.entity");
const category_entity_1 = require("./categories/entities/category.entity");
const transaction_entity_1 = require("./transactions/entities/transaction.entity");
const monthly_budget_entity_1 = require("./budgets/entities/monthly-budget.entity");
const savings_goal_entity_1 = require("./savings-goals/entities/savings-goal.entity");
const savings_goal_contribution_entity_1 = require("./savings-goals/entities/savings-goal-contribution.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [
                    config_2.databaseConfig,
                    config_2.redisConfig,
                    config_2.jwtConfig,
                    config_2.appConfig,
                    config_2.supabaseConfig,
                ],
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    database: configService.get('database.database'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    entities: [
                        user_entity_1.User,
                        category_group_entity_1.CategoryGroup,
                        category_entity_1.Category,
                        transaction_entity_1.Transaction,
                        monthly_budget_entity_1.MonthlyBudget,
                        savings_goal_entity_1.SavingsGoal,
                        savings_goal_contribution_entity_1.SavingsGoalContribution,
                    ],
                    synchronize: false,
                    logging: configService.get('database.logging'),
                    ssl: configService.get('database.ssl'),
                }),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 300,
                },
            ]),
            event_emitter_1.EventEmitterModule.forRoot(),
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            category_groups_module_1.CategoryGroupsModule,
            categories_module_1.CategoriesModule,
            transactions_module_1.TransactionsModule,
            budgets_module_1.BudgetsModule,
            savings_goals_module_1.SavingsGoalsModule,
            dashboard_module_1.DashboardModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map