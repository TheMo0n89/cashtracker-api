"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const guards_1 = require("./guards");
const decorators_1 = require("../shared/decorators");
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE ||
    'strict');
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production' ||
    COOKIE_SAMESITE === 'none';
function isLocalRequest(req) {
    const origin = req.headers.origin || '';
    const host = req.headers.host || '';
    return (origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        host.startsWith('localhost:') ||
        host.startsWith('127.0.0.1:'));
}
function getCookieOptions(req, maxAge) {
    const local = isLocalRequest(req);
    return {
        httpOnly: true,
        secure: local ? false : COOKIE_SECURE,
        sameSite: local ? 'strict' : COOKIE_SAMESITE,
        path: '/v1/auth',
        ...(maxAge ? { maxAge } : {}),
    };
}
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto, req, res) {
        const result = await this.authService.register(dto);
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getCookieOptions(req, 7 * 24 * 60 * 60 * 1000));
        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }
    async login(dto, req, res) {
        const result = await this.authService.login(dto);
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getCookieOptions(req, 7 * 24 * 60 * 60 * 1000));
        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
        if (!refreshToken) {
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'No se encontró el refresh token.',
                code: 'MISSING_REFRESH_TOKEN',
            });
        }
        const result = await this.authService.refresh(refreshToken);
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getCookieOptions(req, 7 * 24 * 60 * 60 * 1000));
        return {
            accessToken: result.accessToken,
        };
    }
    async logout(userId, req, res) {
        await this.authService.logout(userId);
        res.clearCookie(REFRESH_TOKEN_COOKIE, getCookieOptions(req));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nueva cuenta' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cuenta creada exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email ya registrado.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar sesión' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login exitoso.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciales inválidas.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refrescar access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens refrescados.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Refresh token inválido.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar sesión' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Sesión cerrada.' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('v1/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map