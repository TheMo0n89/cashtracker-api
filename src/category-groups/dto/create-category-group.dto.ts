import {
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryGroupDto {
  @ApiProperty({ example: 'Salarios', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ enum: ['income', 'expense'], example: 'income' })
  @IsEnum(['income', 'expense'], {
    message: 'El tipo debe ser "income" o "expense".',
  })
  type: 'income' | 'expense';

  @ApiPropertyOptional({ example: 'wallet' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: '#0ea5a4' })
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'El color debe tener formato #RRGGBB.',
  })
  color?: string;
}
