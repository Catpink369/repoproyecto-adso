import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDisenoDto } from './create-material-diseno.dto';

export class UpdateMaterialDisenoDto extends PartialType(CreateMaterialDisenoDto) {}
