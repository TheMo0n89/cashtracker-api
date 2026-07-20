"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAlreadyExistsException = exports.InvalidCredentialsException = exports.InsufficientGoalBalanceException = exports.DuplicateBudgetException = exports.ResourceNotFoundException = exports.DuplicateResourceException = exports.CategoryHasTransactionsException = exports.BudgetCategoryTypeException = exports.CategoryGroupMismatchException = exports.TransactionTypeMismatchException = exports.DomainException = void 0;
class DomainException extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'DomainException';
    }
}
exports.DomainException = DomainException;
class TransactionTypeMismatchException extends DomainException {
    constructor() {
        super('TRANSACTION_TYPE_MISMATCH', 'El tipo de la transaccion no coincide con el tipo de la categoria.');
        this.name = 'TransactionTypeMismatchException';
    }
}
exports.TransactionTypeMismatchException = TransactionTypeMismatchException;
class CategoryGroupMismatchException extends DomainException {
    constructor() {
        super('CATEGORY_GROUP_MISMATCH', 'El grupo de categorias no pertenece al usuario o no coincide con el tipo de la categoria.');
        this.name = 'CategoryGroupMismatchException';
    }
}
exports.CategoryGroupMismatchException = CategoryGroupMismatchException;
class BudgetCategoryTypeException extends DomainException {
    constructor() {
        super('BUDGET_CATEGORY_TYPE_INVALID', 'Solo se pueden crear presupuestos para categorias de gasto.');
        this.name = 'BudgetCategoryTypeException';
    }
}
exports.BudgetCategoryTypeException = BudgetCategoryTypeException;
class CategoryHasTransactionsException extends DomainException {
    constructor() {
        super('CATEGORY_HAS_TRANSACTIONS', 'No se puede eliminar una categoria que tiene transacciones registradas.');
        this.name = 'CategoryHasTransactionsException';
    }
}
exports.CategoryHasTransactionsException = CategoryHasTransactionsException;
class DuplicateResourceException extends DomainException {
    constructor(resource, field) {
        super('DUPLICATE_RESOURCE', `Ya existe un(a) ${resource} con ese ${field}.`);
        this.name = 'DuplicateResourceException';
    }
}
exports.DuplicateResourceException = DuplicateResourceException;
class ResourceNotFoundException extends DomainException {
    constructor(resource) {
        super('RESOURCE_NOT_FOUND', `${resource} no encontrado(a).`);
        this.name = 'ResourceNotFoundException';
    }
}
exports.ResourceNotFoundException = ResourceNotFoundException;
class DuplicateBudgetException extends DomainException {
    constructor() {
        super('DUPLICATE_BUDGET', 'Ya existe un presupuesto para esta categoria en el periodo indicado.');
        this.name = 'DuplicateBudgetException';
    }
}
exports.DuplicateBudgetException = DuplicateBudgetException;
class InsufficientGoalBalanceException extends DomainException {
    constructor() {
        super('INSUFFICIENT_GOAL_BALANCE', 'El retiro excede el saldo actual de la meta de ahorro.');
        this.name = 'InsufficientGoalBalanceException';
    }
}
exports.InsufficientGoalBalanceException = InsufficientGoalBalanceException;
class InvalidCredentialsException extends DomainException {
    constructor() {
        super('INVALID_CREDENTIALS', 'El email o la contraseña son incorrectos.');
        this.name = 'InvalidCredentialsException';
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
class EmailAlreadyExistsException extends DomainException {
    constructor() {
        super('EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta con este email.');
        this.name = 'EmailAlreadyExistsException';
    }
}
exports.EmailAlreadyExistsException = EmailAlreadyExistsException;
//# sourceMappingURL=domain.exception.js.map