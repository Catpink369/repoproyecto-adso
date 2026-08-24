// RF-002.1 al RF-002.5 — Gestión de Productos 
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { apiRequest } from '../../utils/http';
import { loginComoCliente, loginComoTrabajador, loginConCodigo } from '../../utils/auth-helper';

jest.setTimeout(30000);

describe('RF-002 — Gestión de Productos (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  const sufijo = Date.now();
  const idsProductosCreados: number[] = [];
  const idsPedidosCreados: number[] = []; 

  let cliente: { usuario: any; token: string };
  let trabajador: { usuario: any; token: string };
  let admin: { usuario: any; token: string };

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
  });

  afterAll(async () => {
    const idsValidos = idsProductosCreados.filter((id): id is number => id != null);
    if (idsPedidosCreados.length) {                                                    
      await prisma.detalles_pedido.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
      await prisma.pedido.deleteMany({ where: { id_pedido: { in: idsPedidosCreados } } });
    }
    if (idsValidos.length) {
      await prisma.detalles_pedido.deleteMany({ where: { id_producto: { in: idsValidos } } });
      await prisma.producto.deleteMany({ where: { id_producto: { in: idsValidos } } });
    }
    await prisma.$disconnect();
    await app.close();
  });

  async function crearProductoDeTest(overrides: Partial<Record<string, any>> = {}) {
    const res = await apiRequest(app)
      .post('/productos')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        nom_producto: `Producto Test ${sufijo}-${Math.random().toString(36).slice(2, 7)}`,
        precio_unitario: 25000,
        stock_actual: 10,
        stock_minimo: 2,
        descripcion: 'Producto creado para pruebas de integración',
        id_categoria: 3,
        id_clasificacion: 1,
        ...overrides,
      });

    if (res.status !== 201) {
      throw new Error(`No se pudo crear el producto de prueba: ${res.status} - ${JSON.stringify(res.body)}`);
    }
    idsProductosCreados.push(res.body.id_producto);
    return res.body;
  }

  describe('RF-002.1 — Crear producto', () => {
    it('CP-001: crea un nuevo producto completando todos los campos obligatorios de forma exitosa (Administrador/Trabajador autorizado)', async () => {
      const res = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${trabajador.token}`)
        .send({
          nom_producto: `Producto CP-001 ${sufijo}`,
          precio_unitario: 25000,
          stock_actual: 10,
          stock_minimo: 2,
          descripcion: 'Producto creado en CP-001',
          id_categoria: 3,
          id_clasificacion: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.id_producto).toBeDefined();
      expect(res.body.nom_producto).toBe(`Producto CP-001 ${sufijo}`);
      idsProductosCreados.push(res.body.id_producto);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: res.body.id_producto } });
      expect(enBd).not.toBeNull();
      expect(enBd?.estado).toBe(true);
    });

    it('CP-002: el sistema asigna automáticamente un identificador único (id_producto) a cada producto, garantizando que nunca se dupliquen', async () => {
      const primero = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: `Producto CP-002-A ${sufijo}`,
          precio_unitario: 15000,
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'Primer producto de CP-002',
          id_categoria: 3,
          id_clasificacion: 1,
        });
      expect(primero.status).toBe(201);
      idsProductosCreados.push(primero.body.id_producto);

      const segundo = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          nom_producto: `Producto CP-002-B ${sufijo}`,
          precio_unitario: 18000,
          stock_actual: 8,
          stock_minimo: 1,
          descripcion: 'Segundo producto de CP-002',
          id_categoria: 3,
          id_clasificacion: 1,
        });
      expect(segundo.status).toBe(201);
      idsProductosCreados.push(segundo.body.id_producto);

      expect(typeof primero.body.id_producto).toBe('number');
      expect(typeof segundo.body.id_producto).toBe('number');
      expect(segundo.body.id_producto).not.toBe(primero.body.id_producto);
    });

    it('CP-003: rechaza la creación dejando campos obligatorios vacíos (nombre, precio, stock inicial)', async () => {
      const base = {
        nom_producto: `Producto CP-003 ${sufijo}`,
        precio_unitario: 25000,
        stock_actual: 10,
        stock_minimo: 2,
        descripcion: 'Producto para CP-003',
        id_categoria: 3,
        id_clasificacion: 1,
      };

      const sinNombre = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ ...base, nom_producto: '' });
      expect(sinNombre.status).toBe(400);

      const sinPrecio = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ ...base, precio_unitario: undefined });
      expect(sinPrecio.status).toBe(400);

      const sinStock = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ ...base, stock_actual: undefined });
      expect(sinStock.status).toBe(400);
    });

    it('CP-004: rechaza la creación con valores numéricos inválidos (precio negativo, stock actual o mínimo negativos)', async () => {
      const base = {
        nom_producto: `Producto CP-004 ${sufijo}`,
        precio_unitario: 25000,
        stock_actual: 10,
        stock_minimo: 2,
        descripcion: 'Producto para CP-004',
        id_categoria: 3,
        id_clasificacion: 1,
      };

      // Precio negativo
      const precioNegativo = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ ...base, precio_unitario: -5000 });
      expect(precioNegativo.status).toBe(400);

      // Stock actual negativo
      const stockActualNegativo = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ ...base, stock_actual: -1 });
      expect(stockActualNegativo.status).toBe(400);

      // Stock mínimo negativo
      const stockMinimoNegativo = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ ...base, stock_minimo: -3 });
      expect(stockMinimoNegativo.status).toBe(400);
    });

    it('CP-005: sube una imagen válida durante la creación y la refleja correctamente en el producto', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-005 ${sufijo}` });

      const res = await apiRequest(app)
        .post(`/productos/${creado.id_producto}/imagen`)
        .set('Authorization', `Bearer ${admin.token}`)
        .attach('imagen_producto', imagenValidaBuffer, { filename: 'test.png', contentType: 'image/png' });

      // El endpoint no define @HttpCode, así que Nest responde 201 por defecto en un POST
      expect(res.status).toBe(201);
      expect(res.body.ruta_imagen).toContain(String(creado.id_producto));

      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(enBd?.ruta_imagen).toBe(res.body.ruta_imagen);
    });

    it('CP-006: rechaza un archivo con formato inválido (PDF) en el campo de imagen del producto', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-006 ${sufijo}` });

      const res = await apiRequest(app)
        .post(`/productos/${creado.id_producto}/imagen`)
        .set('Authorization', `Bearer ${admin.token}`)
        .attach('imagen_producto', Buffer.from('%PDF-1.4 contenido falso'), {
          filename: 'documento.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);

      // La ruta de imagen del producto no debe haberse modificado
      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(enBd?.ruta_imagen).toBeNull();
    });

    it('CP-007: bloquea la creación de un producto desde una cuenta sin permisos autorizados (Cliente)', async () => {
      const res = await apiRequest(app)
        .post('/productos')
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({
          nom_producto: `Producto CP-007 ${sufijo}`,
          precio_unitario: 10000,
          stock_actual: 5,
          stock_minimo: 1,
          descripcion: 'No debería crearse',
          id_categoria: 3,
          id_clasificacion: 1,
        });

      expect(res.status).toBe(403);

      const enBd = await prisma.producto.findFirst({
        where: { nom_producto: `Producto CP-007 ${sufijo}` },
      });
      expect(enBd).toBeNull();
    });
  });

  // ────────────────────────────────────────────────────────────
// RF-002.2 — Visualizar catálogo (GET /productos, @Public)
// ────────────────────────────────────────────────────────────
  describe('RF-002.2 — Visualizar catálogo', () => {
    it('CP-008: visualiza la lista completa de productos disponibles en el catálogo (rol Cliente y Administrativo)', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-008 ${sufijo}` });

      const resSinAuth = await apiRequest(app).get('/productos');
      expect(resSinAuth.status).toBe(200);
      expect(Array.isArray(resSinAuth.body)).toBe(true);
      expect(resSinAuth.body.some((p: any) => p.id_producto === creado.id_producto)).toBe(true);

      const resComoCliente = await apiRequest(app)
        .get('/productos')
        .set('Authorization', `Bearer ${cliente.token}`);
      expect(resComoCliente.status).toBe(200);

      const resComoAdmin = await apiRequest(app)
        .get('/productos')
        .set('Authorization', `Bearer ${admin.token}`);
      expect(resComoAdmin.status).toBe(200);
    });

    it('CP-009: la paginación (?page=&limit=) limita la cantidad de resultados y trae páginas distintas', async () => {
      const cantidad = 12;
      const nombreBase = `Producto CP-009 ${sufijo}`;
      const creados: any[] = [];
      for (let i = 0; i < cantidad; i++) {
        creados.push(await crearProductoDeTest({ nom_producto: `${nombreBase}-${i}` }));
      }

      const pagina1 = await apiRequest(app).get('/productos').query({ page: 1, limit: 5 });
      const pagina2 = await apiRequest(app).get('/productos').query({ page: 2, limit: 5 });

      expect(pagina1.status).toBe(200);
      expect(pagina2.status).toBe(200);
      expect(pagina1.body.length).toBe(5);
      expect(pagina2.body.length).toBe(5);

      const idsPagina1 = pagina1.body.map((p: any) => p.id_producto);
      const idsPagina2 = pagina2.body.map((p: any) => p.id_producto);
      const interseccion = idsPagina1.filter((id: number) => idsPagina2.includes(id));
      expect(interseccion.length).toBe(0);

      const sinPaginar = await apiRequest(app).get('/productos');
      const idsSinPaginar = sinPaginar.body.map((p: any) => p.id_producto);
      expect(creados.every((c) => idsSinPaginar.includes(c.id_producto))).toBe(true);
    });
  });

  describe('RF-002.3 — Buscar y filtrar productos', () => {
    it('CP-010: la búsqueda por nombre (?search=) devuelve solo los productos que coinciden', async () => {
      const nombreUnico = `Bufanda Exclusiva ${sufijo}`;
      const creado = await crearProductoDeTest({ nom_producto: nombreUnico });
      await crearProductoDeTest({ nom_producto: `Producto Sin Relación ${sufijo}` });

      const res = await apiRequest(app).get('/productos').query({ search: 'Bufanda Exclusiva' });

      expect(res.status).toBe(200);
      const ids = res.body.map((p: any) => p.id_producto);
      expect(ids).toContain(creado.id_producto);
      expect(res.body.every((p: any) => p.nom_producto.includes('Bufanda Exclusiva'))).toBe(true);
    });

    it('CP-011: el filtro por categoría (?id_categoria=) devuelve solo productos de esa categoría', async () => {
      const productoCat3 = await crearProductoDeTest({ nom_producto: `Producto CP-011-A ${sufijo}`, id_categoria: 3 });
      const productoCat1 = await crearProductoDeTest({ nom_producto: `Producto CP-011-B ${sufijo}`, id_categoria: 1 });

      const res = await apiRequest(app).get('/productos').query({ id_categoria: 3 });

      expect(res.status).toBe(200);
      const ids = res.body.map((p: any) => p.id_producto);
      expect(ids).toContain(productoCat3.id_producto);
      expect(ids).not.toContain(productoCat1.id_producto);
      expect(res.body.every((p: any) => p.id_categoria === 3)).toBe(true);
    });

    it('CP-012: el filtro por clasificación (?id_clasificacion=) devuelve solo productos de esa clasificación', async () => {
      const productoClas1 = await crearProductoDeTest({ nom_producto: `Producto CP-012-A ${sufijo}`, id_clasificacion: 1 });
      const productoClas2 = await crearProductoDeTest({ nom_producto: `Producto CP-012-B ${sufijo}`, id_clasificacion: 2 });

      const res = await apiRequest(app).get('/productos').query({ id_clasificacion: 2 });

      expect(res.status).toBe(200);
      const ids = res.body.map((p: any) => p.id_producto);
      expect(ids).toContain(productoClas2.id_producto);
      expect(ids).not.toContain(productoClas1.id_producto);
      expect(res.body.every((p: any) => p.id_clasificacion === 2)).toBe(true);
    });

    it('CP-013: aplicar múltiples filtros simultáneamente devuelve solo lo que cumple todos a la vez', async () => {
      const coincide = await crearProductoDeTest({
        nom_producto: `Amigurumi Especial ${sufijo}`,
        id_categoria: 3,
        id_clasificacion: 2,
      });
      const otraCategoria = await crearProductoDeTest({
        nom_producto: `Amigurumi Especial Variante ${sufijo}`,
        id_categoria: 1,
        id_clasificacion: 2,
      });

      const res = await apiRequest(app).get('/productos').query({
        search: 'Amigurumi Especial',
        id_categoria: 3,
        id_clasificacion: 2,
      });

      expect(res.status).toBe(200);
      const ids = res.body.map((p: any) => p.id_producto);
      expect(ids).toContain(coincide.id_producto);
      expect(ids).not.toContain(otraCategoria.id_producto);
    });

    it('CP-014: una búsqueda sin coincidencias o con caracteres especiales no rompe el sistema y devuelve una lista vacía', async () => {
      const resSinCoincidencias = await apiRequest(app)
        .get('/productos')
        .query({ search: `TextoQueNoExiste-${sufijo}` });
      expect(resSinCoincidencias.status).toBe(200);
      expect(resSinCoincidencias.body).toEqual([]);

      const resEspeciales = await apiRequest(app)
        .get('/productos')
        .query({ search: '%^&*()"; DROP TABLE producto;--' });
      expect(resEspeciales.status).toBe(200);
      expect(Array.isArray(resEspeciales.body)).toBe(true);
      expect(resEspeciales.body).toEqual([]);

      const resVacia = await apiRequest(app).get('/productos').query({ search: '' });
      expect(resVacia.status).toBe(200);
      expect(Array.isArray(resVacia.body)).toBe(true);
    });
  });

  // ────────────────────────────────────────────────────────────
