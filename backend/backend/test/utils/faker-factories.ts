import { faker } from '@faker-js/faker';
import {
    PrismaClient,
    tipo_documento_t_doc,
    tipo_pedido_id_tipo,
    estado_pago_id_estado,
    metodo_pago_id_met_pago,
    tipo_movimiento_id_m,
    material_tipo,
    material_unidad,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient { // getprisma no abre conexión hasta que se llama explícitamente
    if (!_prisma) {
        _prisma = new PrismaClient();
    }
    return _prisma;
    }

    // ID que ya existen en gurama_test 
    export const CATALOGOS = {
        ROL_CLIENTE: '2',
        ROL_ADMIN: '1',
        ROL_TRABAJADOR: '3',
        TIPO_DOC_CC: tipo_documento_t_doc.CC,
        CATEGORIAS: [1, 2, 3, 4, 5, 6, 7, 8],
        CLASIFICACIONES: [1, 2, 3, 4, 5],
        };

        export async function crearUsuarioFake(idRol: string = CATALOGOS.ROL_CLIENTE) {
        const contrasenaFake = 'Test1234!';
        const contrasenaHash = await bcrypt.hash(contrasenaFake, 10);

        const usuario = await getPrisma().usuario.create({
            data: {
            id_usuario: faker.string.numeric(10), // simula un número de cédula
            nom_1: faker.person.firstName(),
            ape_1: faker.person.lastName(),
            correo: faker.internet.email(),
            telefono: BigInt(faker.string.numeric(10)),
            contrasena: contrasenaHash,
            id_rol_usuario: idRol,
            t_doc: CATALOGOS.TIPO_DOC_CC,
            estado: 1,
            },
        });

        return { usuario, contrasenaFake };
        }

        export async function crearAdminFake(idRol: string = CATALOGOS.ROL_ADMIN) {
        const contrasenaFake = 'Admin1234!';
        const contrasenaHash = await bcrypt.hash(contrasenaFake, 10);
        const codigofake = faker.string.numeric(6); 
        const codigoHash = await bcrypt.hash(codigofake, 10);

        const usuario = await getPrisma().usuario.create({
            data: {
            id_usuario: faker.string.numeric(10), 
            nom_1: faker.person.firstName(),
            ape_1: faker.person.lastName(),
            correo: faker.internet.email(),
            telefono: BigInt(faker.string.numeric(10)),
            contrasena: contrasenaHash,
            id_rol_usuario: idRol,
            t_doc: CATALOGOS.TIPO_DOC_CC,
            estado: 1,
            codigo: codigoHash, 
            },
        });

        return { usuario, codigofake };
        }

        //Crea un producto real en gurama_test con stock definido,
        export async function crearProductoFake(stock: number = 20) {
        return getPrisma().producto.create({
            data: {
            nom_producto: faker.commerce.productName(),
            precio_unitario: faker.number.float({ min: 10000, max: 80000, fractionDigits: 2 }),
            stock_actual: stock,
            stock_minimo: 5,
            ultima_actualiz: new Date(),
            descripcion: faker.commerce.productDescription().slice(0, 255),
            id_categoria: faker.helpers.arrayElement(CATALOGOS.CATEGORIAS),
            id_clasificacion: faker.helpers.arrayElement(CATALOGOS.CLASIFICACIONES),
            estado: true,
            },
        });
        }

        //Crea un movimiento real de inventario 
        export async function crearMovimientoFake(
        id_producto: number,
        id_usuario: string,
        overrides: Partial<{ Cantidad_m: number; id_m: tipo_movimiento_id_m; observaciones: string }> = {},
        ) {
        return getPrisma().movimiento.create({
            data: {
            Cantidad_m: overrides.Cantidad_m ?? faker.number.int({ min: 1, max: 20 }),
            fecha_m: new Date(),
            observaciones: overrides.observaciones ?? faker.lorem.sentence(),
            id_m: overrides.id_m ?? tipo_movimiento_id_m.M_E,
            id_producto,
            id_usuario,
            id_material: null,
            },
        });
        }

        //Crea un pedido real (sin ticket ni detalle) para un usuario existente.
        export async function crearPedidoFake(
        id_usuario: string,
        overrides: Partial<{ estado: string; id_tipo: tipo_pedido_id_tipo }> = {},
        ) {
        return getPrisma().pedido.create({
            data: {
            fecha: new Date(),
            estado: overrides.estado ?? 'Pendiente',
            id_usuario,
            id_tipo: overrides.id_tipo ?? tipo_pedido_id_tipo.P_E,
            },
        });
        }

        //Crea un ticket de compra real asociado a un pedido existente.
        export async function crearTicketFake(
        id_pedido: number,
        overrides: Partial<{
            sub_total: number;
            total_ticket: number;
            id_estado: estado_pago_id_estado;
            id_met_pago: metodo_pago_id_met_pago;
        }> = {},
        ) {
        return getPrisma().ticket_compra.create({
            data: {
            num_ticket: faker.number.int({ min: 100000, max: 999999 }),
            fecha_emision: new Date(),
            sub_total: overrides.sub_total ?? faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 }),
            total_ticket: overrides.total_ticket ?? faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 }),
            id_pedido,
            id_estado: overrides.id_estado ?? estado_pago_id_estado.E_pd,
            id_met_pago: overrides.id_met_pago ?? metodo_pago_id_met_pago.Mtd_PD,
            },
        });
        }

        //Pedido completo
        export async function crearPedidoCompletoFake(
        id_usuario: string,
        id_producto: number,
        overrides: Partial<{ cantidad: number; estado: string }> = {},
        ) {
        const pedido = await crearPedidoFake(id_usuario, { estado: overrides.estado });
        const cantidad = overrides.cantidad ?? faker.number.int({ min: 1, max: 3 });

        await getPrisma().detalles_pedido.create({
            data: {
            descrip_detalles: faker.commerce.productName(),
            cantidad,
            id_pedido: pedido.id_pedido,
            id_producto,
            },
        });

        const ticket = await crearTicketFake(pedido.id_pedido);

        return { pedido, ticket };
        }

        //Crea una notificación
        export async function crearNotificacionFake(
        id_usuario: string,
        overrides: Partial<{
            titulo: string;
            mensaje: string;
            tipo: 'pedido_estado' | 'stock_bajo' | 'pedido_nuevo';
            leida: boolean;
        }> = {},
        ) {
        return getPrisma().notificacion.create({
            data: {
            id_usuario,
            titulo: overrides.titulo ?? 'Notificación de prueba',
            mensaje: overrides.mensaje ?? faker.lorem.sentence(),
            tipo: overrides.tipo ?? 'pedido_nuevo',
            leida: overrides.leida ?? false,
            },
        });
        }

        //crear material
        export async function crearMaterialFake(
        overrides: Partial<{
            tipo: material_tipo;
            unidad: material_unidad;
            precio_unitario: number;
            stock_actual: number;
        }> = {},
        ) {
        return getPrisma().material.create({
            data: {
            nombre: faker.commerce.productMaterial(),
            tipo: overrides.tipo ?? material_tipo.Tela,
            unidad: overrides.unidad ?? material_unidad.metro,
            precio_unitario:
                overrides.precio_unitario ?? faker.number.float({ min: 5000, max: 30000, fractionDigits: 2 }),
            stock_actual: overrides.stock_actual ?? 20,
            stock_minimo: 5,
            estado: true,
            },
        });
        }

        //Crea un color real asociado a un material (tela) existente. 
        export async function crearColorMaterialFake(id_material: number, nombre: string = 'Azul') {
        return getPrisma().material_color.create({
            data: {
            id_material,
            nombre,
            codigo_hex: '#0000FF',
            estado: true,
            },
        });
        }

        //Crea un diseño real asociado a un material (tela) existente.
        export async function crearDisenoMaterialFake(id_material: number, nombre: string = 'Flores') {
        return getPrisma().material_diseno.create({
            data: {
            id_material,
            nombre,
            estado: true,
            },
        });
        }

        //limpia todos los datos de prueba de la base de datos
        export async function limpiarDatosDePrueba() {
        await getPrisma().notificacion.deleteMany();
        await getPrisma().ticket_compra.deleteMany();
        await getPrisma().detalles_pedido.deleteMany();
        await getPrisma().detalle_pedido_personalizado.deleteMany();
        await getPrisma().pedido_personalizado.deleteMany();
        await getPrisma().pedido.deleteMany();
        await getPrisma().movimiento.deleteMany();
        await getPrisma().material_color.deleteMany();
        await getPrisma().material_diseno.deleteMany();
        await getPrisma().material.deleteMany();
        await getPrisma().producto.deleteMany();
        await getPrisma().usuario.deleteMany();
        }

        export async function cerrarConexionFaker() {
        await getPrisma().$disconnect();
    }


    // ----------Simulación de carrito de compra (frontend)-----------------

    export interface ItemCarritoFake {
    id_producto: number;
    nom_producto: string;
    precio_unitario: number;
    cantidad: number;
    stock_actual: number;
    }

    export type ProductoParaCarrito = Omit<ItemCarritoFake, 'cantidad'>;

    export class CarritoFakeError extends Error {
    constructor(public codigo: string, mensaje: string) {
        super(mensaje);
        this.name = 'CarritoFakeError';
    }
    }

    export class CarritoFake {
    private items: ItemCarritoFake[] = [];

    // RF-006.1 - Agregar producto al carrito (CP-001 / CP-002)
    agregarProducto(producto: ProductoParaCarrito, cantidad: number = 1): ItemCarritoFake[] {
        if (producto.stock_actual <= 0) {
        throw new CarritoFakeError(
            'SIN_STOCK',
            `El producto "${producto.nom_producto}" no tiene stock disponible.`,
        );
        }

        const existente = this.items.find((i) => i.id_producto === producto.id_producto);

        if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;
        if (nuevaCantidad > producto.stock_actual) {
            throw new CarritoFakeError(
            'STOCK_INSUFICIENTE',
            'La cantidad solicitada supera el stock disponible.',
            );
        }
        existente.cantidad = nuevaCantidad;
        } else {
        if (cantidad > producto.stock_actual) {
            throw new CarritoFakeError(
            'STOCK_INSUFICIENTE',
            'La cantidad solicitada supera el stock disponible.',
            );
        }
        this.items.push({ ...producto, cantidad });
        }

        return this.getItems();
    }

    // RF-006.2 - Visualizar carrito de compra (CP-003 / CP-004)
    getItems(): ItemCarritoFake[] {
        return [...this.items];
    }

    contarProductos(): number {
        return this.items.reduce((acc, i) => acc + i.cantidad, 0);
    }

    calcularTotal(): number {
        return this.items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);
    }

    estaVacio(): boolean {
        return this.items.length === 0;
    }

    mensajeCarritoVacio(): string {
        return 'Tu carrito está vacío. Explora nuestro catálogo para encontrar productos.';
    }

    // RF-006.3 - Modificar cantidad del carrito (CP-005 al CP-008)
    modificarCantidad(id_producto: number, nuevaCantidad: number): ItemCarritoFake {
        const item = this.items.find((i) => i.id_producto === id_producto);
        if (!item) {
        throw new CarritoFakeError('PRODUCTO_NO_ENCONTRADO', 'El producto no está en el carrito.');
        }
        if (nuevaCantidad < 1) {
        throw new CarritoFakeError('CANTIDAD_INVALIDA', 'La cantidad no puede ser menor a 1.');
        }
        if (nuevaCantidad > item.stock_actual) {
        throw new CarritoFakeError(
            'STOCK_INSUFICIENTE',
            'La cantidad solicitada supera el stock disponible.',
        );
        }
        item.cantidad = nuevaCantidad;
        return item;
    }

    // RF-006.4 - Quitar producto del carrito (CP-009 / CP-010)
    eliminarProducto(id_producto: number): boolean {
        const antes = this.items.length;
        this.items = this.items.filter((i) => i.id_producto !== id_producto);
        return this.items.length < antes;
    }

    // RF-006.5 - Vaciar carrito (CP-011 al CP-013)
    vaciar(): void {
        if (this.estaVacio()) {
        throw new CarritoFakeError('CARRITO_YA_VACIO', 'El carrito ya se encuentra vacío.');
        }
        this.items = [];
    }
    }

    // personalizacion de cubrelecho (opciones del front de lado1 y lado2)
    export interface LadoCubrelecho {
    id_material: number; // tela
    id_color: number;
    id_diseno: number;
    }

    export interface PersonalizacionCubrelechoFake {
    tamanio: string;
    lado1: LadoCubrelecho;
    lado2: LadoCubrelecho;
    }

    export function validarPersonalizacionCubrelecho(
    input: Partial<PersonalizacionCubrelechoFake>,
    ): string[] {
    const errores: string[] = [];

    if (!input.tamanio) errores.push('tamanio es obligatorio');

    (['lado1', 'lado2'] as const).forEach((lado) => {
        const config = input[lado];
        if (!config) {
        errores.push(`${lado} es obligatorio`);
        return;
        }
        if (!config.id_material) errores.push(`${lado}.id_material (tela) es obligatorio`);
        if (!config.id_color) errores.push(`${lado}.id_color es obligatorio`);
        if (!config.id_diseno) errores.push(`${lado}.id_diseno es obligatorio`);
    });

    return errores;
}

    // ----------Simulación de generación y exportación de reportes (frontend) -----------------
    
    export interface ReporteGeneralFake {
    desde: string;
    hasta: string;
    totalEntradas: number;
    totalSalidas: number;
    }

    export class ReporteFakeError extends Error {
    constructor(public codigo: string, mensaje: string) {
        super(mensaje);
        this.name = 'ReporteFakeError';
    }
    }

    export class ReporteFake {
    private reporteActual: ReporteGeneralFake | null = null;

    // RF-009.2 - Generar reporte general (soporte para CP-004 / CP-005 / CP-007)
    generar(
        desde: string,
        hasta: string,
        datos: { totalEntradas: number; totalSalidas: number },
    ): ReporteGeneralFake {
        if (new Date(desde) > new Date(hasta)) {
        throw new ReporteFakeError(
            'RANGO_INVALIDO',
            'La fecha "Desde" no puede ser posterior a la fecha "Hasta".',
        );
        }

        this.reporteActual = { desde, hasta, ...datos };
        return this.reporteActual;
    }

    // RF-009.2 - Exportar el reporte generado (CP-006)
    exportar(formato: 'PDF' | 'Excel' = 'PDF'): { archivo: string; formato: 'PDF' | 'Excel' } {
        if (!this.reporteActual) {
        throw new ReporteFakeError(
            'SIN_REPORTE',
            'Debes generar un reporte antes de poder exportarlo.',
        );
        }

        const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
        const archivo = `reporte_${this.reporteActual.desde}_${this.reporteActual.hasta}.${extension}`;

        return { archivo, formato };
    }

    // RF-009.2 - Abrir la vista de impresión del reporte generado (CP-006)
    imprimir(): boolean {
        if (!this.reporteActual) {
        throw new ReporteFakeError(
            'SIN_REPORTE',
            'Debes generar un reporte antes de poder imprimirlo.',
        );
        }

        return true; // simula la apertura exitosa de impresión
    }
}