import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsAllowedOrigins: (
    process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000'
  )
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  dashboardCacheTtl: parseInt(
    process.env.CASHTRACKER_DASHBOARD_CACHE_TTL || '300',
    10,
  ),
  maxReportMonths: parseInt(
    process.env.CASHTRACKER_MAX_REPORT_MONTHS || '18',
    10,
  ),
}));
