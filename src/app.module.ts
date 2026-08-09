import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';

// Configs
import {
  databaseConfig,
  redisConfig,
  jwtConfig,
  appConfig,
  supabaseConfig,
} from './config';

// Feature modules
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoryGroupsModule } from './category-groups/category-groups.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { DashboardModule } from './dashboard/dashboard.module';

// Entities
import { User } from './users/entities/user.entity';
import { CategoryGroup } from './category-groups/entities/category-group.entity';
import { Category } from './categories/entities/category.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { MonthlyBudget } from './budgets/entities/monthly-budget.entity';
import { SavingsGoal } from './savings-goals/entities/savings-goal.entity';
import { SavingsGoalContribution } from './savings-goals/entities/savings-goal-contribution.entity';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        redisConfig,
        jwtConfig,
        appConfig,
        supabaseConfig,
      ],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.database'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        entities: [
          User,
          CategoryGroup,
          Category,
          Transaction,
          MonthlyBudget,
          SavingsGoal,
          SavingsGoalContribution,
        ],
        synchronize: false,
        logging: configService.get<boolean>('database.logging'),
        ssl: configService.get<boolean | { rejectUnauthorized: boolean }>(
          'database.ssl',
        ),
        // Fail fast: 2 retries × (10s timeout + 1s delay) ≈ 22s max.
        // Default is 10 retries × (10s + 3s) ≈ 130s hang — Render sees timeout
        // before the process ever crashes with a useful error message.
        retryAttempts: 2,
        retryDelay: 1000,
      }),
    }),

    // Rate limiting (300 req/min per user for authenticated routes)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 300,
      },
    ]),

    // Event system for domain events
    EventEmitterModule.forRoot(),

    // Feature modules
    SharedModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CategoryGroupsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    SavingsGoalsModule,
    DashboardModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
