import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCategoryGroupDto } from './create-category-group.dto';

export class UpdateCategoryGroupDto extends PartialType(
  OmitType(CreateCategoryGroupDto, ['type'] as const),
) {}
