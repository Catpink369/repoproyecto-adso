import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialColorDto } from './create-material-color.dto';

export class UpdateMaterialColorDto extends PartialType(CreateMaterialColorDto) {}
