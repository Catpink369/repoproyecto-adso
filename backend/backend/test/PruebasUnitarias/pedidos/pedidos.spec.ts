//RF-007.1 - RF-007.2 - RF-007.3 / RF-008.1 - RF-008.2 - RF-008.3 - RF-008.4
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PedidosService } from '../../../src/pedidos/pedidos.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { FcmPushService } from '../../../src/notificaciones/fcm-push.service';
import { NotificacionesService } from '../../../src/notificaciones/notificaciones.service';
import { fakePedidoDetalleCompleto } from '../../utils/mock-factories';
import { PedidosController } from '../../../src/pedidos/pedidos.controller';

describe('RF-007 - Gestion de Pedidos / RF-008 - Gestion de Pagos y Tickets', () => {
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

		// cambia el pedido y envía notificación
		notificaciones = {
		notificarCambioEstadoPedido: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
		providers: [
			PedidosService,
			{ provide: PrismaService, useValue: prisma },
			{ provide: FcmPushService, useValue: fcmPush },
			{ provide: NotificacionesService, useValue: notificaciones },
		],
		controllers: [
			PedidosController
		],
		}).compile();

		service = module.get(PedidosService);
		controller = module.get(PedidosController);
	});

	function mockTransaccionExitosa(id_producto: number, stockDisponible: number) {
		mockTx.pedido.create.mockResolvedValue({ id_pedido: faker.number.int({ min: 1, max: 9999 }) });
		mockTx.producto.findFirst.mockResolvedValue({
		id_producto,
		nom_producto: faker.commerce.productName(),
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
		it('CP-001: debe generar un ticket al confirmar un pedido estándar con stock suficiente', async () => {
			const id_producto = faker.number.int({ min: 1, max: 1000 });
			const cantidad = faker.number.int({ min: 1, max: 3 });
			const precio = faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 });

			mockTransaccionExitosa(id_producto, cantidad + 10); // stock suficiente

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
		});

		it('CP-002: debe rechazar el pedido si un producto no tiene stock suficiente y no debe generar ticket', async () => {
			const id_producto = faker.number.int({ min: 1, max: 1000 });
			const cantidadSolicitada = 5;
			const stockDisponible = 2; // menos de lo pedido

			mockTransaccionExitosa(id_producto, stockDisponible);

			const dto = {
				id_usuario: faker.string.uuid(),
				metodo_pago: 'Efectivo',
				subtotal: 10000,
				total: 10000,
				items: [{ id_producto, cantidad: cantidadSolicitada, precio: 10000 }],
			};

			await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
			expect(mockTx.ticket_compra.create).not.toHaveBeenCalled();
			expect(mockTx.producto.update).not.toHaveBeenCalled();
		});

		it('CP-003: no debe permitir confirmar un pedido con el carrito vacío', async () => {
			const dto = {
				id_usuario: faker.string.uuid(),
				metodo_pago: 'Efectivo',
				subtotal: 0,
				total: 0,
				items: [], // carrito vacío
			};

			await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
			expect(prisma.$transaction).not.toHaveBeenCalled();
		});
		// CP-004 en jwt-auth.guard.spec.ts
	});

	// RF-007.2 
	describe('RF-007.2 - Consultar/ver estado de pedido', () => {
		// CP-005 en notificaciones.spec.ts
		// CP-006 en notificaciones.spec.ts
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

	// RF-008.1 
	describe('RF-008.1 - Generar ticket de pedido (automático)', () => {
		// CP-001  falta
		// CP-002  en pedidos-personalizados.spec.ts
		it('CP-003: el ticket debe crearse con id_estado y método de pago "Pendiente" por defecto', async () => {
		const id_producto = faker.number.int({ min: 1, max: 1000 });
		mockTransaccionExitosa(id_producto, 10);

		const dto = {
			id_usuario: faker.string.uuid(),
			metodo_pago: 'Efectivo',
			subtotal: 10000,
			total: 10000,
			items: [{ id_producto, cantidad: 1, precio: 10000 }],
		};

		await service.create(dto as any);

		expect(mockTx.ticket_compra.create).toHaveBeenCalledWith(
			expect.objectContaining({
			data: expect.objectContaining({ id_estado: 'E_pt', id_met_pago: 'Mtd_PD' }),
			}),
		);
		});

		it('CP-004: cada ticket generado debe tener un num_ticket distinto entre pedidos consecutivos', async () => {
			const numerosGenerados = new Set<number>();

			for (let i = 0; i < 5; i++) {
				const idProducto = faker.number.int({ min: 1, max: 1000 });
				mockTransaccionExitosa(idProducto, 50);

				const dto = {
				id_usuario: faker.string.uuid(),
				metodo_pago: 'Efectivo',
				subtotal: 10000,
				total: 10000,
				items: [{ id_producto: idProducto, cantidad: 1, precio: 10000 }],
				};

				await service.create(dto as any);

				const llamada = mockTx.ticket_compra.create.mock.calls[i][0];
				numerosGenerados.add(llamada.data.num_ticket);
				expect(llamada.data.num_ticket).toBeGreaterThanOrEqual(100000);
				expect(llamada.data.num_ticket).toBeLessThanOrEqual(999999);
			}
			expect(numerosGenerados.size).toBe(5);
		});
	});

	// RF-008.2
	describe('RF-008.2 - Actualizar estado de pedido', () => {
		it('CP-005: el administrador/trabajador cambia manualmente el estado del pedido', async () => {
		const id_pedido = faker.number.int({ min: 1, max: 9999 });

		prisma.pedido.findFirst.mockResolvedValue(
			fakePedidoDetalleCompleto({ id_pedido, estado: 'Pendiente' }),
		);
		prisma.pedido.update.mockResolvedValue({ id_pedido, estado: 'En preparación' });

		const resultado = await service.update(id_pedido, { estado: 'En preparación' } as any);

		expect(prisma.pedido.update).toHaveBeenCalledWith({
			where: { id_pedido },
			data: { estado: 'En preparación' },
		});
		expect(resultado.estado).toBe('En preparación');
		});

	describe('CP-006: pedidos en estado inmutable no son editables', () => {
		it.each(['Entregado', 'Finalizado', 'Anulado'])(
			'debe rechazar el cambio de estado si el pedido ya está "%s"',
			async (estadoActual) => {
			const id_pedido = faker.number.int({ min: 1, max: 9999 });

			prisma.pedido.findFirst.mockResolvedValue(
				fakePedidoDetalleCompleto({ id_pedido, estado: estadoActual }),
			);

			await expect(
				service.update(id_pedido, { estado: 'Pagado' } as any),
			).rejects.toThrow(BadRequestException);

			expect(prisma.pedido.update).not.toHaveBeenCalled();
			expect(notificaciones.notificarCambioEstadoPedido).not.toHaveBeenCalled();
			},
		);
		});
		// CP-007 en notificaciones.spec.ts
	});

	// RF-008.3 - Actualizar método de pago 
	describe('RF-008.3 - Actualizar método de pago', () => {
		it('CP-008: debe registrar el método de pago en el ticket y actualizar el estado de pago a "Pagado"', async () => {
			const id_pedido = faker.number.int({ min: 1, max: 9999 });

			prisma.pedido.findFirst.mockResolvedValue(
				fakePedidoDetalleCompleto({ id_pedido, estado: 'Pendiente' }),
			);
			prisma.pedido.update.mockResolvedValue({ id_pedido });
			prisma.ticket_compra.updateMany.mockResolvedValue({ count: 1 });

			await service.update(id_pedido, { metodo_pago: 'Nequi' } as any);

			expect(prisma.ticket_compra.updateMany).toHaveBeenCalledWith({
				where: { id_pedido },
				data: expect.objectContaining({
				id_met_pago: 'Mtd_NQ',
				id_estado: 'E_pd', // estado "Pagado" 
				}),
			});
		});

		it('CP-009: el pago debe nacer como "Por definir" (Mtd_PD) hasta que el admin lo edite', async () => {
		const id_producto = faker.number.int({ min: 1, max: 1000 });
		mockTransaccionExitosa(id_producto, 10);

		const dto = {
			id_usuario: faker.string.uuid(),
			metodo_pago: 'Efectivo',
			subtotal: 10000,
			total: 10000,
			items: [{ id_producto, cantidad: 1, precio: 10000 }],
		};

		await service.create(dto as any);

		expect(mockTx.ticket_compra.create).toHaveBeenCalledWith(
			expect.objectContaining({
			data: expect.objectContaining({ id_met_pago: 'Mtd_PD' }),
			}),
		);
		});
	});

	// RF-008.4 
	describe('RF-008.4 - Consultar tickets y pedidos realizados', () => {
		it('CP-010: el usuario puede visualizar el historial completo de sus pedidos', async () => {
		const id_usuario = faker.string.uuid();
		prisma.pedido.findMany.mockResolvedValue([
			fakePedidoDetalleCompleto({ id_pedido: 1, id_usuario }),
			fakePedidoDetalleCompleto({ id_pedido: 2, id_usuario }),
		]);

		const resultado = await service.findByUsuario(id_usuario);

		expect(prisma.pedido.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id_usuario }, orderBy: { fecha: 'desc' } }),
		);
		expect(resultado).toHaveLength(2);
		});

		it('CP-011: el filtro "estándar" debe ocultar los pedidos personalizados', async () => {
			const id_usuario = faker.string.uuid();
			await service.findByUsuario(id_usuario, 'estandar');

			expect(prisma.pedido.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
				where: { id_usuario, id_tipo: 'P_E' },
				}),
			);
		});

		it('CP-012: el filtro "personalizado" debe ocultar los pedidos estándar', async () => {
			const id_usuario = faker.string.uuid();
			await service.findByUsuario(id_usuario, 'personalizado');

			expect(prisma.pedido.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
				where: { id_usuario, id_tipo: 'P_P' },
				}),
			);
		});

		it('CP-013: debe abrir el detalle completo de un pedido específico del listado', async () => {
		prisma.pedido.findFirst.mockResolvedValue(fakePedidoDetalleCompleto({ id_pedido: 15 }));

		const resultado = await service.findOne(15);

		expect(resultado.ticket_compra).toBeDefined();
		expect(resultado.usuario).toBeDefined();
		});
	});
});