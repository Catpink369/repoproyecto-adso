import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoPersonalizadoDto } from './create-pedidos-personalizado.dto';

export class UpdatePedidoPersonalizadoDto extends PartialType(CreatePedidoPersonalizadoDto) {}