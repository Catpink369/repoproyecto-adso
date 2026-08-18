//RF-008.1 - RF-008.2 - RF-008.3 - RF-008.4
// Archivo reúne todo lo que antes estaba repartido entre
// pedidos.spec.ts (CP-003/004 de 8.1, todo 8.2/8.3/8.4) y
// pedidos-personalizados.spec.ts (CP-002 de 8.1).
//
// ORGANIZACIÓN: un describe por RF (008.1 / 008.2 / 008.3 / 008.4), y dentro
// de cada uno un describe adicional por servicio, porque cada uno necesita su
// propio TestingModule/mock (PedidosService, PedidosPersonalizadosService,
// NotificacionesService).
// Cobertura actual: CP-001 a CP-013 (13 CPs) + CP-012 como it.todo (frontend).
//
// RF-008.4 fue reescrito por completo: el checklist original asumía un
// historial de pedidos con filtro estándar/personalizado que NO existe en
// el producto real. El flujo real (Header_c.jsx / TicketPedidoModal.jsx /
// notificaciones.service.ts) es: el cliente ve SOLO sus pedidos como
// notificaciones propias y abre el ticket completo en un modal
// descargable/imprimible.
//
// PENDIENTE (no incluido todavía a propósito): existe un TaskService con
// envío real de correo (task.service.ts, enviarCambioEstadoPedido) que no
// vimos conectado desde pedidos.service.ts. Se deja para una entrega futura.
//
// TODO(revisar lógica): hoy no existe un TicketsService/PagosService propio,
// así que estas pruebas siguen invocando PedidosService y
// PedidosPersonalizadosService directamente (varios setups distintos en este
// mismo archivo). Cuando se extraiga la lógica de tickets a su propio
// servicio, esto debería simplificarse.
//
// TODO(revisar lógica): CP-007 (antes en notificaciones.spec.ts, probaba
// contenido real del push "Actualización de tu pedido") se reescribió como
// verificación de mock, igual que CP-005/006 en pedidos.spec.ts. Falta
// validar el payload esperado.
//
// TODO(revisar lógica): CP-008 solo cubre el método 'Nequi'. El CP en el
// checklist pide validar Efectivo, Tarjeta, Transferencia, Nequi y
// DaviPlata — falta parametrizar (it.each) para cubrir los 5.
//
// TODO(revisar lógica): CP-002 no verifica todavía que el ticket generado
// tenga id_estado/id_met_pago "Pendiente" por defecto como sí lo hace
// CP-003 para el pedido estándar — revisar si aplica igual a personalizados.
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { BadRequestException } from '@nestjs/common';
import { PedidosService } from '../../../src/pedidos/pedidos.service';
import { PedidosPersonalizadosService } from '../../../src/pedidos-personalizados/pedidos-personalizados.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { FcmPushService } from '../../../src/notificaciones/fcm-push.service';
import { NotificacionesService } from '../../../src/notificaciones/notificaciones.service';
import { fakePedidoDetalleCompleto } from '../../utils/mock-factories';

