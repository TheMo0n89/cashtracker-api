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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryGroupsService } from './category-groups.service';
import { CreateCategoryGroupDto, UpdateCategoryGroupDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Category Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/category-groups')
export class CategoryGroupsController {
  constructor(private readonly service: CategoryGroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos los grupos del usuario' })
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un grupo por ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findByIdAndUser(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo grupo' })
  create(
    @Body() dto: CreateCategoryGroupDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un grupo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryGroupDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete de un grupo' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
