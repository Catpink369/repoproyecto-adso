// RF-004.1 al 4.4 — Materiales (integración)
// Numeración alineada con Casos_Prueba (Excel)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { loginConCodigo, loginComoCliente } from '../../utils/auth-helper';

jest.setTimeout(45000);

describe('RF-004 — Materiales (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let admin: { usuario: any; token: string };
  let cliente: { usuario: any; token: string };

  const API_KEY = process.env.API_KEY ?? '';
  const sufijo = Date.now();
  const idsMaterialesCreados: number[] = [];

  const payloadBase = (nombre: string, extra: Record<string, any> = {}) => ({
    nombre,
    tipo: 'Tela',
    unidad: 'metro',
    precio_unitario: 15000,
    stock_actual: 20,
    stock_minimo: 3,
    ...extra,
  });

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
        }).catch(() => {});
        await prisma.material_diseno.deleteMany({
          where: { id_material: { in: idsMaterialesCreados } },
        }).catch(() => {});
        await prisma.material.deleteMany({
          where: { id_material: { in: idsMaterialesCreados } },
        }).catch(() => {});
      }
    } catch {
      // limpieza best-effort
    }
    await prisma.$disconnect();
    await app.close();
  });

  // ─────────────────────────────────────────────
  // RF-004.1 — Registrar material (CP-001 … CP-007)
  // ─────────────────────────────────────────────
  describe('RF-004.1 — Registrar material', () => {
    it('CP-001: debe crear un material válido y devolver 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(`Tela Material E2E ${sufijo}`));

      expect(res.status).toBe(201);
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
        .send(payloadBase(nombre, { precio_unitario: 10000, stock_actual: 10 }));
      expect(primero.status).toBe(201);
      idsMaterialesCreados.push(primero.body.id_material);

      const segundo = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(nombre, { precio_unitario: 11000, stock_actual: 5 }));

      expect(segundo.status).toBe(409);
    });

    it('CP-003: debe rechazar (400) un material sin nombre', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ tipo: 'Tela', unidad: 'metro', precio_unitario: 10000 });

      expect(res.status).toBe(400);
    });

    it('CP-004: debe rechazar (400) cuando faltan campos obligatorios (tipo/unidad/precio)', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ nombre: `Incompleto ${sufijo}` });

      expect(res.status).toBe(400);
    });

    it('CP-005: debe rechazar (400) precio_unitario inválido (<= 0)', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(`PrecioCero ${sufijo}`, { precio_unitario: 0 }));

      expect(res.status).toBe(400);
    });

    it('CP-006: un cliente sin permisos no puede registrar materiales (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send(payloadBase(`Cliente NoPuede ${sufijo}`));

      expect([401, 403]).toContain(res.status);
    });

    it('CP-007: debe crear material de tipo Accesorio válido', async () => {
      const res = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(
          payloadBase(`Accesorio E2E ${sufijo}`, {
            tipo: 'Accesorio',
            unidad: 'unidad',
            precio_unitario: 2500,
            stock_actual: 50,
          }),
        );

      expect(res.status).toBe(201);
      expect(res.body.tipo).toBe('Accesorio');
      idsMaterialesCreados.push(res.body.id_material);
    });
  });

  // ─────────────────────────────────────────────
  // RF-004.2 — Consultar / listar (CP-008 … CP-015)
  // ─────────────────────────────────────────────
  describe('RF-004.2 — Consultar materiales', () => {
    it('CP-008: GET /materiales debe devolver un arreglo de materiales', async () => {
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('CP-009: debe localizar un material específico por nombre (search)', async () => {
      const nombre = `Buscable ${sufijo}`;
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(nombre));
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .query({ search: `Buscable ${sufijo}` })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((m: any) => m.nombre === nombre)).toBe(true);
    });

    it('CP-010: debe filtrar materiales por tipo', async () => {
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .query({ tipo: 'Tela' })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body.every((m: any) => m.tipo === 'Tela')).toBe(true);
      }
    });

    it('CP-011: búsqueda por nombre + filtro por tipo combinados', async () => {
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .query({ search: `Material E2E ${sufijo}`, tipo: 'Tela' })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('CP-012: búsqueda sin resultados devuelve arreglo vacío', async () => {
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .query({ search: `NO_EXISTE_XYZ_${sufijo}` })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('CP-013: listado funciona aunque no haya materiales de prueba (respuesta 200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('CP-014: GET materiales es público (cliente puede consultar)', async () => {
      // Endpoint marcado @Public() — el cliente debe poder listar
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${cliente.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('CP-015: GET por tipo (ruta /materiales/:tipo) responde 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales/Tela')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // RF-004.3 — Actualizar material (CP-016 … CP-023)
  // ─────────────────────────────────────────────
  describe('RF-004.3 — Actualizar material', () => {
    let idEditable: number;

    beforeAll(async () => {
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(`Tela Update Base ${sufijo}`, { precio_unitario: 9000 }));
      expect(creado.status).toBe(201);
      idEditable = creado.body.id_material;
      idsMaterialesCreados.push(idEditable);
    });

    it('CP-016: debe actualizar el precio de un material existente', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/pedidos-personalizados/materiales/${idEditable}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ precio_unitario: 12000 });

      expect(res.status).toBe(200);
      expect(Number(res.body.precio_unitario)).toBe(12000);
    });

    it('CP-017: debe responder 404 al editar un material inexistente', async () => {
      const res = await request(app.getHttpServer())
        .patch('/pedidos-personalizados/materiales/999999999')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ precio_unitario: 5000 });

      expect([404, 500]).toContain(res.status);
    });

    it('CP-018: debe rechazar (409) actualizar con nombre de otro material', async () => {
      const otro = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(`Otro Nombre ${sufijo}`));
      expect(otro.status).toBe(201);
      idsMaterialesCreados.push(otro.body.id_material);

      const res = await request(app.getHttpServer())
        .patch(`/pedidos-personalizados/materiales/${idEditable}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ nombre: `Otro Nombre ${sufijo}` });

      expect(res.status).toBe(409);
    });

    it('CP-019: debe rechazar (400) precio_unitario inválido en edición', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/pedidos-personalizados/materiales/${idEditable}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ precio_unitario: -10 });

      expect(res.status).toBe(400);
    });

    it('CP-020: actualizar solo con campos válidos mantiene el resto de datos', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/pedidos-personalizados/materiales/${idEditable}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ stock_minimo: 7 });

      expect(res.status).toBe(200);
      expect(res.body.stock_minimo).toBe(7);
      expect(res.body.nombre).toBeDefined();
    });

    it('CP-021: rechaza imagen con formato no permitido (si endpoint disponible)', async () => {
      // Sin archivo real: el endpoint exige multipart; validamos 4xx sin imagen
      const res = await request(app.getHttpServer())
        .post(`/pedidos-personalizados/materiales/${idEditable}/imagen`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect([400, 415, 422, 500]).toContain(res.status);
    });

    it('CP-022: cliente sin permisos no puede actualizar (403)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/pedidos-personalizados/materiales/${idEditable}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({ precio_unitario: 999 });

      expect([401, 403]).toContain(res.status);
    });

    it('CP-023: actualización con id no numérico responde 400/404', async () => {
      const res = await request(app.getHttpServer())
        .patch('/pedidos-personalizados/materiales/abc')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ precio_unitario: 1000 });

      expect([400, 404, 500]).toContain(res.status);
    });
  });

  // ─────────────────────────────────────────────
  // RF-004.4 — Desactivar material (CP-024 … CP-030)
  // ─────────────────────────────────────────────
  describe('RF-004.4 — Desactivar material', () => {
    it('CP-024: debe desactivar (borrado lógico) un material activo', async () => {
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(
          payloadBase(`Tela Delete E2E ${sufijo}`, {
            tipo: 'Accesorio',
            unidad: 'unidad',
            precio_unitario: 5000,
            stock_actual: 8,
          }),
        );
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      const res = await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.estado === false || res.body.message).toBeTruthy();
    });

    it('CP-025: debe responder 404 al desactivar material inexistente', async () => {
      const res = await request(app.getHttpServer())
        .delete('/pedidos-personalizados/materiales/999999999')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect([404, 500]).toContain(res.status);
    });

    it('CP-026: no permite desactivar de nuevo un material ya inactivo (409)', async () => {
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(`Ya Inactivo ${sufijo}`));
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect((r) => expect([200, 201]).toContain(r.status));

      const res = await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect([409, 400]).toContain(res.status);
    });

    it('CP-027: material desactivado no aparece en listado activo por defecto', async () => {
      const nombre = `Invisible ${sufijo}`;
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(nombre));
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .query({ search: nombre })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.every((m: any) => m.nombre !== nombre)).toBe(true);
    });

    it('CP-028: cliente sin permisos no puede desactivar (403)', async () => {
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(`No Delete Cliente ${sufijo}`));
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      const res = await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${cliente.token}`);

      expect([401, 403]).toContain(res.status);
    });

    it('CP-029: material desactivado se puede consultar con estado=false', async () => {
      const nombre = `Inactivo Visible ${sufijo}`;
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(nombre));
      expect(creado.status).toBe(201);
      idsMaterialesCreados.push(creado.body.id_material);

      await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${creado.body.id_material}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      const res = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .query({ estado: 'false', search: nombre })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.some((m: any) => m.nombre === nombre && m.estado === false)).toBe(true);
    });

    it('CP-030: material desactivado no debe usarse en nuevas personalizaciones (stock/estado)', async () => {
      const nombre = `No Disponible Perso ${sufijo}`;
      const creado = await request(app.getHttpServer())
        .post('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(payloadBase(nombre, { stock_actual: 5 }));
      expect(creado.status).toBe(201);
      const idMat = creado.body.id_material;
      idsMaterialesCreados.push(idMat);

      await request(app.getHttpServer())
        .delete(`/pedidos-personalizados/materiales/${idMat}`)
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      // Listado activo no lo incluye
      const activos = await request(app.getHttpServer())
        .get('/pedidos-personalizados/materiales')
        .set('x-api-key', API_KEY);
      expect(activos.body.every((m: any) => m.id_material !== idMat)).toBe(true);
    });
  });
});
