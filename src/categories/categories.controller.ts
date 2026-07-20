import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, ReorderCategoriesDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista categorías del usuario' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('type') type?: 'income' | 'expense',
  ) {
    return this.service.findAllByUser(userId, type);
  }

  @Get(':id/deletion-impact')
  @ApiOperation({
    summary: 'Obtiene el impacto de eliminar una categoria',
  })
  getDeletionImpact(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.getDeletionImpact(id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una categoría por ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findByIdAndUser(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crea una categoría' })
  create(@Body() dto: CreateCategoryDto, @CurrentUser('id') userId: string) {
    return this.service.create(userId, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reordena categorias dentro de un grupo' })
  reorder(
    @Body() dto: ReorderCategoriesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.reorder(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza una categoría' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete de categoría (RESTRICT si tiene transacciones)',
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
