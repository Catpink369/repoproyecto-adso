import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MovimientosController } from '../../src/movimientos/movimientos.controller';
import { MovimientosService } from '../../src/movimientos/movimientos.service';

describe('RF-003.2 - Registrar salida de inventario (integración)', () => {
  let app: INestApplication;
  let movimientosService: { create: jest.Mock };

  const basePayload = {
    Cantidad_m: 3,
    id_m: 'M-S',
    id_producto: 1,
    id_usuario: 'U-001',
    observaciones: 'Venta al contado',
  };

  beforeEach(async () => {
    movimientosService = {
      create: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosController],
      providers: [{ provide: MovimientosService, useValue: movimientosService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('CP-010 - registra la salida por venta con stock suficiente', async () => {
    movimientosService.create.mockResolvedValue({
      movimiento: {
        id_movimiento: 200,
        Cantidad_m: 3,
        id_m: 'M_S',
        id_producto: 1,
        id_usuario: 'U-001',
        observaciones: 'Venta al contado',
      },
      stock_actual: 12,
    });

    const response = await request(app.getHttpServer())
      .post('/movimientos')
      .send(basePayload)
      .expect(201);

    expect(movimientosService.create).toHaveBeenCalledWith({
      Cantidad_m: 3,
      id_m: 'M-S',
      id_producto: 1,
      id_usuario: 'U-001',
      observaciones: 'Venta al contado',
    });
    expect(response.body).toEqual({
      movimiento: {
        id_movimiento: 200,
        Cantidad_m: 3,
        id_m: 'M_S',
        id_producto: 1,
        id_usuario: 'U-001',
        observaciones: 'Venta al contado',
      },
      stock_actual: 12,
    });
  });

  it('CP-011 - registra la salida por ajuste manual con justificación', async () => {
    const payloadConJustificacion = {
      ...basePayload,
      observaciones: 'Ajuste manual por daño de inventario. Justificación: se destruyó 3 unidades en almacén.',
    };

    movimientosService.create.mockResolvedValue({
      movimiento: {
        id_movimiento: 201,
        Cantidad_m: 3,
        id_m: 'M_S',
        id_producto: 1,
        id_usuario: 'U-001',
        observaciones: payloadConJustificacion.observaciones,
      },
      stock_actual: 9,
    });

    const response = await request(app.getHttpServer())
      .post('/movimientos')
      .send(payloadConJustificacion)
      .expect(201);

    expect(response.body.stock_actual).toBe(9);
    expect(response.body.movimiento.Cantidad_m).toBe(3);
  });

  it('CP-012 - impide la salida cuando el stock es insuficiente', async () => {
    movimientosService.create.mockRejectedValue(
      new BadRequestException('No hay suficiente stock de "Producto A" para registrar esta salida. Stock actual: 2, cantidad solicitada: 5.'),
    );

    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        ...basePayload,
        Cantidad_m: 5,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'No hay suficiente stock de "Producto A" para registrar esta salida. Stock actual: 2, cantidad solicitada: 5.',
        error: 'Bad Request',
      });
  });

  it('CP-013 - rechaza cantidades inválidas menores o iguales a cero', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        ...basePayload,
        Cantidad_m: 0,
      })
      .expect(400);

    expect(movimientosService.create).not.toHaveBeenCalled();
  });

  it('CP-014 - exige una justificación cuando el ajuste manual la requiere', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        ...basePayload,
        observaciones: '',
      })
      .expect(400);

    expect(movimientosService.create).not.toHaveBeenCalled();
  });

  it('CP-015 - muestra validaciones cuando faltan campos obligatorios', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        Cantidad_m: 2,
        id_m: 'M-S',
        id_producto: 1,
      })
      .expect(400);

    expect(movimientosService.create).not.toHaveBeenCalled();
  });

  it('CP-016 - deniega el acceso cuando el usuario no tiene permisos', async () => {
    movimientosService.create.mockRejectedValue(
      new BadRequestException('No posee permisos para realizar esta operación.'),
    );

    await request(app.getHttpServer())
      .post('/movimientos')
      .send(basePayload)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'No posee permisos para realizar esta operación.',
        error: 'Bad Request',
      });
  });

  it('CP-017 - cancela la operación si falla la conexión a la base de datos', async () => {
    movimientosService.create.mockRejectedValue(new Error('Database connection failed'));

    await request(app.getHttpServer())
      .post('/movimientos')
      .send(basePayload)
      .expect(500)
      .expect({
        statusCode: 500,
        message: 'Error interno al registrar el nuevo movimiento.',
        error: 'Internal Server Error',
      });
  });
});
