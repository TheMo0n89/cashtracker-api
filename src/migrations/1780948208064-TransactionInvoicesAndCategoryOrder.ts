import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionInvoicesAndCategoryOrder1780948208064
  implements MigrationInterface
{
  name = 'TransactionInvoicesAndCategoryOrder1780948208064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD "paymentPlace" varchar(255) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD "invoiceNumber" varchar(100) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD "invoiceFilePath" varchar(500) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD "invoiceOriginalName" varchar(255) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD "invoiceMimeType" varchar(100) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" ADD "invoiceUploadedAt" timestamp NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "categories" ADD "sortOrder" int NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_categories_user_type_group_sort" ON "categories" ("userId", "type", "categoryGroupId", "sortOrder")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_categories_user_type_group_sort"');
    await queryRunner.query('ALTER TABLE "categories" DROP COLUMN "sortOrder"');
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP COLUMN "invoiceUploadedAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP COLUMN "invoiceMimeType"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP COLUMN "invoiceOriginalName"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP COLUMN "invoiceFilePath"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP COLUMN "invoiceNumber"',
    );
    await queryRunner.query(
      'ALTER TABLE "transactions" DROP COLUMN "paymentPlace"',
    );
  }
}
