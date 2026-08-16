import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, IsString, MaxLength } from 'class-validator';
export class UpdateMovimientoDto {
    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'Cantidad_m debe ser mayor a 0.' })
    @Type(() => Number)
    Cantidad_m?: number;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    observaciones?: string;
}