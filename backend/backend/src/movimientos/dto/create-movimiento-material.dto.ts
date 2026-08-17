import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsIn, IsNotEmpty, Min, MaxLength } from 'class-validator';

const TIPOS_MOVIMIENTO_VALIDOS = ['M-E', 'M-S', 'M_E', 'M_S'];

export class CreateMovimientoMaterialDto {
  @IsNumber(
    {},
    { message: 'cantidad_m debe ser un número (cantidad de metros o unidades a mover).' },
  )
  @Min(0.01, {
    message: 'cantidad_m debe ser mayor a 0. No se pueden registrar movimientos con cantidad cero o negativa.',
  })
  @Type(() => Number)
  cantidad_m: number;

  @IsOptional()
  @IsString({ message: 'observaciones debe ser un texto.' })
  @MaxLength(80, {
    message: 'observaciones no puede superar los 80 caracteres (límite de la columna "observaciones" en la base de datos).',
  })
  observaciones?: string;

  @IsString({ message: 'id_m debe ser un texto.' })
  @IsIn(TIPOS_MOVIMIENTO_VALIDOS, {
    message: `id_m inválido: el valor recibido no es un tipo de movimiento reconocido. Use 'M-E' o 'M_E' para registrar una entrada, o 'M-S' o 'M_S' para registrar una salida.`,
  })
  id_m: string;

  @IsNumber(
    {},
    { message: 'id_material debe ser un número (ID del material asociado al movimiento).' },
  )
  @Type(() => Number)
  id_material: number;

  @IsString({ message: 'id_usuario debe ser un texto (documento del usuario que registra el movimiento).' })
  @IsNotEmpty({
    message: 'id_usuario es obligatorio: todo movimiento debe quedar asociado al usuario que lo registró.',
  })
  id_usuario: string;
}