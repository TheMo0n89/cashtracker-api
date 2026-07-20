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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../shared/decorators");
let DashboardController = class DashboardController {
    service;
    constructor(service) {
        this.service = service;
    }
    getSummary(year, month, userId) {
        const now = new Date();
        return this.service.getSummary(userId, year || now.getFullYear(), month || now.getMonth() + 1);
    }
    getBudgets(year, month, userId) {
        const now = new Date();
        return this.service.getBudgetProgress(userId, year || now.getFullYear(), month || now.getMonth() + 1);
    }
    getGoals(userId) {
        return this.service.getGoalsProgress(userId);
    }
    getDistribution(year, month, userId) {
        const now = new Date();
        return this.service.getExpenseDistribution(userId, year || now.getFullYear(), month || now.getMonth() + 1);
    }
    getReportSummary(startYear, startMonth, endYear, endMonth, type, userId) {
        const now = new Date();
        return this.service.getReportSummary(userId, startYear || now.getFullYear(), startMonth || 1, endYear || now.getFullYear(), endMonth || 12, type || 'all');
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Resumen financiero del período' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('budgets'),
    (0, swagger_1.ApiOperation)({ summary: 'Progreso de presupuestos del período' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getBudgets", null);
__decorate([
    (0, common_1.Get)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Progreso de metas de ahorro' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getGoals", null);
__decorate([
    (0, common_1.Get)('distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Distribución de gastos reales por categoría' }),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDistribution", null);
__decorate([
    (0, common_1.Get)('report-summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Resumen consolidado para reportes (fecha variable)',
    }),
    __param(0, (0, common_1.Query)('startYear')),
    __param(1, (0, common_1.Query)('startMonth')),
    __param(2, (0, common_1.Query)('endYear')),
    __param(3, (0, common_1.Query)('endMonth')),
    __param(4, (0, common_1.Query)('type')),
    __param(5, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getReportSummary", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('v1/dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map