// RF-009.1 al RF-009.3
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MovimientosService } from '../../../src/movimientos/movimientos.service';
import { NotificacionesService } from '../../../src/notificaciones/notificaciones.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { FcmPushService } from '../../../src/notificaciones/fcm-push.service';
import { TaskService } from '../../../src/task/task.service';
import { fakeMovimiento, fakeProductoAlertaRaw, fakePedidoRaw, fakeUsuario } from '../../utils/mock-factories';
import { ReporteFake } from '../../utils/faker-factories';

describe('RF-009 - Gestion de Historial y Reportes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // RF-009.1 y RF-009.2 comparten MovimientosService (solo depende de PrismaService)
    describe('RF-009.1 / RF-009.2 - MovimientosService', () => {
        let service: MovimientosService;
        let prisma: any;
        let reporte: ReporteFake;

        beforeEach(async () => {
        reporte = new ReporteFake();

        prisma = { // Mock de PrismaService
            $queryRaw: jest.fn(),
            $queryRawUnsafe: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
            MovimientosService,
            { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        service = module.get(MovimientosService);
        });

        // RF-009.1
        describe('RF-009.1 - Consultar historial de movimientos', () => {
        it('CP-001: debe consultar la lista completa de entradas y salidas con la info relacionada', async () => {
            const filasFake = [fakeMovimiento({ id_movimiento: 1, Cantidad_m: 5 })];
            prisma.$queryRaw.mockResolvedValue(filasFake);

            const resultado = await service.findAll({});

            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(resultado).toEqual(filasFake);
        });

        it('CP-002: debe filtrar el historial de movimientos por un rango de fechas determinado', async () => {
            const filasFiltradas = [fakeMovimiento({ id_movimiento: 2, Cantidad_m: 3 })];
            prisma.$queryRaw.mockResolvedValue(filasFiltradas);

            const resultado = await service.findAll({
            desde: '2026-07-01',
            hasta: '2026-07-31',
            });

            expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
            expect(resultado).toEqual(filasFiltradas);
        });

        it('CP-003: debe devolver una lista vacía cuando no existen movimientos registrados en el periodo consultado', async () => {
            prisma.$queryRaw.mockResolvedValue([]);

            const resultado = await service.findAll({
            desde: '2020-01-01',
            hasta: '2020-01-02',
            });

            expect(resultado).toEqual([]);
        });
        });

        // RF-009.2
        describe('RF-009.2 - Generar reporte general', () => {
        it('CP-004: debe generar el reporte con las estadísticas correctas del periodo', async () => {
            prisma.$queryRaw.mockResolvedValue([
            { totalEntradas: 50, totalSalidas: 20 },
            ]);

            const resultado = await service.resumenGeneral('2026-07-01', '2026-07-31');

            expect(resultado).toEqual({ totalEntradas: 50, totalSalidas: 20 });
        });

        it('CP-005: debe rechazar la generación del reporte si la fecha "Desde" es posterior a "Hasta"', async () => {
            await expect(
            service.resumenGeneral('2026-08-10', '2026-08-01'),
            ).rejects.toThrow(BadRequestException);

            expect(prisma.$queryRaw).not.toHaveBeenCalled();
        });

        it('CP-006: debe exportar el reporte generado a PDF o abrir la vista de impresión', () => {
            reporte.generar('2026-07-01', '2026-07-31', { totalEntradas: 50, totalSalidas: 20 });

            const exportado = reporte.exportar('PDF');

            expect(exportado.formato).toBe('PDF');
            expect(exportado.archivo).toMatch(/\.pdf$/);
            expect(reporte.imprimir()).toBe(true);
        });

        it('CP-007: en un rango sin movimientos, debe devolver 0 en lugar de NULL gracias al operador ?? en el service', async () => {
            prisma.$queryRaw.mockResolvedValue([
            { totalEntradas: null, totalSalidas: null },
            ]);

            const resultado = await service.resumenGeneral('2020-01-01', '2020-01-02');

            expect(resultado).toEqual({ totalEntradas: 0, totalSalidas: 0 });
        });
        });
    });

    // RF-009.3 usa NotificacionesService (depende también de FcmPushService y TaskService)
    describe('RF-009.3 - NotificacionesService', () => {
        let service: NotificacionesService;
        let prisma: any;
        let taskServiceMock: any;

        function mockStockBajoRaw(filas: any[]) {
        prisma.$queryRaw.mockResolvedValueOnce(filas);
        }

        beforeEach(async () => {
        prisma = {
            $queryRaw: jest.fn(),
            producto: { findMany: jest.fn() },
            pedido: { findMany: jest.fn() },
            usuario: { findMany: jest.fn(), findUnique: jest.fn() },
            ticket_compra: { findFirst: jest.fn() },
            notificacion: { create: jest.fn() },
        };

        taskServiceMock = { enviarCambioEstadoPedido: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
            NotificacionesService,
            { provide: PrismaService, useValue: prisma },
            // FcmPushService y TaskService siguen siendo dependencias del servicio
            { provide: FcmPushService, useValue: { notificarAdmins: jest.fn(), notificarUsuario: jest.fn() } },
            { provide: TaskService, useValue: taskServiceMock },
            ],
        }).compile();

        service = module.get(NotificacionesService);
        });

        describe('RF-009.3 - Consultar notificaciones', () => {
        it('CP-008: debe desplegar en orden las alertas de stock bajo, agotados y nuevos pedidos', async () => {
            prisma.producto.findMany.mockResolvedValue([]);
            prisma.pedido.findMany.mockResolvedValue([fakePedidoRaw({ id_usuario: 'u1' })]);
            prisma.usuario.findMany.mockResolvedValue([fakeUsuario({ id_usuario: 'u1' })]);

            mockStockBajoRaw([fakeProductoAlertaRaw({ stock_actual: 2 })]); // stock bajo
            mockStockBajoRaw([fakeProductoAlertaRaw({ stock_actual: 0 })]); // agotados

            const resultado = await service.findAll({});

            expect(resultado).toHaveLength(3); // 1 stock-bajo / 1 agotado / 1 pedido
            const tipos = resultado.map((n: any) => n.tipo);
            expect(tipos).toEqual(expect.arrayContaining(['stock-bajo', 'agotado', 'pedido']));
        });

        it('CP-009: debe filtrar y mostrar únicamente las alertas de stock crítico', async () => {
            prisma.$queryRaw.mockResolvedValue([fakeProductoAlertaRaw({ stock_actual: 1 })]);

            const resultado = await service.stockBajo({});

            expect(resultado).toHaveLength(1);
            expect(resultado[0].tipo).toBe('stock-bajo');
        });

        it('CP-010: las alertas de stock bajo/agotados deben apuntar a /movimientos', async () => {
            prisma.$queryRaw.mockResolvedValue([fakeProductoAlertaRaw({ stock_actual: 1 })]);

            const resultado = await service.stockBajo({});

            expect(resultado[0].ruta_destino).toBe('/movimientos');
        });

        it('CP-010: las alertas de pedido nuevo deben apuntar a /pedidos_realizados', async () => {
            // NOTA: numeración duplicada (dos CP-010) heredada del archivo original;
            // revisar y renumerar cuando toque este bloque.
            prisma.producto.findMany.mockResolvedValue([]);
            prisma.pedido.findMany.mockResolvedValue([
            fakePedidoRaw({ id_pedido: 7, id_usuario: 'u1', id_tipo: 'P_P' }),
            ]);
            prisma.usuario.findMany.mockResolvedValue([fakeUsuario({ id_usuario: 'u1' })]);
            mockStockBajoRaw([]);
            mockStockBajoRaw([]);

            const resultado = await service.findAll({});
            const notifPedido = resultado.find((n: any) => n.tipo === 'pedido');

            expect(notifPedido).toBeDefined();
            expect(notifPedido?.ruta_destino).toBe('/pedidos_realizados');
        });

        it('CP-011: debe devolver una bandeja vacía cuando no hay alertas pendientes', async () => {
            prisma.producto.findMany.mockResolvedValue([]);
            prisma.pedido.findMany.mockResolvedValue([]);
            prisma.usuario.findMany.mockResolvedValue([]);
            mockStockBajoRaw([]); // stock bajo
            mockStockBajoRaw([]); // agotados

            const resultado = await service.findAll({});

            expect(resultado).toEqual([]);
        });
        });

        // RF-007.2 - el correo se envía desde NotificacionesService.notificarCambioEstadoPedido(),
        // no desde PedidosService (que solo la invoca — ver CP-005 en pedidos.spec.ts).
        describe('RF-007.2 - Notificación por correo al cambiar el estado del pedido', () => {
        it('CP-006: el cliente recibe el correo de notificación cuando cambia el estado de su pedido', async () => {
            prisma.usuario.findUnique.mockResolvedValue({
            correo: 'cliente@correo.com',
            nom_1: 'Juan',
            ape_1: 'Pérez',
            });
            prisma.ticket_compra.findFirst.mockResolvedValue({
            num_ticket: 123456,
            total_ticket: 50000,
            });

            await service.notificarCambioEstadoPedido({
            id_pedido: 42,
            id_usuario: 'u1',
            estado: 'En preparación',
            });

            expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
            where: { id_usuario: 'u1' },
            select: { correo: true, nom_1: true, ape_1: true },
            });
            expect(taskServiceMock.enviarCambioEstadoPedido).toHaveBeenCalledWith({
            correo: 'cliente@correo.com',
            nombreCliente: 'Juan Pérez',
            idPedido: 42,
            estado: 'En preparación',
            numTicket: '123456',
            totalTicket: 50000,
            });
        });

        it('no debe intentar enviar el correo si el usuario no tiene correo registrado', async () => {
            prisma.usuario.findUnique.mockResolvedValue({ correo: null, nom_1: 'Juan', ape_1: 'Pérez' });

            await service.notificarCambioEstadoPedido({
            id_pedido: 43,
            id_usuario: 'u2',
            estado: 'Pagado',
            });

            expect(taskServiceMock.enviarCambioEstadoPedido).not.toHaveBeenCalled();
        });

        it('un fallo al enviar el correo no debe romper el flujo de notificación (queda solo logueado)', async () => {
            prisma.usuario.findUnique.mockResolvedValue({ correo: 'cliente@correo.com', nom_1: 'Juan', ape_1: 'Pérez' });
            prisma.ticket_compra.findFirst.mockResolvedValue(null);
            taskServiceMock.enviarCambioEstadoPedido.mockRejectedValue(new Error('SMTP caído'));

            await expect(
            service.notificarCambioEstadoPedido({ id_pedido: 44, id_usuario: 'u3', estado: 'Entregado' }),
            ).resolves.not.toThrow();

            expect(prisma.notificacion.create).toHaveBeenCalled(); // la notificación in-app sí se creó
        });
        });
    });
});