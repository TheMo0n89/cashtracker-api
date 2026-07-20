/**
 * Base class for all domain-level exceptions.
 * These exceptions represent business rule violations, NOT HTTP errors.
 * The ExceptionFilter maps them to appropriate HTTP status codes.
 */
export class DomainException extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}

/**
 * Thrown when a transaction's type does not match its category's type.
 * E.g., creating an expense transaction under an income-only category.
 */
export class TransactionTypeMismatchException extends DomainException {
  constructor() {
    super(
      'TRANSACTION_TYPE_MISMATCH',
      'El tipo de la transaccion no coincide con el tipo de la categoria.',
    );
    this.name = 'TransactionTypeMismatchException';
  }
}

export class CategoryGroupMismatchException extends DomainException {
  constructor() {
    super(
      'CATEGORY_GROUP_MISMATCH',
      'El grupo de categorias no pertenece al usuario o no coincide con el tipo de la categoria.',
    );
    this.name = 'CategoryGroupMismatchException';
  }
}

export class BudgetCategoryTypeException extends DomainException {
  constructor() {
    super(
      'BUDGET_CATEGORY_TYPE_INVALID',
      'Solo se pueden crear presupuestos para categorias de gasto.',
    );
    this.name = 'BudgetCategoryTypeException';
  }
}

/**
 * Thrown when attempting to delete a category that has linked transactions.
 */
export class CategoryHasTransactionsException extends DomainException {
  constructor() {
    super(
      'CATEGORY_HAS_TRANSACTIONS',
      'No se puede eliminar una categoria que tiene transacciones registradas.',
    );
    this.name = 'CategoryHasTransactionsException';
  }
}

/**
 * Thrown when attempting to create a resource that already exists (unique constraint).
 */
export class DuplicateResourceException extends DomainException {
  constructor(resource: string, field: string) {
    super(
      'DUPLICATE_RESOURCE',
      `Ya existe un(a) ${resource} con ese ${field}.`,
    );
    this.name = 'DuplicateResourceException';
  }
}

/**
 * Thrown when a resource is not found or doesn't belong to the current user.
 * Maps to 404 to avoid revealing existence of resources to unauthorized users.
 */
export class ResourceNotFoundException extends DomainException {
  constructor(resource: string) {
    super('RESOURCE_NOT_FOUND', `${resource} no encontrado(a).`);
    this.name = 'ResourceNotFoundException';
  }
}

/**
 * Thrown when a budget already exists for the same category+period combination.
 */
export class DuplicateBudgetException extends DomainException {
  constructor() {
    super(
      'DUPLICATE_BUDGET',
      'Ya existe un presupuesto para esta categoria en el periodo indicado.',
    );
    this.name = 'DuplicateBudgetException';
  }
}

/**
 * Thrown when a savings goal contribution would result in a negative balance.
 */
export class InsufficientGoalBalanceException extends DomainException {
  constructor() {
    super(
      'INSUFFICIENT_GOAL_BALANCE',
      'El retiro excede el saldo actual de la meta de ahorro.',
    );
    this.name = 'InsufficientGoalBalanceException';
  }
}

/**
 * Thrown when the user provides invalid credentials during login.
 */
export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('INVALID_CREDENTIALS', 'El email o la contraseña son incorrectos.');
    this.name = 'InvalidCredentialsException';
  }
}

/**
 * Thrown when a duplicate email is detected during registration.
 */
export class EmailAlreadyExistsException extends DomainException {
  constructor() {
    super('EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta con este email.');
    this.name = 'EmailAlreadyExistsException';
  }
}

