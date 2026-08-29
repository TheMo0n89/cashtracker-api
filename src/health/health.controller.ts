import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

/**
 * Lightweight health check endpoint.
 * Responds immediately without touching the database or any external service.
 * Used by Render to confirm the process is alive, and by GitHub Actions / monitoring
 * to verify production availability post-deploy.
 *
 * Route: GET /v1/health
 */
@ApiTags('Health')
@Controller('v1/health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Process liveness check (no DB dependency)' })
  check() {
    return {
      status: 'ok',
      service: 'cashtracker-api',
      commit: process.env.RENDER_GIT_COMMIT || 'local',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memory: {
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check including database connectivity' })
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
        commit: process.env.RENDER_GIT_COMMIT || 'local',
      };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
