import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * Catch-all exception filter for any unhandled exceptions.
 * Ensures consistent error response format and logs the full error for debugging.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor.';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || message;

        // Handle class-validator array of messages
        if (Array.isArray(resp.message)) {
          message = (resp.message as string[]).join('. ');
          code = 'VALIDATION_ERROR';
        }
      }

      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'Demasiadas solicitudes. Intenta de nuevo más tarde.';
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Unknown exception type on ${request.method} ${request.url}`,
        String(exception),
      );
    }

    response.status(status).json({
      success: false,
      message,
      code,
    });
  }
}
