import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {

    @IsString()
    @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
    @MaxLength(60, { message: 'El nombre del producto no puede tener más de 60 caracteres' })
    nom_producto: string;

    @IsNumber()
    @IsNotEmpty({ message: 'El precio unitario es obligatorio' })
    @Min(0, { message: 'El precio unitario debe ser un número positivo' })
    @Type(() => Number)
    precio_unitario: number;

    @IsNumber()
    @IsNotEmpty({ message: 'El stock actual es obligatorio' })
    @Min(0, { message: 'El stock actual debe ser un número positivo' })
    @Type(() => Number)
    stock_actual: number;

    @IsNumber()
    @IsNotEmpty({ message: 'El stock mínimo es obligatorio' })
    @Min(0, { message: 'El stock mínimo debe ser un número positivo' })
    @Type(() => Number)
    stock_minimo: number;

    @IsString()
    @IsOptional()
    @MaxLength(60, { message: 'El color no puede tener más de 60 caracteres' })
    color?: string;

    @IsString()
    @IsOptional()
    @MaxLength(60, { message: 'La talla no puede tener más de 60 caracteres' })
    talla?: string;

    @IsString()
    @IsOptional()
    @MaxLength(60, { message: 'El tamaño no puede tener más de 60 caracteres' })
    tamaño?: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MaxLength(255, { message: 'La descripción no puede tener más de 255 caracteres' })
    descripcion: string;

    @IsNumber()
    @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
    @Type(() => Number)
    id_categoria: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id_clasificacion?: number;

    @IsString()
    @IsOptional()
    ruta_imagen?: string;

    @IsBoolean()
    @IsOptional()
    estado?: boolean;
}