// RF-002.4 — Editar producto (PATCH /productos/:id, @Roles ADMIN, TRABAJADOR)
// ────────────────────────────────────────────────────────────
  describe('RF-002.4 — Editar producto', () => {
    it('CP-015: actualiza exitosamente los datos básicos de un producto (nombre, descripción, precio) desde un rol autorizado', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-015 ${sufijo}` });

      const res = await apiRequest(app)
        .patch(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${trabajador.token}`)
        .send({
          nom_producto: `Producto CP-015 Actualizado ${sufijo}`,
          descripcion: 'Descripción actualizada',
          precio_unitario: 30000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.nom_producto).toBe(`Producto CP-015 Actualizado ${sufijo}`);
      expect(res.body.data.descripcion).toBe('Descripción actualizada');
      expect(Number(res.body.data.precio_unitario)).toBe(30000);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(enBd?.nom_producto).toBe(`Producto CP-015 Actualizado ${sufijo}`);
    });

    it('CP-016: rechaza la modificación con valores no numéricos o negativos en precio/stock mínimo', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-016 ${sufijo}` });

      const precioNegativo = await apiRequest(app)
        .patch(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ precio_unitario: -1000 });
      expect(precioNegativo.status).toBe(400);

      const stockMinimoNegativo = await apiRequest(app)
        .patch(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ stock_minimo: -5 });
      expect(stockMinimoNegativo.status).toBe(400);

      const precioNoNumerico = await apiRequest(app)
        .patch(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ precio_unitario: 'no-es-un-numero' });
      expect(precioNoNumerico.status).toBe(400);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(Number(enBd?.precio_unitario)).toBe(25000);
    });

    it('CP-017: bloquea la modificación de un producto desde un rol no autorizado (Cliente)', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-017 ${sufijo}` });

      const res = await apiRequest(app)
        .patch(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({ nom_producto: 'No debería aplicar' });

      expect(res.status).toBe(403);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(enBd?.nom_producto).toBe(`Producto CP-017 ${sufijo}`);
    });
  });

  // ────────────────────────────────────────────────────────────
