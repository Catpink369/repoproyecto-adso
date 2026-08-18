import { PedidosPersonalizadosService } from '../../src/pedidos-personalizados/pedidos-personalizados.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PedidosPersonalizadosService - Materiales (unit)', () => {
  let service: PedidosPersonalizadosService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      material: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    service = new PedidosPersonalizadosService(prisma as any);
  });

  it('should create a material successfully', async () => {
    const dto = {
      nombre: 'Nuevo Color',
      tipo: 'Color',
      unidad: 'Unidad',
      precio_unitario: 10.5,
      stock_actual: 100,
      stock_minimo: 5,
    };

    const created = { id_material: 123, ...dto, estado: true };
    prisma.material.create.mockResolvedValueOnce(created as any);

    const result = await service.crearMaterial(dto as any);

    expect(prisma.material.create).toHaveBeenCalledWith({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        unidad: dto.unidad,
        precio_unitario: dto.precio_unitario,
        stock_actual: dto.stock_actual,
        stock_minimo: dto.stock_minimo,
        estado: true,
      },
    });

    expect(result).toEqual(created);
  });

  it('should propagate unique constraint error from prisma', async () => {
    const dto = {
      nombre: 'Duplicado',
      tipo: 'Color',
      unidad: 'Unidad',
      precio_unitario: 1,
      stock_actual: 10,
      stock_minimo: 1,
    };

    const err = { code: '23505', message: 'Unique constraint' };
    prisma.material.create.mockRejectedValueOnce(err as any);

    await expect(service.crearMaterial(dto as any)).rejects.toMatchObject(err);
  });

  it('should propagate validation errors (BadRequestException) thrown by service', async () => {
    const dto = {
      nombre: '',
      tipo: 'Color',
      unidad: 'Unidad',
      precio_unitario: -5,
      stock_actual: -1,
      stock_minimo: -1,
    };

    const badReq = new BadRequestException('Invalid data');
    prisma.material.create.mockRejectedValueOnce(badReq);

    await expect(service.crearMaterial(dto as any)).rejects.toThrow(BadRequestException);
  });

  it('should propagate generic DB errors', async () => {
    const dto = {
      nombre: 'Otra',
      tipo: 'Diseño',
      unidad: 'Unidad',
      precio_unitario: 2,
      stock_actual: 5,
      stock_minimo: 0,
    };

    const err = new Error('DB connection error');
    prisma.material.create.mockRejectedValueOnce(err);

    await expect(service.crearMaterial(dto as any)).rejects.toThrow('DB connection error');
  });
});
