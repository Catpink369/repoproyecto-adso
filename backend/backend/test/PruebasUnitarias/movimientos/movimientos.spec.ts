// movimientos.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductosController } from '../../../../../backend/backend/src/productos/productos.controller';
import { ProductosService } from '../../../../../backend/backend/src/productos/productos.service';
import { CreateMovimientoDto } from '../../../../../backend/backend/src/movimientos/dto/create-movimiento.dto';
import { MovimientosService } from '../../../../../backend/backend/src/movimientos/movimientos.service';
import { MovimientosController } from '../../../../../backend/backend/src/movimientos/movimientos.controller';
import { PrismaService } from '../../../../../backend/backend/src/prisma/prisma.service';
import * as tipoMovimientoUtil from '../../../../../backend/backend/src/movimientos/tipo-movimiento.util';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../../../../backend/backend/src/auth/guards/roles.guard';
import { Roles } from '../../../../../backend/backend/src/auth/enums/roles.enum';
import { NotificacionesService } from '../../../../../backend/backend/src/notificaciones/notificaciones.service';
import { FcmPushService } from '../../../../../backend/backend/src/notificaciones/fcm-push.service';
import { TaskService } from '../../../../../backend/backend/src/task/task.service';

jest.mock('../../../../../backend/backend/src/movimientos/tipo-movimiento.util');

