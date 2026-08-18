import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import request from 'supertest';
import { NotificacionesController } from '../../src/notificaciones/notificaciones.controller';
import { NotificacionesService } from '../../src/notificaciones/notificaciones.service';

describe('RF-003.4 - Generar alertas por bajo stock (integración)', () => {
  let app: INestApplication;
  let notificacionesService: {
    stockBajo: jest.Mock;
    agotados: jest.Mock;
    findAll: jest.Mock;
    count: jest.Mock;
  };

  beforeEach(async () => {
    notificacionesService = {
      stockBajo: jest.fn(),
      agotados: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [NotificacionesController],
      providers: [{ provide: NotificacionesService, useValue: notificacionesService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('CP-020 - genera alerta cuando el stock llega al mínimo', async () => {
    const alerta = [{
      tipo: 'stock-bajo',
      id_notificacion: 'stock-bajo-1',
      id_producto: 1,
      nom_producto: 'Sábana doble',
      stock_actual: 5,
      stock_minimo: 5,
      fecha: new Date(),
      mensaje: 'Alerta de bajo stock',
      detalles: 'Sábana doble - Últimas 5 unidades',
      ruta_destino: '/movimientos',
      clase_boton: 'stock',
      categoria: 'Textiles',
      ruta_imagen: '/uploads/productos/1.png',
    }];

    notificacionesService.stockBajo.mockResolvedValue(alerta);

    const response = await request(app.getHttpServer())
      .get('/notificaciones/stock-bajo')
      .expect(200);

    expect(notificacionesService.stockBajo).toHaveBeenCalledWith({});
    expect(response.body[0]).toMatchObject({
      tipo: 'stock-bajo',
      id_notificacion: 'stock-bajo-1',
      id_producto: 1,
      nom_producto: 'Sábana doble',
      stock_actual: 5,
      stock_minimo: 5,
      mensaje: 'Alerta de bajo stock',
      detalles: 'Sábana doble - Últimas 5 unidades',
      ruta_destino: '/movimientos',
      clase_boton: 'stock',
      categoria: 'Textiles',
      ruta_imagen: '/uploads/productos/1.png',
    });
    expect(response.body[0].fecha).toEqual(expect.any(String));
  });

  it('CP-021 - genera alerta crítica cuando el stock llega a cero', async () => {
    const agotado = [{
      tipo: 'agotado',
      id_notificacion: 'agotado-2',
      id_producto: 2,
      nom_producto: 'Toalla de manos',
      stock_actual: 0,
      stock_minimo: 4,
      fecha: new Date(),
      mensaje: 'Producto agotado',
      detalles: 'Toalla de manos - SIN STOCK DISPONIBLE',
      ruta_destino: '/movimientos',
      clase_boton: 'agotado',
      categoria: 'Hogar',
      ruta_imagen: '/uploads/productos/2.png',
    }];

    notificacionesService.agotados.mockResolvedValue(agotado);

    const response = await request(app.getHttpServer())
      .get('/notificaciones/agotados')
      .expect(200);

    expect(response.body[0]).toMatchObject({
      tipo: 'agotado',
      id_notificacion: 'agotado-2',
      id_producto: 2,
      nom_producto: 'Toalla de manos',
      stock_actual: 0,
      stock_minimo: 4,
      mensaje: 'Producto agotado',
      detalles: 'Toalla de manos - SIN STOCK DISPONIBLE',
      ruta_destino: '/movimientos',
      clase_boton: 'agotado',
      categoria: 'Hogar',
      ruta_imagen: '/uploads/productos/2.png',
    });
    expect(response.body[0].fecha).toEqual(expect.any(String));
  });

  it('CP-022 - no genera alerta cuando el stock es superior al mínimo', async () => {
    notificacionesService.stockBajo.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/notificaciones/stock-bajo')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('CP-023 - resuelve automáticamente la alerta al aumentar el stock', async () => {
    notificacionesService.stockBajo.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/notificaciones/stock-bajo')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('CP-024 - no genera alerta si el producto no tiene stock mínimo configurado', async () => {
    notificacionesService.stockBajo.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/notificaciones/stock-bajo')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('CP-025 - devuelve error cuando falla la conexión con la base de datos', async () => {
    notificacionesService.stockBajo.mockRejectedValue(new Error('DB connection failed'));

    await request(app.getHttpServer())
      .get('/notificaciones/stock-bajo')
      .expect(500)
      .expect({
        statusCode: 500,
        message: 'Error interno al obtener notificaciones de stock bajo',
        error: 'Internal Server Error',
      });
  });

  it('CP-026 - visualiza la alerta desde el módulo de inventario', async () => {
    const conjunto = [
      {
        tipo: 'stock-bajo',
        id_producto: 1,
        nom_producto: 'Sábana doble',
        stock_actual: 3,
        stock_minimo: 5,
        mensaje: 'Alerta de bajo stock',
      },
    ];

    notificacionesService.findAll.mockResolvedValue(conjunto);

    const response = await request(app.getHttpServer())
      .get('/notificaciones')
      .expect(200);

    expect(response.body).toEqual(conjunto);
  });

  it('CP-027 - registra la alerta para auditoría', async () => {
    const conjunto = [{
      tipo: 'stock-bajo',
      id_notificacion: 'stock-bajo-3',
      id_producto: 3,
      nom_producto: 'Cortina',
      stock_actual: 2,
      stock_minimo: 4,
      mensaje: 'Alerta de bajo stock',
    }];

    notificacionesService.findAll.mockResolvedValue(conjunto);

    const response = await request(app.getHttpServer())
      .get('/notificaciones')
      .expect(200);

    expect(response.body[0].tipo).toBe('stock-bajo');
    expect(response.body[0].mensaje).toBe('Alerta de bajo stock');
  });
});
