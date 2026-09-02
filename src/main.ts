import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { DataSource } from 'typeorm';

// ─────────────────────────────────────────────────────────────────────────────
// Fail-fast environment validation
// Runs BEFORE NestJS bootstraps so Render logs show the exact missing vars
// instead of a cryptic TypeORM connection error or JWT undefined stack trace.
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_ENV: Record<string, string> = {
  DB_HOST: 'Supabase pooler host (e.g. aws-1-us-east-2.pooler.supabase.com)',
  DB_PORT: 'Database port (6543 for Transaction Pooler)',
  DB_DATABASE: 'Database name (postgres)',
  DB_USERNAME: 'Database username',
  DB_PASSWORD: 'Database password',
  DB_SSL: 'Enable SSL (true)',
  JWT_SECRET: 'JWT access token secret (min 64 chars)',
  JWT_REFRESH_SECRET: 'JWT refresh token secret (min 64 chars)',
  JWT_ACCESS_EXPIRATION: 'JWT access expiration (e.g. 8h)',
  JWT_REFRESH_EXPIRATION: 'JWT refresh expiration (e.g. 7d)',
  CORS_ALLOWED_ORIGINS: 'Comma-separated allowed origins',
  SUPABASE_URL: 'Supabase project URL',
  SUPABASE_SECRET_KEY: 'Supabase service_role key',
  SUPABASE_STORAGE_BUCKET: 'Supabase storage bucket name',
  NODE_ENV: 'Node environment (production)',
};

function validateEnvironment(): void {
  const missing: string[] = [];

  for (const [key, description] of Object.entries(REQUIRED_ENV)) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(`  ❌  ${key.padEnd(28)} — ${description}`);
    }
  }

  // Warn about NODE_OPTIONS memory cap for Render free tier
  const nodeOpts = process.env.NODE_OPTIONS || '';
  if (!nodeOpts.includes('--max-old-space-size')) {
    console.warn(
      '[Bootstrap] ⚠️  NODE_OPTIONS does not include --max-old-space-size.\n' +
        '           Render Free (512 MB) requires: NODE_OPTIONS=--max-old-space-size=460\n' +
        '           Without this, the process may crash with heap OOM under load.',
    );
  }

  console.log(`[ENV CHECK] NODE_ENV=${process.env.NODE_ENV}`);

  const databaseHost = process.env.DB_HOST || '';
  const databaseUsername = process.env.DB_USERNAME || '';
  const usesSupabasePooler = databaseHost.includes('.pooler.supabase.com');
  const poolerUsernameConfigured =
    !usesSupabasePooler || databaseUsername.startsWith('postgres.');
  console.log(
    `[DATABASE CHECK] supabasePooler=${usesSupabasePooler} poolerUsernameConfigured=${poolerUsernameConfigured}`,
  );

  if (!poolerUsernameConfigured) {
    missing.push(
      '  ❌  DB_USERNAME                  — Supabase pooler requires postgres.<project-ref>',
    );
  }

  if (missing.length > 0) {
    console.error(
      '\n[Bootstrap] ❌ STARTUP ABORTED — Missing required environment variables:',
    );
    missing.forEach((line) => console.error(line));
    console.error(
      '\n  → Set these variables in: Render Dashboard → cashtracker-api → Environment\n' +
        '  → Then redeploy the service.',
    );
    process.exit(1);
  }

  console.log('[ENV CHECK] Required variables validated.\n');
}

validateEnvironment();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const dataSource = app.get(DataSource);
  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  const allowedOrigins = new Set(
    (configService.get<string[]>('app.corsAllowedOrigins') || []).map(
      (origin) => origin.replace(/\/+$/, ''),
    ),
  );
  logger.log(
    `[CORS CHECK] Allowed origins loaded: ${Array.from(allowedOrigins).join(', ')}`,
  );
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      logger.warn(`CORS rejected origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters (order matters: most specific first)
  app.useGlobalFilters(new AllExceptionsFilter(), new DomainExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CashTracker Pro API')
    .setDescription('API REST para gestión financiera personal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start
  const port = configService.get<number>('app.port') ?? 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`[DATABASE] Connection successful=${dataSource.isInitialized}`);
  logger.log(`[SERVER] Listening on 0.0.0.0:${port}`);
  logger.log(`[SERVER] Git commit=${process.env.RENDER_GIT_COMMIT || 'local'}`);
}

void bootstrap();
