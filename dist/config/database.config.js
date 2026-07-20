"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_DATABASE || 'cashtracker',
    username: process.env.DB_USERNAME || 'cashtracker_user',
    password: process.env.DB_PASSWORD || 'cashtracker_pass',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
}));
//# sourceMappingURL=database.config.js.map