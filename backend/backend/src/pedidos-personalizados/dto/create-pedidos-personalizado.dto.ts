import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MaterialItemDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    id_material: number;

    @IsNumber()
    @Min(0.1)
    @Type(() => Number)
    cantidad: number;
    }

    export class CreatePedidoPersonalizadoDto {
    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    id_usuario: string;

    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    tipo_producto: string;

    @IsString()
    @IsNotEmpty()
    @Type(() => String)
    tamanio: string;

    // El cliente no elige método de pago al personalizar; queda "Por definir"
    // hasta que el admin/trabajador lo asigne al cotizar el pedido.
    @IsString()
    @IsOptional()
    @Type(() => String)
    metodo_pago?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialItemDto)
    materiales: MaterialItemDto[];
}