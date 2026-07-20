"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1780948208063 = void 0;
class InitialSchema1780948208063 {
    name = 'InitialSchema1780948208063';
    async up(queryRunner) {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        await queryRunner.query(`CREATE TYPE "transaction_type" AS ENUM ('income', 'expense')`);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL,
        "password" varchar(255) NOT NULL,
        "name" varchar(100) NOT NULL,
        "timezone" varchar(50) NOT NULL DEFAULT 'America/Lima',
        "provider" varchar(20) NOT NULL DEFAULT 'local',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "deletedAt" timestamp NULL,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "category_groups" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "name" varchar(50) NOT NULL,
        "type" "transaction_type" NOT NULL,
        "icon" varchar(50) NULL,
        "color" varchar(7) NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "deletedAt" timestamp NULL,
        CONSTRAINT "PK_category_groups" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_category_groups_user_name_type" UNIQUE ("userId", "name", "type")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "categoryGroupId" uuid NULL,
        "name" varchar(50) NOT NULL,
        "type" "transaction_type" NOT NULL,
        "icon" varchar(50) NULL,
        "color" varchar(7) NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "deletedAt" timestamp NULL,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "monthly_budgets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "categoryId" uuid NOT NULL,
        "year" int NOT NULL,
        "month" int NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "deletedAt" timestamp NULL,
        CONSTRAINT "PK_monthly_budgets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_monthly_budgets_user_category_period" UNIQUE ("userId", "categoryId", "year", "month")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "savings_goals" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "targetAmount" numeric(14,2) NOT NULL,
        "currentAmount" numeric(14,2) NOT NULL DEFAULT '0.00',
        "deadline" date NULL,
        "completedAt" timestamp NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "deletedAt" timestamp NULL,
        CONSTRAINT "PK_savings_goals" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "savings_goal_contributions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "savingsGoalId" uuid NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "note" varchar(255) NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_savings_goal_contributions" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "categoryId" uuid NOT NULL,
        "type" "transaction_type" NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "description" varchar(500) NULL,
        "date" date NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "deletedAt" timestamp NULL,
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_monthly_budgets_user_period" ON "monthly_budgets" ("userId", "year", "month")`);
        await queryRunner.query(`CREATE INDEX "IDX_transactions_user_category" ON "transactions" ("userId", "categoryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_transactions_user_type_date" ON "transactions" ("userId", "type", "date")`);
        await queryRunner.query(`CREATE INDEX "IDX_transactions_user_date" ON "transactions" ("userId", "date")`);
        await queryRunner.query(`
      ALTER TABLE "category_groups"
      ADD CONSTRAINT "FK_category_groups_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      ALTER TABLE "categories"
      ADD CONSTRAINT "FK_categories_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      ALTER TABLE "categories"
      ADD CONSTRAINT "FK_categories_category_group"
      FOREIGN KEY ("categoryGroupId") REFERENCES "category_groups"("id") ON DELETE SET NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "monthly_budgets"
      ADD CONSTRAINT "FK_monthly_budgets_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      ALTER TABLE "monthly_budgets"
      ADD CONSTRAINT "FK_monthly_budgets_category"
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      ALTER TABLE "savings_goals"
      ADD CONSTRAINT "FK_savings_goals_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      ALTER TABLE "savings_goal_contributions"
      ADD CONSTRAINT "FK_savings_goal_contributions_goal"
      FOREIGN KEY ("savingsGoalId") REFERENCES "savings_goals"("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
        await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_category"
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS "transactions"');
        await queryRunner.query('DROP TABLE IF EXISTS "savings_goal_contributions"');
        await queryRunner.query('DROP TABLE IF EXISTS "savings_goals"');
        await queryRunner.query('DROP TABLE IF EXISTS "monthly_budgets"');
        await queryRunner.query('DROP TABLE IF EXISTS "categories"');
        await queryRunner.query('DROP TABLE IF EXISTS "category_groups"');
        await queryRunner.query('DROP TABLE IF EXISTS "users"');
        await queryRunner.query('DROP TYPE IF EXISTS "transaction_type"');
    }
}
exports.InitialSchema1780948208063 = InitialSchema1780948208063;
//# sourceMappingURL=1780948208063-InitialSchema.js.map