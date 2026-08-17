// RF-005.1 / RF-005.2 
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { loginComoCliente } from '../utils/auth-helper';

jest.setTimeout(30000);

describe('RF-005 — Pedidos Personalizados (integración)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;
    let token: string;
    let idUsuario: string;

    const API_KEY = process.env.API_KEY ?? '';
    const sufijo = Date.now(); // evita choque de nombres únicos entre corridas

    let materialTelaA: any;
    let materialTelaB: any;
    let materialExtra: any;
    let materialSinColores: any;
    let colorTelaA: any;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
        await app.init();

        prisma = new PrismaClient();

        const sesion = await loginComoCliente(app);
        token = sesion.token;
        idUsuario = sesion.usuario.id_usuario;

        materialTelaA = await prisma.material.create({
        data: {
            nombre: `Tela Test A ${sufijo}`, tipo: 'Tela', unidad: 'metro',
            precio_unitario: 10000, stock_actual: 50, stock_minimo: 5, estado: true,
        },
        });
        materialTelaB = await prisma.material.create({
        data: {
            nombre: `Tela Test B ${sufijo}`, tipo: 'Tela', unidad: 'metro',
            precio_unitario: 12000, stock_actual: 50, stock_minimo: 5, estado: true,
        },
        });
        materialExtra = await prisma.material.create({
        data: {
            nombre: `Sobresábana Test ${sufijo}`, tipo: 'Accesorio', unidad: 'unidad',
            precio_unitario: 8000, stock_actual: 30, stock_minimo: 5, estado: true,
        },
        });
        materialSinColores = await prisma.material.create({
        data: {
            nombre: `Tela Sin Colores Test ${sufijo}`, tipo: 'Tela', unidad: 'metro',
            precio_unitario: 9000, stock_actual: 20, stock_minimo: 5, estado: true,
        },
        });
        colorTelaA = await prisma.material_color.create({
        data: {
            id_material: materialTelaA.id_material,
            nombre: 'Azul Test', codigo_hex: '#0000FF', estado: true,
        },
        });
    });

    afterAll(async () => {
        const idsMateriales = [
        materialTelaA.id_material,
        materialTelaB.id_material,
        materialExtra.id_material,
        materialSinColores.id_material,
        ];
        // Limpieza en orden por dependencias FK
        await prisma.detalle_pedido_personalizado.deleteMany({
        where: { id_material: { in: idsMateriales } },
        });
        await prisma.material_color.deleteMany({ where: { id_material: materialTelaA.id_material } });
        await prisma.material.deleteMany({ where: { id_material: { in: idsMateriales } } });
        await prisma.$disconnect();
        await app.close();
    });

    // RF-005.1
    describe('RF-005.1 — Personalizar producto', () => {
        it('CP-001: debe guardar la configuración de ambos lados de un cubrelecho de forma independiente', async () => {
        const res = await request(app.getHttpServer())
            .post('/pedidos-personalizados')
            .set('x-api-key', API_KEY)
            .set('Authorization', `Bearer ${token}`)
            .send({
            id_usuario: idUsuario,
            tipo_producto: 'Cubrelecho',
            tamanio: 'Queen',
            materiales: [
                { id_material: materialTelaA.id_material, cantidad: 2 }, // lado 1
                { id_material: materialTelaB.id_material, cantidad: 2 }, // lado 2
            ],
        });

        expect(res.status).toBe(201);
        expect(res.body.materiales).toHaveLength(2);
        const idsDevueltos = res.body.materiales.map((m: any) => m.id_material);
        expect(idsDevueltos).toEqual(
            expect.arrayContaining([materialTelaA.id_material, materialTelaB.id_material]),
        );
        });

        it('CP-002: debe registrar una sábana con complementos opcionales (sobresábana) correctamente sumados', async () => {
        const res = await request(app.getHttpServer())
            .post('/pedidos-personalizados')
            .set('x-api-key', API_KEY)
            .set('Authorization', `Bearer ${token}`)
            .send({
            id_usuario: idUsuario,
            tipo_producto: 'Sabana',
            tamanio: 'Doble',
            materiales: [
                { id_material: materialTelaA.id_material, cantidad: 1 },
                { id_material: materialExtra.id_material, cantidad: 1 },
            ],
        });

        expect(res.status).toBe(201);
        // 10000 (tela) + 8000 (sobresábana) = 18000
        expect(res.body.precio_total).toBe(18000);
        expect(res.body.materiales.some((m: any) => m.id_material === materialExtra.id_material)).toBe(true);
        });

        it('CP-003: el listado de colores debe filtrarse según el material (tela) seleccionado', async () => {
            const resConColores = await request(app.getHttpServer())
                .get(`/pedidos-personalizados/materiales/${materialTelaA.id_material}/colores`)
                .set('x-api-key', API_KEY);

            expect(resConColores.status).toBe(200);
            expect(resConColores.body).toHaveLength(1);
            expect(resConColores.body[0].nombre).toBe('Azul Test');

            const resSinColores = await request(app.getHttpServer())
                .get(`/pedidos-personalizados/materiales/${materialSinColores.id_material}/colores`)
                .set('x-api-key', API_KEY);

            expect(resSinColores.status).toBe(200);
            expect(resSinColores.body).toHaveLength(0);
        });

        it('CP-004: el backend debe rechazar (400) un pedido personalizado sin materiales seleccionados', async () => {
            const res = await request(app.getHttpServer())
                .post('/pedidos-personalizados')
                .set('x-api-key', API_KEY)
                .set('Authorization', `Bearer ${token}`)
                .send({
                id_usuario: idUsuario,
                tipo_producto: 'Cubrelecho',
                tamanio: 'Queen',
                materiales: [], // sin tela seleccionada
                });

            expect(res.status).toBe(400);
        });

        it('CP-004: el backend debe rechazar (400) un pedido sin tipo_producto', async () => {
        const res = await request(app.getHttpServer())
            .post('/pedidos-personalizados')
            .set('x-api-key', API_KEY)
            .set('Authorization', `Bearer ${token}`)
            .send({
            id_usuario: idUsuario,
            tamanio: 'Queen',
            materiales: [{ id_material: materialTelaA.id_material, cantidad: 1 }],
            });

        expect(res.status).toBe(400);
        });
    });

    // RF-005.2
    describe('RF-005.2 — Calcular precio', () => {
        it('CP-005: el precio total debe sumar exactamente el precio de cada opción seleccionada', async () => {
        const res = await request(app.getHttpServer())
            .post('/pedidos-personalizados')
            .set('x-api-key', API_KEY)
            .set('Authorization', `Bearer ${token}`)
            .send({
            id_usuario: idUsuario,
            tipo_producto: 'Cubrelecho',
            tamanio: 'King',
            materiales: [
                { id_material: materialTelaA.id_material, cantidad: 3 }, // 3 * 10000 = 30000
                { id_material: materialTelaB.id_material, cantidad: 2 }, // 2 * 12000 = 24000
            ],
        });

        expect(res.status).toBe(201);
        expect(res.body.precio_total).toBe(54000);
        });

        it('CP-006: la respuesta debe traer el desglose por material (base para el resumen visual antes de confirmar)', async () => {
        const res = await request(app.getHttpServer())
            .post('/pedidos-personalizados')
            .set('x-api-key', API_KEY)
            .set('Authorization', `Bearer ${token}`)
            .send({
            id_usuario: idUsuario,
            tipo_producto: 'Sabana',
            tamanio: 'Sencilla',
            materiales: [{ id_material: materialTelaA.id_material, cantidad: 1 }],
        });

        expect(res.status).toBe(201);
        expect(res.body.materiales[0]).toEqual(
            expect.objectContaining({
            id_material: materialTelaA.id_material,
            cantidad: 1,
            subtotal: 10000,
            nombre: materialTelaA.nombre,
            unidad: 'metro',
            }),
        );
        });

        it('CP-007: llamadas consecutivas con combinaciones distintas no deben arrastrar precio entre sí', async () => {
        const res1 = await request(app.getHttpServer())
            .post('/pedidos-personalizados')
            .set('x-api-key', API_KEY)
            .set('Authorization', `Bearer ${token}`)
            .send({
            id_usuario: idUsuario,
            tipo_producto: 'Sabana',
            tamanio: 'Doble',
            materiales: [{ id_material: materialTelaA.id_material, cantidad: 1 }],
        });

        const res2 = await request(app.getHttpServer())
            .post('/pedidos-personalizados')
            .set('x-api-key', API_KEY)
            .set('Authorization', `Bearer ${token}`)
            .send({
            id_usuario: idUsuario,
            tipo_producto: 'Sabana',
            tamanio: 'Doble',
            materiales: [{ id_material: materialTelaB.id_material, cantidad: 3 }],
        });

        expect(res1.body.precio_total).toBe(10000);
        expect(res2.body.precio_total).toBe(36000); // no arrastra los 10000 del anterior
        });
    });
});