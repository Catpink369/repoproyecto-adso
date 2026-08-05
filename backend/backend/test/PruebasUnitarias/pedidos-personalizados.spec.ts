//RF-005.1 / RF-005.2
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PedidosPersonalizadosService } from '../../src/pedidos-personalizados/pedidos-personalizados.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('PedidosPersonalizadosService', () => {
    let service: PedidosPersonalizadosService;
    let prisma: any;

    const mockTx = {
        pedido: { create: jest.fn() },
        pedido_personalizado: { create: jest.fn() },
        ticket_compra: { create: jest.fn() },
        material: { update: jest.fn() },
    };

    beforeEach(async () => {
        jest.clearAllMocks(); // limpiar los mocks antes de cada prueba

        prisma = {
        usuario: { findUnique: jest.fn() },
        material: { findUnique: jest.fn() },
        material_color: { findMany: jest.fn() },
        material_diseno: { findMany: jest.fn() },
        pedido_personalizado: { findMany: jest.fn() },
        $transaction: jest.fn((callback) => callback(mockTx)),
        };

        const module: TestingModule = await Test.createTestingModule({
        providers: [
            PedidosPersonalizadosService,
            { provide: PrismaService, useValue: prisma },
        ],
        }).compile();

        service = module.get(PedidosPersonalizadosService);
    });

    function mockUsuarioValido(id_usuario: string) {
        prisma.usuario.findUnique.mockResolvedValue({
        id_usuario,
        nom_1: faker.person.firstName(),
        ape_1: faker.person.lastName(),
        correo: faker.internet.email(),
        telefono: BigInt(faker.string.numeric(10)),
        });
    }

    function mockMaterialesDisponibles(
        materiales: {
        id_material: number;
        nombre: string;
        precio_unitario: number;
        stock_actual: number;
        unidad: string;
        estado?: boolean;
        }[],
    ) {
        prisma.material.findUnique.mockImplementation(({ where }: any) => {
        const mat = materiales.find((m) => m.id_material === where.id_material);
        return Promise.resolve(mat ? { ...mat, estado: mat.estado ?? true } : null);
        });
    }

    function mockTransaccionExitosa() {
        mockTx.pedido.create.mockResolvedValue({
        id_pedido: faker.number.int({ min: 1, max: 9999 }),
        });
        mockTx.pedido_personalizado.create.mockResolvedValue({});
        mockTx.ticket_compra.create.mockResolvedValue({});
        mockTx.material.update.mockResolvedValue({});
    }

    // RF-005.2 - Calcular precio de producto personalizado
    it('CP-005: debe sumar correctamente el precio de cada material seleccionado al costo total', async () => {
        mockUsuarioValido('123');
        mockMaterialesDisponibles([
        { id_material: 1, nombre: 'Tela algodón', precio_unitario: 10000, stock_actual: 20, unidad: 'metro' },
        { id_material: 2, nombre: 'Relleno fibra', precio_unitario: 5000, stock_actual: 15, unidad: 'unidad' },
        ]);
        mockTransaccionExitosa();

        const dto = {
        id_usuario: '123',
        tipo_producto: 'Cubrelecho',
        tamanio: 'Queen',
        materiales: [
            { id_material: 1, cantidad: 3 },
            { id_material: 2, cantidad: 2 },
        ],
        };

        const resultado = await service.crearPedido(dto as any);

        // 3 productos de 10mil + 2 productos de 5mil = 30mil + 10mil = 40mil
        expect(resultado.precio_total).toBe(40000);
        expect(resultado.materiales).toHaveLength(2);
        expect(resultado.materiales[0].subtotal).toBe(30000);
        expect(resultado.materiales[1].subtotal).toBe(10000);
    });

    it('CP-006: la respuesta de crearPedido() debe mostrar el desglose del precio por cada material antes de confirmar', async () => {
        mockUsuarioValido('123');
        mockMaterialesDisponibles([
        { id_material: 1, nombre: 'Tela algodón', precio_unitario: 12000, stock_actual: 20, unidad: 'metro' },
        { id_material: 2, nombre: 'Relleno fibra', precio_unitario: 6000, stock_actual: 15, unidad: 'unidad' },
        ]);
        mockTransaccionExitosa();

        const dto = {
        id_usuario: '123',
        tipo_producto: 'Cubrelecho',
        tamanio: 'Queen',
        materiales: [
            { id_material: 1, cantidad: 2 },
            { id_material: 2, cantidad: 1 },
        ],
        };

        const resultado = await service.crearPedido(dto as any);

        // El nombre, cantidad, precio_unitario y subtotal por cada material
        expect(resultado.materiales).toEqual([
        expect.objectContaining({ id_material: 1, cantidad: 2, precio_unitario: 12000, subtotal: 24000 }),
        expect.objectContaining({ id_material: 2, cantidad: 1, precio_unitario: 6000, subtotal: 6000 }),
        ]);
        expect(resultado.precio_total).toBe(30000);
    });

    it('CP-007: crearPedido() debe ser idempotente — llamadas repetidas con distintas combinaciones de materiales no arrastran estado entre sí', async () => {
        mockUsuarioValido('123');
        mockMaterialesDisponibles([
        { id_material: 1, nombre: 'Tela algodón', precio_unitario: 10000, stock_actual: 20, unidad: 'metro' },
        { id_material: 2, nombre: 'Relleno fibra', precio_unitario: 5000, stock_actual: 15, unidad: 'unidad' },
        ]);
        mockTransaccionExitosa();

        // Primera "selección" del cliente
        const resultado1 = await service.crearPedido({
        id_usuario: '123',
        tipo_producto: 'Cubrelecho',
        tamanio: 'Queen',
        materiales: [{ id_material: 1, cantidad: 1 }],
        } as any);

        // El cliente cambia de opción varias veces antes de confirmar
        const resultado2 = await service.crearPedido({
        id_usuario: '123',
        tipo_producto: 'Cubrelecho',
        tamanio: 'Queen',
        materiales: [{ id_material: 2, cantidad: 3 }],
        } as any);

        expect(resultado1.precio_total).toBe(10000);
        expect(resultado2.precio_total).toBe(15000); // no arrastra el material anterior
    });

    it('debe descontar del stock la cantidad exacta usada por cada material', async () => {
        mockUsuarioValido('123');
        mockMaterialesDisponibles([
        { id_material: 1, nombre: 'Tela algodón', precio_unitario: 10000, stock_actual: 20, unidad: 'metro' },
        ]);
        mockTransaccionExitosa();

        const dto = {
        id_usuario: '123',
        tipo_producto: 'Sabana',
        tamanio: 'Doble',
        materiales: [{ id_material: 1, cantidad: 4 }],
        };

        await service.crearPedido(dto as any);

        expect(mockTx.material.update).toHaveBeenCalledWith({
        where: { id_material: 1 },
        data: { stock_actual: { decrement: 4 } },
        });
    });

    it('debe generar el ticket con estado de pedido y pago "Pendiente" por defecto', async () => {
        mockUsuarioValido('123');
        mockMaterialesDisponibles([
        { id_material: 1, nombre: 'Tela algodón', precio_unitario: 10000, stock_actual: 20, unidad: 'metro' },
        ]);
        mockTransaccionExitosa();

        const dto = {
        id_usuario: '123',
        tipo_producto: 'Sabana',
        tamanio: 'Doble',
        materiales: [{ id_material: 1, cantidad: 1 }],
        };

        await service.crearPedido(dto as any);

        expect(mockTx.ticket_compra.create).toHaveBeenCalledWith(
        expect.objectContaining({
            data: expect.objectContaining({
            id_estado: 'E_pt', // estado pendiente
            }),
        }),
        );
    });

    // RF-005.1 - Personalizar producto (validaciones)
    it('CP-004 debe rechazar el pedido si un material no tiene stock suficiente', async () => {
        mockUsuarioValido('123');
        mockMaterialesDisponibles([
        { id_material: 1, nombre: 'Tela algodón', precio_unitario: 10000, stock_actual: 2, unidad: 'metro' },
        ]);

        const dto = {
        id_usuario: '123',
        tipo_producto: 'Cubrelecho',
        tamanio: 'Queen',
        materiales: [{ id_material: 1, cantidad: 5 }],
        };

        await expect(service.crearPedido(dto as any)).rejects.toThrow(BadRequestException);
        expect(mockTx.pedido.create).not.toHaveBeenCalled();
    });

    it('debe rechazar el pedido si un material no existe o está inactivo', async () => {
        mockUsuarioValido('123');
        mockMaterialesDisponibles([]); // si ningún material coincide findUnique devuelve null

        const dto = {
        id_usuario: '123',
        tipo_producto: 'Sabana',
        tamanio: 'Doble',
        materiales: [{ id_material: 99, cantidad: 1 }],
        };

        await expect(service.crearPedido(dto as any)).rejects.toThrow(NotFoundException);
        expect(mockTx.pedido.create).not.toHaveBeenCalled();
    });

    it('debe rechazar el pedido si el usuario no existe', async () => {
        prisma.usuario.findUnique.mockResolvedValue(null);

        const dto = {
        id_usuario: 'no-existe',
        tipo_producto: 'Sabana',
        tamanio: 'Doble',
        materiales: [],
        };

        await expect(service.crearPedido(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('CP-003: debe filtrar los colores disponibles según el material (tela) seleccionado', async () => {
        prisma.material_color.findMany.mockResolvedValue([
        { id_color: 1, nombre: 'Azul', codigo_hex: '#0000FF' },
        { id_color: 2, nombre: 'Rojo', codigo_hex: '#FF0000' },
        ]);

        const colores = await service.getColoresMaterial(1);

        expect(prisma.material_color.findMany).toHaveBeenCalledWith({
        where: { id_material: 1, estado: true },
        select: { id_color: true, nombre: true, codigo_hex: true },
        });
        expect(colores).toHaveLength(2);
    });

    it('CP-003: debe filtrar los diseños disponibles según el material seleccionado', async () => {
        prisma.material_diseno.findMany.mockResolvedValue([
        { id_diseno: 1, nombre: 'Flores', ruta_imagen: '/img/flores.png' },
        ]);

        const disenos = await service.getDisenosMaterial(1);

        expect(prisma.material_diseno.findMany).toHaveBeenCalledWith({
        where: { id_material: 1, estado: true },
        select: { id_diseno: true, nombre: true, ruta_imagen: true },
        });
        expect(disenos).toHaveLength(1);
    });
});