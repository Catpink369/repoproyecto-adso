import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, MaxLength, IsArray, ArrayNotEmpty, ValidateNested } from 'class-validator';

export class MaterialItemDto {
    @IsNumber()
    @IsNotEmpty({ message: 'El id_material es obligatorio.' })
    @Type(() => Number)
    id_material!: number;

    @IsNumber()
    @Min(0.1, { message: 'La cantidad debe ser mayor a 0.' })
    @Type(() => Number)
    cantidad!: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_color?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    id_diseno?: number;

    @IsOptional()
    @IsString()
    @MaxLength(40, { message: 'El concepto no puede superar los 40 caracteres.' })
    concepto?: string;
    }

    export class CreatePedidoPersonalizadoDto {
    @IsString()
    @IsNotEmpty({ message: 'El id_usuario es obligatorio.' })
    id_usuario!: string;

    @IsString()
    @IsNotEmpty({ message: 'El tipo_producto es obligatorio.' })
    tipo_producto!: string;

    @IsString()
    @IsNotEmpty({ message: 'El tamaño es obligatorio.' })
    tamanio!: string;

    @IsOptional()
    @IsString()
    metodo_pago?: string;

    @IsArray()
    @ArrayNotEmpty({ message: 'Debes seleccionar al menos un material (la tela es obligatoria).' })
    @ValidateNested({ each: true })
    @Type(() => MaterialItemDto)
    materiales!: MaterialItemDto[];
}