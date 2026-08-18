// RF-009.1 al RF-009.3 | El historial del cliente se maneja por medio de notificaciones y correos
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { getApps, deleteApp } from 'firebase-admin/app';
import { AppModule } from '../../../src/app.module';
import { loginConCodigo, loginComoCliente } from '../../utils/auth-helper';

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
  let productoAgotado: any;
  let productoParaPedido: any;

  // pedidos creados durante los tests, para poder limpiarlos en afterAll
  const idsPedidosCreados: number[] = [];

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

    productoConMovimientos = await prisma.producto.create({
      data: {
        nom_producto: `Producto Movimientos Test ${sufijo}`,
        precio_unitario: 12000, stock_actual: 20, stock_minimo: 5,
        ultima_actualiz: new Date(), descripcion: 'Test movimientos',
        id_categoria: categoria.id_categoria, id_clasificacion: clasificacion.id_clasificacion,
        estado: true,
      },
    });

    // dispara alerta de stock bajo (CP-009 / CP-008)
    productoStockBajo = await prisma.producto.create({
      data: {
        nom_producto: `Producto Stock Bajo Test ${sufijo}`,
        precio_unitario: 9000, stock_actual: 3, stock_minimo: 5,
        ultima_actualiz: new Date(), descripcion: 'Test stock bajo',
        id_categoria: categoria.id_categoria, id_clasificacion: clasificacion.id_clasificacion,
        estado: true,
      },
    });

    // dispara alerta de agotado (CP-008)
    productoAgotado = await prisma.producto.create({
      data: {
        nom_producto: `Producto Agotado Test ${sufijo}`,
        precio_unitario: 7000, stock_actual: 0, stock_minimo: 5,
        ultima_actualiz: new Date(), descripcion: 'Test agotado',
        id_categoria: categoria.id_categoria, id_clasificacion: clasificacion.id_clasificacion,
        estado: true,
      },
    });

    // producto exclusivo para generar un pedido y así probar la notificación "pedido nuevo"
    productoParaPedido = await prisma.producto.create({
      data: {
        nom_producto: `Producto Notif Pedido Test ${sufijo}`,
        precio_unitario: 15000, stock_actual: 15, stock_minimo: 5,
        ultima_actualiz: new Date(), descripcion: 'Test notificacion pedido nuevo',
        id_categoria: categoria.id_categoria, id_clasificacion: clasificacion.id_clasificacion,
        estado: true,
      },
    });

    // id_m usa el identificador del enum de Prisma (M_E, mapeado a "M-E" en
    // la BD) — no el valor crudo con guion, igual que pasaba con
    // clasificacion.nombre_clas. Se asegura además que el POST responda 2xx:
    // antes fallaba en silencio (nadie comprobaba el status) y CP-001/CP-002
    // fallaban más abajo por no encontrar el movimiento, sin pista de por qué.
    const resMovimiento = await request(app.getHttpServer())
      .post('/movimientos')
      .set('x-api-key', API_KEY)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        Cantidad_m: 10,
        observaciones: `Entrada de prueba ${sufijo}`,
        id_m: 'M_E',
        id_producto: productoConMovimientos.id_producto,
        id_usuario: admin.usuario.id_usuario,
      });

    if (resMovimiento.status >= 300) {
      throw new Error(
        `No se pudo crear el movimiento de prueba en beforeAll (status ${resMovimiento.status}): ` +
          JSON.stringify(resMovimiento.body),
      );
    }
  }, 30000); // 30s: login de 2 usuarios + 4 productos puede superar el timeout por defecto de Jest (5s), sobre todo con varias suites e2e corriendo en paralelo

  afterAll(async () => {
    // Si beforeAll no llegó a completarse (timeout, login fallido, etc.),
    // estas variables quedan undefined. Sin esta guarda, afterAll también
    // fallaba con "Cannot read properties of undefined", lo que convertía
    // un fallo puntual del beforeAll en "Test suite failed to run" para
    // TODO el archivo, tapando cuál test realmente falló.
    if (cliente?.usuario?.id_usuario) {
      // limpieza de notificaciones generadas por los pedidos de este archivo
      await prisma.notificacion.deleteMany({ where: { id_usuario: cliente.usuario.id_usuario } });
    }

    if (idsPedidosCreados.length) {
      await prisma.ticket_compra.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
      await prisma.detalles_pedido.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
      await prisma.pedido.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
    }

    const idsProductos = [
      productoConMovimientos?.id_producto,
      productoStockBajo?.id_producto,
      productoAgotado?.id_producto,
      productoParaPedido?.id_producto,
    ].filter((id): id is number => id != null);

    if (idsProductos.length) {
      await prisma.movimiento.deleteMany({ where: { id_producto: { in: idsProductos } } });
      await prisma.producto.deleteMany({ where: { id_producto: { in: idsProductos } } });
    }

    await prisma.$disconnect();
    if (app) await app.close();

    // Los pedidos creados en este archivo disparan FcmPushService, que
    // inicializa el SDK de Firebase Admin (conexión HTTP2/gRPC de fondo).
    // Nadie más la cierra, así que Jest se queda con un handle abierto y
    // termina lanzando "import a file after the Jest environment has been
    // torn down" en la siguiente suite. Se cierra explícitamente acá.
    await Promise.all(getApps().map((firebaseApp) => deleteApp(firebaseApp)));
  }, 30000);

  // RF-009.1 — Consultar historial de movimientos
  describe('RF-009.1 — Consultar historial de movimientos', () => {
    it('CP-001: el admin/trabajador consulta la lista completa de entradas y salidas con la info relacionada', async () => {
      const res = await request(app.getHttpServer())
        .get('/movimientos')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      const movimientos = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
      const propio = movimientos.find((m: any) => m.id_producto === productoConMovimientos.id_producto);
      expect(propio).toBeDefined();
      // "con la info relacionada": nombre de producto y usuario, no solo los IDs crudos
      expect(propio.nom_producto ?? propio.producto?.nom_producto).toBeDefined();
    });

    it('CP-002: debe filtrar el historial de movimientos por un rango de fechas determinado', async () => {
      const hoy = new Date().toISOString().slice(0, 10);

      const res = await request(app.getHttpServer())
        .get('/movimientos')
        .query({ desde: hoy, hasta: hoy })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      const movimientos = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
      const propio = movimientos.find((m: any) => m.id_producto === productoConMovimientos.id_producto);
      expect(propio).toBeDefined(); // el movimiento del beforeAll cae dentro del rango "hoy"
    });

    it('CP-003: debe devolver una lista vacía cuando no existen movimientos registrados en el periodo consultado', async () => {
      const res = await request(app.getHttpServer())
        .get('/movimientos')
        .query({ desde: '2020-01-01', hasta: '2020-01-02' })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      const movimientos = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
      expect(movimientos).toHaveLength(0);
    });
  });

  // RF-009.2 
  describe('RF-009.2 — Generar reporte general', () => {
    it('CP-004: debe generar el reporte con las estadísticas correctas del periodo (incluye el movimiento del beforeAll)', async () => {
      const hoy = new Date().toISOString().slice(0, 10);

      const res = await request(app.getHttpServer())
        .get('/movimientos/resumen-general')
        .query({ desde: hoy, hasta: hoy })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalEntradas).toBeGreaterThanOrEqual(1);
    });

    it('CP-005: debe rechazar la generación del reporte si la fecha "Desde" es posterior a "Hasta"', async () => {
      const res = await request(app.getHttpServer())
        .get('/movimientos/resumen-general')
        .query({ desde: '2026-08-10', hasta: '2026-08-01' })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(400);
    });

    it.todo('CP-006: exportar el reporte a PDF — cubierto en movimientos.spec.ts (ReporteFake), no aplica a e2e backend');

    it('CP-007: en un rango sin movimientos, debe devolver 0 en lugar de NULL', async () => {
      const res = await request(app.getHttpServer())
        .get('/movimientos/resumen-general')
        .query({ desde: '2020-01-01', hasta: '2020-01-02' })
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalEntradas).toBe(0);
      expect(res.body.totalSalidas).toBe(0);
    });
  });

  // RF-009.3 
  describe('RF-009.3 — Consultar notificaciones', () => {
    it('CP-008: debe desplegar las alertas de stock bajo, agotados y nuevos pedidos', async () => {
      // genera un pedido real para que aparezca la notificación "pedido nuevo"
      const resPedido = await request(app.getHttpServer())
        .post('/pedidos/crear')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({
          id_usuario: cliente.usuario.id_usuario,
          metodo_pago: 'Efectivo',
          subtotal: Number(productoParaPedido.precio_unitario),
          total: Number(productoParaPedido.precio_unitario),
          items: [{ id_producto: productoParaPedido.id_producto, cantidad: 1, precio: productoParaPedido.precio_unitario }],
        });
      expect(resPedido.status).toBe(201);
      idsPedidosCreados.push(resPedido.body.data.id_pedido);

      const res = await request(app.getHttpServer())
        .get('/notificaciones')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      const notifs = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
      const tipos = notifs.map((n: any) => n.tipo);

      expect(tipos).toContain('stock-bajo');
      expect(tipos).toContain('agotado');
      expect(tipos).toContain('pedido');

      const stockBajoPropio = notifs.find(
        (n: any) => n.tipo === 'stock-bajo' && n.id_producto === productoStockBajo.id_producto,
      );
      expect(stockBajoPropio).toBeDefined();

      const agotadoPropio = notifs.find(
        (n: any) => n.tipo === 'agotado' && n.id_producto === productoAgotado.id_producto,
      );
      expect(agotadoPropio).toBeDefined();
    });

    it('CP-009: debe filtrar y mostrar únicamente las alertas de stock crítico', async () => {
      const res = await request(app.getHttpServer())
        .get('/notificaciones/stock-bajo')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      const notifs = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
      expect(notifs.every((n: any) => n.tipo === 'stock-bajo')).toBe(true);

      const propio = notifs.find((n: any) => n.id_producto === productoStockBajo.id_producto);
      expect(propio).toBeDefined();
      // stock bajo NUNCA debe incluir productos agotados (stock_actual = 0)
      expect(notifs.some((n: any) => n.id_producto === productoAgotado.id_producto)).toBe(false);
    });

    it('Comportamiento actual (interino): las alertas de stock bajo/agotados apuntan a /movimientos', async () => {

      const [resStockBajo, resAgotados] = await Promise.all([
        request(app.getHttpServer())
          .get('/notificaciones/stock-bajo')
          .set('x-api-key', API_KEY)
          .set('Authorization', `Bearer ${admin.token}`),
        request(app.getHttpServer())
          .get('/notificaciones/agotados')
          .set('x-api-key', API_KEY)
          .set('Authorization', `Bearer ${admin.token}`),
      ]);

      const stockBajo = (Array.isArray(resStockBajo.body) ? resStockBajo.body : resStockBajo.body?.data ?? [])
        .find((n: any) => n.id_producto === productoStockBajo.id_producto);
      const agotado = (Array.isArray(resAgotados.body) ? resAgotados.body : resAgotados.body?.data ?? [])
        .find((n: any) => n.id_producto === productoAgotado.id_producto);

      expect(stockBajo?.ruta_destino).toBe('/movimientos');
      expect(agotado?.ruta_destino).toBe('/movimientos');
    });

    it.todo('CP-010: al pulsar una alerta de stock bajo/agotado, debe abrir la vista detallada del producto/material afectado (bloqueado: confirmar ruta de detalle en el front)');

    it('Comportamiento actual (interino): la alerta de pedido nuevo apunta a /pedidos_realizados', async () => {
      // Mismo caso que arriba: listado genérico, no el detalle puntual del
      // pedido. El CP-010 real vive documentado en el it.todo de arriba.
      const res = await request(app.getHttpServer())
        .get('/notificaciones')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${admin.token}`);

      const notifs = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
      const notifPedido = notifs.find(
        (n: any) => n.tipo === 'pedido' && n.id_producto === idsPedidosCreados[0],
      );

      expect(notifPedido).toBeDefined();
      expect(notifPedido?.ruta_destino).toBe('/pedidos_realizados');
    });

    it.todo('CP-011: bandeja vacía sin alertas — cubierto de forma determinística en notificaciones.spec.ts');
  });
});