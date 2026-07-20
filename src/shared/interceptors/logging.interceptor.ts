import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logs every incoming request with timing, method, URL, status, and a correlation ID.
 * The correlation ID is useful for tracing requests across distributed systems.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const correlationId =
      (request.headers['x-correlation-id'] as string) || uuidv4();
    const startTime = Date.now();

    // Attach correlation ID to request for downstream use
    (request as any)['correlationId'] = correlationId;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${correlationId}] ${method} ${originalUrl} ${response.statusCode} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${correlationId}] ${method} ${originalUrl} ERROR - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
