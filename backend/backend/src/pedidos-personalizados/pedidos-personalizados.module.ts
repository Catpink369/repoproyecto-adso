import { Module } from '@nestjs/common';
import { PedidosPersonalizadosService } from './pedidos-personalizados.service';
import { PedidosPersonalizadosController } from './pedidos-personalizados.controller';

@Module({
  controllers: [PedidosPersonalizadosController],
  providers: [PedidosPersonalizadosService],
})
export class PedidosPersonalizadosModule {}
