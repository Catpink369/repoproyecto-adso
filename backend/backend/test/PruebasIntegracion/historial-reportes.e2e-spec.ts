// RF-009.1 a RF-009.3 
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { loginConCodigo, loginComoCliente } from '../utils/auth-helper';

describe('RF-009 — Historial y Reportes (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let admin: { usuario: any; token: string };
  let cliente: { usuario: any; token: string };

  const API_KEY = process.env.API_KEY ?? '';
  const sufijo = Date.now();

  let categoria: any;
  let clasificacion: any;
  let productoConMovimientos: any;
  let productoStockBajo: any; 

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
    await app.init();

    prisma = new PrismaClient();

    admin = await loginConCodigo(app);
    cliente = await loginComoCliente(app);

    categoria = await prisma.categoria.upsert({
      where: { id_categoria: 1 },
      update: {},
      create: { id_categoria: 1, nombre_c: 'Amigurumis', descripcion: 'Test' },
    });
    clasificacion = await prisma.clasificacion.upsert({
      where: { id_clasificacion: 1 },
      update: {},
      create: { id_clasificacion: 1, nombre_clas: 'Sin clasificar' },
    });

    productoConMovimientos = await prisma.producto.create({
      data: {
        nom_producto: `Producto Movimientos Test ${sufijo}`,
        precio_unitario: 12000, stock_actual: 20, stock_minimo: 5,
        ultima_actualiz: new Date(), descripcion: 'Test movimientos',
        id_categoria: categoria.id_categoria, id_clasificacion: clasificacion.id_clasificacion,
        estado: true,
      },
    });

    // dispara alerta de stock bajo
    productoStockBajo = await prisma.producto.create({
      data: {
        nom_producto: `Producto Stock Bajo Test ${sufijo}`,
        precio_unitario: 9000, stock_actual: 3, stock_minimo: 5,
        ultima_actualiz: new Date(), descripcion: 'Test stock bajo',
        id_categoria: categoria.id_categoria, id_clasificacion: clasificacion.id_clasificacion,
        estado: true,
      },
    });

    await request(app.getHttpServer())
      .post('/movimientos')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        Cantidad_m: 10,
        observaciones: `Entrada de prueba ${sufijo}`,
        id_m: 'M-E',
        id_producto: productoConMovimientos.id_producto,
        id_usuario: admin.usuario.id_usuario,
      });
  });

  afterAll(async () => {
    const ids = [productoConMovimientos.id_producto, productoStockBajo.id_producto];
    await prisma.movimiento.deleteMany({ where: { id_producto: { in: ids } } });
    await prisma.producto.deleteMany({ where: { id_producto: { in: ids } } });
    await prisma.$disconnect();
    await app.close();
  });

  
});