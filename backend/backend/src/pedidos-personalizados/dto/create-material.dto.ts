import { Type } from 'class-transformer';
import { IsString, IsIn, IsNumber, Min, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

const TIPOS_MATERIAL = ['Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio'];
const UNIDADES_MATERIAL = ['metro', 'unidad'];

export class CreateMaterialDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del material es obligatorio.' })
    @MaxLength(60, { message: 'El nombre no puede superar los 60 caracteres.' })
    nombre!: string;

    @IsIn(TIPOS_MATERIAL, {
        message: `tipo debe ser uno de: ${TIPOS_MATERIAL.join(', ')}`,
    })
    tipo!: string;

    @IsIn(UNIDADES_MATERIAL, {
        message: `unidad debe ser uno de: ${UNIDADES_MATERIAL.join(', ')}`,
    })
    unidad!: string;

    @IsNumber()
    @Min(0, { message: 'precio_unitario no puede ser negativo.' })
    @Type(() => Number)
    precio_unitario!: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'stock_actual no puede ser negativo.' })
    @Type(() => Number)
    stock_actual?: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'stock_minimo no puede ser negativo.' })
    @Type(() => Number)
    stock_minimo?: number;
}