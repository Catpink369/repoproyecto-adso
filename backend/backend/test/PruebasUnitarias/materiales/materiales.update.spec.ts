import { PedidosPersonalizadosService } from '../../src/pedidos-personalizados/pedidos-personalizados.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PedidosPersonalizadosService - Editar material (unit)', () => {
  let service: PedidosPersonalizadosService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      material: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    service = new PedidosPersonalizadosService(prisma as any);
  });

  it('should update material successfully', async () => {
    const id = 10;
    const existing = { id_material: id, nombre: 'Old', tipo: 'Color', unidad: 'u', precio_unitario: 5, stock_actual: 10, stock_minimo: 1 };
    const dto = { nombre: 'Updated', tipo: 'Diseño', unidad: 'u2', precio_unitario: 8, stock_actual: 20, stock_minimo: 2 };
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

  it('should throw NotFoundException when material does not exist', async () => {
    const id = 999;
    (prisma.material.findUnique as any).mockResolvedValueOnce(null);

    await expect(service.actualizarMaterial(id, {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should propagate unique constraint error from prisma.update', async () => {
    const id = 11;
    const existing = { id_material: id };
    const dto = { nombre: 'Duplicado' };
    const err = { code: '23505', message: 'Unique constraint' };

    (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
    (prisma.material.update as any).mockRejectedValueOnce(err);

    await expect(service.actualizarMaterial(id, dto as any)).rejects.toMatchObject(err);
  });

  it('should propagate BadRequestException from prisma.update', async () => {
    const id = 12;
    const existing = { id_material: id };
    const dto = { precio_unitario: -5 };
    const bad = new BadRequestException('Invalid data');

    (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
    (prisma.material.update as any).mockRejectedValueOnce(bad);

    await expect(service.actualizarMaterial(id, dto as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should propagate generic DB errors', async () => {
    const id = 13;
    const existing = { id_material: id };
    const dto = { nombre: 'Any' };
    const err = new Error('DB connection error');

    (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
    (prisma.material.update as any).mockRejectedValueOnce(err);

    await expect(service.actualizarMaterial(id, dto as any)).rejects.toThrow('DB connection error');
  });
});
