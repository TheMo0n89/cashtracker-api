import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Sueldo mensual' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'], {
    message: 'El tipo debe ser "income" o "expense".',
  })
  type: 'income' | 'expense';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'categoryGroupId debe ser un UUID válido.' })
  categoryGroupId?: string | null;

  @ApiPropertyOptional({ example: 'wallet' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: '#10b981' })
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'El color debe tener formato #RRGGBB.',
  })
  color?: string;
}
