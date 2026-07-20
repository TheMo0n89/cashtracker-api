import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL || '',
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
  secretKey: process.env.SUPABASE_SECRET_KEY || '',
  jwksUrl: process.env.SUPABASE_JWKS_URL || '',
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'transaction-invoices',
}));
