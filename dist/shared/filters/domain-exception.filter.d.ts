import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { DomainException } from '../exceptions';
export declare class DomainExceptionFilter implements ExceptionFilter {
    private readonly logger;
    private readonly statusMap;
    catch(exception: DomainException, host: ArgumentsHost): void;
}
