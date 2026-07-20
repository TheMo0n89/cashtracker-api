"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const domain_exception_filter_1 = require("./shared/filters/domain-exception.filter");
const all_exceptions_filter_1 = require("./shared/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./shared/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./shared/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    const allowedOrigins = new Set((configService.get('app.corsAllowedOrigins') || []).map((origin) => origin.replace(/\/+$/, '')));
    logger.log(`CORS allowed origins: ${Array.from(allowedOrigins).join(', ')}`);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
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
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(), new domain_exception_filter_1.DomainExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('CashTracker Pro API')
        .setDescription('API REST para gestión financiera personal')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.enableShutdownHooks();
    const port = configService.get('app.port') ?? 3001;
    await app.listen(port);
    logger.log(`🚀 CashTracker API running on http://localhost:${port}`);
    logger.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map