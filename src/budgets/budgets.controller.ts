import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista presupuestos del período' })
  findAll(
    @Query('year') year: number,
    @Query('month') month: number,
    @CurrentUser('id') userId: string,
  ) {
    const now = new Date();
    return this.service.findAllByUserAndPeriod(
      userId,
      year || now.getFullYear(),
      month || now.getMonth() + 1,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un presupuesto' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findByIdAndUser(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un presupuesto' })
  create(@Body() dto: CreateBudgetDto, @CurrentUser('id') userId: string) {
    return this.service.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza el monto del presupuesto' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un presupuesto' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
