// RF-002 — Gestión de Productos (integración) - Opción A (Nombres Duplicados Permitidos)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { apiRequest } from '../../utils/http';
import { loginComoCliente, loginConCodigo, loginComoTrabajador } from '../../utils/auth-helper';
import { crearProductoFake, crearPedidoCompletoFake, CATALOGOS } from '../../utils/faker-factories';

jest.setTimeout(30000);

describe('RF-002 — Gestión de Productos (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  const sufijo = Date.now();
  const idsProductosCreados: number[] = [];
  const idsUsuariosCreados: string[] = [];
  const idsPedidosCreados: number[] = [];

  let cliente: { usuario: any; token: string };
  let trabajador: { usuario: any; token: string };
  let admin: { usuario: any; token: string };

  // Imagen mínima válida (PNG 1x1) para las pruebas de subida de archivo
  const imagenValidaBuffer = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000155e51a8a0000000049454e44ae426082',
    'hex',
  );

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
    await app.init();

    prisma = new PrismaClient();

    cliente = await loginComoCliente(app);
    trabajador = await loginComoTrabajador(app);
    admin = await loginConCodigo(app);

    idsUsuariosCreados.push(cliente.usuario.id_usuario, trabajador.usuario.id_usuario, admin.usuario.id_usuario);
  });

  afterAll(async () => {
    // Filtramos undefined para evitar fallos si un test no agregó un ID válido
    const idsProductosValidos = idsProductosCreados.filter(
      (id): id is number => id !== undefined && id !== null,
    );

    // Orden por dependencias FK: detalles/tickets -> pedidos -> productos -> usuarios
    if (idsPedidosCreados.length) {
      await prisma.detalles_pedido.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
      await prisma.ticket_compra.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
      await prisma.pedido.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
    }
    if (idsProductosValidos.length) {
      await prisma.producto.deleteMany({ where: { id_producto: { in: idsProductosValidos } } });
    }
    await prisma.usuario.deleteMany({ where: { id_usuario: { in: idsUsuariosCreados } } });
    await prisma.$disconnect();
    await app.close();
  });

  // ────────────────────────────────────────────────────────────
  // RF-002.1 — Crear producto (POST /productos, @Roles ADMIN, TRABAJADOR)
  // ────────────────────────────────────────────────────────────
  describe('RF-002.1 — Crear producto', () => {
    it('CP-001: debe crear un nuevo producto completando todos los campos obligatorios (Administrador/Trabajador)', async () => {
      const res = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${trabajador.token}`)
        .send({
          nom_producto: `Producto Test ${sufijo}`,
          precio_unitario: 25000,
          stock_actual: 10,
          stock_minimo: 2,
          descripcion: 'Producto creado en prueba de integración',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });

      expect(res.status).toBe(201);
      idsProductosCreados.push(res.body.id_producto);
    });

    it('CP-002: debe permitir crear un producto con un nombre ya existente (Opción A: flexibilidad de nombres)', async () => {
      const nombreCompartido = `Producto Duplicado ${sufijo}`;

      // Primer producto
      const primero = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: nombreCompartido,
          precio_unitario: 15000,
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'Primer producto',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });

      expect(primero.status).toBe(201);
      idsProductosCreados.push(primero.body.id_producto);

      // Segundo producto con el mismo nombre
      const segundo = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: nombreCompartido,
          precio_unitario: 18000,
          stock_actual: 8,
          stock_minimo: 1,
          descripcion: 'Segundo producto con el mismo nombre',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });

      expect(segundo.status).toBe(201);
      idsProductosCreados.push(segundo.body.id_producto);
      
      // Verifica que sean dos registros independientes con IDs diferentes
      expect(segundo.body.id_producto).not.toBe(primero.body.id_producto);
    });

    it('CP-003: debe rechazar la creación dejando campos obligatorios vacíos', async () => {
      const res = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: '', // obligatorio y vacío
          precio_unitario: 10000,
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'Sin nombre',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });

      expect(res.status).toBe(400);
    });

    it('CP-004: debe rechazar la creación con valores numéricos inválidos (precio negativo)', async () => {
      const res = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: `Producto Precio Invalido ${sufijo}`,
          precio_unitario: -5000, // inválido
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'Precio negativo',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });

      expect(res.status).toBe(400);
    });

    it('CP-005: debe subir una imagen válida durante la creación y reflejarla en el producto', async () => {
      const creado = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: `Producto Con Imagen ${sufijo}`,
          precio_unitario: 20000,
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'Para probar subida de imagen',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });
      idsProductosCreados.push(creado.body.id_producto);

      const res = await apiRequest(app)
        .post(`/productos/${creado.body.id_producto}/imagen`)
        .set('Authorization', `Bearer ${admin.token}`)
        .attach('imagen_producto', imagenValidaBuffer, { filename: 'test.png', contentType: 'image/png' });

      expect(res.status).toBe(200);
      expect(res.body.ruta_imagen).toContain(String(creado.body.id_producto));
    });

    it('CP-006: debe rechazar un archivo inválido (PDF) en el campo de imagen del producto', async () => {
      const creado = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: `Producto Imagen Invalida ${sufijo}`,
          precio_unitario: 20000,
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'Para probar rechazo de archivo',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });
      idsProductosCreados.push(creado.body.id_producto);

      const res = await apiRequest(app)
        .post(`/productos/${creado.body.id_producto}/imagen`)
        .set('Authorization', `Bearer ${admin.token}`)
        .attach('imagen_producto', Buffer.from('%PDF-1.4 contenido falso'), {
          filename: 'documento.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);
    });

    it('CP-007: debe bloquear la creación desde una cuenta sin permisos autorizados (Cliente)', async () => {
      const res = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({
          nom_producto: `Producto No Autorizado ${sufijo}`,
          precio_unitario: 10000,
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'No debería crearse',
          id_categoria: CATALOGOS.CATEGORIAS[0],
        });

      expect(res.status).toBe(403);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-002.2 — Visualizar catálogo (GET /productos, @Public)
  // ────────────────────────────────────────────────────────────
  describe('RF-002.2 — Visualizar catálogo', () => {
    it('CP-008: debe visualizar la lista completa de productos disponibles (rol Cliente y Administrativo)', async () => {
      const producto = await crearProductoFake();
      idsProductosCreados.push(producto.id_producto);

      const resSinAuth = await apiRequest(app).get('/productos');
      expect(resSinAuth.status).toBe(200);
      expect(Array.isArray(resSinAuth.body)).toBe(true);

      const resConAuth = await apiRequest(app)
        .get('/productos')
        .set('Authorization', `Bearer ${admin.token}`);
      expect(resConAuth.status).toBe(200);
    });

    it.skip('CP-009: paginación del catálogo — pendiente: no implementada en el backend actual', () => {});
  });

  // ────────────────────────────────────────────────────────────
  // RF-002.3 — Buscar y filtrar productos
  // ────────────────────────────────────────────────────────────
  describe.skip('RF-002.3 — Buscar y filtrar productos (pendiente: filtrado no implementado server-side)', () => {
    it.todo('CP-010: buscar por nombre');
    it.todo('CP-011: filtrar por categoría');
    it.todo('CP-012: filtrar por clasificación');
    it.todo('CP-013: aplicar múltiples filtros simultáneamente');
    it.todo('CP-014: búsqueda con caracteres especiales o vacía');
  });

  // ────────────────────────────────────────────────────────────
  // RF-002.4 — Editar producto (PATCH /productos/:id, @Roles ADMIN, TRABAJADOR)
  // ────────────────────────────────────────────────────────────
  describe('RF-002.4 — Editar producto', () => {
    it('CP-015: debe actualizar exitosamente los datos básicos de un producto (rol autorizado)', async () => {
      const producto = await crearProductoFake();
      idsProductosCreados.push(producto.id_producto);

      const res = await apiRequest(app)
        .patch(`/productos/${producto.id_producto}`)
        .set('Authorization', `Bearer ${trabajador.token}`)
        .send({ nom_producto: 'Nombre Actualizado', precio_unitario: 30000 });

      expect(res.status).toBe(200);
      expect(res.body.data.nom_producto).toBe('Nombre Actualizado');
    });

    it('CP-016: debe rechazar la modificación con valores negativos en precio/stock mínimo', async () => {
      const producto = await crearProductoFake();
      idsProductosCreados.push(producto.id_producto);

      const res = await apiRequest(app)
        .patch(`/productos/${producto.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ stock_minimo: -3 });

      expect(res.status).toBe(400);
    });

    it('CP-017: debe bloquear la modificación desde un rol no autorizado (Cliente)', async () => {
      const producto = await crearProductoFake();
      idsProductosCreados.push(producto.id_producto);

      const res = await apiRequest(app)
        .patch(`/productos/${producto.id_producto}`)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({ nom_producto: 'No debería aplicar' });

      expect(res.status).toBe(403);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-002.5 — Eliminar producto (DELETE /productos/:id, @Roles ADMIN)
  // ────────────────────────────────────────────────────────────
  describe('RF-002.5 — Eliminar producto', () => {
    it('CP-018: debe desactivar el producto exitosamente', async () => {
      const producto = await crearProductoFake();
      idsProductosCreados.push(producto.id_producto);

      const res = await apiRequest(app)
        .delete(`/productos/${producto.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: producto.id_producto } });
      expect(enBd?.estado).toBe(false);
    });

    it('CP-019: debe rechazar la eliminación de un producto con pedidos asociados', async () => {
      const producto = await crearProductoFake();
      idsProductosCreados.push(producto.id_producto);

      const { pedido } = await crearPedidoCompletoFake(cliente.usuario.id_usuario, producto.id_producto);
      idsPedidosCreados.push(pedido.id_pedido);

      const res = await apiRequest(app)
        .delete(`/productos/${producto.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(409);
    });

    it('CP-021: debe bloquear la eliminación desde una cuenta sin permisos (no-Admin)', async () => {
      const producto = await crearProductoFake();
      idsProductosCreados.push(producto.id_producto);

      const res = await apiRequest(app)
        .delete(`/productos/${producto.id_producto}`)
        .set('Authorization', `Bearer ${trabajador.token}`); // solo ADMIN tiene permiso

      expect(res.status).toBe(403);
    });
  });
});