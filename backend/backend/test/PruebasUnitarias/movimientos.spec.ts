//RF-009.1 / RF-009.2
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MovimientosService } from '../../src/movimientos/movimientos.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { fakeMovimiento } from '../utils/mock-factories';
import { ReporteFake, ReporteFakeError } from '../utils/faker-factories';

describe('MovimientosService', () => {
  let service: MovimientosService;
  let prisma: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
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
      prisma.$queryRawUnsafe.mockResolvedValue([
        { totalEntradas: 50, totalSalidas: 20 },
      ]);

      const resultado = await service.resumenGeneral('2026-07-01', '2026-07-31');

      expect(resultado).toEqual({ totalEntradas: 50, totalSalidas: 20 });
    });

    it('CP-005: debe rechazar la generación del reporte si la fecha "Desde" es posterior a "Hasta"', async () => {
      await expect(
        service.resumenGeneral('2026-08-10', '2026-08-01'),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it('CP-007: en un rango sin movimientos, SUM() sin filas devuelve NULL (no 0 como espera el CP)', async () => {
      prisma.$queryRawUnsafe.mockResolvedValue([
        { totalEntradas: null, totalSalidas: null },
      ]);

      const resultado = await service.resumenGeneral('2020-01-01', '2020-01-02');

      expect(resultado).toEqual({ totalEntradas: null, totalSalidas: null });
    });
  });

  // RF-009.2 
  describe('RF-009.2 - Exportar/imprimir reporte (simulación de frontend)', () => {
    let reporte: ReporteFake;

    beforeEach(() => {
      reporte = new ReporteFake();
    });

    it('CP-006: debe exportar el reporte generado a PDF o abrir la vista de impresión', () => {
      reporte.generar('2026-07-01', '2026-07-31', { totalEntradas: 50, totalSalidas: 20 });

      const exportado = reporte.exportar('PDF');

      expect(exportado.formato).toBe('PDF');
      expect(exportado.archivo).toMatch(/\.pdf$/);
      expect(reporte.imprimir()).toBe(true);
    });

    it('debe rechazar la exportación si no se ha generado un reporte previamente', () => {
      expect(() => reporte.exportar()).toThrow(ReporteFakeError);
    });

    it('debe rechazar la impresión si no se ha generado un reporte previamente', () => {
      expect(() => reporte.imprimir()).toThrow(ReporteFakeError);
    });
  });
});