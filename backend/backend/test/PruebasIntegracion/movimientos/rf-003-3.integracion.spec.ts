import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import request from 'supertest';
import { ProductosController } from '../../src/productos/productos.controller';
import { ProductosService } from '../../src/productos/productos.service';

describe('RF-003.3 - Consultar stock (integración)', () => {
  let app: INestApplication;
  let productosService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  const productos = [
    {
      id_producto: 1,
      nom_producto: 'Sábana doble',
      stock_actual: 8,
      stock_minimo: 10,
      categoria: { nombre_c: 'Textiles' },
      clasificacion: { nombre_clas: 'Ropa de hogar' },
      nombre_c: 'Textiles',
      nombre_clas: 'Ropa de hogar',
    },
    {
      id_producto: 2,
      nom_producto: 'Toalla de manos',
      stock_actual: 25,
      stock_minimo: 5,
      categoria: { nombre_c: 'Hogar' },
      clasificacion: { nombre_clas: 'Accesorios' },
      nombre_c: 'Hogar',
      nombre_clas: 'Accesorios',
    },
  ];

  beforeEach(async () => {
    productosService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [{ provide: ProductosService, useValue: productosService }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('CP-017 - consulta el stock actual y muestra alerta cuando está en mínimo', async () => {
    productosService.findAll.mockResolvedValue(productos);

    const response = await request(app.getHttpServer())
      .get('/productos')
      .expect(200);

    expect(productosService.findAll).toHaveBeenCalledWith({});
    expect(response.body).toEqual(productos);
    expect(response.body[0]).toMatchObject({
      stock_actual: 8,
      stock_minimo: 10,
      nombre_c: 'Textiles',
      nombre_clas: 'Ropa de hogar',
    });
    expect(response.body[0].stock_actual).toBeLessThanOrEqual(response.body[0].stock_minimo);
  });

  it('CP-018 - devuelve error cuando el producto no existe', async () => {
    productosService.findOne.mockRejectedValue(
      new NotFoundException('Producto 99 no encontrado'),
    );

    await request(app.getHttpServer())
      .get('/productos/99')
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'Producto 99 no encontrado',
        error: 'Not Found',
      });
  });

  it('CP-019 - deniega la consulta a un usuario sin permisos', async () => {
    productosService.findAll.mockRejectedValue(
      new ForbiddenException('No posee permisos para consultar el inventario.'),
    );

    await request(app.getHttpServer())
      .get('/productos')
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'No posee permisos para consultar el inventario.',
        error: 'Forbidden',
      });
  });

  it('Muestra inventario vacío cuando no existen productos registrados', async () => {
    productosService.findAll.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/productos')
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
