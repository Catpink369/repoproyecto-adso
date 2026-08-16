import { Type } from 'class-transformer';
import { IsString, IsIn, IsNumber, Min, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateMovimientoDto {
  @IsNumber(
    {},
    { message: 'Cantidad_m debe ser un número (cantidad de unidades a mover).' },
  )
  @Min(1, {
    message: 'Cantidad_m debe ser mayor a 0. No se pueden registrar movimientos con cantidad cero o negativa.',
  })
  @Type(() => Number)
  Cantidad_m!: number;

  @IsOptional()
  @IsString({ message: 'observaciones debe ser un texto.' })
  @MaxLength(80, {
    message: 'observaciones no puede superar los 80 caracteres (límite de la columna "observaciones" en la base de datos).',
  })
  observaciones?: string;

  @IsString()
  @IsIn(['M-E', 'M-S', 'M_E', 'M_S'], {
    message: 'id_m debe ser M-E/M_E (entrada) o M-S/M_S (salida).',
  })
  id_m!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'id_producto es obligatorio' })
  @Type(() => Number)
  id_producto!: number;

  @IsString()
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  id_usuario!: string;
}