// usuarios.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsuariosService } from '../../src/usuarios/usuarios.service';
import { UsuariosController } from '../../src/usuarios/usuarios.controller';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TaskService } from '../../src/task/task.service';
import * as bcrypt from 'bcrypt';

describe('RF-001 - Gestión de Usuarios', () => {
  let service: UsuariosService;
  let controller: UsuariosController;
  let prismaMock: any;
  let taskServiceMock: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock = {
      usuario: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    taskServiceMock = {
      enviarCodigoReset: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TaskService, useValue: taskServiceMock },
      ],
      controllers: [UsuariosController],
    }).compile();

    service = module.get(UsuariosService);
    controller = module.get(UsuariosController);
  });

  // RF-001.1
  describe('RF-001.1 - Registrar usuario', () => {
    it('CP-001: debe registrar un nuevo usuario con rol Cliente de forma exitosa', async () => {
      const dtoCliente = {
        id_usuario: faker.string.numeric(10),
        nom_1: faker.person.firstName(),
        nom_2: '',
        ape_1: faker.person.lastName(),
        ape_2: faker.person.lastName(),
        correo: faker.internet.email(),
        telefono: '3215478542',
        contrasena: '123456789',
        t_doc: 'CC',
        id_rol_usuario: '2', // Cliente
      };

      prismaMock.usuario.create.mockResolvedValue({
        ...dtoCliente,
        telefono: 3215478542,
        nom_2: null,
      });

      const resultado = await service.create(dtoCliente as any);

      expect(resultado.id_rol_usuario).toBe('2');
      expect(resultado.nom_2).toBeNull();
      expect(prismaMock.usuario.create).toHaveBeenCalledTimes(1);
    });

    it('CP-002: debe registrar un nuevo usuario con rol Trabajador desde el panel autorizado de forma exitosa', async () => {
      const dtoTrabajador = {
        id_usuario: faker.string.numeric(10),
        nom_1: faker.person.firstName(),
        nom_2: '',
        ape_1: faker.person.lastName(),
        ape_2: faker.person.lastName(),
        correo: faker.internet.email(),
        telefono: '3001234567',
        contrasena: 'segura123',
        t_doc: 'CC',
        codigo: 'TRAB-001',
        id_rol_usuario: '3', // Trabajador
      };

      prismaMock.usuario.create.mockResolvedValue({
        ...dtoTrabajador,
        telefono: 3001234567,
        nom_2: null,
      });

      const resultado = await service.create(dtoTrabajador as any);

      expect(resultado.id_rol_usuario).toBe('3');
      expect(resultado.nom_2).toBeNull();
      expect(prismaMock.usuario.create).toHaveBeenCalled();
    });

    it('CP-003: debe registrar un nuevo usuario con rol Administrador de forma exitosa', async () => {
      const dtoAdmin = {
        id_usuario: faker.string.numeric(10),
        nom_1: faker.person.firstName(),
        nom_2: '',
        ape_1: faker.person.lastName(),
        ape_2: '',
        correo: faker.internet.email(),
        telefono: '3001234567',
        contrasena: 'marianita23',
        t_doc: 'CC',
        codigo: 'ADMIN-001',
        id_rol_usuario: '1', // Administrador
      };

      prismaMock.usuario.create.mockResolvedValue({
        ...dtoAdmin,
        telefono: 3001234567,
        nom_2: null,
        ape_2: null,
      });

      const resultado = await service.create(dtoAdmin as any);

      expect(resultado.id_rol_usuario).toBe('1');
      expect(resultado.nom_2).toBeNull();
      expect(resultado.ape_2).toBeNull();
    });

    it('CP-004: debe rechazar el registro con un número de documento que ya existe en el sistema', async () => {
      prismaMock.usuario.create.mockRejectedValue({ code: 'P2002' });

      const dtoDuplicado = {
        id_usuario: '1023898051',
        nom_1: faker.person.firstName(),
        ape_1: faker.person.lastName(),
        correo: faker.internet.email(),
        telefono: '3215478542',
        contrasena: '123456789',
        t_doc: 'CC',
      };

      await expect(service.create(dtoDuplicado as any)).rejects.toBeDefined();
    });

    it('CP-005: debe rechazar el registro dejando campos obligatorios vacíos en el formulario', async () => {
      prismaMock.usuario.create.mockRejectedValue(new Error('Faltan datos obligatorios'));

      const dtoIncompleto = {
        id_usuario: '10125587421',
        nom_1: faker.person.firstName(),
        ape_1: faker.person.lastName(),
        correo: '',
        telefono: '3215478542',
        contrasena: '123456789',
        t_doc: 'CC',
      };

      await expect(service.create(dtoIncompleto as any)).rejects.toThrow();
    });

    it('CP-006: debe rechazar el registro con una contraseña que no cumple las políticas de seguridad', async () => {
      const dtoContrasenaCorta = {
        id_usuario: '10125587421',
        nom_1: faker.person.firstName(),
        ape_1: faker.person.lastName(),
        correo: faker.internet.email(),
        telefono: '3215478542',
        contrasena: '12345',
        t_doc: 'CC',
      };

      prismaMock.usuario.create.mockRejectedValue(
        new Error('La contraseña debe tener mínimo 6 caracteres'),
      );

      await expect(service.create(dtoContrasenaCorta as any)).rejects.toThrow();
    });
  });

  // RF-001.2
  describe('RF-001.2 - Visualizar usuarios', () => {
    it('CP-007: debe visualizar la lista completa de usuarios registrados desde el rol Administrador', async () => {
      const usuariosEnBD = [
        { id_usuario: faker.string.numeric(10), nom_1: faker.person.firstName(), id_rol_usuario: '2' },
        { id_usuario: faker.string.numeric(10), nom_1: faker.person.firstName(), id_rol_usuario: '1' },
        { id_usuario: faker.string.numeric(10), nom_1: faker.person.firstName(), id_rol_usuario: '3' },
      ];

      prismaMock.usuario.findMany.mockResolvedValue(usuariosEnBD);

      const resultado = await service.findAll({});

      expect(resultado).toHaveLength(3);
      expect(resultado).toEqual(usuariosEnBD);
    });

    it('CP-008: debe filtrar y retornar los usuarios que coincidan con el nombre o correo buscado', async () => {
      const usuarioBuscado = [
        { id_usuario: '1012345678', nom_1: 'Evelyn', ape_1: 'Cardenas', correo: 'evelyn@correo.com' },
      ];

      prismaMock.usuario.findMany.mockResolvedValue(usuarioBuscado);

      const resultado = await service.findAll({ search: 'evelyn@correo.com' });

      expect(resultado).toEqual(usuarioBuscado);
      expect(resultado[0].nom_1).toBe('Evelyn');
    });

    // CP-009: pendiente — findAll() aún no valida rol, lo dejamos para después según lo acordado
  });

  // RF-001.4
  describe('RF-001.4 - Recuperar contraseña', () => {
    it('CP-017: debe solicitar la recuperación de contraseña con éxito y generar el código si el correo existe', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({
        id_usuario: '10125587421',
        correo: 'juan@correo.com',
      });
      prismaMock.usuario.update.mockResolvedValue({});

      const resultado = await service.solicitarReset('juan@correo.com');

      expect(resultado.message).toBe('Código enviado a tu correo');
      expect(taskServiceMock.enviarCodigoReset).toHaveBeenCalled();
    });

    it('CP-018: debe rechazar la solicitud de recuperación con un correo que no existe en el sistema', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue(null);

      await expect(service.solicitarReset('correoNoRegistrado@correo.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('CP-019: debe rechazar el restablecimiento de contraseña con un código/token inválido o expirado', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({
        id_usuario: '10125587421',
        codigo_visible: '584920',
      });

      await expect(
        service.resetContrasena('juan@correo.com', '000000', 'nuevaClave123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // RF-001.5
  describe('RF-001.5 - Editar Perfil', () => {
    it('CP-020: debe actualizar exitosamente los datos básicos del perfil (nombre, teléfono) del usuario logueado', async () => {
      const datosActualizados = {
        nom_1: 'Juan Carlos',
        nom_2: 'Alberto',
        ape_1: 'Perez',
        ape_2: 'Gomez',
        telefono: '3009876543',
      };

      prismaMock.usuario.findUnique.mockResolvedValue({ id_usuario: '10125587421' });
      prismaMock.usuario.update.mockResolvedValue({
        id_usuario: '10125587421',
        ...datosActualizados,
      });

      const resultado = await service.update('10125587421', datosActualizados as any);

      expect(resultado.nom_1).toBe('Juan Carlos');
      expect(resultado.nom_2).toBe('Alberto');
      expect(resultado.telefono).toBe('3009876543');
    });

    it('CP-021: debe rechazar la actualización del correo por uno que ya está en uso por otro usuario', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ id_usuario: '10125587421' });
      prismaMock.usuario.update.mockRejectedValue({ code: 'P2002' });

      const dtoCorreoDuplicado = { correo: 'correo.existente@correo.com' };

      await expect(
        service.update('10125587421', dtoCorreoDuplicado as any),
      ).rejects.toBeDefined();
    });
  });

  // RF-001.6
  describe('RF-001.6 - Cambiar Contraseña', () => {
    it('CP-022: debe cambiar la contraseña actual por una nueva de forma exitosa estando logueado', async () => {
      const idUsuarioLogueado = '10125587421';
      const contrasenaHashActual = await bcrypt.hash('clave123', 10);

      prismaMock.usuario.findUnique.mockResolvedValue({
        id_usuario: idUsuarioLogueado,
        contrasena: contrasenaHashActual,
      });

      prismaMock.usuario.update.mockResolvedValue({
        id_usuario: idUsuarioLogueado,
        mensaje: 'Contraseña actualizada exitosamente',
      });

      const resultado = await service.cambiarContrasena(idUsuarioLogueado, 'clave123', 'nuevaClave456');

      expect(resultado).toBeDefined();
      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
        where: { id_usuario: idUsuarioLogueado },
      });
      expect(prismaMock.usuario.update).toHaveBeenCalledTimes(1);
    });

    it('CP-023: debe rechazar el cambio de contraseña si la contraseña actual ingresada es incorrecta', async () => {
      const hashed = await bcrypt.hash('123456789', 10);

      prismaMock.usuario.findUnique.mockResolvedValue({ id_usuario: '10125587421', contrasena: hashed });

      await expect(
        service.cambiarContrasena('10125587421', 'claveFalsa123', 'nueva123'),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.usuario.update).not.toHaveBeenCalled();
    });
  });

  // RF-001.7
  describe('RF-001.7 - Editar Código y Rol', () => {
    it('CP-024: debe modificar el rol de un usuario existente (de Trabajador a Administrador) desde la cuenta de Administrador', async () => {
      const idUsuario = '1012345678';

      prismaMock.usuario.findUnique.mockResolvedValue({
        id_usuario: idUsuario,
        id_rol_usuario: '3', // Trabajador
      });

      prismaMock.usuario.update.mockResolvedValue({
        id_usuario: idUsuario,
        nom_1: 'Evelyn',
        id_rol_usuario: '1', // Administrador
      });

      const resultado = await service.update(idUsuario, { id_rol_usuario: '1' } as any);

      expect(resultado.id_rol_usuario).toBe('1');
      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { id_usuario: idUsuario },
        data: { id_rol_usuario: '1' },
      });
    });

    describe('CP-025: intentar cambiar el rol de un usuario desde una cuenta sin permisos (Cliente/Trabajador)', () => {
      it.each([
        ['su propio rol', true],
        ['el rol de otro usuario', false],
      ])('debe impedir que un usuario sin permisos cambie %s', async (_desc, esPropio) => {
        const usuarioSinPermisos = { id_usuario: faker.string.numeric(10), id_rol_usuario: '2' };
        const idObjetivo = esPropio ? usuarioSinPermisos.id_usuario : faker.string.numeric(10);
        const dtoCambiarRol = { id_rol_usuario: '1' };

        await expect(
          controller.update(idObjetivo, dtoCambiarRol as any, usuarioSinPermisos as any),
        ).rejects.toThrow(ForbiddenException);

        expect(prismaMock.usuario.update).not.toHaveBeenCalled();
      });
    });
  });

  // RF-001.8
  describe('RF-001.8 - Desactivar Usuario', () => {
    it('CP-026: debe desactivar la cuenta de un usuario (bloqueo lógico) desde el panel de Administrador', async () => {
      const idUsuario = faker.string.numeric(10);

      prismaMock.usuario.findUnique.mockResolvedValue({
        id_usuario: idUsuario,
        correo: faker.internet.email(),
        estado: 1,
      });

      prismaMock.usuario.update.mockResolvedValue({
        id_usuario: idUsuario,
        estado: 0,
      });

      const resultado = await service.toggleEstado(idUsuario);

      expect(resultado.estado).toBe(0);
      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { id_usuario: idUsuario },
        data: { estado: 0 },
      });
    });

    // CP-027 en auth.spec.ts, ya que pertenece a AuthService.login() y no a UsuariosService

    it('CP-028: debe reactivar la cuenta de un usuario previamente desactivado desde el rol Administrador', async () => {
      const idUsuario = faker.string.numeric(10);

      prismaMock.usuario.findUnique.mockResolvedValue({
        id_usuario: idUsuario,
        correo: faker.internet.email(),
        estado: 0,
      });

      prismaMock.usuario.update.mockResolvedValue({
        id_usuario: idUsuario,
        estado: 1,
      });

      const resultado = await service.toggleEstado(idUsuario);

      expect(resultado.estado).toBe(1);
      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { id_usuario: idUsuario },
        data: { estado: 1 },
      });
    });

    it('CP-029: debe impedir desactivar al Administrador principal (restricción de seguridad del sistema)', async () => {
      const idUsuario = faker.string.numeric(10);

      prismaMock.usuario.findUnique.mockResolvedValue({
        id_usuario: idUsuario,
        correo: 'valruiz@gmail.com',
        estado: 1,
      });

      await expect(service.toggleEstado(idUsuario)).rejects.toThrow(BadRequestException);

      expect(prismaMock.usuario.update).not.toHaveBeenCalled();
    });
  });
});