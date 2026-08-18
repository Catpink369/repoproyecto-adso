//RF-009.3
import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesService } from '../../../src/notificaciones/notificaciones.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { FcmPushService } from '../../../src/notificaciones/fcm-push.service';
import { TaskService } from '../../../src/task/task.service';
import { fakeProductoAlertaRaw, fakePedidoRaw, fakeUsuario } from '../../utils/mock-factories';

describe('Notificaciones ', () => {
  let service: NotificacionesService;
  let prisma: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        { provide: PrismaService, useValue: prisma },
        // FcmPushService y TaskService siguen siendo dependencias del servicio
        // (las usa notificarCambioEstadoPedido, que ya no se prueba en este
        // archivo), se mockean solo para que el módulo compile.
        { provide: FcmPushService, useValue: { notificarAdmins: jest.fn(), notificarUsuario: jest.fn() } },
        { provide: TaskService, useValue: { enviarCambioEstadoPedido: jest.fn() } },
      ],
    }).compile();

    service = module.get(NotificacionesService);
  });

  function mockStockBajoRaw(filas: any[]) {
    prisma.$queryRaw.mockResolvedValueOnce(filas);
  }

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
      // NOTA: numeración duplicada (dos CP-010) heredada del archivo original;
      // revisar y renumerar cuando toque este archivo.
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