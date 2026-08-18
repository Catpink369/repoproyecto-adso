//RF-007.1 - RF-007.2 - RF-007.3
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PedidosService } from '../../../src/pedidos/pedidos.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { FcmPushService } from '../../../src/notificaciones/fcm-push.service';
import { NotificacionesService } from '../../../src/notificaciones/notificaciones.service';
import { fakePedidoDetalleCompleto } from '../../utils/mock-factories';
import { CarritoFake } from '../../utils/faker-factories';
import { PedidosController } from '../../../src/pedidos/pedidos.controller';

describe('RF-007 - Gestion de Pedidos', () => {
	let service: PedidosService;
	let controller: PedidosController;
	let prisma: any;
	let fcmPush: any;
	let notificaciones: any;

	const mockTx = {
		pedido: { create: jest.fn() },
		producto: { findFirst: jest.fn(), update: jest.fn() },
		detalles_pedido: { create: jest.fn() },
		movimiento: { create: jest.fn() },
		ticket_compra: { create: jest.fn() },
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		prisma = {
			$transaction: jest.fn((callback) => callback(mockTx)),
			pedido: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
			ticket_compra: { updateMany: jest.fn() },
		};

		fcmPush = {
			notificarAdmins: jest.fn(),
			notificarUsuario: jest.fn(),
		};

		// cambia el pedido y envía notificación / notifica pedido recién creado
		notificaciones = {
			notificarCambioEstadoPedido: jest.fn(),
			notificarPedidoCreado: jest.fn(), // antes no estaba mockeado: create() lo llama siempre
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PedidosService,
				{ provide: PrismaService, useValue: prisma },
				{ provide: FcmPushService, useValue: fcmPush },
				{ provide: NotificacionesService, useValue: notificaciones },
			],
			controllers: [
				PedidosController,
			],
		}).compile();

		service = module.get(PedidosService);
		controller = module.get(PedidosController);
	});

	function mockTransaccionExitosa(id_producto: number, stockDisponible: number, nombreProducto?: string) {
		mockTx.pedido.create.mockResolvedValue({ id_pedido: faker.number.int({ min: 1, max: 9999 }) });
		mockTx.producto.findFirst.mockResolvedValue({
			id_producto,
			nom_producto: nombreProducto ?? faker.commerce.productName(),
			stock_actual: stockDisponible,
		});
		mockTx.producto.update.mockResolvedValue({});
		mockTx.detalles_pedido.create.mockResolvedValue({});
		mockTx.movimiento.create.mockResolvedValue({});
		mockTx.ticket_compra.create.mockResolvedValue({
			id_ticket_c: faker.number.int({ min: 1, max: 9999 }),
		});
	}

	// RF-007.1
	describe('RF-007.1 - Registrar pedido', () => {
		it('CP-001: debe registrar el pedido, descontar el stock, generar el ticket "Pendiente" y vaciar el carrito (frontend) al confirmar con stock suficiente', async () => {
			const id_producto = faker.number.int({ min: 1, max: 1000 });
			const cantidad = faker.number.int({ min: 1, max: 3 });
			const precio = faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 });
			const nombreProducto = faker.commerce.productName();
			const stockInicial = cantidad + 10;

			mockTransaccionExitosa(id_producto, stockInicial, nombreProducto);

			// Simulación del carrito de frontend antes de confirmar
			const carrito = new CarritoFake();
			carrito.agregarProducto(
				{ id_producto, nom_producto: nombreProducto, precio_unitario: precio, stock_actual: stockInicial },
				cantidad,
			);
			expect(carrito.estaVacio()).toBe(false);

			const dto = {
				id_usuario: faker.string.uuid(),
				metodo_pago: 'Efectivo',
				subtotal: precio * cantidad,
				total: precio * cantidad,
				items: [{ id_producto, cantidad, precio }],
			};

			const resultado = await service.create(dto as any);

			expect(resultado.success).toBe(true);
			expect(mockTx.ticket_compra.create).toHaveBeenCalledTimes(1);
			expect(resultado.data.num_ticket).toBeDefined();
			expect(typeof resultado.data.num_ticket).toBe('number');
			// el ticket recién generado debe iniciar en estado "Pendiente" (E_pt)
			expect(mockTx.ticket_compra.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({ id_estado: 'E_pt' }),
				}),
			);
			// se descuenta el stock exactamente en la cantidad pedida
			expect(mockTx.producto.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id_producto },
					data: expect.objectContaining({ stock_actual: stockInicial - cantidad }),
				}),
			);

			// el frontend solo vacía el carrito tras una confirmación exitosa
			carrito.vaciar();
			expect(carrito.estaVacio()).toBe(true);
		});

		it('CP-002: debe rechazar el pedido si un producto no tiene stock suficiente, indicar cuál producto es, y no debe generar ticket ni descontar stock', async () => {
			const id_producto = faker.number.int({ min: 1, max: 1000 });
			const cantidadSolicitada = 5;
			const stockDisponible = 2; // menos de lo pedido
			const nombreProducto = faker.commerce.productName();

			mockTransaccionExitosa(id_producto, stockDisponible, nombreProducto);

			// El front lo dejó agregar porque validó contra el stock que tenía
			// al cargar el catálogo; el backend revalida el stock real al confirmar.
			const carrito = new CarritoFake();
			carrito.agregarProducto(
				{ id_producto, nom_producto: nombreProducto, precio_unitario: 10000, stock_actual: cantidadSolicitada },
				cantidadSolicitada,
			);

			const dto = {
				id_usuario: faker.string.uuid(),
				metodo_pago: 'Efectivo',
				subtotal: 10000,
				total: 10000,
				items: [{ id_producto, cantidad: cantidadSolicitada, precio: 10000 }],
			};

			let error: any;
			try {
				await service.create(dto as any);
			} catch (e) {
				error = e;
			}

			expect(error).toBeInstanceOf(BadRequestException);
			expect(error.message).toContain(nombreProducto); // indica qué producto no tiene stock
			expect(mockTx.ticket_compra.create).not.toHaveBeenCalled();
			expect(mockTx.producto.update).not.toHaveBeenCalled();

			// como el backend rechazó el pedido, el carrito de frontend NO se vacía
			expect(carrito.estaVacio()).toBe(false);
		});

		it('CP-003: no debe permitir confirmar un pedido con el carrito vacío', async () => {
			const carrito = new CarritoFake();
			expect(carrito.estaVacio()).toBe(true);
			expect(carrito.mensajeCarritoVacio()).toBe(
				'Tu carrito está vacío. Explora nuestro catálogo para encontrar productos.',
			);

			const dto = {
				id_usuario: faker.string.uuid(),
				metodo_pago: 'Efectivo',
				subtotal: 0,
				total: 0,
				items: carrito.getItems(), // [] - refleja el carrito vacío del frontend
			};

			await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
			expect(prisma.$transaction).not.toHaveBeenCalled();
		});

		// CP-004: "Un usuario sin sesión iniciada no puede registrar un pedido" -> jwt-auth.guard.spec.ts 
	
	});

	// RF-007.2
	describe('RF-007.2 - Consultar/ver estado de pedido', () => {
		it('CP-005: al cambiar el estado del pedido, el cliente debe recibir una notificación en la app (NotificacionesService mockeado)', async () => {
			const id_pedido = faker.number.int({ min: 1, max: 9999 });

			prisma.pedido.findFirst.mockResolvedValue(
				fakePedidoDetalleCompleto({ id_pedido, estado: 'Pendiente' }),
			);
			prisma.pedido.update.mockResolvedValue({ id_pedido, estado: 'En preparación' });

			await service.update(id_pedido, { estado: 'En preparación' } as any);

			expect(notificaciones.notificarCambioEstadoPedido).toHaveBeenCalledTimes(1);
			expect(notificaciones.notificarCambioEstadoPedido).toHaveBeenCalledWith(
				expect.objectContaining({ id_pedido, estado: 'En preparación' }),
			);
		});

		it.todo('CP-006: el cliente recibe un correo notificando el nuevo estado de su pedido');

		it('CP-007: el admin/trabajador consulta el listado de todos los pedidos con su estado', async () => {
			prisma.pedido.findMany.mockResolvedValue([
				fakePedidoDetalleCompleto({ id_pedido: 1, estado: 'Pendiente' }),
				fakePedidoDetalleCompleto({ id_pedido: 2, estado: 'Entregado' }),
			]);

			const resultado = await service.findAll({});

			expect(prisma.pedido.findMany).toHaveBeenCalledWith(
				expect.objectContaining({ orderBy: { fecha: 'desc' } }),
			);
			expect(resultado).toHaveLength(2);
		});

		it('CP-008: el sistema deniega a un cliente el acceso al pedido de otro cliente', async () => {
			const idPedido = 42;
			jest.spyOn(service, 'findOne').mockResolvedValue({
				id_pedido: idPedido,
				id_usuario: 'cliente-B',
				estado: 'Pendiente',
			} as any);

			const usuarioA = { id_usuario: 'cliente-A', id_rol_usuario: '2' };

			await expect(
				controller.findOne(idPedido, usuarioA as any),
			).rejects.toThrow(ForbiddenException);
		});
	});

	// RF-007.3
	describe('RF-007.3 - Cancelar/anular pedido', () => {
		it('CP-009: el admin anula un pedido en estado "Pendiente" y el cliente recibe notificación', async () => {
			const id_pedido = faker.number.int({ min: 1, max: 9999 });
			const id_usuario = faker.string.uuid();

			prisma.pedido.findFirst.mockResolvedValue(
				fakePedidoDetalleCompleto({ id_pedido, id_usuario, estado: 'Pendiente' }),
			);
			prisma.pedido.update.mockResolvedValue({ id_pedido, estado: 'Anulado' });

			const resultado = await service.update(id_pedido, { estado: 'Anulado' } as any);

			expect(prisma.pedido.update).toHaveBeenCalledWith({
				where: { id_pedido },
				data: { estado: 'Anulado' },
			});
			expect(resultado.estado).toBe('Anulado');
			expect(notificaciones.notificarCambioEstadoPedido).toHaveBeenCalledWith(
				expect.objectContaining({ id_pedido, id_usuario, estado: 'Anulado' }),
			);
		});

		describe('CP-010: no debe permitir anular un pedido ya entregado/completado', () => {
			it.each(['Entregado', 'Finalizado', 'Anulado'])(
				'debe rechazar la anulación si el pedido ya está "%s"',
				async (estadoActual) => {
					const id_pedido = faker.number.int({ min: 1, max: 9999 });

					prisma.pedido.findFirst.mockResolvedValue(
						fakePedidoDetalleCompleto({ id_pedido, estado: estadoActual }),
					);

					await expect(
						service.update(id_pedido, { estado: 'Anulado' } as any),
					).rejects.toThrow(BadRequestException);

					expect(prisma.pedido.update).not.toHaveBeenCalled();
					expect(notificaciones.notificarCambioEstadoPedido).not.toHaveBeenCalled();
				},
			);
		});
	});
});