"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'CHANGE_ME_IN_PRODUCTION',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '8h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    refreshExpirationMs: 7 * 24 * 60 * 60 * 1000,
}));
//# sourceMappingURL=jwt.config.js.map