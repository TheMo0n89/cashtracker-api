"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionDeletedEvent = exports.TransactionUpdatedEvent = exports.TransactionCreatedEvent = void 0;
class TransactionCreatedEvent {
    userId;
    transactionId;
    constructor(userId, transactionId) {
        this.userId = userId;
        this.transactionId = transactionId;
    }
}
exports.TransactionCreatedEvent = TransactionCreatedEvent;
class TransactionUpdatedEvent {
    userId;
    transactionId;
    constructor(userId, transactionId) {
        this.userId = userId;
        this.transactionId = transactionId;
    }
}
exports.TransactionUpdatedEvent = TransactionUpdatedEvent;
class TransactionDeletedEvent {
    userId;
    transactionId;
    constructor(userId, transactionId) {
        this.userId = userId;
        this.transactionId = transactionId;
    }
}
exports.TransactionDeletedEvent = TransactionDeletedEvent;
//# sourceMappingURL=transaction.events.js.map