import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'], {
    message: 'El tipo debe ser "income" o "expense".',
  })
  type: 'income' | 'expense';

  @ApiProperty({ example: 1500.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El monto debe ser mayor a 0.' })
  amount: number;

  @ApiProperty()
  @IsUUID('4', { message: 'categoryId debe ser un UUID válido.' })
  categoryId: string;

  @ApiProperty({ example: '2026-06-05' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD.' })
  date: string;

  @ApiPropertyOptional({ example: 'Pago de sueldo mensual' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'Supermercado Central' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentPlace?: string;

  @ApiPropertyOptional({ example: 'F001-12345' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;
}
