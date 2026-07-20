import { Module } from '@nestjs/common';

/**
 * SharedModule exports cross-cutting concerns used by all feature modules.
 * Value Objects, Exceptions, Filters, Interceptors, Decorators, and shared DTOs.
 *
 * Note: Filters and Interceptors are registered globally in main.ts,
 * not through this module. The module exists primarily for organizational clarity
 * and to make shared providers available through DI if needed.
 */
@Module({
  providers: [],
  exports: [],
})
export class SharedModule {}
