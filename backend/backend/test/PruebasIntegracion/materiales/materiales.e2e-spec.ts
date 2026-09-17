// RF-004.1 al 4.4 — Materiales (integración)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { loginConCodigo } from '../../utils/auth-helper';

jest.setTimeout(30000);

describe('RF-004 — Materiales (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let admin: { usuario: any; token: string };

  const API_KEY = process.env.API_KEY ?? '';
  const sufijo = Date.now();
  const idsMaterialesCreados: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
    await app.init();

    prisma = new PrismaClient();
    admin = await loginConCodigo(app);

    // Sincronizar secuencia tras seed con IDs explícitos
    await prisma.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('material', 'id_material'),
        COALESCE((SELECT MAX(id_material) FROM material), 1)
      );
    `);
  });

  afterAll(async () => {
    try {
      if (idsMaterialesCreados.length > 0) {
        await prisma.material_color.deleteMany({
          where: { id_material: { in: idsMaterialesCreados } },
        });
        await prisma.material_diseno.deleteMany({
          where: { id_material: { in: idsMaterialesCreados } },
        });
        await prisma.material.deleteMany({
          where: { id_material: { in: idsMaterialesCreados } },
        });
      }
    } catch {
      // limpieza best-effort
    }
    await prisma.$disconnect();
    await app.close();
  });

  describe('RF-004.1 — Registrar material', () => {
    it('CP-001: debe crear un material válido y devolver 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nombre: `Tela Material E2E ${sufijo}`,
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 15000,
          stock_actual: 20,
          stock_minimo: 3,
        });

      expect(res.status).toBe(201);
      // Prisma Decimal se serializa como string en JSON
      expect(res.body).toEqual(
        expect.objectContaining({
          nombre: `Tela Material E2E ${sufijo}`,
          tipo: 'Tela',
          unidad: 'metro',
          estado: true,
        }),
      );
      expect(Number(res.body.precio_unitario)).toBe(15000);
      expect(res.body.id_material).toBeDefined();
      idsMaterialesCreados.push(res.body.id_material);
    });

    it('CP-002: debe rechazar (409) un material con nombre duplicado', async () => {
      const nombre = `Tela Duplicada E2E ${sufijo}`;
      const primero = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nombre,
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 10000,
          stock_actual: 10,
          stock_minimo: 2,
        });
      expect(primero.status).toBe(201);
      idsMaterialesCreados.push(primero.body.id_material);

      const segundo = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nombre,
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 11000,
          stock_actual: 5,
          stock_minimo: 1,
        });

      expect(segundo.status).toBe(409);
    });

    it('CP-003: debe rechazar (400) un material sin nombre', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 10000,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('RF-004.2 — Listar materiales', () => {
    it('CP-004: GET /pedidos-personalizados/materiales debe devolver un arreglo', async () => {
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('RF-004.3 — Actualizar material', () => {
    it('CP-005: debe actualizar el precio de un material existente', async () => {
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nombre: `Tela Update E2E ${sufijo}`,
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 9000,
          stock_actual: 15,
          stock_minimo: 2,
        });
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      const res = await request(app.getHttpServer())
        .patch(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ precio_unitario: 12000 });

      expect(res.status).toBe(200);
      // Prisma Decimal se serializa como string en JSON
      expect(Number(res.body.precio_unitario)).toBe(12000);
    });
  });

  describe('RF-004.4 — Desactivar material', () => {
    it('CP-006: debe desactivar (borrado lógico) un material', async () => {
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nombre: `Tela Delete E2E ${sufijo}`,
          tipo: 'Accesorio',
          unidad: 'unidad',
          precio_unitario: 5000,
          stock_actual: 8,
          stock_minimo: 1,
        });
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      const res = await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.estado === false || res.body.message).toBeTruthy();
    });
  });
});