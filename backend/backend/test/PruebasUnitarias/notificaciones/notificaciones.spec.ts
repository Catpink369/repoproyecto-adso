//RF-009.3 / RF-007.2 (CP-005 y CP-006) / RF-008.2 (CP-007)
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { NotificacionesService } from '../../../src/notificaciones/notificaciones.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { FcmPushService } from '../../../src/notificaciones/fcm-push.service';
import { TaskService } from '../../../src/task/task.service';
import { fakeProductoAlertaRaw, fakePedidoRaw, fakeUsuario } from '../../utils/mock-factories';

function mockUsuarioConCorreo(overrides: Partial<any> = {}) {
  return fakeUsuario({ correo: 'cliente@test.com', ...overrides });
}

describe('Notificaciones ', () => {
  let service: NotificacionesService;
  let prisma: any;
  let fcmPush: any;
  let taskService: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      $queryRaw: jest.fn(),
      producto: { findMany: jest.fn() },
      pedido: { findMany: jest.fn() },
      usuario: { findMany: jest.fn(), findUnique: jest.fn() },
      ticket_compra: { findFirst: jest.fn() },
      notificacion: { create: jest.fn() },
    };

    fcmPush = {
      notificarAdmins: jest.fn(),
      notificarUsuario: jest.fn(),
    };

    taskService = {
      enviarCambioEstadoPedido: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        { provide: PrismaService, useValue: prisma },
        { provide: FcmPushService, useValue: fcmPush },
        { provide: TaskService, useValue: taskService },
      ],
    }).compile();

    service = module.get(NotificacionesService);
  });

  function mockStockBajoRaw(filas: any[]) {
    prisma.$queryRaw.mockResolvedValueOnce(filas);
  }

  // RF-007.2 
  describe('RF-007.2 - Consultar/ver estado de pedido', () => {
    let id_pedido: number;
    let id_usuario: string;

    beforeEach(() => {
      id_pedido = faker.number.int({ min: 1, max: 9999 });
      id_usuario = faker.string.numeric(10);
      prisma.usuario.findUnique.mockResolvedValue(mockUsuarioConCorreo({ id_usuario }));
      prisma.ticket_compra.findFirst.mockResolvedValue({ num_ticket: 123456, total_ticket: 50000 });
      prisma.notificacion.create.mockResolvedValue({ id_notificacion: 1 });
    });

    it('CP-005: debe crear la notificación persistida en el panel del cliente', async () => {
      await service.notificarCambioEstadoPedido({ id_pedido, id_usuario, estado: 'Pagado' });

      expect(prisma.notificacion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ id_usuario, tipo: 'pedido_estado' }),
        }),
      );
    });

    it('CP-006: debe enviar el correo con los datos del ticket cuando el usuario tiene correo registrado', async () => {
      await service.notificarCambioEstadoPedido({ id_pedido, id_usuario, estado: 'Pagado' });

      expect(taskService.enviarCambioEstadoPedido).toHaveBeenCalledWith(
        expect.objectContaining({
          correo: 'cliente@test.com',
          idPedido: id_pedido,
          estado: 'Pagado',
          numTicket: '123456',
          totalTicket: 50000,
        }),
      );
    });
  });

  // RF-008.2 
  describe('RF-008.2 - Actualizar estado de pedido', () => {
    let id_pedido: number;
    let id_usuario: string;

    beforeEach(() => {
      id_pedido = faker.number.int({ min: 1, max: 9999 });
      id_usuario = faker.string.numeric(10);
      prisma.usuario.findUnique.mockResolvedValue(mockUsuarioConCorreo({ id_usuario }));
      prisma.ticket_compra.findFirst.mockResolvedValue({ num_ticket: 123456, total_ticket: 50000 });
      prisma.notificacion.create.mockResolvedValue({ id_notificacion: 1 });
    });

    it('CP-007: debe enviar la notificación push con el título esperado', async () => {
      await service.notificarCambioEstadoPedido({ id_pedido, id_usuario, estado: 'Pagado' });

      expect(fcmPush.notificarUsuario).toHaveBeenCalledWith(
        id_usuario,
        'Actualización de tu pedido',
        expect.stringContaining('pago fue confirmado'),
        expect.objectContaining({ id_pedido: String(id_pedido) }),
      );
    });
  });

  // RF-009.3 
  describe('RF-009.3 - Consultar notificaciones', () => {
    it('CP-008: debe desplegar en orden las alertas de stock bajo, agotados y nuevos pedidos', async () => {
      prisma.producto.findMany.mockResolvedValue([]);
      prisma.pedido.findMany.mockResolvedValue([fakePedidoRaw({ id_usuario: 'u1' })]);
      prisma.usuario.findMany.mockResolvedValue([fakeUsuario({ id_usuario: 'u1' })]);

      mockStockBajoRaw([fakeProductoAlertaRaw({ stock_actual: 2 })]); // stock bajo
      mockStockBajoRaw([fakeProductoAlertaRaw({ stock_actual: 0 })]); // agotados

      const resultado = await service.findAll({});

      expect(resultado).toHaveLength(3); // 1 stock-bajo / 1 agotado / 1 pedido
      const tipos = resultado.map((n: any) => n.tipo);
      expect(tipos).toEqual(expect.arrayContaining(['stock-bajo', 'agotado', 'pedido']));
    });

    it('CP-009: debe filtrar y mostrar únicamente las alertas de stock crítico', async () => {
      prisma.$queryRaw.mockResolvedValue([fakeProductoAlertaRaw({ stock_actual: 1 })]);

      const resultado = await service.stockBajo({});

      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipo).toBe('stock-bajo');
    });

    it('CP-010: las alertas de stock bajo/agotados deben apuntar a /movimientos', async () => {
      prisma.$queryRaw.mockResolvedValue([fakeProductoAlertaRaw({ stock_actual: 1 })]);

      const resultado = await service.stockBajo({});

      expect(resultado[0].ruta_destino).toBe('/movimientos');
    });

    it('CP-010: las alertas de pedido nuevo deben apuntar a /pedidos_realizados', async () => {
      prisma.producto.findMany.mockResolvedValue([]);
      prisma.pedido.findMany.mockResolvedValue([
        fakePedidoRaw({ id_pedido: 7, id_usuario: 'u1', id_tipo: 'P_P' }),
      ]);
      prisma.usuario.findMany.mockResolvedValue([fakeUsuario({ id_usuario: 'u1' })]);
      mockStockBajoRaw([]);
      mockStockBajoRaw([]);

      const resultado = await service.findAll({});
      const notifPedido = resultado.find((n: any) => n.tipo === 'pedido');

      expect(notifPedido).toBeDefined();
      expect(notifPedido?.ruta_destino).toBe('/pedidos_realizados');
    });

    it('CP-011: debe devolver una bandeja vacía cuando no hay alertas pendientes', async () => {
      prisma.producto.findMany.mockResolvedValue([]);
      prisma.pedido.findMany.mockResolvedValue([]);
      prisma.usuario.findMany.mockResolvedValue([]);
      mockStockBajoRaw([]); // stock bajo
      mockStockBajoRaw([]); // agotados

      const resultado = await service.findAll({});

      expect(resultado).toEqual([]);
    });
  });
});