// RF-002.5 — Eliminar producto (DELETE /productos/:id, @Roles ADMIN)
// ────────────────────────────────────────────────────────────
  describe('RF-002.5 — Eliminar producto', () => {
    it('CP-018: desactiva el producto exitosamente (borrado lógico, estado = false)', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-018 ${sufijo}` });

      const res = await apiRequest(app)
        .delete(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(enBd?.estado).toBe(false);

      const catalogo = await apiRequest(app).get('/productos');
      const idsCatalogo = catalogo.body.map((p: any) => p.id_producto);
      expect(idsCatalogo).not.toContain(creado.id_producto);
    });

    it('CP-019: rechaza la eliminación de un producto con pedidos asociados', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-019 ${sufijo}` });

      const pedido = await prisma.pedido.create({
        data: {
          fecha: new Date(),
          estado: 'Pendiente',
          id_usuario: cliente.usuario.id_usuario,
          id_tipo: 'P_P',
        },
      });
      idsPedidosCreados.push(pedido.id_pedido);

      await prisma.detalles_pedido.create({
        data: {
          descrip_detalles: `Detalle de prueba CP-019`,
          cantidad: 1,
          id_pedido: pedido.id_pedido,
          id_producto: creado.id_producto,
        },
      });

      const res = await apiRequest(app)
        .delete(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(409);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(enBd?.estado).toBe(true);
    });

    it.todo(
      'CP-020: el usuario cancela la operación de eliminar — es un flujo del frontend (window.confirm) que nunca llega a llamar la API; no aplica a un test de integración de backend',
    );

    it('CP-021: bloquea la eliminación desde una cuenta sin permisos (no-Admin)', async () => {
      const creado = await crearProductoDeTest({ nom_producto: `Producto CP-021 ${sufijo}` });

      const res = await apiRequest(app)
        .delete(`/productos/${creado.id_producto}`)
        .set('Authorization', `Bearer ${trabajador.token}`);

      expect(res.status).toBe(403);

      const enBd = await prisma.producto.findUnique({ where: { id_producto: creado.id_producto } });
      expect(enBd?.estado).toBe(true);
    });
  });
});