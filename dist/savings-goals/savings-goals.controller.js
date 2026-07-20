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
exports.SavingsGoalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const savings_goals_service_1 = require("./savings-goals.service");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../shared/decorators");
let SavingsGoalsController = class SavingsGoalsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(userId) {
        return this.service.findAllByUser(userId);
    }
    findOne(id, userId) {
        return this.service.findByIdAndUser(id, userId);
    }
    create(dto, userId) {
        return this.service.create(userId, dto);
    }
    update(id, dto, userId) {
        return this.service.update(id, userId, dto);
    }
    remove(id, userId) {
        return this.service.remove(id, userId);
    }
    addContribution(id, dto, userId) {
        return this.service.addContribution(id, userId, dto);
    }
    getContributions(id, userId) {
        return this.service.getContributions(id, userId);
    }
};
exports.SavingsGoalsController = SavingsGoalsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista metas de ahorro del usuario' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtiene una meta' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crea una meta de ahorro' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSavingsGoalDto, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualiza una meta' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSavingsGoalDto, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Elimina una meta' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/contributions'),
    (0, swagger_1.ApiOperation)({ summary: 'Aporte o retiro a una meta' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateContributionDto, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "addContribution", null);
__decorate([
    (0, common_1.Get)(':id/contributions'),
    (0, swagger_1.ApiOperation)({ summary: 'Historial de aportes' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SavingsGoalsController.prototype, "getContributions", null);
exports.SavingsGoalsController = SavingsGoalsController = __decorate([
    (0, swagger_1.ApiTags)('Savings Goals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('v1/savings-goals'),
    __metadata("design:paramtypes", [savings_goals_service_1.SavingsGoalsService])
], SavingsGoalsController);
//# sourceMappingURL=savings-goals.controller.js.map