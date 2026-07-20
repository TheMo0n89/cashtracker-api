import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'CHANGE_ME_IN_PRODUCTION',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '8h',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  refreshExpirationMs: 7 * 24 * 60 * 60 * 1000, // 7 days in ms for Redis TTL
}));
