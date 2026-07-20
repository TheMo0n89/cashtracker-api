export declare class DomainException extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare class TransactionTypeMismatchException extends DomainException {
    constructor();
}
export declare class CategoryGroupMismatchException extends DomainException {
    constructor();
}
export declare class BudgetCategoryTypeException extends DomainException {
    constructor();
}
export declare class CategoryHasTransactionsException extends DomainException {
    constructor();
}
export declare class DuplicateResourceException extends DomainException {
    constructor(resource: string, field: string);
}
export declare class ResourceNotFoundException extends DomainException {
    constructor(resource: string);
}
export declare class DuplicateBudgetException extends DomainException {
    constructor();
}
export declare class InsufficientGoalBalanceException extends DomainException {
    constructor();
}
export declare class InvalidCredentialsException extends DomainException {
    constructor();
}
export declare class EmailAlreadyExistsException extends DomainException {
    constructor();
}
