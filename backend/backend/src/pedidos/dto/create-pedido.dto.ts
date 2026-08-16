import { IsNotEmpty, IsString, IsNumber, IsArray, ArrayNotEmpty, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePedidoItemDto {
    @IsNumber()
    @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
    @Type(() => Number)
    id_producto!: number;

    @IsNumber()
    @IsNotEmpty({ message: 'La cantidad es obligatoria' })
    @Min(1, { message: 'La cantidad debe ser un número positivo' })
    @Type(() => Number)
    cantidad!: number;

    @IsNumber()
    @IsNotEmpty({ message: 'El precio es obligatorio' })
    @Min(0, { message: 'El precio debe ser un número positivo' })
    @Type(() => Number)
    precio!: number;
}

export class CreatePedidoDto {
    @IsArray()
    @ArrayNotEmpty({ message: 'El pedido debe tener al menos un producto' })
    @ValidateNested({ each: true })
    @Type(() => CreatePedidoItemDto)
    items!: CreatePedidoItemDto[];

    @IsString()
    @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
    id_usuario!: string;

    @IsString()
    @IsNotEmpty({ message: 'El método de pago es obligatorio' })
    metodo_pago!: string;

    @IsNumber()
    @Min(0, { message: 'El subtotal debe ser un número positivo' })
    @Type(() => Number)
    subtotal!: number;

    @IsNumber()
    @Min(0, { message: 'El impuesto debe ser un número positivo' })
    @Type(() => Number)
    total!: number;
}