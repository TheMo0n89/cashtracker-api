export declare class TransactionCreatedEvent {
    readonly userId: string;
    readonly transactionId: string;
    constructor(userId: string, transactionId: string);
}
export declare class TransactionUpdatedEvent {
    readonly userId: string;
    readonly transactionId: string;
    constructor(userId: string, transactionId: string);
}
export declare class TransactionDeletedEvent {
    readonly userId: string;
    readonly transactionId: string;
    constructor(userId: string, transactionId: string);
}
