import { MiddlewareConsumer, Module, NestModule, RequestMethod  } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PedidosPersonalizadosModule } from './pedidos-personalizados/pedidos-personalizados.module';
import { TaskModule } from './task/task.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    CategoriasModule,
    MovimientosModule,
    PedidosModule,
    NotificacionesModule,
    PedidosPersonalizadosModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globales — todas las rutas requieren JWT por defecto
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/verify-code', method: RequestMethod.POST },
        { path: 'usuarios', method: RequestMethod.POST },
        { path: 'productos', method: RequestMethod.GET },
        { path: 'uploads/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*'); // aplica a todas las rutas
  }
}