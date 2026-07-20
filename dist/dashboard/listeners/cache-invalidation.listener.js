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
var CacheInvalidationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInvalidationListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const dashboard_service_1 = require("../dashboard.service");
const transaction_events_1 = require("../../transactions/events/transaction.events");
let CacheInvalidationListener = CacheInvalidationListener_1 = class CacheInvalidationListener {
    dashboardService;
    logger = new common_1.Logger(CacheInvalidationListener_1.name);
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async handleTransactionCreated(event) {
        this.logger.debug(`Transaction created (${event.transactionId}), invalidating cache for user ${event.userId}`);
        await this.dashboardService.invalidateCache(event.userId);
    }
    async handleTransactionUpdated(event) {
        this.logger.debug(`Transaction updated (${event.transactionId}), invalidating cache for user ${event.userId}`);
        await this.dashboardService.invalidateCache(event.userId);
    }
    async handleTransactionDeleted(event) {
        this.logger.debug(`Transaction deleted (${event.transactionId}), invalidating cache for user ${event.userId}`);
        await this.dashboardService.invalidateCache(event.userId);
    }
};
exports.CacheInvalidationListener = CacheInvalidationListener;
__decorate([
    (0, event_emitter_1.OnEvent)('transaction.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_events_1.TransactionCreatedEvent]),
    __metadata("design:returntype", Promise)
], CacheInvalidationListener.prototype, "handleTransactionCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('transaction.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_events_1.TransactionUpdatedEvent]),
    __metadata("design:returntype", Promise)
], CacheInvalidationListener.prototype, "handleTransactionUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('transaction.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_events_1.TransactionDeletedEvent]),
    __metadata("design:returntype", Promise)
], CacheInvalidationListener.prototype, "handleTransactionDeleted", null);
exports.CacheInvalidationListener = CacheInvalidationListener = CacheInvalidationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], CacheInvalidationListener);
//# sourceMappingURL=cache-invalidation.listener.js.map