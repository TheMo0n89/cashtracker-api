import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class TransactionInvoicesAndCategoryOrder1780948208064 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
