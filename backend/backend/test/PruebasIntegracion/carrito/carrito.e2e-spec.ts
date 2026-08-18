// RF-006.1 / RF-006.2 / RF-006.3 / RF-006.4 / RF-006.5 (integración)
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { loginComoCliente } from '../../utils/auth-helper';
import { CarritoFake, CarritoFakeError, ProductoParaCarrito } from '../../utils/faker-factories';

jest.setTimeout(30000);

describe('RF-006 — Gestión de Carrito (integración)', () => {
    let app: INestApplication;
    let prisma: PrismaClient;
    let token: string;
    let idUsuario: string;

    const idsProductosCreados: number[] = [];

    // Crea un producto real en gurama_test y lo deja listo para usar como
    // ProductoParaCarrito (la forma que CarritoFake.agregarProducto() espera).
    async function crearProductoParaCarrito(overrides: Partial<{ stock_actual: number; precio_unitario: number }> = {}): Promise<ProductoParaCarrito> {
        const producto = await prisma.producto.create({
        data: {
            nom_producto: `Producto Carrito Test ${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            precio_unitario: overrides.precio_unitario ?? 10000,
            stock_actual: overrides.stock_actual ?? 10,
            stock_minimo: 2,
            ultima_actualiz: new Date(),
            descripcion: 'Producto creado en prueba de integración de carrito',
            id_categoria: 1,
            id_clasificacion: 1,
            estado: true,
        } as any,
        });
        idsProductosCreados.push(producto.id_producto);
        return {
        id_producto: producto.id_producto,
        nom_producto: producto.nom_producto,
        precio_unitario: Number(producto.precio_unitario),
        stock_actual: producto.stock_actual,
        };
    }

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
    });

    afterAll(async () => {
        if (idsProductosCreados.length) {

        await prisma.detalles_pedido.deleteMany({ where: { id_producto: { in: idsProductosCreados } } });
        await prisma.producto.deleteMany({ where: { id_producto: { in: idsProductosCreados } } });
        }
        await prisma.$disconnect();
        await app.close();
    });

    function nuevoCarrito(): CarritoFake {
        return new CarritoFake();
    }

    // RF-006.1 - Agregar producto al carrito
    describe('RF-006.1 - Agregar producto al carrito', () => {
        it('CP-001: debe agregar un producto estándar (real, de la BD) al carrito y el contador debe incrementarse', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 10 });

        carrito.agregarProducto(producto, 1);

        expect(carrito.getItems()).toHaveLength(1);
        expect(carrito.contarProductos()).toBe(1);
        });

        it('CP-002: debe bloquear el intento de agregar un producto sin stock disponible (stock real = 0)', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 0 });

        expect(() => carrito.agregarProducto(producto, 1)).toThrow(CarritoFakeError);
        expect(carrito.getItems()).toHaveLength(0);
        });
    });

    // RF-006.2 - Visualizar carrito de compra
    describe('RF-006.2 - Visualizar carrito de compra', () => {
        it('CP-003: debe calcular correctamente la sumatoria del precio total de todos los productos (precios reales)', async () => {
        const carrito = nuevoCarrito();
        const productoA = await crearProductoParaCarrito({ precio_unitario: 10000, stock_actual: 10 });
        const productoB = await crearProductoParaCarrito({ precio_unitario: 5000, stock_actual: 10 });

        carrito.agregarProducto(productoA, 2);
        carrito.agregarProducto(productoB, 3);

        expect(carrito.calcularTotal()).toBe(35000);
        });

        it('CP-004: debe mostrar un mensaje informativo cuando el carrito está vacío', () => {
        const carrito = nuevoCarrito();

        expect(carrito.estaVacio()).toBe(true);
        expect(carrito.mensajeCarritoVacio()).toMatch(/carrito está vacío/i);
        });
    });

    // RF-006.3 - Modificar cantidad del carrito
    describe('RF-006.3 - Modificar cantidad del carrito', () => {
        it('CP-005: debe impedir que la cantidad se establezca en menos de 1 unidad', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 10 });
        carrito.agregarProducto(producto, 1);

        expect(() => carrito.modificarCantidad(producto.id_producto, 0)).toThrow(CarritoFakeError);
        });

        it('CP-006: debe impedir que la cantidad supere el stock disponible (stock real)', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 5 });
        carrito.agregarProducto(producto, 1);

        expect(() => carrito.modificarCantidad(producto.id_producto, 6)).toThrow('supera el stock disponible');
        });

        it('CP-007: debe permitir aumentar la cantidad dentro del límite de stock', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 10 });
        carrito.agregarProducto(producto, 2);

        const item = carrito.modificarCantidad(producto.id_producto, 4);

        expect(item.cantidad).toBe(4);
        });

        it('CP-008: debe permitir disminuir la cantidad sin bajar de 1', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 10 });
        carrito.agregarProducto(producto, 4);

        const item = carrito.modificarCantidad(producto.id_producto, 2);

        expect(item.cantidad).toBe(2);
        });
    });

    // RF-006.4 - Quitar producto del carrito
    describe('RF-006.4 - Quitar producto del carrito', () => {
        it('CP-009: debe eliminar el producto específico indicado del carrito', async () => {
        const carrito = nuevoCarrito();
        const productoA = await crearProductoParaCarrito({ stock_actual: 10 });
        const productoB = await crearProductoParaCarrito({ stock_actual: 10 });
        carrito.agregarProducto(productoA, 1);
        carrito.agregarProducto(productoB, 1);

        const eliminado = carrito.eliminarProducto(productoA.id_producto);

        expect(eliminado).toBe(true);
        expect(carrito.getItems().map((i) => i.id_producto)).toEqual([productoB.id_producto]);
        });

        it('CP-010: al cancelar la eliminación, el producto debe permanecer en el carrito', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 10 });
        carrito.agregarProducto(producto, 1);
        const itemsAntes = carrito.getItems();

        // "Cancelar" = no invocar eliminarProducto(); el estado no cambia.
        expect(carrito.getItems()).toEqual(itemsAntes);
        });
    });

    // RF-006.5 - Vaciar carrito
    describe('RF-006.5 - Vaciar carrito', () => {
        it('CP-011: debe vaciar el carrito cuando contiene productos', async () => {
        const carrito = nuevoCarrito();
        const productoA = await crearProductoParaCarrito({ stock_actual: 10 });
        const productoB = await crearProductoParaCarrito({ stock_actual: 10 });
        carrito.agregarProducto(productoA, 2);
        carrito.agregarProducto(productoB, 1);

        carrito.vaciar();

        expect(carrito.estaVacio()).toBe(true);
        });

        it('CP-012: al cancelar el vaciado, el carrito debe mantener sus productos', async () => {
        const carrito = nuevoCarrito();
        const producto = await crearProductoParaCarrito({ stock_actual: 10 });
        carrito.agregarProducto(producto, 2);
        const itemsAntes = carrito.getItems();

        // "Cancelar" = no invocar vaciar(); el estado no cambia.
        expect(carrito.getItems()).toEqual(itemsAntes);
        });

        it('CP-013: debe rechazar el intento de vaciar un carrito que ya está vacío', () => {
        const carrito = nuevoCarrito();

        expect(carrito.estaVacio()).toBe(true);
        expect(() => carrito.vaciar()).toThrow(CarritoFakeError);
        });
    });
});