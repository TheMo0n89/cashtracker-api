import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SavingsGoalsService } from './savings-goals.service';
import {
  CreateSavingsGoalDto,
  UpdateSavingsGoalDto,
  CreateContributionDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Savings Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/savings-goals')
export class SavingsGoalsController {
  constructor(private readonly service: SavingsGoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista metas de ahorro del usuario' })
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una meta' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findByIdAndUser(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crea una meta de ahorro' })
  create(@Body() dto: CreateSavingsGoalDto, @CurrentUser('id') userId: string) {
    return this.service.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza una meta' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSavingsGoalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina una meta' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }

  @Post(':id/contributions')
  @ApiOperation({ summary: 'Aporte o retiro a una meta' })
  addContribution(
    @Param('id') id: string,
    @Body() dto: CreateContributionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.addContribution(id, userId, dto);
  }

  @Get(':id/contributions')
  @ApiOperation({ summary: 'Historial de aportes' })
  getContributions(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.getContributions(id, userId);
  }
}
