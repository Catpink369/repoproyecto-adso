import { PedidosPersonalizadosService } from '../../src/pedidos-personalizados/pedidos-personalizados.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PedidosPersonalizadosService - Desactivar material (unit)', () => {
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

  it('should deactivate material successfully', async () => {
    const id = 20;
    const existing = { id_material: id, estado: true };
    (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
    (prisma.material.update as any).mockResolvedValueOnce({ id_material: id, estado: false });

    const res = await service.desactivarMaterial(id);

    expect(prisma.material.findUnique).toHaveBeenCalledWith({ where: { id_material: id } });
    expect(prisma.material.update).toHaveBeenCalledWith({ where: { id_material: id }, data: { estado: false } });
    expect(res).toEqual({ success: true, message: 'Material desactivado exitosamente' });
  });

  it('should throw NotFoundException if material does not exist', async () => {
    const id = 9999;
    (prisma.material.findUnique as any).mockResolvedValueOnce(null);

    await expect(service.desactivarMaterial(id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw BadRequestException if material already inactive', async () => {
    const id = 21;
    const existing = { id_material: id, estado: false };
    (prisma.material.findUnique as any).mockResolvedValueOnce(existing);

    await expect(service.desactivarMaterial(id)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should propagate DB errors during update', async () => {
    const id = 22;
    const existing = { id_material: id, estado: true };
    (prisma.material.findUnique as any).mockResolvedValueOnce(existing);
    const err = new Error('DB connection error');
    (prisma.material.update as any).mockRejectedValueOnce(err);

    await expect(service.desactivarMaterial(id)).rejects.toThrow('DB connection error');
  });
});
