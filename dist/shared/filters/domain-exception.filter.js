"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DomainExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../exceptions");
let DomainExceptionFilter = DomainExceptionFilter_1 = class DomainExceptionFilter {
    logger = new common_1.Logger(DomainExceptionFilter_1.name);
    statusMap = new Map([
        [exceptions_1.ResourceNotFoundException.name, common_1.HttpStatus.NOT_FOUND],
        [exceptions_1.InvalidCredentialsException.name, common_1.HttpStatus.UNAUTHORIZED],
        [exceptions_1.DuplicateResourceException.name, common_1.HttpStatus.CONFLICT],
        [exceptions_1.EmailAlreadyExistsException.name, common_1.HttpStatus.CONFLICT],
        [exceptions_1.DuplicateBudgetException.name, common_1.HttpStatus.CONFLICT],
        [exceptions_1.TransactionTypeMismatchException.name, common_1.HttpStatus.UNPROCESSABLE_ENTITY],
        [exceptions_1.CategoryGroupMismatchException.name, common_1.HttpStatus.UNPROCESSABLE_ENTITY],
        [exceptions_1.BudgetCategoryTypeException.name, common_1.HttpStatus.UNPROCESSABLE_ENTITY],
        [exceptions_1.CategoryHasTransactionsException.name, common_1.HttpStatus.CONFLICT],
        [exceptions_1.InsufficientGoalBalanceException.name, common_1.HttpStatus.UNPROCESSABLE_ENTITY],
    ]);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = this.statusMap.get(exception.name) || common_1.HttpStatus.UNPROCESSABLE_ENTITY;
        this.logger.warn(`Domain exception [${exception.code}]: ${exception.message}`);
        response.status(status).json({
            success: false,
            message: exception.message,
            code: exception.code,
        });
    }
};
exports.DomainExceptionFilter = DomainExceptionFilter;
exports.DomainExceptionFilter = DomainExceptionFilter = DomainExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(exceptions_1.DomainException)
], DomainExceptionFilter);
//# sourceMappingURL=domain-exception.filter.js.map