describe('RF-003 - Gestión de inventario', () => {
  let service: MovimientosService;
  let controller: MovimientosController;
  let prismaMock: any;
  let txMock: any;
  let rolesGuard: RolesGuard;
  let productosService: ProductosService;
  let productosController: ProductosController;
  let notificacionesService: NotificacionesService;

  const normalizarMock = tipoMovimientoUtil.normalizarTipoMovimiento as jest.Mock;
  const aPrismaMock = tipoMovimientoUtil.aTipoMovimientoPrisma as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    txMock = {
      producto: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
      $transaction: jest.fn((callback: any) => callback(txMock)),
      movimiento: {
        create: jest.fn(),
      },
    };

    prismaMock = {
      movimiento: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      producto: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      pedido: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      usuario: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      notificacion: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
      },
      ticket_compra: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      detalles_pedido: {
        findMany: jest.fn(),
      },
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
      $transaction: jest.fn((callback: any) => callback(txMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientosService,
        NotificacionesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: FcmPushService, useValue: { notificarUsuario: jest.fn() } },
        { provide: TaskService, useValue: { enviarCambioEstadoPedido: jest.fn() } },
      ],
      controllers: [MovimientosController],
    }).compile();

    service = module.get(MovimientosService);
    controller = module.get(MovimientosController);
    notificacionesService = module.get(NotificacionesService);
    rolesGuard = new RolesGuard(new Reflector());
    productosService = new ProductosService(prismaMock);
    productosController = new ProductosController(productosService, {} as any);
  });

  function contextoFalso(
    user: any,
    handler: Function,
    controllerClass: Function = MovimientosController,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user, url: '/movimientos' }) }),
      getHandler: () => handler,
      getClass: () => controllerClass,
    } as unknown as ExecutionContext;
  }

  // =========================================================
  // RF-003.1 - Registrar entrada de inventario
  // =========================================================
  describe('RF-003.1 - Registrar entrada de inventario', () => {
    it('CP-001: debe registrar una entrada de inventario exitosamente y aumentar el stock del producto', async () => {
      const dto = {
        Cantidad_m: 10,
        observaciones: 'Ingreso de mercancía nueva',
        id_m: 'M-E',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-E');
      aPrismaMock.mockReturnValue('M_E');

      const productoExistente = {
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: true,
        stock_actual: 50,
      };

      txMock.producto.findUnique.mockResolvedValue(productoExistente);
      txMock.movimiento.create.mockResolvedValue({
        id_movimiento: faker.number.int({ min: 1, max: 999 }),
        Cantidad_m: dto.Cantidad_m,
        id_m: 'M_E',
        id_producto: dto.id_producto,
        id_usuario: dto.id_usuario,
        observaciones: dto.observaciones,
      });
      txMock.producto.update.mockResolvedValue({
        ...productoExistente,
        stock_actual: 60,
      });

      const resultado = await service.create(dto as any);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(resultado.stock_actual).toBe(60);
      expect(resultado.movimiento).toBeDefined();

      expect(txMock.movimiento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          Cantidad_m: dto.Cantidad_m,
          id_m: 'M_E',
          id_producto: dto.id_producto,
          id_usuario: String(dto.id_usuario),
          observaciones: dto.observaciones,
        }),
      });

      expect(txMock.producto.update).toHaveBeenCalledWith({
        where: { id_producto: dto.id_producto },
        data: expect.objectContaining({
          stock_actual: { increment: 10 },
        }),
      });
    });

    it('CP-002: debe rechazar el registro de una entrada cuando el producto no existe', async () => {
      const dto = {
        Cantidad_m: 10,
        observaciones: 'Ingreso de mercancía nueva',
        id_m: 'M-E',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-E');
      aPrismaMock.mockReturnValue('M_E');

      txMock.producto.findUnique.mockResolvedValue(null);

      await expect(service.create(dto as any)).rejects.toThrow(NotFoundException);

      expect(txMock.movimiento.create).not.toHaveBeenCalled();
      expect(txMock.producto.update).not.toHaveBeenCalled();
    });

    it('CP-003: debe rechazar el registro de un movimiento con cantidad cero o negativa', async () => {
      const dto = {
        Cantidad_m: 0,
        observaciones: 'Ingreso de mercancía nueva',
        id_m: 'M-E',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-E');
      aPrismaMock.mockReturnValue('M_E');

      txMock.producto.findUnique.mockResolvedValue({
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: true,
        stock_actual: 50,
      });

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);

      expect(txMock.movimiento.create).not.toHaveBeenCalled();
      expect(txMock.producto.update).not.toHaveBeenCalled();
    });

    it('CP-004: debe rechazar el registro dejando vacíos los campos obligatorios.', async () => {
      const dtoIncompleto = plainToInstance(CreateMovimientoDto, {
        Cantidad_m: undefined,
        id_m: '',
        id_producto: undefined,
        id_usuario: '',
      });

      const errores = await validate(dtoIncompleto);

      expect(errores.length).toBeGreaterThan(0);
      expect(errores.some((e) => e.property === 'Cantidad_m')).toBe(true);
      expect(errores.some((e) => e.property === 'id_m')).toBe(true);
      expect(errores.some((e) => e.property === 'id_producto')).toBe(true);
      expect(errores.some((e) => e.property === 'id_usuario')).toBe(true);
    });

    it('CP-005: debe rechazar el registro de una entrada cuando el producto está inactivo', async () => {
      const dto = {
        Cantidad_m: 5,
        observaciones: 'Ingreso de mercancía nueva',
        id_m: 'M-E',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-E');
      aPrismaMock.mockReturnValue('M_E');

      txMock.producto.findUnique.mockResolvedValue({
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: false,
        stock_actual: 50,
      });

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);

      expect(txMock.movimiento.create).not.toHaveBeenCalled();
      expect(txMock.producto.update).not.toHaveBeenCalled();
    });

    it('CP-006: Un usuario sin permisos (Cliente) NO puede crear un movimiento', () => {
      const usuarioCliente = { id_usuario: faker.string.numeric(10), id_rol_usuario: Roles.USUARIO };
      const contexto = contextoFalso(usuarioCliente, controller.create);

      const permitido = rolesGuard.canActivate(contexto);
      // @Roles(ADMIN, TRABAJADOR) en POST /movimientos → cliente denegado
      expect(permitido).toBe(false);
    });

    it('CP-007: debe propagar el error cuando falla la conexión con la base de datos', async () => {
      const dto = {
        Cantidad_m: 10,
        observaciones: 'Ingreso de mercancía nueva',
        id_m: 'M-E',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-E');
      aPrismaMock.mockReturnValue('M_E');

      const errorDeConexion = new Error('Connection lost: ECONNREFUSED');
      prismaMock.$transaction.mockRejectedValue(errorDeConexion);

      await expect(service.create(dto as any)).rejects.toThrow('Connection lost: ECONNREFUSED');

      expect(txMock.movimiento.create).not.toHaveBeenCalled();
      expect(txMock.producto.update).not.toHaveBeenCalled();
    });
  });

  // =========================================================
  // RF-003.2 - Registrar salida de inventario
  // =========================================================
  describe('RF-003.2 - Registrar salida de inventario', () => {
    it('CP-008: debe registrar una salida de inventario por venta exitosamente y descontar el stock', async () => {
      const dto = {
        Cantidad_m: 5,
        observaciones: 'Salida por venta - Pedido #123',
        id_m: 'M-S',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-S');
      aPrismaMock.mockReturnValue('M_S');

      const productoExistente = {
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: true,
        stock_actual: 20,
      };

      txMock.producto.findUnique.mockResolvedValue(productoExistente);
      txMock.movimiento.create.mockResolvedValue({
        id_movimiento: faker.number.int({ min: 1, max: 999 }),
        Cantidad_m: dto.Cantidad_m,
        id_m: 'M_S',
        id_producto: dto.id_producto,
        id_usuario: dto.id_usuario,
        observaciones: dto.observaciones,
      });
      txMock.producto.update.mockResolvedValue({
        ...productoExistente,
        stock_actual: 15,
      });

      const resultado = await service.create(dto as any);

      expect(resultado.stock_actual).toBe(15);
      expect(resultado.movimiento).toBeDefined();

      expect(txMock.movimiento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          Cantidad_m: dto.Cantidad_m,
          id_m: 'M_S',
          id_producto: dto.id_producto,
          id_usuario: String(dto.id_usuario),
          observaciones: dto.observaciones,
        }),
      });

      expect(txMock.producto.update).toHaveBeenCalledWith({
        where: { id_producto: dto.id_producto },
        data: expect.objectContaining({
          stock_actual: { increment: -5 },
        }),
      });
    });

    it('CP-009: debe registrar una salida por ajuste manual con la justificación en observaciones', async () => {
      const dto = {
        Cantidad_m: 3,
        observaciones: 'Ajuste manual - Producto dañado en bodega',
        id_m: 'M-S',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-S');
      aPrismaMock.mockReturnValue('M_S');

      const productoExistente = {
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: true,
        stock_actual: 30,
      };

      txMock.producto.findUnique.mockResolvedValue(productoExistente);
      txMock.movimiento.create.mockResolvedValue({
        id_movimiento: faker.number.int({ min: 1, max: 999 }),
        Cantidad_m: dto.Cantidad_m,
        id_m: 'M_S',
        id_producto: dto.id_producto,
        id_usuario: dto.id_usuario,
        observaciones: dto.observaciones,
      });
      txMock.producto.update.mockResolvedValue({
        ...productoExistente,
        stock_actual: 27,
      });

      const resultado = await service.create(dto as any);

      expect(resultado.stock_actual).toBe(27);

      expect(txMock.movimiento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          observaciones: 'Ajuste manual - Producto dañado en bodega',
        }),
      });
    });

    it('CP-010: debe rechazar el registro de una salida cuando no hay stock suficiente', async () => {
      const dto = {
        Cantidad_m: 15,
        observaciones: 'Salida por venta',
        id_m: 'M-S',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-S');
      aPrismaMock.mockReturnValue('M_S');

      txMock.producto.findUnique.mockResolvedValue({
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: true,
        stock_actual: 10,
      });

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);

      expect(txMock.movimiento.create).not.toHaveBeenCalled();
      expect(txMock.producto.update).not.toHaveBeenCalled();
    });

    it('CP-011: debe rechazar el registro de una salida con cantidad cero o negativa', async () => {
      const dto = {
        Cantidad_m: -2,
        observaciones: 'Salida por venta',
        id_m: 'M-S',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-S');
      aPrismaMock.mockReturnValue('M_S');

      txMock.producto.findUnique.mockResolvedValue({
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: true,
        stock_actual: 50,
      });

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);

      expect(txMock.movimiento.create).not.toHaveBeenCalled();
      expect(txMock.producto.update).not.toHaveBeenCalled();
    });

    it('CP-012: el sistema permite registrar una salida sin observaciones, aunque sea un ajuste manual que debería requerir justificación', async () => {
      const dto = {
        Cantidad_m: 4,
        id_m: 'M-S',
        id_producto: faker.number.int({ min: 1, max: 999 }),
        id_usuario: faker.string.numeric(10),
      };

      normalizarMock.mockReturnValue('M-S');
      aPrismaMock.mockReturnValue('M_S');

      const productoExistente = {
        id_producto: dto.id_producto,
        nom_producto: faker.commerce.productName(),
        estado: true,
        stock_actual: 20,
      };

      txMock.producto.findUnique.mockResolvedValue(productoExistente);
      txMock.movimiento.create.mockResolvedValue({
        id_movimiento: faker.number.int({ min: 1, max: 999 }),
        Cantidad_m: dto.Cantidad_m,
        id_m: 'M_S',
        id_producto: dto.id_producto,
        id_usuario: dto.id_usuario,
        observaciones: null,
      });
      txMock.producto.update.mockResolvedValue({
        ...productoExistente,
        stock_actual: 16,
      });

      const resultado = await service.create(dto as any);

      expect(resultado.stock_actual).toBe(16);
      expect(txMock.movimiento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ observaciones: null }),
      });
    });

    it('CP-013: debe rechazar el registro de una salida dejando vacíos los campos obligatorios', async () => {
      const dtoIncompleto = plainToInstance(CreateMovimientoDto, {
        Cantidad_m: 5,
        id_m: 'M-S',
        id_producto: undefined,
        id_usuario: '',
      });

      const errores = await validate(dtoIncompleto);

      expect(errores.length).toBeGreaterThan(0);
      expect(errores.some((e) => e.property === 'id_producto')).toBe(true);
      expect(errores.some((e) => e.property === 'id_usuario')).toBe(true);
    });

    it('CP-014: Un usuario sin permisos (Cliente) NO puede crear un movimiento de salida', () => {
      const usuarioCliente = { id_usuario: faker.string.numeric(10), id_rol_usuario: Roles.USUARIO };
      const contexto = contextoFalso(usuarioCliente, controller.create);

      const permitido = rolesGuard.canActivate(contexto);
      // Mismo endpoint POST /movimientos con @Roles(ADMIN, TRABAJADOR)
      expect(permitido).toBe(false);
    });
  });

  // =========================================================
  // RF-003.3 - Consultar stock + alertas (vía NotificacionesService)
  // =========================================================
  describe('RF-003.3 - Consultar stock de un producto', () => {
    it('CP-015: debe consultar el stock de un producto existente exitosamente', async () => {
      const idProducto = faker.number.int({ min: 1, max: 999 });

      prismaMock.producto.findFirst.mockResolvedValue({
        id_producto: idProducto,
        nom_producto: faker.commerce.productName(),
        stock_actual: 42,
        precio_unitario: 25000,
      });

      const resultado = await productosService.checkProducto(idProducto);

      expect(resultado.found).toBe(true);
      expect(resultado.product!.stock_actual).toBe(42);
      expect(prismaMock.producto.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_producto: idProducto, estado: true } }),
      );
    });

    it('CP-016: debe indicar que el producto no existe al consultar su stock', async () => {
      const idProducto = faker.number.int({ min: 1, max: 999 });
      prismaMock.producto.findFirst.mockResolvedValue(null);

      const resultado = await productosService.checkProducto(idProducto);

      expect(resultado.found).toBe(false);
      expect(resultado.message).toBe('Producto no encontrado');
    });

    it('CP-017: un usuario sin permisos específicos (Cliente) SÍ puede consultar el stock de un producto, porque el endpoint no exige un rol', () => {
      const usuarioCliente = { id_usuario: faker.string.numeric(10), id_rol_usuario: Roles.USUARIO };
      const contexto = contextoFalso(usuarioCliente, productosController.checkProducto, ProductosController);

      const permitido = rolesGuard.canActivate(contexto);

      expect(permitido).toBe(true);
    });

    it('CP-018: debe generar una alerta cuando el stock de un producto llega al mínimo', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id_producto: faker.number.int({ min: 1, max: 999 }),
          nom_producto: faker.commerce.productName(),
          stock_actual: 2,
          stock_minimo: 2,
          ultima_actualiz: new Date(),
          categoria: 'Ropa',
          ruta_imagen: null,
        },
      ]);

      const resultado = await notificacionesService.stockBajo({});

      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipo).toBe('stock-bajo');
      expect(resultado[0].mensaje).toBe('Alerta de bajo stock');
      expect(resultado[0].stock_actual).toBe(2);
    });

    it('CP-019: debe generar una alerta crítica cuando el stock de un producto llega a cero', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id_producto: faker.number.int({ min: 1, max: 999 }),
          nom_producto: faker.commerce.productName(),
          stock_actual: 0,
          stock_minimo: 3,
          ultima_actualiz: new Date(),
          categoria: 'Accesorios',
          ruta_imagen: null,
        },
      ]);

      const resultado = await notificacionesService.agotados({});

      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipo).toBe('agotado');
      expect(resultado[0].mensaje).toBe('Producto agotado');
      expect(resultado[0].stock_actual).toBe(0);
      expect(resultado[0].detalles).toContain('SIN STOCK DISPONIBLE');
    });

    it('CP-020: no debe generar ninguna alerta cuando el stock es superior al mínimo', async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      const resultado = await notificacionesService.stockBajo({});

      expect(resultado).toEqual([]);
    });

    it('CP-021: debe dejar de mostrar la alerta de un producto una vez su stock sube por encima del mínimo', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        {
          id_producto: 55,
          nom_producto: 'Chaleco tejido',
          stock_actual: 1,
          stock_minimo: 3,
          ultima_actualiz: new Date(),
          categoria: 'Ropa',
          ruta_imagen: null,
        },
      ]);
      const primeraConsulta = await notificacionesService.stockBajo({});
      expect(primeraConsulta).toHaveLength(1);

      prismaMock.$queryRaw.mockResolvedValueOnce([]);
      const segundaConsulta = await notificacionesService.stockBajo({});

      expect(segundaConsulta).toEqual([]);
    });

    it('CP-022: debe manejar sin errores un producto que no tiene stock mínimo configurado', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id_producto: 77,
          nom_producto: 'Producto nuevo sin mínimo',
          stock_actual: 1,
          stock_minimo: null,
          ultima_actualiz: new Date(),
          categoria: 'Ropa',
          ruta_imagen: null,
        },
      ]);

      const resultado = await notificacionesService.stockBajo({});

      expect(resultado).toHaveLength(1);
      expect(resultado[0].stock_minimo).toBeNull();
    });

    it('CP-023: debe propagar el error cuando falla la conexión con la base de datos al consultar alertas', async () => {
      const errorDeConexion = new Error('Connection lost: ECONNREFUSED');
      prismaMock.$queryRaw.mockRejectedValue(errorDeConexion);

      await expect(notificacionesService.stockBajo({})).rejects.toThrow(
        'Connection lost: ECONNREFUSED',
      );
    });

    it('CP-024: debe permitir visualizar el total de alertas del módulo de inventario (stock bajo + agotados)', async () => {
      // _contarStockBajo() usa $queryRaw
      prismaMock.$queryRaw.mockResolvedValue([{ total: 3 }]);
      // agotados
      prismaMock.producto.count.mockResolvedValue(2);
      // pedidos recientes
      prismaMock.pedido.count.mockResolvedValue(5);

      const resultado = await notificacionesService.count({});

      expect(resultado.alertas_stock_bajo).toBe(3);
      expect(resultado.alertas_agotados).toBe(2);
      expect(resultado.nuevos_pedidos).toBe(5);
      expect(resultado.total_notificaciones).toBe(10); // 3 + 2 + 5
    });

    it('CP-025: Las alertas de stock bajo/agotado no quedan registradas en la tabla notificacion para auditoría', async () => {
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id_producto: 1,
          nom_producto: faker.commerce.productName(),
          stock_actual: 1,
          stock_minimo: 3,
          ultima_actualiz: new Date(),
          categoria: 'Ropa',
          ruta_imagen: null,
        },
      ]);

      await notificacionesService.stockBajo({});

      expect(prismaMock.notificacion.create).not.toHaveBeenCalled();
      expect(prismaMock.notificacion.createMany).not.toHaveBeenCalled();
    });
  });
});