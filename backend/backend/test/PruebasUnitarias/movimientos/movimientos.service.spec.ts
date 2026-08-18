import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MovimientosService } from '../../src/movimientos/movimientos.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateMovimientoDto } from '../../src/movimientos/dto/create-movimiento.dto';

describe('MovimientosService (unit)', () => {
  let service: MovimientosService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    const mockTx = {
      producto: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      movimiento: {
        create: jest.fn(),
      },
    } as any;

    prisma = {
      $transaction: jest.fn(async (callback) => callback(mockTx)),
    } as any;

    service = new MovimientosService(prisma);
  });

  it('should create an inventory entry and update stock when input is valid', async () => {
    const dto: CreateMovimientoDto = {
      Cantidad_m: 10,
      id_m: 'M-E',
      id_producto: 1,
      id_usuario: 'user-1',
      observaciones: 'Ingreso por compra',
    };

    const mockProducto = {
      id_producto: 1,
      nom_producto: 'Producto A',
      stock_actual: 5,
      estado: true,
    };

    const mockMovimiento = {
      id_movimiento: 100,
      Cantidad_m: dto.Cantidad_m,
      fecha_m: new Date(),
      observaciones: dto.observaciones,
      id_m: 'M_E',
      id_producto: dto.id_producto,
      id_usuario: dto.id_usuario,
      id_material: null,
    };

    const mockProductoActualizado = {
      id_producto: 1,
      stock_actual: 15,
      ultima_actualiz: new Date(),
    };

    const tx = {
      producto: {
        findUnique: jest.fn().mockResolvedValue(mockProducto),
        update: jest.fn().mockResolvedValue(mockProductoActualizado),
      },
      movimiento: {
        create: jest.fn().mockResolvedValue(mockMovimiento),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await service.create(dto);

    expect(tx.producto.findUnique).toHaveBeenCalledWith({ where: { id_producto: 1 } });
    expect(tx.movimiento.create).toHaveBeenCalledWith({
      data: {
        Cantidad_m: dto.Cantidad_m,
        fecha_m: expect.any(Date),
        observaciones: dto.observaciones,
        id_m: 'M_E',
        id_producto: dto.id_producto,
        id_usuario: dto.id_usuario,
        id_material: null,
      },
    });
    expect(tx.producto.update).toHaveBeenCalledWith({
      where: { id_producto: 1 },
      data: {
        stock_actual: { increment: 10 },
        ultima_actualiz: expect.any(Date),
      },
    });
    expect(result).toEqual({ movimiento: mockMovimiento, stock_actual: 15 });
  });

  it('should create an inventory exit and update stock when stock is sufficient', async () => {
    const dto: CreateMovimientoDto = {
      Cantidad_m: 5,
      id_m: 'M-S',
      id_producto: 1,
      id_usuario: 'user-1',
      observaciones: 'Salida por venta',
    };

    const mockProducto = {
      id_producto: 1,
      nom_producto: 'Producto B',
      stock_actual: 20,
      estado: true,
    };

    const mockMovimiento = {
      id_movimiento: 101,
      Cantidad_m: dto.Cantidad_m,
      fecha_m: new Date(),
      observaciones: dto.observaciones,
      id_m: 'M_S',
      id_producto: dto.id_producto,
      id_usuario: dto.id_usuario,
      id_material: null,
    };

    const mockProductoActualizado = {
      id_producto: 1,
      stock_actual: 15,
      ultima_actualiz: new Date(),
    };

    const tx = {
      producto: {
        findUnique: jest.fn().mockResolvedValue(mockProducto),
        update: jest.fn().mockResolvedValue(mockProductoActualizado),
      },
      movimiento: {
        create: jest.fn().mockResolvedValue(mockMovimiento),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await service.create(dto);

    expect(tx.producto.findUnique).toHaveBeenCalledWith({ where: { id_producto: 1 } });
    expect(tx.movimiento.create).toHaveBeenCalledWith({
      data: {
        Cantidad_m: dto.Cantidad_m,
        fecha_m: expect.any(Date),
        observaciones: dto.observaciones,
        id_m: 'M_S',
        id_producto: dto.id_producto,
        id_usuario: dto.id_usuario,
        id_material: null,
      },
    });
    expect(tx.producto.update).toHaveBeenCalledWith({
      where: { id_producto: 1 },
      data: {
        stock_actual: { increment: -5 },
        ultima_actualiz: expect.any(Date),
      },
    });
    expect(result).toEqual({ movimiento: mockMovimiento, stock_actual: 15 });
  });

  it('should throw BadRequestException when stock is insufficient for an exit', async () => {
    const dto: CreateMovimientoDto = {
      Cantidad_m: 10,
      id_m: 'M-S',
      id_producto: 1,
      id_usuario: 'user-1',
      observaciones: 'Salida por venta',
    };

    const tx = {
      producto: {
        findUnique: jest.fn().mockResolvedValue({
          id_producto: 1,
          nom_producto: 'Producto B',
          stock_actual: 5,
          estado: true,
        }),
      },
      movimiento: {
        create: jest.fn(),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(tx.movimiento.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when the product does not exist', async () => {
    const dto: CreateMovimientoDto = {
      Cantidad_m: 5,
      id_m: 'M-E',
      id_producto: 999,
      id_usuario: 'user-1',
    };

    const tx = {
      producto: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      movimiento: {
        create: jest.fn(),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    expect(tx.movimiento.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when quantity is invalid', async () => {
    const dto: CreateMovimientoDto = {
      Cantidad_m: 0,
      id_m: 'M-E',
      id_producto: 1,
      id_usuario: 'user-1',
    };

    const tx = {
      producto: {
        findUnique: jest.fn().mockResolvedValue({
          id_producto: 1,
          nom_producto: 'Producto A',
          stock_actual: 10,
          estado: true,
        }),
      },
      movimiento: {
        create: jest.fn(),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(tx.movimiento.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when the product is inactive', async () => {
    const dto: CreateMovimientoDto = {
      Cantidad_m: 5,
      id_m: 'M-E',
      id_producto: 1,
      id_usuario: 'user-1',
    };

    const tx = {
      producto: {
        findUnique: jest.fn().mockResolvedValue({
          id_producto: 1,
          nom_producto: 'Producto A',
          stock_actual: 10,
          estado: false,
        }),
      },
      movimiento: {
        create: jest.fn(),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(tx.movimiento.create).not.toHaveBeenCalled();
  });

  it('should propagate database errors and not create a movement when the transaction fails', async () => {
    const dto: CreateMovimientoDto = {
      Cantidad_m: 5,
      id_m: 'M-E',
      id_producto: 1,
      id_usuario: 'user-1',
    };

    const error = new Error('DB connection error');
    prisma.$transaction.mockRejectedValue(error);

    await expect(service.create(dto)).rejects.toThrow('DB connection error');
  });
});
