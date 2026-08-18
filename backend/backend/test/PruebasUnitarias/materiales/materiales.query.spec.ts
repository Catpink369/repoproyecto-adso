import { PedidosPersonalizadosService } from '../../src/pedidos-personalizados/pedidos-personalizados.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('PedidosPersonalizadosService - Consultar materiales (unit)', () => {
  let service: PedidosPersonalizadosService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      material: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      material_color: {
        findMany: jest.fn(),
      },
      material_diseno: {
        findMany: jest.fn(),
      },
    } as any;

    service = new PedidosPersonalizadosService(prisma as any);
  });

  it('should return a list of active materials', async () => {
    const items = [
      { id_material: 1, nombre: 'A', tipo: 'Color', unidad: 'u', precio_unitario: 1, stock_actual: 10, ruta_imagen: '/img/a.png' },
      { id_material: 2, nombre: 'B', tipo: 'Diseño', unidad: 'u', precio_unitario: 2, stock_actual: 5, ruta_imagen: '/img/b.png' },
    ];
    prisma.material.findMany.mockResolvedValueOnce(items as any);

    const res = await service.getMateriales({});

    expect(prisma.material.findMany).toHaveBeenCalledWith({
      where: { estado: true },
      select: {
        id_material: true,
        nombre: true,
        tipo: true,
        unidad: true,
        precio_unitario: true,
        stock_actual: true,
        ruta_imagen: true,
      },
    });
    expect(res).toEqual(items);
  });

  it('should return empty list when no materials found', async () => {
    prisma.material.findMany.mockResolvedValueOnce([] as any);
    const res = await service.getMateriales({});
    expect(res).toEqual([]);
  });

  it('should filter materials by tipo', async () => {
    const items = [
      { id_material: 3, nombre: 'C', tipo: 'Color', unidad: 'u', precio_unitario: 3, stock_actual: 7, ruta_imagen: null },
    ];
    prisma.material.findMany.mockResolvedValueOnce(items as any);

    const res = await service.getMaterialesPorTipo('Color');

    expect(prisma.material.findMany).toHaveBeenCalledWith({
      where: { estado: true, tipo: 'Color' },
      select: {
        id_material: true,
        nombre: true,
        tipo: true,
        unidad: true,
        precio_unitario: true,
        stock_actual: true,
        ruta_imagen: true,
      },
    });

    expect(res).toEqual(items);
  });

  it('should return colors for a given material', async () => {
    const colors = [{ id_color: 1, nombre: 'Rojo', codigo_hex: '#FF0000' }];
    prisma.material_color.findMany.mockResolvedValueOnce(colors as any);

    const res = await service.getColoresMaterial(1);

    expect(prisma.material_color.findMany).toHaveBeenCalledWith({ where: { id_material: 1, estado: true }, select: { id_color: true, nombre: true, codigo_hex: true } });
    expect(res).toEqual(colors);
  });

  it('should return designs for a given material', async () => {
    const disenos = [{ id_diseno: 1, nombre: 'Flores', ruta_imagen: '/img/flores.png' }];
    prisma.material_diseno.findMany.mockResolvedValueOnce(disenos as any);

    const res = await service.getDisenosMaterial(2);

    expect(prisma.material_diseno.findMany).toHaveBeenCalledWith({ where: { id_material: 2, estado: true }, select: { id_diseno: true, nombre: true, ruta_imagen: true } });
    expect(res).toEqual(disenos);
  });

  it('should propagate DB errors when querying materials', async () => {
    const err = new Error('DB error');
    prisma.material.findMany.mockRejectedValueOnce(err);

    await expect(service.getMateriales({})).rejects.toThrow('DB error');
  });
});
