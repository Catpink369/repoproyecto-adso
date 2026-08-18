import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MovimientosController } from '../../src/movimientos/movimientos.controller';
import { MovimientosService } from '../../src/movimientos/movimientos.service';

describe('RF-003.1 - Registrar entrada de inventario (integración)', () => {
  let app: INestApplication;
  let movimientosService: { create: jest.Mock };

  const basePayload = {
    Cantidad_m: 10,
    id_m: 'M-E',
    id_producto: 1,
    id_usuario: 'U-001',
    observaciones: 'Compra de materia prima',
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

  it('CP-001 - registra la entrada y actualiza el stock disponible', async () => {
    movimientosService.create.mockResolvedValue({
      movimiento: {
        id_movimiento: 101,
        Cantidad_m: 10,
        id_m: 'M_E',
        id_producto: 1,
        id_usuario: 'U-001',
        observaciones: 'Compra de materia prima',
      },
      stock_actual: 35,
    });

    const response = await request(app.getHttpServer())
      .post('/movimientos')
      .send(basePayload)
      .expect(201);

    expect(movimientosService.create).toHaveBeenCalledWith({
      Cantidad_m: 10,
      id_m: 'M-E',
      id_producto: 1,
      id_usuario: 'U-001',
      observaciones: 'Compra de materia prima',
    });
    expect(response.body).toEqual({
      movimiento: {
        id_movimiento: 101,
        Cantidad_m: 10,
        id_m: 'M_E',
        id_producto: 1,
        id_usuario: 'U-001',
        observaciones: 'Compra de materia prima',
      },
      stock_actual: 35,
    });
  });

  it('CP-002 - impide registrar una entrada cuando el producto no existe', async () => {
    movimientosService.create.mockRejectedValue(
      new NotFoundException('No se puede crear el movimiento: El producto no existe.'),
    );

    await request(app.getHttpServer())
      .post('/movimientos')
      .send(basePayload)
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'No se puede crear el movimiento: El producto no existe.',
        error: 'Not Found',
      });
  });

  it('CP-003 - rechaza cantidades inválidas menores o iguales a cero', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        ...basePayload,
        Cantidad_m: 0,
      })
      .expect(400);

    expect(movimientosService.create).not.toHaveBeenCalled();
  });

  it('CP-004 - muestra validaciones cuando faltan campos obligatorios', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        Cantidad_m: 10,
        id_m: 'M-E',
        id_producto: 1,
      })
      .expect(400);

    expect(movimientosService.create).not.toHaveBeenCalled();
  });

  it('CP-005 - impide registrar entrada para un producto inactivo', async () => {
    movimientosService.create.mockRejectedValue(
      new BadRequestException('No se puede registrar el movimiento: el producto con ID 1 está inactivo.'),
    );

    await request(app.getHttpServer())
      .post('/movimientos')
      .send(basePayload)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'No se puede registrar el movimiento: el producto con ID 1 está inactivo.',
        error: 'Bad Request',
      });
  });

  it('CP-007 - cancela la operación ante un error de conexión con la base de datos', async () => {
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
