import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty, IsNumber, IsOptional, IsIn, MaxLength, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MaterialItemDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    id_material!: number;

    @IsNumber()
    @Min(0.1)
    @Type(() => Number)
    cantidad!: number;
    }

    export class CreatePedidoPersonalizadoDto {
    @IsString()
    @IsNotEmpty()
    id_usuario!: string;

    @IsIn(['Sabana', 'Sábana', 'Cubrelecho'], {
        message: 'tipo_producto debe ser Sabana o Cubrelecho.',
    })
    tipo_producto!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30, { message: 'tamanio no puede superar los 30 caracteres.' })
    tamanio!: string;

    @IsString()
    @IsOptional()
    metodo_pago?: string;

    @IsArray()
    @ArrayNotEmpty({ message: 'Debes seleccionar al menos un material.' })
    @ValidateNested({ each: true })
    @Type(() => MaterialItemDto)
    materiales!: MaterialItemDto[];
}