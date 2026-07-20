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
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionsDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../shared/decorators';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista transacciones paginada con filtros' })
  findAll(
    @Query() filters: FilterTransactionsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findAll(userId, filters);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Obtiene el PDF de factura de una transacciÃ³n' })
  async getInvoice(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const invoice = await this.service.getInvoiceFile(id, userId);
    res.setHeader('Content-Type', invoice.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(invoice.fileName)}"`,
    );
    res.send(invoice.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una transacción' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findByIdAndUser(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crea transacción (valida coherencia de tipo)' })
  create(@Body() dto: CreateTransactionDto, @CurrentUser('id') userId: string) {
    return this.service.create(userId, dto);
  }

  @Post(':id/invoice')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Adjunta o reemplaza PDF de factura' })
  uploadInvoice(
    @Param('id') id: string,
    @UploadedFile()
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
    @CurrentUser('id') userId: string,
  ) {
    return this.service.attachInvoice(id, userId, file);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza transacción (re-valida coherencia)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Delete(':id/invoice')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina el PDF de factura adjunto' })
  removeInvoice(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.removeInvoice(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete de transacción' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
