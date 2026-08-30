import { Module } from '@nestjs/common';
import { PedidosPersonalizadosService } from './pedidos-personalizados.service';
import { PedidosPersonalizadosController } from './pedidos-personalizados.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [PedidosPersonalizadosController],
  providers: [PedidosPersonalizadosService],
})
export class PedidosPersonalizadosModule {}