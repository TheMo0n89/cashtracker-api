import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_DATABASE || 'cashtracker',
  username: process.env.DB_USERNAME || 'cashtracker_user',
  password: process.env.DB_PASSWORD || 'cashtracker_pass',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
}));
