import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DashboardService } from '../dashboard.service';
import {
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionDeletedEvent,
} from '../../transactions/events/transaction.events';

/**
 * Listens to transaction lifecycle events and invalidates the
 * dashboard cache for the affected user.
 */
@Injectable()
export class CacheInvalidationListener {
  private readonly logger = new Logger(CacheInvalidationListener.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @OnEvent('transaction.created')
  async handleTransactionCreated(event: TransactionCreatedEvent) {
    this.logger.debug(
      `Transaction created (${event.transactionId}), invalidating cache for user ${event.userId}`,
    );
    await this.dashboardService.invalidateCache(event.userId);
  }

  @OnEvent('transaction.updated')
  async handleTransactionUpdated(event: TransactionUpdatedEvent) {
    this.logger.debug(
      `Transaction updated (${event.transactionId}), invalidating cache for user ${event.userId}`,
    );
    await this.dashboardService.invalidateCache(event.userId);
  }

  @OnEvent('transaction.deleted')
  async handleTransactionDeleted(event: TransactionDeletedEvent) {
    this.logger.debug(
      `Transaction deleted (${event.transactionId}), invalidating cache for user ${event.userId}`,
    );
    await this.dashboardService.invalidateCache(event.userId);
  }
}
