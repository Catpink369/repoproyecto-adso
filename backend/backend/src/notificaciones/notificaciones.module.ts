import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { FcmPushService } from './fcm-push.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [PrismaModule, TaskModule],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, FcmPushService],
  exports: [FcmPushService, NotificacionesService],
})
export class NotificacionesModule {}