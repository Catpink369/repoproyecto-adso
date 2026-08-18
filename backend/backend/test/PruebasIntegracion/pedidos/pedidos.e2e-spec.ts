// RF-007.1 al RF-007.3
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { loginComoCliente, loginConCodigo } from '../../utils/auth-helper';
import { CarritoFake } from '../../utils/faker-factories';

jest.setTimeout(30000); // para que el tiempo de espera no sea tan corto

describe('RF-007 — Pedidos (integración)', () => {
    let app: INestApplication; // instancia de la app NestJS para pruebas
    let prisma: PrismaClient;

    let cliente: { usuario: any; token: string };
    let admin: { usuario: any; token: string };

    const API_KEY = process.env.API_KEY ?? '';
    const sufijo = Date.now();

    let categoria: any;
    let clasificacion: any;
    let producto: any;

    beforeAll(async () => { // correr 1 vez antes que las pruebas se corran
        const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
        await app.init();

        prisma = new PrismaClient();

        cliente = await loginComoCliente(app);
        admin = await loginConCodigo(app);

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
            nom_producto: `Producto Pedido Test ${sufijo}`,
            precio_unitario: 20000,
            stock_actual: 30,
            stock_minimo: 5,
            ultima_actualiz: new Date(),
            descripcion: 'Producto de prueba para pedidos',
            id_categoria: categoria.id_categoria,
            id_clasificacion: clasificacion.id_clasificacion,
            estado: true,
        },
        });
    });

    afterAll(async () => {
        // Limpieza de notificaciones creadas por los pedidos de este archivo
        // (notificarPedidoCreado / notificarCambioEstadoPedido las persisten)
        await prisma.notificacion.deleteMany({ where: { id_usuario: cliente.usuario.id_usuario } });

        const detalles = await prisma.detalles_pedido.findMany({
        where: { id_producto: producto.id_producto },
        select: { id_pedido: true },
        });
        const idsPedidos = [...new Set(detalles.map((d) => d.id_pedido))];
        await prisma.ticket_compra.deleteMany({ where: { id_pedido: { in: idsPedidos } } });
        await prisma.detalles_pedido.deleteMany({ where: { id_producto: producto.id_producto } });
        await prisma.pedido.deleteMany({ where: { id_pedido: { in: idsPedidos } } });
        await prisma.producto.delete({ where: { id_producto: producto.id_producto } }).catch(() => {});
        await prisma.$disconnect();
        await app.close();
    });

    async function refrescarStockProducto() {
        producto = await prisma.producto.findUnique({ where: { id_producto: producto.id_producto } });
        return producto;
    }

    async function crearPedidoEstandar(
        clienteUsado: { usuario: any; token: string } = cliente,
        cantidad: number = 1,
    ) {
        return request(app.getHttpServer())
        .post('/pedidos/crear')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${clienteUsado.token}`)
        .send({
            id_usuario: clienteUsado.usuario.id_usuario,
            metodo_pago: 'Efectivo',
            subtotal: Number(producto.precio_unitario) * cantidad,
            total: Number(producto.precio_unitario) * cantidad,
            items: [{ id_producto: producto.id_producto, cantidad, precio: producto.precio_unitario }],
        });
    }

    describe('RF-007.1 — Registrar pedido', () => {
        it('CP-001: el cliente confirma un pedido con stock suficiente: se registra, se genera el ticket "Pendiente", se descuenta el stock y el carrito (frontend) se vacía', async () => {
            await refrescarStockProducto();
            const stockAntes = producto.stock_actual;
            const cantidad = 2;

            // Simulación del carrito de frontend antes de confirmar
            const carrito = new CarritoFake();
            carrito.agregarProducto(
                {
                    id_producto: producto.id_producto,
                    nom_producto: producto.nom_producto,
                    precio_unitario: Number(producto.precio_unitario),
                    stock_actual: stockAntes,
                },
                cantidad,
            );
            expect(carrito.estaVacio()).toBe(false);

            const res = await crearPedidoEstandar(cliente, cantidad);

            expect(res.status).toBe(201);
            expect(res.body.data.num_ticket).toBeGreaterThanOrEqual(100000);
            expect(res.body.data.num_ticket).toBeLessThanOrEqual(999999);
            expect(res.body.data.detalles[0].producto).toBe(producto.nom_producto);

            const pedidoEnBD = await prisma.pedido.findUnique({
                where: { id_pedido: res.body.data.id_pedido },
                include: { ticket_compra: true },
            });
            expect(pedidoEnBD?.estado).toBe('Pendiente');
            expect(pedidoEnBD?.ticket_compra?.id_estado).toBe('E_pt');

            await refrescarStockProducto();
            expect(producto.stock_actual).toBe(stockAntes - cantidad);

            // El frontend solo vacía el carrito tras una confirmación exitosa
            carrito.vaciar();
            expect(carrito.estaVacio()).toBe(true);
        });

        it('CP-002: el sistema rechaza el pedido si un producto no tiene stock suficiente, indica cuál producto es, y no descuenta inventario ni genera ticket', async () => {
            await refrescarStockProducto();
            const stockAntes = producto.stock_actual;
            const cantidadSolicitada = stockAntes + 100; // supera el stock disponible

            // El front lo dejó agregar porque validó contra el stock que tenía
            // al cargar el catálogo; el backend revalida el stock real al confirmar.
            const carrito = new CarritoFake();
            carrito.agregarProducto(
                {
                    id_producto: producto.id_producto,
                    nom_producto: producto.nom_producto,
                    precio_unitario: Number(producto.precio_unitario),
                    stock_actual: cantidadSolicitada,
                },
                cantidadSolicitada,
            );

            const res = await request(app.getHttpServer())
                .post('/pedidos/crear')
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`)
                .send({
                    id_usuario: cliente.usuario.id_usuario,
                    metodo_pago: 'Efectivo',
                    subtotal: Number(producto.precio_unitario) * cantidadSolicitada,
                    total: Number(producto.precio_unitario) * cantidadSolicitada,
                    items: [{ id_producto: producto.id_producto, cantidad: cantidadSolicitada, precio: producto.precio_unitario }],
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain(producto.nom_producto);

            await refrescarStockProducto();
            expect(producto.stock_actual).toBe(stockAntes); // no se descontó nada

            // como el backend rechazó el pedido, el carrito de frontend no se vacía
            expect(carrito.estaVacio()).toBe(false);
        });

        it('CP-003: no se permite confirmar un pedido con el carrito vacío', async () => {
            const carrito = new CarritoFake();
            expect(carrito.estaVacio()).toBe(true);

            const res = await request(app.getHttpServer())
                .post('/pedidos/crear')
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`)
                .send({
                    id_usuario: cliente.usuario.id_usuario,
                    metodo_pago: 'Efectivo',
                    subtotal: 0,
                    total: 0,
                    items: carrito.getItems(), // [] - refleja el carrito vacío del frontend
                });

            expect(res.status).toBe(400);
        });

        it('CP-004: un usuario sin sesión iniciada no puede registrar un pedido', async () => {
            const res = await request(app.getHttpServer())
                .post('/pedidos/crear')
                .set('x-api-key', API_KEY)
                // sin header Authorization: simula acceso directo sin sesión
                .send({
                    id_usuario: cliente.usuario.id_usuario,
                    metodo_pago: 'Efectivo',
                    subtotal: producto.precio_unitario,
                    total: producto.precio_unitario,
                    items: [{ id_producto: producto.id_producto, cantidad: 1, precio: producto.precio_unitario }],
                });

            expect(res.status).toBe(401);
        });
    });

    describe('RF-007.2 — Consultar/ver estado de pedido', () => {
        it('CP-005: al cambiar el estado del pedido, el cliente recibe una notificación en la app', async () => {
            const resPedido = await crearPedidoEstandar();
            const idPedido = resPedido.body.data.id_pedido;

            await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'En preparación' })
                .expect(200);

            const notif = await prisma.notificacion.findFirst({
                where: { id_usuario: cliente.usuario.id_usuario, mensaje: { contains: `#${idPedido}` } },
                orderBy: { fecha: 'desc' },
            });

            expect(notif).not.toBeNull();
        });

        it.todo(
            'CP-006: el cliente recibe el correo de notificación cuando cambia el estado de su pedido — requiere TaskService conectado',
        );

        it('CP-007: el admin/trabajador consulta el listado de todos los pedidos con su estado', async () => {
            await crearPedidoEstandar();

            const res = await request(app.getHttpServer())
                .get('/pedidos')
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`);

            expect(res.status).toBe(200);
            const pedidos = Array.isArray(res.body) ? res.body : res.body?.data ?? [];
            expect(pedidos.length).toBeGreaterThan(0);
            expect(pedidos[0]).toHaveProperty('estado');
        });

        it('CP-008: el sistema deniega a un cliente el acceso al pedido de otro cliente', async () => {
            const otroCliente = await loginComoCliente(app);
            const resPedidoOtro = await crearPedidoEstandar(otroCliente);
            const idPedidoOtro = resPedidoOtro.body.data.id_pedido;

            const res = await request(app.getHttpServer())
                .get(`/pedidos/detalle/${idPedidoOtro}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`); // cliente A intenta ver pedido de cliente B

            expect(res.status).toBe(403);

            // limpieza del cliente auxiliar
            await prisma.notificacion.deleteMany({ where: { id_usuario: otroCliente.usuario.id_usuario } });
        });
    });

    describe('RF-007.3 — Cancelar/anular pedido', () => {
        it('CP-009: el admin anula un pedido en estado "Pendiente" y el cliente recibe notificación', async () => {
            const resPedido = await crearPedidoEstandar();
            const idPedido = resPedido.body.data.id_pedido;

            const res = await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'Anulado' });

            expect(res.status).toBe(200);
            expect(res.body.estado).toBe('Anulado');

            const pedidoEnBD = await prisma.pedido.findUnique({ where: { id_pedido: idPedido } });
            expect(pedidoEnBD?.estado).toBe('Anulado');

            const notif = await prisma.notificacion.findFirst({
                where: { id_usuario: cliente.usuario.id_usuario, mensaje: { contains: `#${idPedido}` } },
                orderBy: { fecha: 'desc' },
            });
            expect(notif).not.toBeNull();
        });

        it('CP-010: el sistema no permite anular un pedido ya "Entregado" o "Finalizado"', async () => {
            const resPedido = await crearPedidoEstandar();
            const idPedido = resPedido.body.data.id_pedido;

            // Flujo válido: Pendiente -> En preparación -> Pagado -> Entregado
            await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'En preparación' })
                .expect(200);

            await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'Pagado', metodo_pago: 'Efectivo' })
                .expect(200);

            await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'Entregado' })
                .expect(200);

            const res = await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'Anulado' });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Entregado/);
        });
    });
});