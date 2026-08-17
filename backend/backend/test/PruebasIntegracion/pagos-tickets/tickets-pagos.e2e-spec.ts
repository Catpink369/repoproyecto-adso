// RF-008.1 a RF-008.4 
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { loginComoCliente, loginConCodigo } from '../../utils/auth-helper';

jest.setTimeout(30000); // para que el tiempo de espera no sea tan corto

describe('RF-008 — Pagos y Tickets (integración)', () => {
    let app: INestApplication; // instancia de la app NestJS para pruebas
    let prisma: PrismaClient;

    let cliente: { usuario: any; token: string };
    let admin: { usuario: any; token: string };

    const API_KEY = process.env.API_KEY ?? '';
    const sufijo = Date.now();

    let categoria: any;
    let clasificacion: any;
    let producto: any;
    let material: any;

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
            create: { id_clasificacion: 1, nombre_clas: 'Sin_clasificar' }, // antes: 'Sin clasificar'
        });

        producto = await prisma.producto.create({
        data: {
            nom_producto: `Producto Ticket Test ${sufijo}`,
            precio_unitario: 25000,
            stock_actual: 30,
            stock_minimo: 5,
            ultima_actualiz: new Date(),
            descripcion: 'Producto de prueba para tickets',
            id_categoria: categoria.id_categoria,
            id_clasificacion: clasificacion.id_clasificacion,
            estado: true,
        },
        });

        material = await prisma.material.create({
        data: {
            nombre: `Tela Ticket Test ${sufijo}`, tipo: 'Tela', unidad: 'metro',
            precio_unitario: 9000, stock_actual: 40, stock_minimo: 5, estado: true,
        },
        });
    });

    afterAll(async () => {
        await prisma.detalle_pedido_personalizado.deleteMany({ where: { id_material: material.id_material } });
        await prisma.material.delete({ where: { id_material: material.id_material } }).catch(() => {});
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

    async function crearPedidoEstandar() {
        const res = await request(app.getHttpServer())
        .post('/pedidos/crear')
        .set('x-api-key', API_KEY)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({
            id_usuario: cliente.usuario.id_usuario,
            metodo_pago: 'Efectivo',
            subtotal: 25000,
            total: 25000,
            items: [{ id_producto: producto.id_producto, cantidad: 1, precio: 25000 }],
        });
        return res.body.data.id_pedido as number;
    }

    describe('RF-008.1 — Generar ticket de pedido (automático)', () => {
        it('CP-001: al confirmar un pedido estándar se genera el ticket con número único y detalle del producto', async () => {
            const res = await request(app.getHttpServer())
                .post('/pedidos/crear')
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`)
                .send({
                id_usuario: cliente.usuario.id_usuario,
                metodo_pago: 'Efectivo',
                subtotal: 25000,
                total: 25000,
                items: [{ id_producto: producto.id_producto, cantidad: 1, precio: 25000 }],
                });

            expect(res.status).toBe(201);
            expect(res.body.data.num_ticket).toBeGreaterThanOrEqual(100000);
            expect(res.body.data.detalles[0].producto).toBe(producto.nom_producto);
        });

        it('CP-002: al confirmar un pedido personalizado, el ticket detalla las opciones elegidas', async () => {
            const res = await request(app.getHttpServer())
                .post('/pedidos-personalizados')
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`)
                .send({
                id_usuario: cliente.usuario.id_usuario,
                tipo_producto: 'Sabana',
                tamanio: 'Doble',
                materiales: [{ id_material: material.id_material, cantidad: 2 }],
                });

            expect(res.status).toBe(201);
            expect(res.body.num_ticket).toBeGreaterThanOrEqual(100000);
            expect(res.body.tamanio).toBe('Doble');
            expect(res.body.materiales[0].nombre).toBe(material.nombre);
        });

        it('CP-003: el ticket nace con estado de pedido y de pago "Pendiente"', async () => {
            const idPedido = await crearPedidoEstandar();

            const pedidoEnBD = await prisma.pedido.findUnique({
                where: { id_pedido: idPedido },
                include: { ticket_compra: true },
            });

            expect(pedidoEnBD?.estado).toBe('Pendiente');
            expect(pedidoEnBD?.ticket_compra?.id_estado).toBe('E_pt'); // requiere el fix aplicado arriba
        });

        it('CP-004: pedidos consecutivos generan números de ticket distintos', async () => {
            const idPedido1 = await crearPedidoEstandar();
            const idPedido2 = await crearPedidoEstandar();

            const [t1, t2] = await Promise.all([
                prisma.ticket_compra.findUnique({ where: { id_pedido: idPedido1 } }),
                prisma.ticket_compra.findUnique({ where: { id_pedido: idPedido2 } }),
            ]);

            expect(t1?.num_ticket).not.toBe(t2?.num_ticket);
        });
    });

    describe('RF-008.2 — Actualizar estado de pedido', () => {
        it('CP-005: el admin/trabajador cambia manualmente el estado del pedido', async () => {
            const idPedido = await crearPedidoEstandar();

            const res = await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'En preparación' });

            expect(res.status).toBe(200);
            expect(res.body.estado).toBe('En preparación');
        });

        it('CP-006: bloquea el cambio de estado en pedidos Entregado/Finalizado/Anulado', async () => {
            const idPedido = await crearPedidoEstandar();
            await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'Finalizado' })
                .expect(200);

            const res = await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ estado: 'Pagado' });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Finalizado/);
        });

        it('CP-007: al cambiar el estado se genera una notificación con el título esperado', async () => {
            const idPedido = await crearPedidoEstandar();

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
            expect(notif?.titulo).toBe('Actualización de pedido'); // el título persistido; el push usa "Actualización de tu pedido"
        });
    });

    describe('RF-008.3 — Actualizar método de pago', () => {
        it('CP-008: elegir un método de pago actualiza el método Y marca el pago como "Pagado" en el mismo paso', async () => {
            const idPedido = await crearPedidoEstandar();

            const res = await request(app.getHttpServer())
                .patch(`/pedidos/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ metodo_pago: 'Nequi' });

            expect(res.status).toBe(200);

            const ticket = await prisma.ticket_compra.findUnique({ where: { id_pedido: idPedido } });
            expect(ticket?.id_met_pago).toBe('Mtd_NQ');
            expect(ticket?.id_estado).toBe('E_pd'); // requiere el fix aplicado arriba
        });

        it('CP-009: un pedido recién creado muestra el método "Por definir" hasta que se actualice', async () => {
            const idPedido = await crearPedidoEstandar();

            const ticket = await prisma.ticket_compra.findUnique({ where: { id_pedido: idPedido } });
            expect(ticket?.id_met_pago).toBe('Mtd_PD');
            expect(ticket?.id_estado).toBe('E_pt');
        });
    });

    describe('RF-008.4 — Consultar tickets y pedidos realizados', () => {
        it('CP-010: el usuario visualiza el historial cronológico completo de sus pedidos', async () => {
            await crearPedidoEstandar();
            await crearPedidoEstandar();

            const res = await request(app.getHttpServer())
                .get(`/pedidos/usuario/${cliente.usuario.id_usuario}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
            const fechas = res.body.map((p: any) => new Date(p.fecha).getTime());
            const fechasOrdenadas = [...fechas].sort((a, b) => b - a);
            expect(fechas).toEqual(fechasOrdenadas); // más reciente primero
        });

        it('CP-011: el filtro "estándar" oculta los pedidos personalizados', async () => {
            await crearPedidoEstandar();
            await request(app.getHttpServer())
                .post('/pedidos-personalizados')
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`)
                .send({
                id_usuario: cliente.usuario.id_usuario,
                tipo_producto: 'Sabana',
                tamanio: 'Sencilla',
                materiales: [{ id_material: material.id_material, cantidad: 1 }],
                });

            const res = await request(app.getHttpServer())
                .get(`/pedidos/usuario/${cliente.usuario.id_usuario}?tipo=estandar`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`);

            expect(res.status).toBe(200);
            expect(res.body.every((p: any) => p.id_tipo === 'P_E')).toBe(true);
        });

        it('CP-012: el filtro "personalizado" oculta los pedidos estándar', async () => {
            const res = await request(app.getHttpServer())
                .get(`/pedidos/usuario/${cliente.usuario.id_usuario}?tipo=personalizado`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`);

            expect(res.status).toBe(200);
            expect(res.body.every((p: any) => p.id_tipo === 'P_P')).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('CP-013: se puede abrir el detalle completo de un pedido específico', async () => {
            const idPedido = await crearPedidoEstandar();

            const res = await request(app.getHttpServer())
                .get(`/pedidos/detalle/${idPedido}`)
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${cliente.token}`);

            expect(res.status).toBe(200);
            expect(res.body.id_pedido).toBe(idPedido);
            expect(res.body.detalles_pedido).toBeDefined();
            expect(res.body.ticket_compra).toBeDefined();
            expect(res.body.usuario).toBeDefined();
        });
    });
});