describe('RF-008 - Gestion de Pagos y Tickets', () => {

	// RF-008.1 
	describe('RF-008.1 - Generar ticket de pedido (automático)', () => {
		describe('Pedido estándar (PedidosService)', () => {
			let service: PedidosService;
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
				}).compile();

				service = module.get(PedidosService);
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

			it('CP-001: debe generar el ticket automáticamente con número único y el detalle del producto estándar', async () => {
				const id_producto = faker.number.int({ min: 1, max: 1000 });
				const nombreProducto = faker.commerce.productName();

				mockTx.pedido.create.mockResolvedValue({ id_pedido: faker.number.int({ min: 1, max: 9999 }) });
				mockTx.producto.findFirst.mockResolvedValue({
					id_producto,
					nom_producto: nombreProducto,
					stock_actual: 10,
				});
				mockTx.producto.update.mockResolvedValue({});
				mockTx.detalles_pedido.create.mockResolvedValue({});
				mockTx.movimiento.create.mockResolvedValue({});
				mockTx.ticket_compra.create.mockResolvedValue({
					id_ticket_c: faker.number.int({ min: 1, max: 9999 }),
				});

				const dto = {
					id_usuario: faker.string.uuid(),
					metodo_pago: 'Efectivo',
					subtotal: 10000,
					total: 10000,
					items: [{ id_producto, cantidad: 2, precio: 10000 }],
				};

				const resultado = await service.create(dto as any);

				expect(resultado.data.num_ticket).toBeGreaterThanOrEqual(100000);
				expect(resultado.data.num_ticket).toBeLessThanOrEqual(999999);
				expect(resultado.data.detalles[0]).toEqual(
					expect.objectContaining({ producto: nombreProducto, cantidad: 2 }),
				);
			});

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


		// CP-002
		describe('Pedido personalizado (PedidosPersonalizadosService)', () => {
			let servicePP: PedidosPersonalizadosService;
			let prismaPP: any;

			const mockTxPP = {
				pedido: { create: jest.fn() },
				pedido_personalizado: { create: jest.fn() },
				ticket_compra: { create: jest.fn() },
				material: { findUnique: jest.fn(), update: jest.fn() },
				$executeRaw: jest.fn(),
			};

			beforeEach(async () => {
				jest.clearAllMocks();

				prismaPP = {
					usuario: { findUnique: jest.fn() },
					material: { findUnique: jest.fn() },
					material_color: { findMany: jest.fn() },
					material_diseno: { findMany: jest.fn() },
					pedido_personalizado: { findMany: jest.fn() },
					$transaction: jest.fn((callback) => callback(mockTxPP)),
				};

				const module: TestingModule = await Test.createTestingModule({
					providers: [
						PedidosPersonalizadosService,
						{ provide: PrismaService, useValue: prismaPP },
					],
				}).compile();

				servicePP = module.get(PedidosPersonalizadosService);
			});

			function mockUsuarioValido(id_usuario: string) {
				prismaPP.usuario.findUnique.mockResolvedValue({
					id_usuario,
					nom_1: faker.person.firstName(),
					ape_1: faker.person.lastName(),
					correo: faker.internet.email(),
					telefono: BigInt(faker.string.numeric(10)),
				});
			}

			function mockMaterialesDisponibles(materiales: any[]) {
				prismaPP.material.findUnique.mockImplementation(({ where }: any) => {
					const mat = materiales.find((m) => m.id_material === where.id_material);
					return Promise.resolve(mat ? { ...mat, estado: mat.estado ?? true } : null);
				});
			}

			function mockTransaccionExitosaPP() {
				mockTxPP.pedido.create.mockResolvedValue({ id_pedido: faker.number.int({ min: 1, max: 9999 }) });
				mockTxPP.pedido_personalizado.create.mockResolvedValue({ id_ped_personal: faker.number.int({ min: 1, max: 9999 }) });
				mockTxPP.ticket_compra.create.mockResolvedValue({});
				mockTxPP.material.findUnique.mockResolvedValue({ stock_actual: 20, nombre: 'Tela algodón estampada' });
				mockTxPP.material.update.mockResolvedValue({});
				mockTxPP.$executeRaw.mockResolvedValue(undefined);
			}

			it('CP-002: el resultado para generar el ticket debe incluir las opciones de personalización elegidas', async () => {
				mockUsuarioValido('123');
				mockMaterialesDisponibles([
					{ id_material: 1, nombre: 'Tela algodón estampada', precio_unitario: 14000, stock_actual: 20, unidad: 'metro' },
				]);
				mockTransaccionExitosaPP();

				const dto = {
					id_usuario: '123',
					tipo_producto: 'Cubrelecho',
					tamanio: 'King',
					materiales: [{ id_material: 1, cantidad: 3 }],
				};

				const resultado = await servicePP.crearPedido(dto as any);

				expect(resultado.tipo_producto).toBe('Cubrelecho');
				expect(resultado.tamanio).toBe('King');
				expect(resultado.materiales[0]).toEqual(
					expect.objectContaining({ nombre: 'Tela algodón estampada', cantidad: 3, unidad: 'metro' }),
				);
				expect(resultado.num_ticket).toBeDefined();
			});
		});
	});

	// RF-008.2 
	describe('RF-008.2 - Actualizar estado de pedido', () => {
		let service: PedidosService;
		let prisma: any;
		let fcmPush: any;
		let notificaciones: any;

		beforeEach(async () => {
			jest.clearAllMocks();

			prisma = {
				$transaction: jest.fn(),
				pedido: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
				ticket_compra: { updateMany: jest.fn() },
			};

			fcmPush = {
				notificarAdmins: jest.fn(),
				notificarUsuario: jest.fn(),
			};

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
			}).compile();

			service = module.get(PedidosService);
		});

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

		it('CP-007: al confirmar el pago, el sistema debe notificar al cliente (vía NotificacionesService)', async () => {
			const id_pedido = faker.number.int({ min: 1, max: 9999 });

			// El flujo válido es Pendiente -> En preparación -> Pagado

			prisma.pedido.findFirst.mockResolvedValue(
				fakePedidoDetalleCompleto({ id_pedido, estado: 'En preparación' }),
			);
			prisma.pedido.update.mockResolvedValue({ id_pedido, estado: 'Pagado' });

			await service.update(id_pedido, { estado: 'Pagado' } as any);

			expect(notificaciones.notificarCambioEstadoPedido).toHaveBeenCalledWith(
				expect.objectContaining({ id_pedido, estado: 'Pagado' }),
			);
		});
	});

	// RF-008.3 
	describe('RF-008.3 - Actualizar método de pago', () => {
		let service: PedidosService;
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
			}).compile();

			service = module.get(PedidosService);
		});


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
			mockTx.pedido.create.mockResolvedValue({ id_pedido: faker.number.int({ min: 1, max: 9999 }) });
			mockTx.producto.findFirst.mockResolvedValue({
				id_producto,
				nom_producto: faker.commerce.productName(),
				stock_actual: 10,
			});
			mockTx.producto.update.mockResolvedValue({});
			mockTx.detalles_pedido.create.mockResolvedValue({});
			mockTx.movimiento.create.mockResolvedValue({});
			mockTx.ticket_compra.create.mockResolvedValue({
				id_ticket_c: faker.number.int({ min: 1, max: 9999 }),
			});

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

		describe('Notificaciones propias del cliente (NotificacionesService)', () => {
			let service: NotificacionesService;
			let prisma: any;
			let fcmPush: any;

			beforeEach(async () => {
				jest.clearAllMocks();

				prisma = {
					notificacion: { findMany: jest.fn(), count: jest.fn(), updateMany: jest.fn() },
				};

				fcmPush = {
					notificarUsuario: jest.fn(),
				};

				const module: TestingModule = await Test.createTestingModule({
					providers: [
						NotificacionesService,
						{ provide: PrismaService, useValue: prisma },
						{ provide: FcmPushService, useValue: fcmPush },
					],
				}).compile();

				service = module.get(NotificacionesService);
			});

			it('CP-010: el cliente solo debe ver notificaciones/pedidos de su propia cuenta', async () => {
				const id_usuario = faker.string.uuid();
				prisma.notificacion.findMany.mockResolvedValue([
					{ id_notificacion: 1, id_usuario, tipo: 'pedido_estado', mensaje: 'Tu pedido #1 ...' },
				]);

				const resultado = await service.notificacionesPorUsuario(id_usuario);

				// La consulta va filtrada exclusivamente por el id_usuario del cliente
				// que inició sesión; nunca se traen notificaciones de otro usuario.
				expect(prisma.notificacion.findMany).toHaveBeenCalledWith({
					where: { id_usuario },
					orderBy: { fecha: 'desc' },
				});
				expect(resultado.every((n: any) => n.id_usuario === id_usuario)).toBe(true);
			});

			it('CP-013: al abrir una notificación no leída, debe marcarse como leída y el contador debe reflejar la baja', async () => {
				const id_usuario = faker.string.uuid();
				const id_notificacion = faker.number.int({ min: 1, max: 999 });

				prisma.notificacion.updateMany.mockResolvedValue({ count: 1 });
				await service.marcarLeida(id_notificacion, id_usuario);

				expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
					where: { id_notificacion, id_usuario },
					data: { leida: true },
				});

				prisma.notificacion.count.mockResolvedValue(0);
				const noLeidas = await service.contarNoLeidas(id_usuario);

				expect(prisma.notificacion.count).toHaveBeenCalledWith({
					where: { id_usuario, leida: false },
				});
				expect(noLeidas).toBe(0);
			});
		});

		// CP-011 
		describe('Detalle del ticket de un pedido (PedidosService)', () => {
			let service: PedidosService;
			let prisma: any;
			let fcmPush: any;
			let notificaciones: any;

			beforeEach(async () => {
				jest.clearAllMocks();

				prisma = {
					$transaction: jest.fn(),
					pedido: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
					ticket_compra: { updateMany: jest.fn() },
				};

				fcmPush = {
					notificarAdmins: jest.fn(),
					notificarUsuario: jest.fn(),
				};

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
				}).compile();

				service = module.get(PedidosService);
			});

			it('CP-011: al hacer clic en la notificación debe abrirse el ticket completo del pedido correspondiente', async () => {
				prisma.pedido.findFirst.mockResolvedValue(fakePedidoDetalleCompleto({ id_pedido: 15 }));

				const resultado = await service.findOne(15);

				expect(resultado.ticket_compra).toBeDefined();
				expect(resultado.usuario).toBeDefined();
			});
		});

		it.todo(
			'CP-012: el cliente puede descargar/imprimir el ticket de su pedido como PDF',
		);
	});
});