import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CacheInvalidationListener } from './listeners/cache-invalidation.listener';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, CacheInvalidationListener],
  exports: [DashboardService],
})
export class DashboardModule {}
