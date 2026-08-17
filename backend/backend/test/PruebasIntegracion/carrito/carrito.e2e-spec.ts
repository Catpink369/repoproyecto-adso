// RF-006.1 al 6.5
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { crearProductoFake, limpiarDatosDePrueba, cerrarConexionFaker } from '../../utils/faker-factories';
import { loginComoCliente } from '../../../test/utils/auth-helper';

describe('Integración Backend - Procesamiento de ítems del Carrito (POST /pedidos)', () => {
    let app: INestApplication;
    let tokenCliente: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const cliente = await loginComoCliente(app);
        tokenCliente = cliente.token;
    });

    afterEach(async () => {
        await limpiarDatosDePrueba();
    });

    afterAll(async () => {
        await app.close();
        await cerrarConexionFaker();
    });

    it('CP-001 a CP-003: debe procesar un pedido recibiendo la estructura de ítems del carrito', async () => {
        const producto1 = await crearProductoFake(15);
        const producto2 = await crearProductoFake(10);

        const payloadCarrito = {
        detalles: [
            { id_producto: producto1.id_producto, cantidad: 2 },
            { id_producto: producto2.id_producto, cantidad: 1 },
        ],
        };

        const res = await request(app.getHttpServer())
        .post('/pedidos')
        .set('Authorization', `Bearer ${tokenCliente}`)
        .send(payloadCarrito);

        expect([200, 201]).toContain(res.status);
        expect(res.body).toHaveProperty('id_pedido');
    });

    it('CP-002: debe rechazar la creación del pedido si un producto del carrito no tiene stock suficiente', async () => {
        const productoSinStock = await crearProductoFake(0);

        const payloadCarrito = {
        detalles: [{ id_producto: productoSinStock.id_producto, cantidad: 1 }],
        };

        const res = await request(app.getHttpServer())
        .post('/pedidos')
        .set('Authorization', `Bearer ${tokenCliente}`)
        .send(payloadCarrito);

        expect(res.status).toBe(400);
    });
});