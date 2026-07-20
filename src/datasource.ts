import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Standalone DataSource configuration for TypeORM CLI.
 * Used exclusively for migration generation and execution.
 *
 * Usage:
 *   npm run migration:run
 *   npm run migration:show
 *
 * The project uses TypeScript + CommonJS at runtime, so use the
 * typeorm-ts-node-commonjs wrapper instead of the plain typeorm CLI.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_DATABASE || 'cashtracker',
  username: process.env.DB_USERNAME || 'cashtracker_user',
  password: process.env.DB_PASSWORD || 'cashtracker_pass',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});
