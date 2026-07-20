import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface PaginationMeta {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
