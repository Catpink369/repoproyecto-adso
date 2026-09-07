// RF-004.1 - RF-004.2 - RF-004.3 - RF-004.4
// Gestión de materiales (crear / consultar / editar / desactivar)
import { PedidosPersonalizadosService } from '../../../src/pedidos-personalizados/pedidos-personalizados.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

describe('RF-004 - Gestión de Materiales', () => {
	let service: PedidosPersonalizadosService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      material: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      material_color: {
        findMany: jest.fn(),
      },
      material_diseno: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    service = new PedidosPersonalizadosService(prisma as any);
  });

  // ─────────────────────────────────────────────────────────
  // RF-004.1 - Registrar material
  // ─────────────────────────────────────────────────────────
  describe('RF-004.1 - Registrar material', () => {
    it('CP-001: debe crear un material correctamente', async () => {
      const dto = {
        nombre: 'Nuevo Color',
        tipo: 'Color',
        unidad: 'Unidad',
        precio_unitario: 10.5,
        stock_actual: 100,
        stock_minimo: 5,
      };

      const created = { id_material: 123, ...dto, estado: true };
      prisma.material.create.mockResolvedValueOnce(created as any);

      const result = await service.crearMaterial(dto as any);

      expect(prisma.material.create).toHaveBeenCalledWith({
        data: {
          nombre: dto.nombre,
          tipo: dto.tipo,
          unidad: dto.unidad,
          precio_unitario: dto.precio_unitario,
          stock_actual: dto.stock_actual,
          stock_minimo: dto.stock_minimo,
          estado: true,
        },
      });

      expect(result).toEqual(created);
    });

    it('CP-002: debe propagar error de restricción única (nombre duplicado)', async () => {
      const dto = {
        nombre: 'Duplicado',
        tipo: 'Color',
        unidad: 'Unidad',
        precio_unitario: 1,
        stock_actual: 10,
        stock_minimo: 1,
      };

      const err = { code: '23505', message: 'Unique constraint' };
      prisma.material.create.mockRejectedValueOnce(err as any);

      await expect(service.crearMaterial(dto as any)).rejects.toMatchObject(err);
    });

    it('CP-003: debe propagar BadRequestException por datos inválidos', async () => {
      const dto = {
        nombre: '',
        tipo: 'Color',
        unidad: 'Unidad',
        precio_unitario: -5,
        stock_actual: -1,
        stock_minimo: -1,
      };

      const badReq = new BadRequestException('Invalid data');
      prisma.material.create.mockRejectedValueOnce(badReq);

      await expect(service.crearMaterial(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('CP-004: debe propagar errores genéricos de base de datos al crear', async () => {
      const dto = {
        nombre: 'Otra',
        tipo: 'Diseño',
        unidad: 'Unidad',
        precio_unitario: 2,
        stock_actual: 5,
        stock_minimo: 0,
      };

      const err = new Error('DB connection error');
      prisma.material.create.mockRejectedValueOnce(err);

      await expect(service.crearMaterial(dto as any)).rejects.toThrow('DB connection error');
    });
  });

  // ─────────────────────────────────────────────────────────
  // RF-004.2 - Consultar materiales
  // ─────────────────────────────────────────────────────────
  describe('RF-004.2 - Consultar materiales', () => {
    it('CP-005: debe retornar la lista de materiales activos', async () => {
      const items = [
        { id_material: 1, nombre: 'A', tipo: 'Color', unidad: 'u', precio_unitario: 1, stock_actual: 10, ruta_imagen: '/img/a.png' },
        { id_material: 2, nombre: 'B', tipo: 'Diseño', unidad: 'u', precio_unitario: 2, stock_actual: 5, ruta_imagen: '/img/b.png' },
      ];
      prisma.material.findMany.mockResolvedValueOnce(items as any);

      const res = await service.getMateriales({});

      expect(prisma.material.findMany).toHaveBeenCalledWith({
        where: { estado: true },
        select: {
          id_material: true,
          nombre: true,
          tipo: true,
          unidad: true,
          precio_unitario: true,
          stock_actual: true,
          ruta_imagen: true,
        },
      });
      expect(res).toEqual(items);
    });

    it('CP-006: debe retornar lista vacía cuando no hay materiales', async () => {
      prisma.material.findMany.mockResolvedValueOnce([] as any);
      const res = await service.getMateriales({});
      expect(res).toEqual([]);
    });

    it('CP-007: debe filtrar materiales por tipo', async () => {
      const items = [
        { id_material: 3, nombre: 'C', tipo: 'Color', unidad: 'u', precio_unitario: 3, stock_actual: 7, ruta_imagen: null },
      ];
      prisma.material.findMany.mockResolvedValueOnce(items as any);

      const res = await service.getMaterialesPorTipo('Color');

      expect(prisma.material.findMany).toHaveBeenCalledWith({
        where: { estado: true, tipo: 'Color' },
        select: {
          id_material: true,
          nombre: true,
          tipo: true,
          unidad: true,
          precio_unitario: true,
          stock_actual: true,
          ruta_imagen: true,
        },
      });

      expect(res).toEqual(items);
    });

    it('CP-008: debe retornar colores de un material', async () => {
      const colors = [{ id_color: 1, nombre: 'Rojo', codigo_hex: '#FF0000' }];
      prisma.material_color.findMany.mockResolvedValueOnce(colors as any);

      const res = await service.getColoresMaterial(1);

      expect(prisma.material_color.findMany).toHaveBeenCalledWith({
        where: { id_material: 1, estado: true },
        select: { id_color: true, nombre: true, codigo_hex: true },
      });
      expect(res).toEqual(colors);
    });

    it('CP-009: debe retornar diseños de un material', async () => {
      const disenos = [{ id_diseno: 1, nombre: 'Flores', ruta_imagen: '/img/flores.png' }];
      prisma.material_diseno.findMany.mockResolvedValueOnce(disenos as any);

      const res = await service.getDisenosMaterial(2);

      expect(prisma.material_diseno.findMany).toHaveBeenCalledWith({
        where: { id_material: 2, estado: true },
        select: { id_diseno: true, nombre: true, ruta_imagen: true },
      });
      expect(res).toEqual(disenos);
    });

    it('CP-010: debe propagar errores de DB al consultar materiales', async () => {
      const err = new Error('DB error');
      prisma.material.findMany.mockRejectedValueOnce(err);

      await expect(service.getMateriales({})).rejects.toThrow('DB error');
    });
  });

  // ─────────────────────────────────────────────────────────
  // RF-004.3 - Editar material
  // ─────────────────────────────────────────────────────────
  describe('RF-004.3 - Editar material', () => {
    it('CP-011: debe actualizar un material correctamente', async () => {
      const id = 10;
      const existing = {
        id_material: id,
        nombre: 'Old',
        tipo: 'Color',
        unidad: 'u',
        precio_unitario: 5,
        stock_actual: 10,
        stock_minimo: 1,
      };
      const dto = {
        nombre: 'Updated',
        tipo: 'Diseño',
        unidad: 'u2',
        precio_unitario: 8,
        stock_actual: 20,
        stock_minimo: 2,
      };
      const updated = { id_material: id, ...dto };

      (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
      (prisma.material.update as any).mockResolvedValueOnce(updated);

      const res = await service.actualizarMaterial(id, dto as any);

      expect(prisma.material.findUnique).toHaveBeenCalledWith({ where: { id_material: id } });
      expect(prisma.material.update).toHaveBeenCalledWith({
        where: { id_material: id },
        data: {
          ...dto,
          tipo: dto.tipo,
          unidad: dto.unidad,
        },
      });

      expect(res).toEqual(updated);
    });

    it('CP-012: debe lanzar NotFoundException si el material no existe', async () => {
      const id = 999;
      (prisma.material.findUnique as any).mockResolvedValueOnce(null);

      await expect(service.actualizarMaterial(id, {} as any)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('CP-013: debe propagar error de restricción única al actualizar', async () => {
      const id = 11;
      const existing = { id_material: id };
      const dto = { nombre: 'Duplicado' };
      const err = { code: '23505', message: 'Unique constraint' };

      (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
      (prisma.material.update as any).mockRejectedValueOnce(err);

      await expect(service.actualizarMaterial(id, dto as any)).rejects.toMatchObject(err);
    });

    it('CP-014: debe propagar BadRequestException al actualizar con datos inválidos', async () => {
      const id = 12;
      const existing = { id_material: id };
      const dto = { precio_unitario: -5 };
      const bad = new BadRequestException('Invalid data');

      (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
      (prisma.material.update as any).mockRejectedValueOnce(bad);

      await expect(service.actualizarMaterial(id, dto as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('CP-015: debe propagar errores genéricos de DB al actualizar', async () => {
      const id = 13;
      const existing = { id_material: id };
      const dto = { nombre: 'Any' };
      const err = new Error('DB connection error');

      (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
      (prisma.material.update as any).mockRejectedValueOnce(err);

      await expect(service.actualizarMaterial(id, dto as any)).rejects.toThrow('DB connection error');
    });
  });

  // ─────────────────────────────────────────────────────────
  // RF-004.4 - Desactivar material
  // ─────────────────────────────────────────────────────────
  describe('RF-004.4 - Desactivar material', () => {
    it('CP-024: debe desactivar un material activo correctamente', async () => {
      const id = 20;
      const existing = { id_material: id, nombre: 'Material Test', estado: true };
      const desactivado = { id_material: id, nombre: 'Material Test', estado: false };
      (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
      (prisma.material.update as any).mockResolvedValueOnce(desactivado);

      const res = await service.desactivarMaterial(id);

      expect(prisma.material.findUnique).toHaveBeenCalledWith({ where: { id_material: id } });
      expect(prisma.material.update).toHaveBeenCalledWith({
        where: { id_material: id },
        data: { estado: false },
      });
      expect(res).toEqual(desactivado);
    });

    it('CP-025: debe lanzar NotFoundException si el material no existe', async () => {
      const id = 9999;
      (prisma.material.findUnique as any).mockResolvedValueOnce(null);

      await expect(service.desactivarMaterial(id)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('CP-026: debe lanzar ConflictException si el material ya está inactivo', async () => {
      const id = 21;
      const existing = { id_material: id, estado: false };
      (prisma.material.findUnique as any).mockResolvedValueOnce(existing);

      await expect(service.desactivarMaterial(id)).rejects.toBeInstanceOf(ConflictException);
    });

    it('CP-029: debe propagar errores de DB al desactivar', async () => {
      const id = 22;
      const existing = { id_material: id, nombre: 'Material Test', estado: true };
      (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
      const err = new Error('DB connection error');
      (prisma.material.update as any).mockRejectedValueOnce(err);

      await expect(service.desactivarMaterial(id)).rejects.toThrow('DB connection error');
    });

    it('CP-030: materiales desactivados no aparecen en la consulta de activos', async () => {
      const activos = [
        { id_material: 1, nombre: 'Activo A', tipo: 'Color', unidad: 'u', precio_unitario: 1, stock_actual: 10, ruta_imagen: null },
      ];
      prisma.material.findMany.mockResolvedValueOnce(activos as any);

      const res = await service.getMateriales({});

      expect(prisma.material.findMany).toHaveBeenCalledWith({
        where: { estado: true },
        select: {
          id_material: true,
          nombre: true,
          tipo: true,
          unidad: true,
          precio_unitario: true,
          stock_actual: true,
          ruta_imagen: true,
        },
      });
      expect(res).toEqual(activos);
      expect(res.every((m: any) => m.nombre !== 'Material Desactivado')).toBe(true);
    });
  });
});