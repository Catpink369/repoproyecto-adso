import { faker } from '@faker-js/faker';

export function fakeUsuario(overrides: Partial<any> = {}) {
    return {
        id_usuario: faker.string.numeric(10),
        nom_1: faker.person.firstName(),
        ape_1: faker.person.lastName(),
        correo: faker.internet.email(),
        telefono: BigInt(faker.string.numeric(10)),
        estado: 1,
        ...overrides,
    };
    }

    export function fakeProducto(overrides: Partial<any> = {}) {
    return {
        id_producto: faker.number.int({ min: 1, max: 1000 }),
        nom_producto: faker.commerce.productName(),
        precio_unitario: faker.number.float({ min: 10000, max: 80000, fractionDigits: 2 }),
        stock_actual: faker.number.int({ min: 5, max: 50 }),
        stock_minimo: 5,
        estado: true,
        ultima_actualiz: new Date(),
        ruta_imagen: '/img/producto.png',
        ...overrides,
    };
    }

    export function fakeMaterial(overrides: Partial<any> = {}) {
    return {
        id_material: faker.number.int({ min: 1, max: 100 }),
        nombre: faker.commerce.productMaterial(),
        precio_unitario: faker.number.float({ min: 1000, max: 30000, fractionDigits: 2 }),
        stock_actual: faker.number.int({ min: 5, max: 50 }),
        unidad: 'metro',
        estado: true,
        ...overrides,
    };
    }

    export function fakeMovimiento(overrides: Partial<any> = {}) {
    return {
        id_movimiento: faker.number.int({ min: 1, max: 9999 }),
        Cantidad_m: faker.number.int({ min: 1, max: 20 }),
        fecha_m: new Date(),
        observaciones: faker.lorem.sentence(),
        id_m: 'M_E',
        tipo: 'entrada',
        nom_producto: faker.commerce.productName(),
        nombre_usuario: faker.person.fullName(),
        ...overrides,
    };
    }

    export function fakeTicket(overrides: Partial<any> = {}) {
    return {
        id_ticket_c: faker.number.int({ min: 1, max: 9999 }),
        num_ticket: faker.number.int({ min: 100000, max: 999999 }),
        fecha_emision: new Date(),
        sub_total: faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 }),
        total_ticket: faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 }),
        id_estado: 'E_pd',
        id_met_pago: 'Mtd_PD',
        ...overrides,
    };
    }

    /** Pedido con las relaciones que devuelve PedidosService.findOne()/findAll()/findByUsuario(). */
    export function fakePedidoDetalleCompleto(overrides: Partial<any> = {}) {
    return {
        id_pedido: faker.number.int({ min: 1, max: 9999 }),
        estado: 'Pendiente',
        id_usuario: faker.string.uuid(),
        usuario: {
        nom_1: faker.person.firstName(),
        ape_1: faker.person.lastName(),
        correo: faker.internet.email(),
        telefono: faker.string.numeric(10),
        },
        ticket_compra: [fakeTicket()],
        detalles_pedido: [
        {
            cantidad: faker.number.int({ min: 1, max: 3 }),
            producto: {
            nom_producto: faker.commerce.productName(),
            precio_unitario: faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 }),
            },
        },
        ],
        ...overrides,
    };
    }

    /** Fila cruda tal como la devuelve el $queryRaw de _getStockBajo()/_getAgotados(). */
    export function fakeProductoAlertaRaw(overrides: Partial<any> = {}) {
    return {
        id_producto: faker.number.int({ min: 1, max: 1000 }),
        nom_producto: faker.commerce.productName(),
        stock_actual: faker.number.int({ min: 0, max: 4 }),
        stock_minimo: 5,
        ultima_actualiz: new Date(),
        categoria: faker.commerce.department(),
        ruta_imagen: '/img/producto.png',
        ...overrides,
    };
    }

    export function fakePedidoRaw(overrides: Partial<any> = {}) {
    return {
        id_pedido: faker.number.int({ min: 1, max: 9999 }),
        id_usuario: faker.string.uuid(),
        id_tipo: 'P_E',
        fecha: new Date(),
        ...overrides,
    }; 
}