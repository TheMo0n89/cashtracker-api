import { registerAs } from '@nestjs/config';

/**
 * Database configuration for TypeORM.
 *
 * Production uses Supabase Transaction Pooler (pgBouncer) on port 6543.
 * The pooler handles connection multiplexing — TypeORM's own pool should
 * stay small to avoid exhausting Supabase's connection slots.
 *
 * Free tier limit: ~15 simultaneous connections via pooler.
 * We cap TypeORM at 10 to leave headroom for other services / admin.
 */
export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_DATABASE || 'postgres',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  // Connection pool tuned for Supabase Transaction Pooler
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  connectTimeoutMS: 10000,
  extra: {
    // pg driver: max connections in the pool
    max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    // Time (ms) a connection can sit idle before being released
    idleTimeoutMillis: 30000,
    // Time (ms) to wait for a connection from the pool
    connectionTimeoutMillis: 10000,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  },
}));
