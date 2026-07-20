import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  TransactionTypeMismatchException,
  CategoryGroupMismatchException,
  BudgetCategoryTypeException,
  CategoryHasTransactionsException,
  DuplicateResourceException,
  ResourceNotFoundException,
  DuplicateBudgetException,
  InsufficientGoalBalanceException,
  InvalidCredentialsException,
  EmailAlreadyExistsException,
} from '../exceptions';

/**
 * Maps domain exceptions to HTTP status codes.
 * The domain layer throws exceptions without knowledge of HTTP,
 * and this filter translates them for the API consumer.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  private readonly statusMap = new Map<string, HttpStatus>([
    [ResourceNotFoundException.name, HttpStatus.NOT_FOUND],
    [InvalidCredentialsException.name, HttpStatus.UNAUTHORIZED],
    [DuplicateResourceException.name, HttpStatus.CONFLICT],
    [EmailAlreadyExistsException.name, HttpStatus.CONFLICT],
    [DuplicateBudgetException.name, HttpStatus.CONFLICT],
    [TransactionTypeMismatchException.name, HttpStatus.UNPROCESSABLE_ENTITY],
    [CategoryGroupMismatchException.name, HttpStatus.UNPROCESSABLE_ENTITY],
    [BudgetCategoryTypeException.name, HttpStatus.UNPROCESSABLE_ENTITY],
    [CategoryHasTransactionsException.name, HttpStatus.CONFLICT],
    [InsufficientGoalBalanceException.name, HttpStatus.UNPROCESSABLE_ENTITY],
  ]);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      this.statusMap.get(exception.name) || HttpStatus.UNPROCESSABLE_ENTITY;

    this.logger.warn(
      `Domain exception [${exception.code}]: ${exception.message}`,
    );

    response.status(status).json({
      success: false,
      message: exception.message,
      code: exception.code,
    });
  }
}
