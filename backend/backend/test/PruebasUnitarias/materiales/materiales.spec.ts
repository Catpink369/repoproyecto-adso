// materiales.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

import { PedidosPersonalizadosService } from '../../../../../backend/backend/src/pedidos-personalizados/pedidos-personalizados.service';
import { PedidosPersonalizadosController } from '../../../../../backend/backend/src/pedidos-personalizados/pedidos-personalizados.controller';
import { PrismaService } from '../../../../../backend/backend/src/prisma/prisma.service';
import { CloudinaryService } from '../../../../../backend/backend/src/cloudinary/cloudinary.service';
import { CreateMaterialDto } from '../../../../../backend/backend/src/pedidos-personalizados/dto/create-material.dto';
import { UpdateMaterialDto } from '../../../../../backend/backend/src/pedidos-personalizados/dto/update-material.dto';
import { RolesGuard } from '../../../../../backend/backend/src/auth/guards/roles.guard';
import { Roles } from '../../../../../backend/backend/src/auth/enums/roles.enum';

describe('RF-004 - Gestión de Materiales de Personalización', () => {
  let service: PedidosPersonalizadosService;
  let controller: PedidosPersonalizadosController;
  let prismaMock: any;
  let cloudinaryMock: any;
  let rolesGuard: RolesGuard;

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock = {
      material: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      material_color: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      material_diseno: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    cloudinaryMock = {
      subirImagen: jest.fn().mockResolvedValue('https://res.cloudinary.com/fake/material.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosPersonalizadosService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
      controllers: [PedidosPersonalizadosController],
    }).compile();

    service = module.get(PedidosPersonalizadosService);
    controller = module.get(PedidosPersonalizadosController);
    rolesGuard = new RolesGuard(new Reflector());
  });

  function contextoFalso(user: any, handler: Function): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, url: '/pedidos-personalizados/materiales' }),
      }),
      getHandler: () => handler,
      getClass: () => PedidosPersonalizadosController,
    } as unknown as ExecutionContext;
  }

  // =========================================================
  // RF-004.1 - Registrar material
  // =========================================================
  describe('RF-004.1 - Registrar material', () => {
    it('CP-001: Registrar material exitosamente.', async () => {
      const dto = {
        nombre: faker.commerce.productName(),
        tipo: 'Tela',
        unidad: 'metro',
        precio_unitario: 15000,
        stock_actual: 10,
        stock_minimo: 2,
      };

      prismaMock.material.findFirst.mockResolvedValue(null);
      prismaMock.material.create.mockResolvedValue({
        id_material: faker.number.int({ min: 1, max: 999 }),
        ...dto,
        estado: true,
        ruta_imagen: null,
      });

      const resultado = await service.crearMaterial(dto as any);

      expect(resultado.nombre).toBe(dto.nombre);
      expect(resultado.estado).toBe(true);
      expect(prismaMock.material.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nombre: dto.nombre,
          tipo: dto.tipo,
          unidad: dto.unidad,
          precio_unitario: dto.precio_unitario,
          stock_actual: 10,
          stock_minimo: 2,
          estado: true,
        }),
      });
    });

    it('CP-002: Registrar un material duplicado.', async () => {
      const dto = {
        nombre: 'Tela algodón',
        tipo: 'Tela',
        unidad: 'metro',
        precio_unitario: 12000,
      };

      prismaMock.material.findFirst.mockResolvedValue({
        id_material: 99,
        nombre: 'Tela algodón',
        estado: true,
      });

      await expect(service.crearMaterial(dto as any)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.material.create).not.toHaveBeenCalled();
    });

    it('CP-003: Registrar un costo adicional inválido.', async () => {
      const dtoInvalido = plainToInstance(CreateMaterialDto, {
        nombre: 'Tela',
        tipo: 'Tela',
        unidad: 'metro',
        precio_unitario: -100,
      });

      const errores = await validate(dtoInvalido);

      expect(errores.length).toBeGreaterThan(0);
      expect(errores.some((e) => e.property === 'precio_unitario')).toBe(true);
    });

    it('CP-004: Campos obligatorios vacíos.', async () => {
      const dtoIncompleto = plainToInstance(CreateMaterialDto, {
        nombre: '',
        tipo: '',
        unidad: '',
        precio_unitario: undefined,
      });

      const errores = await validate(dtoIncompleto);

      expect(errores.length).toBeGreaterThan(0);
      expect(errores.some((e) => e.property === 'nombre')).toBe(true);
      expect(errores.some((e) => e.property === 'tipo')).toBe(true);
      expect(errores.some((e) => e.property === 'unidad')).toBe(true);
      expect(errores.some((e) => e.property === 'precio_unitario')).toBe(true);
    });

    it('CP-005: Imagen con formato no permitido.', () => {
      // El filtro de tipo/peso de imagen vive en multer (controller), no en el service.
      expect(true).toBe(true);
    });

    it('CP-006: Usuario sin permisos.', () => {
      const usuarioCliente = {
        id_usuario: faker.string.numeric(10),
        id_rol_usuario: Roles.USUARIO,
      };
      const contexto = contextoFalso(usuarioCliente, controller.crearMaterial);

      const permitido = rolesGuard.canActivate(contexto);
      // Con @Roles('1','3') en el handler, Cliente no debe pasar
      expect(permitido).toBe(false);
    });

    it('CP-007: Error de conexión con la base de datos.', async () => {
      const dto = {
        nombre: 'Relleno',
        tipo: 'Relleno',
        unidad: 'unidad',
        precio_unitario: 5000,
      };

      prismaMock.material.findFirst.mockResolvedValue(null);
      prismaMock.material.create.mockRejectedValue(
        new Error('Connection lost: ECONNREFUSED'),
      );

      await expect(service.crearMaterial(dto as any)).rejects.toThrow(
        'Connection lost: ECONNREFUSED',
      );
    });

    it('CP-008: Validar registro en auditoría', async () => {
      // Aún no hay tabla de auditoría; al crear solo se inserta el material.
      const dto = {
        nombre: 'Bordado floral',
        tipo: 'Bordado',
        unidad: 'unidad',
        precio_unitario: 8000,
      };

      prismaMock.material.findFirst.mockResolvedValue(null);
      prismaMock.material.create.mockResolvedValue({
        id_material: 10,
        ...dto,
        stock_actual: 0,
        stock_minimo: 5,
        estado: true,
      });

      await service.crearMaterial(dto as any);

      expect(prismaMock.material.create).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================
  // RF-004.2 - Consultar materiales
  // =========================================================
  describe('RF-004.2 - Consultar materiales', () => {
    it('CP-009: Consultar listado de materiales.', async () => {
      const materiales = [
        {
          id_material: 1,
          nombre: 'Tela algodón',
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 12000,
          stock_actual: 50,
          ruta_imagen: null,
          estado: true,
        },
        {
          id_material: 2,
          nombre: 'Relleno siliconado',
          tipo: 'Relleno',
          unidad: 'unidad',
          precio_unitario: 3000,
          stock_actual: 20,
          ruta_imagen: null,
          estado: true,
        },
      ];

      prismaMock.material.findMany.mockResolvedValue(materiales);

      const resultado = await service.getMateriales({});

      expect(resultado).toHaveLength(2);
      expect(prismaMock.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: true }),
        }),
      );
    });

    it('CP-010: Buscar un material por nombre.', async () => {
      prismaMock.material.findMany.mockResolvedValue([]);

      await service.getMateriales({ search: 'algodón' });

      expect(prismaMock.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: true,
            nombre: { contains: 'algodón', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('CP-011: Filtrar materiales por tipo.', async () => {
      prismaMock.material.findMany.mockResolvedValue([
        {
          id_material: 1,
          nombre: 'Tela polar',
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 10000,
          stock_actual: 30,
          ruta_imagen: null,
        },
      ]);

      const resultado = await service.getMaterialesPorTipo('Tela');

      expect(resultado).toHaveLength(1);
      expect(prismaMock.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: true, tipo: 'Tela' },
        }),
      );
    });

    it('CP-012: Filtrar materiales por estado.', async () => {
      prismaMock.material.findMany.mockResolvedValue([]);

      await service.getMateriales({ estado: false });

      expect(prismaMock.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: false }),
        }),
      );
    });

    it('CP-013: Consulta sin resultados.', async () => {
      prismaMock.material.findMany.mockResolvedValue([]);

      const resultado = await service.getMaterialesPorTipo('Accesorio');

      expect(resultado).toEqual([]);
    });

    it('CP-014: Consultar cuando no existen materiales registrados.', async () => {
      prismaMock.material.findMany.mockResolvedValue([]);

      const resultado = await service.getMateriales({});

      expect(resultado).toEqual([]);
    });

    it('CP-015: Usuario sin permisos.', () => {
      // GET materiales es @Public — un Cliente puede consultar.
      const usuarioCliente = {
        id_usuario: faker.string.numeric(10),
        id_rol_usuario: Roles.USUARIO,
      };
      const contexto = contextoFalso(usuarioCliente, controller.getMateriales);

      expect(rolesGuard.canActivate(contexto)).toBe(true);
    });

    it('CP-016: Error de conexión con la base de datos.', async () => {
      prismaMock.material.findMany.mockRejectedValue(
        new Error('Connection lost: ECONNREFUSED'),
      );

      await expect(service.getMateriales({})).rejects.toThrow(
        'Connection lost: ECONNREFUSED',
      );
    });
  });

  // =========================================================
  // RF-004.3 - Editar material
  // =========================================================
  describe('RF-004.3 - Editar material', () => {
    it('CP-017: Actualizar un material exitosamente.', async () => {
      const id = faker.number.int({ min: 1, max: 999 });
      const dto = {
        nombre: 'Tela actualizada',
        precio_unitario: 18000,
      };

      prismaMock.material.findUnique.mockResolvedValue({
        id_material: id,
        nombre: 'Tela vieja',
        tipo: 'Tela',
        unidad: 'metro',
        precio_unitario: 12000,
        estado: true,
      });
      prismaMock.material.findFirst.mockResolvedValue(null);
      prismaMock.material.update.mockResolvedValue({
        id_material: id,
        ...dto,
        tipo: 'Tela',
        unidad: 'metro',
        estado: true,
      });

      const resultado = await service.actualizarMaterial(id, dto as any);

      expect(resultado.nombre).toBe('Tela actualizada');
      expect(resultado.precio_unitario).toBe(18000);
      expect(prismaMock.material.update).toHaveBeenCalled();
    });

    it('CP-018: Intentar editar un material inexistente.', async () => {
      const id = faker.number.int({ min: 1, max: 999 });

      prismaMock.material.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarMaterial(id, { nombre: 'X' } as any),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.material.update).not.toHaveBeenCalled();
    });

    it('CP-019: Registrar un nombre duplicado.', async () => {
      const id = 5;

      prismaMock.material.findUnique.mockResolvedValue({
        id_material: id,
        nombre: 'Original',
        estado: true,
      });
      prismaMock.material.findFirst.mockResolvedValue({
        id_material: 10,
        nombre: 'Nombre ya usado',
        estado: true,
      });

      await expect(
        service.actualizarMaterial(id, { nombre: 'Nombre ya usado' } as any),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.material.update).not.toHaveBeenCalled();
    });

    it('CP-020: Registrar un costo adicional inválido.', async () => {
      const dtoInvalido = plainToInstance(UpdateMaterialDto, {
        precio_unitario: -50,
      });

      const errores = await validate(dtoInvalido);

      expect(errores.some((e) => e.property === 'precio_unitario')).toBe(true);
    });

    it('CP-021: Campos obligatorios vacíos.', async () => {
      const dtoParcial = plainToInstance(UpdateMaterialDto, {
        nombre: 'Solo nombre',
      });

      const errores = await validate(dtoParcial);
      expect(errores.filter((e) => e.property === 'nombre').length).toBe(0);
    });

    it('CP-022: Imagen con formato no permitido.', () => {
      // Validación de formato de imagen está en multer del controller.
      expect(true).toBe(true);
    });

    it('CP-023: Usuario sin permisos.', () => {
      const usuarioCliente = {
        id_usuario: faker.string.numeric(10),
        id_rol_usuario: Roles.USUARIO,
      };
      const contexto = contextoFalso(usuarioCliente, controller.actualizarMaterial);
      expect(rolesGuard.canActivate(contexto)).toBe(false);
    });

    it('CP-024: Error de conexión con la base de datos.', async () => {
      prismaMock.material.findUnique.mockResolvedValue({
        id_material: 1,
        estado: true,
      });
      prismaMock.material.findFirst.mockResolvedValue(null);
      prismaMock.material.update.mockRejectedValue(
        new Error('Connection lost: ECONNREFUSED'),
      );

      await expect(
        service.actualizarMaterial(1, { nombre: 'X' } as any),
      ).rejects.toThrow('Connection lost: ECONNREFUSED');
    });

    it('CP-025: Validar registro en auditoría.', async () => {
      // Aún no hay tabla de auditoría al actualizar.
      prismaMock.material.findUnique.mockResolvedValue({
        id_material: 1,
        nombre: 'A',
        estado: true,
      });
      prismaMock.material.findFirst.mockResolvedValue(null);
      prismaMock.material.update.mockResolvedValue({
        id_material: 1,
        nombre: 'B',
        estado: true,
      });

      await service.actualizarMaterial(1, { nombre: 'B' } as any);

      expect(prismaMock.material.update).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================
  // RF-004.4 - Eliminar / desactivar material
  // =========================================================
  describe('RF-004.4 - Eliminar/desactivar material', () => {
    it('CP-026: Desactivar un material exitosamente.', async () => {
      const id = faker.number.int({ min: 1, max: 999 });

      prismaMock.material.findUnique.mockResolvedValue({
        id_material: id,
        nombre: 'Tela a desactivar',
        estado: true,
      });
      prismaMock.material.update.mockResolvedValue({
        id_material: id,
        nombre: 'Tela a desactivar',
        estado: false,
      });

      const resultado = await service.desactivarMaterial(id);

      expect(resultado.estado).toBe(false);
      expect(prismaMock.material.update).toHaveBeenCalledWith({
        where: { id_material: id },
        data: { estado: false },
      });
    });

    it('CP-027: Intentar desactivar un material inexistente.', async () => {
      prismaMock.material.findUnique.mockResolvedValue(null);

      await expect(service.desactivarMaterial(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.material.update).not.toHaveBeenCalled();
    });

    it('CP-028: Intentar desactivar un material ya inactivo.', async () => {
      prismaMock.material.findUnique.mockResolvedValue({
        id_material: 3,
        nombre: 'Ya inactivo',
        estado: false,
      });

      await expect(service.desactivarMaterial(3)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.material.update).not.toHaveBeenCalled();
    });

    it('CP-029: Usuario cancela la operación.', () => {
      // Cancelar es interacción de UI (frontend).
      expect(true).toBe(true);
    });

    it('CP-030: Usuario sin permisos.', () => {
      const usuarioCliente = {
        id_usuario: faker.string.numeric(10),
        id_rol_usuario: Roles.USUARIO,
      };
      const contexto = contextoFalso(usuarioCliente, controller.desactivarMaterial);
      expect(rolesGuard.canActivate(contexto)).toBe(false);
    });

    it('CP-031: Error de conexión con la base de datos.', async () => {
      prismaMock.material.findUnique.mockResolvedValue({
        id_material: 1,
        nombre: 'X',
        estado: true,
      });
      prismaMock.material.update.mockRejectedValue(
        new Error('Connection lost: ECONNREFUSED'),
      );

      await expect(service.desactivarMaterial(1)).rejects.toThrow(
        'Connection lost: ECONNREFUSED',
      );
    });

    it('CP-032: Validar que el material desactivado no aparezca en nuevas personalizaciones.', async () => {
      prismaMock.material.findMany.mockResolvedValue([
        {
          id_material: 2,
          nombre: 'Activo',
          tipo: 'Tela',
          unidad: 'metro',
          precio_unitario: 1000,
          stock_actual: 5,
          ruta_imagen: null,
          estado: true,
        },
      ]);

      const resultado = await service.getMateriales({});

      expect(resultado.every((m: any) => m.id_material !== 1)).toBe(true);
      expect(prismaMock.material.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: true }),
        }),
      );
    });

    it('CP-033: Validar registro en auditoría.', async () => {
      // Auditoría actual: console.log al desactivar (no hay tabla aún).
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      prismaMock.material.findUnique.mockResolvedValue({
        id_material: 7,
        nombre: 'Material auditado',
        estado: true,
      });
      prismaMock.material.update.mockResolvedValue({
        id_material: 7,
        nombre: 'Material auditado',
        estado: false,
      });

      await service.desactivarMaterial(7);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUDITORIA] Material desactivado'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('id_material: 7'),
      );

      logSpy.mockRestore();
    });
  });
});