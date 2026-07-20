import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumen financiero del período' })
  getSummary(
    @Query('year') year: number,
    @Query('month') month: number,
    @CurrentUser('id') userId: string,
  ) {
    const now = new Date();
    return this.service.getSummary(
      userId,
      year || now.getFullYear(),
      month || now.getMonth() + 1,
    );
  }

  @Get('budgets')
  @ApiOperation({ summary: 'Progreso de presupuestos del período' })
  getBudgets(
    @Query('year') year: number,
    @Query('month') month: number,
    @CurrentUser('id') userId: string,
  ) {
    const now = new Date();
    return this.service.getBudgetProgress(
      userId,
      year || now.getFullYear(),
      month || now.getMonth() + 1,
    );
  }

  @Get('goals')
  @ApiOperation({ summary: 'Progreso de metas de ahorro' })
  getGoals(@CurrentUser('id') userId: string) {
    return this.service.getGoalsProgress(userId);
  }

  @Get('distribution')
  @ApiOperation({ summary: 'Distribución de gastos reales por categoría' })
  getDistribution(
    @Query('year') year: number,
    @Query('month') month: number,
    @CurrentUser('id') userId: string,
  ) {
    const now = new Date();
    return this.service.getExpenseDistribution(
      userId,
      year || now.getFullYear(),
      month || now.getMonth() + 1,
    );
  }

  @Get('report-summary')
  @ApiOperation({
    summary: 'Resumen consolidado para reportes (fecha variable)',
  })
  getReportSummary(
    @Query('startYear') startYear: number,
    @Query('startMonth') startMonth: number,
    @Query('endYear') endYear: number,
    @Query('endMonth') endMonth: number,
    @Query('type') type: string,
    @CurrentUser('id') userId: string,
  ) {
    const now = new Date();
    return this.service.getReportSummary(
      userId,
      startYear || now.getFullYear(),
      startMonth || 1,
      endYear || now.getFullYear(),
      endMonth || 12,
      type || 'all',
    );
  }
}
