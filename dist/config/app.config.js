"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean),
    dashboardCacheTtl: parseInt(process.env.CASHTRACKER_DASHBOARD_CACHE_TTL || '300', 10),
    maxReportMonths: parseInt(process.env.CASHTRACKER_MAX_REPORT_MONTHS || '18', 10),
}));
//# sourceMappingURL=app.config.js.map