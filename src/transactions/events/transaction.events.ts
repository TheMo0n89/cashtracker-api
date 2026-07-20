/**
 * Domain events emitted by the Transactions module.
 * Consumed by DashboardModule listeners for cache invalidation.
 */

export class TransactionCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
  ) {}
}

export class TransactionUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
  ) {}
}

export class TransactionDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly transactionId: string,
  ) {}
}
