import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response structure for paginated results.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

/**
 * Wraps all successful responses in a consistent { data: <payload> } structure.
 * For paginated responses, the service should return { items: [...], meta: {...} },
 * and this interceptor will restructure it to { data: [...], meta: {...} }.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // If the response is null/undefined (e.g., 204 No Content), pass through
        if (data === undefined || data === null) {
          return data;
        }

        // If the service returned a paginated structure
        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'meta' in data
        ) {
          return {
            data: data.items,
            meta: data.meta,
          };
        }

        // Standard wrapping
        return { data };
      }),
    );
  }
}
