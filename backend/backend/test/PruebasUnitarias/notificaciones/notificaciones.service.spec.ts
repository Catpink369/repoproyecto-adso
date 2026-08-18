import { NotificacionesService } from '../../src/notificaciones/notificaciones.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('NotificacionesService (unit)', () => {
  let service: NotificacionesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn(),
      producto: {
        fields: { stock_minimo: 'stock_minimo' },
        count: jest.fn(),
        findMany: jest.fn(),
      },
      pedido: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      usuario: {
        findMany: jest.fn(),
      },
      ticket_compra: {
        findMany: jest.fn(),
      },
      detalles_pedido: {
        findMany: jest.fn(),
      },
    } as any;

    service = new NotificacionesService(prisma);
  });

  it('should generate a stock-low alert when stock is less than or equal to minimum', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        id_producto: 1,
        nom_producto: 'Producto A',
        stock_actual: 3,
        stock_minimo: 5,
        ultima_actualiz: new Date('2026-08-04T10:00:00Z'),
        categoria: 'Sabanas',
        ruta_imagen: '/uploads/productos/1.png',
      },
    ]);

    const result = await service.stockBajo({});

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      tipo: 'stock-bajo',
      id_producto: 1,
      nom_producto: 'Producto A',
      stock_actual: 3,
      stock_minimo: 5,
      mensaje: 'Alerta de bajo stock',
      clase_boton: 'stock',
      categoria: 'Sabanas',
    });
  });

  it('should generate a critical alert when stock is zero', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        id_producto: 2,
        nom_producto: 'Producto B',
        stock_actual: 0,
        stock_minimo: 5,
        ultima_actualiz: new Date('2026-08-04T11:00:00Z'),
        categoria: 'Cubrelechos',
        ruta_imagen: '/uploads/productos/2.png',
      },
    ]);

    const result = await service.agotados({});

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      tipo: 'agotado',
      id_producto: 2,
      nom_producto: 'Producto B',
      stock_actual: 0,
      stock_minimo: 5,
      mensaje: 'Producto agotado',
      clase_boton: 'agotado',
      categoria: 'Cubrelechos',
    });
  });

  it('should return no alerts when there are no products with low stock or zero stock', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    const lowStock = await service.stockBajo({});
    const agotados = await service.agotados({});

    expect(lowStock).toEqual([]);
    expect(agotados).toEqual([]);
  });

  it('should propagate a database error when alert generation fails', async () => {
    const error = new Error('DB connection error');
    prisma.$queryRaw.mockRejectedValue(error);

    await expect(service.stockBajo({})).rejects.toThrow('DB connection error');
  });

  it('should count low stock and agotado alerts correctly', async () => {
    prisma.producto.count.mockResolvedValueOnce(3 as any);
    prisma.producto.count.mockResolvedValueOnce(2 as any);
    prisma.pedido.count.mockResolvedValueOnce(5 as any);

    const result = await service.count({});

    expect(prisma.producto.count).toHaveBeenCalledTimes(2);
    expect(prisma.pedido.count).toHaveBeenCalledWith({ where: { fecha: { gte: expect.any(Date) } } });
    expect(result).toEqual({
      alertas_stock_bajo: 3,
      alertas_agotados: 2,
      nuevos_pedidos: 5,
      total_notificaciones: 10,
    });
  });
});
