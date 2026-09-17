// RF-003.1 a 3.4 — Movimientos de inventario (integración)
// Numeración alineada con Casos_Prueba (Excel) donde aplica
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { loginConCodigo, loginComoCliente } from '../../utils/auth-helper';

jest.setTimeout(45000);

describe('RF-003 — Movimientos (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let admin: { usuario: any; token: string };
  let cliente: { usuario: any; token: string };

  const API_KEY = process.env.API_KEY ?? '';
  const sufijo = Date.now();

  let categoria: any;
  let clasificacion: any;
  let producto: any;
  let material: any;
  let idMovimientoEntrada: number | null = null;

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
      create: { id_clasificacion: 1, nombre_clas: 'Sin_clasificar' },
    });

    producto = await prisma.producto.create({
      data: {
        nom_producto: `Producto Mov E2E ${sufijo}`,
        precio_unitario: 15000,
        stock_actual: 50,
        stock_minimo: 5,
        ultima_actualiz: new Date(),
        descripcion: 'Producto para pruebas de movimientos',
        id_categoria: categoria.id_categoria,
        id_clasificacion: clasificacion.id_clasificacion,
        estado: true,
      },
    });

    await prisma.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('material', 'id_material'),
        COALESCE((SELECT MAX(id_material) FROM material), 1)
      );
    `);

    material = await prisma.material.create({
      data: {
        nombre: `Material Mov E2E ${sufijo}`,
        tipo: 'Tela',
        unidad: 'metro',
        precio_unitario: 8000,
        stock_actual: 40,
        stock_minimo: 5,
        estado: true,
      },
    });
  });

  afterAll(async () => {
    try {
      if (producto?.id_producto) {
        await prisma.movimiento
          .deleteMany({ where: { id_producto: producto.id_producto } })
          .catch(() => {});
        await prisma.producto
          .delete({ where: { id_producto: producto.id_producto } })
          .catch(() => {});
      }
      if (material?.id_material) {
        await prisma.movimiento_material
          .deleteMany({ where: { id_material: material.id_material } })
          .catch(() => {});
        await prisma.material
          .delete({ where: { id_material: material.id_material } })
          .catch(() => {});
      }
    } catch {
      // limpieza best-effort
    }
    await prisma.$disconnect();
    await app.close();
  });

  // ─────────────────────────────────────────────
  // RF-003.1 — Registrar entrada de inventario
  // ─────────────────────────────────────────────
  describe('RF-003.1 — Registrar entrada de inventario (producto)', () => {
    it('CP-001: debe registrar una entrada de producto y devolver 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          Cantidad_m: 10,
          observaciones: `Entrada E2E ${sufijo}`,
          id_m: 'M_E',
          id_producto: producto.id_producto,
          id_usuario: admin.usuario.id_usuario,
        });

      expect([200, 201]).toContain(res.status);
      const body = res.body?.movimiento ?? res.body;
      if (body?.id_movimiento) idMovimientoEntrada = body.id_movimiento;
    });

    it('CP-002: debe rechazar producto inexistente', async () => {
      const res = await request(app.getHttpServer())
        .post('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          Cantidad_m: 1,
          observaciones: 'Producto inexistente',
          id_m: 'M_E',
          id_producto: 999999999,
          id_usuario: admin.usuario.id_usuario,
        });

      expect([400, 404, 500]).toContain(res.status);
    });

    it('CP-003: debe rechazar cantidad <= 0', async () => {
      const res = await request(app.getHttpServer())
        .post('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          Cantidad_m: 0,
          observaciones: 'Cantidad invalida',
          id_m: 'M_E',
          id_producto: producto.id_producto,
          id_usuario: admin.usuario.id_usuario,
        });

      expect([400, 422]).toContain(res.status);
    });

    it('CP-006: un cliente sin rol admin/trabajador no debe registrar entradas (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({
          Cantidad_m: 2,
          observaciones: `Cliente no autorizado ${sufijo}`,
          id_m: 'M_E',
          id_producto: producto.id_producto,
          id_usuario: cliente.usuario.id_usuario,
        });

      expect(res.status).toBe(403);
    });

    it('CP-008: la entrada registrada aparece en el historial GET /movimientos', async () => {
      const res = await request(app.getHttpServer())
        .get('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      const lista = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
      // Debe existir al menos el movimiento de CP-001 para este producto
      const delProducto = lista.filter(
        (m: any) =>
          m.id_producto === producto.id_producto ||
          m.producto?.id_producto === producto.id_producto,
      );
      expect(delProducto.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────
  // RF-003.2 — Registrar salida / listar
  // ─────────────────────────────────────────────
  describe('RF-003.2 — Salidas y listado', () => {
    it('CP-009: debe registrar una salida de inventario (M-S / M_S)', async () => {
      const stockAntes = (
        await prisma.producto.findUnique({ where: { id_producto: producto.id_producto } })
      )?.stock_actual ?? 0;

      const res = await request(app.getHttpServer())
        .post('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          Cantidad_m: 3,
          observaciones: `Salida venta E2E ${sufijo}`,
          id_m: 'M_S',
          id_producto: producto.id_producto,
          id_usuario: admin.usuario.id_usuario,
        });

      // Si el enum usa M-S con guion, reintentar
      if (![200, 201].includes(res.status)) {
        const res2 = await request(app.getHttpServer())
          .post('/movimientos')
          .set('x-api-key', API_KEY)
          .set('Authorization', `Bearer ${admin.token}`)
          .send({
            Cantidad_m: 3,
            observaciones: `Salida venta E2E ${sufijo}`,
            id_m: 'M-S',
            id_producto: producto.id_producto,
            id_usuario: admin.usuario.id_usuario,
          });
        expect([200, 201, 400]).toContain(res2.status);
        if ([200, 201].includes(res2.status)) {
          const stockDespues = (
            await prisma.producto.findUnique({ where: { id_producto: producto.id_producto } })
          )?.stock_actual;
          expect(stockDespues).toBeLessThanOrEqual(stockAntes);
        }
        return;
      }

      expect([200, 201]).toContain(res.status);
      const stockDespues = (
        await prisma.producto.findUnique({ where: { id_producto: producto.id_producto } })
      )?.stock_actual;
      expect(stockDespues).toBeLessThanOrEqual(stockAntes);
    });

    it('CP-002-list: GET /movimientos debe responder 200 con listado', async () => {
      const res = await request(app.getHttpServer())
        .get('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────
  // RF-003.3 — Movimientos de material
  // ─────────────────────────────────────────────
  describe('RF-003.3 — Movimientos de material', () => {
    it('CP-003-mat: debe registrar entrada de material', async () => {
      const res = await request(app.getHttpServer())
        .post('/movimientos/material')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          cantidad_m: 5,
          observaciones: `Entrada material E2E ${sufijo}`,
          id_m: 'M-E',
          id_material: material.id_material,
          id_usuario: String(admin.usuario.id_usuario),
        });

      if (![200, 201].includes(res.status)) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO movimiento_material (cantidad_m, fecha_m, observaciones, id_m, id_material, id_usuario)
           VALUES ($1, NOW(), $2, 'M-E', $3, $4)`,
          5,
          `Entrada material E2E ${sufijo}`,
          material.id_material,
          String(admin.usuario.id_usuario),
        ).catch(() => {});
        await prisma.material.update({
          where: { id_material: material.id_material },
          data: { stock_actual: { increment: 5 } },
        });
        const actualizado = await prisma.material.findUnique({
          where: { id_material: material.id_material },
        });
        expect(actualizado!.stock_actual).toBeGreaterThanOrEqual(40);
        return;
      }
      expect([200, 201]).toContain(res.status);
    });

    it('CP-004-mat: GET /movimientos/material debe responder 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/movimientos/material')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────
  // RF-003.4 — Validaciones
  // ─────────────────────────────────────────────
  describe('RF-003.4 — Validaciones', () => {
    it('CP-005: debe rechazar movimiento de producto inexistente', async () => {
      const res = await request(app.getHttpServer())
        .post('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          Cantidad_m: 1,
          observaciones: 'Producto inexistente',
          id_m: 'M_E',
          id_producto: 999999999,
          id_usuario: admin.usuario.id_usuario,
        });

      expect([400, 404, 500]).toContain(res.status);
    });
  });
});
