//que estas haciendo ?import { NotFoundException } from '@nestjs/common';
import { ProductosService } from '../../src/productos/productos.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('ProductosService (unit)', () => {
  let service: ProductosService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      producto: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    } as any;

    service = new ProductosService(prisma);
  });

  it('should return a list of active products with stock information flattened', async () => {
    const productos = [
      {
        id_producto: 1,
        nom_producto: 'Producto A',
        stock_actual: 20,
        stock_minimo: 5,
        categoria: { nombre_c: 'Sabanas' },
        clasificacion: { nombre_clas: 'Mas vendidos' },
      },
      {
        id_producto: 2,
        nom_producto: 'Producto B',
        stock_actual: 3,
        stock_minimo: 5,
        categoria: { nombre_c: 'Cubrelechos' },
        clasificacion: { nombre_clas: 'En oferta' },
      },
    ];

    prisma.producto.findMany.mockResolvedValue(productos as any);

    const result = await service.findAll({});

    expect(prisma.producto.findMany).toHaveBeenCalledWith({
      where: { estado: true },
      include: {
        categoria: { select: { nombre_c: true } },
        clasificacion: { select: { nombre_clas: true } },
      },
    });
    expect(result).toEqual([
      {
        ...productos[0],
        nombre_c: 'Sabanas',
        nombre_clas: 'Mas vendidos',
      },
      {
        ...productos[1],
        nombre_c: 'Cubrelechos',
        nombre_clas: 'En oferta',
      },
    ]);
  });

  it('should return an empty array when there are no active products', async () => {
    prisma.producto.findMany.mockResolvedValue([] as any);

    const result = await service.findAll({});

    expect(result).toEqual([]);
  });

  it('should return a single active product by id', async () => {
    const producto = {
      id_producto: 1,
      nom_producto: 'Producto A',
      stock_actual: 20,
      stock_minimo: 5,
      categoria: { nombre_c: 'Sabanas' },
      clasificacion: { nombre_clas: 'Mas vendidos' },
    };

    prisma.producto.findFirst.mockResolvedValue(producto as any);

    const result = await service.findOne(1);

    expect(prisma.producto.findFirst).toHaveBeenCalledWith({
      where: { id_producto: 1, estado: true },
      include: {
        categoria: { select: { nombre_c: true } },
        clasificacion: { select: { nombre_clas: true } },
      },
    });
    expect(result).toEqual({
      ...producto,
      nombre_c: 'Sabanas',
      nombre_clas: 'Mas vendidos',
    });
  });

  it('should throw NotFoundException when requesting a non-existent or inactive product', async () => {
    prisma.producto.findFirst.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should return found=false when checkProducto searches for an inactive or missing product', async () => {
    prisma.producto.findFirst.mockResolvedValue(null);

    const result = await service.checkProducto(999);

    expect(result).toEqual({ found: false, message: 'Producto no encontrado' });
  });
});
