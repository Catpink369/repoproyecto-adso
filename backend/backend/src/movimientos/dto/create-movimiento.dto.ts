import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateMovimientoDto {
  @IsNumber()
  @Type(() => Number)
  Cantidad_m: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsString()
  @IsIn(['M-E', 'M-S', 'M_E', 'M_S'])
  id_m: string;

  @IsNumber()
  @Type(() => Number)
  id_producto: number;

  @IsString()
  id_usuario: string;
}