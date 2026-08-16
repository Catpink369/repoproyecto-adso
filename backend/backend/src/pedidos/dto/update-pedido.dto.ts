import { IsOptional, IsString, IsIn } from 'class-validator';

const ESTADOS_VALIDOS = ['Pendiente', 'Pagado', 'En preparación', 'Entregado', 'Finalizado', 'Anulado'];
const METODOS_PAGO_VALIDOS = ['Efectivo', 'Nequi', 'Daviplata', 'DaviPlata', 'Tarjeta', 'Transferencia', 'Por_definir'];

export class UpdatePedidoDto {
    @IsOptional()
    @IsString()
    @IsIn(ESTADOS_VALIDOS, { message: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` })
    estado?: string;

    @IsOptional()
    @IsString()
    @IsIn(METODOS_PAGO_VALIDOS, { message: `metodo_pago debe ser uno de: ${METODOS_PAGO_VALIDOS.join(', ')}` })
    metodo_pago?: string;
}