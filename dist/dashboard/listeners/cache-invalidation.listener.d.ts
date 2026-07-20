import { DashboardService } from '../dashboard.service';
import { TransactionCreatedEvent, TransactionUpdatedEvent, TransactionDeletedEvent } from '../../transactions/events/transaction.events';
export declare class CacheInvalidationListener {
    private readonly dashboardService;
    private readonly logger;
    constructor(dashboardService: DashboardService);
    handleTransactionCreated(event: TransactionCreatedEvent): Promise<void>;
    handleTransactionUpdated(event: TransactionUpdatedEvent): Promise<void>;
    handleTransactionDeleted(event: TransactionDeletedEvent): Promise<void>;
}
