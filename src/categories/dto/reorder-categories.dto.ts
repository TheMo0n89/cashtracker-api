import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReorderCategoriesDto {
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((dto: ReorderCategoriesDto) => dto.categoryGroupId !== null)
  @IsUUID('4')
  categoryGroupId?: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  orderedCategoryIds: string[];
}
