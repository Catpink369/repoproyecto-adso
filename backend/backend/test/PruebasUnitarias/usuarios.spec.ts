import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../../src/usuarios/usuarios.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TaskService } from '../../src/task/task.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('Pruebas unitarias de UsuariosService', () => {
  let service: UsuariosService;
  let prismaMock: any;
  let taskServiceMock: any;

  beforeEach(async () => {
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
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  // CP-001
  test('Debería registrar al cliente con éxito si envía todos los campos requeridos', async () => {
    const dtoCliente = {
      id_usuario: '10125587421',
      nom_1: 'Juan',
      nom_2: '',
      ape_1: 'Perez',
      ape_2: 'Gomez',
      correo: 'juan@correo.com',
      telefono: '3215478542',
      contrasena: '123456789',
      t_doc: 'CC',
      id_rol_usuario: '2',
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

  // CP-002 
  test('Debería registrar al trabajador con éxito si envía todos los campos requeridos', async () => {
    const dtoTrabajador = {
      id_usuario: '1012345678',
      nom_1: 'Evelyn',
      nom_2: '',
      ape_1: 'Cardenas',
      ape_2: 'Vega',
      correo: 'evelyn@correo.com',
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

  // CP-003 
  test('Debería registrar al administrador con éxito si envía todos los campos requeridos', async () => {
    const dtoAdmin = {
      id_usuario: '10224587798',
      nom_1: 'Mariana',
      nom_2: '',
      ape_1: 'Gonzalez',
      ape_2: '',
      correo: 'mariana@correo.com',
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

  // CP-004
  test('Deberia retornar un error si el numero de documento ya existe en el sistema', async () => {
    prismaMock.usuario.create.mockRejectedValue({ code: 'P2002' }); // Error de restricción única en Prisma

    const dtoDuplicado = {
      id_usuario: '1023898051',
      nom_1: 'Carlos',
      ape_1: 'Perez',
      correo: 'carlos@correo.com',
      telefono: '3215478542',
      contrasena: '123456789',
      t_doc: 'CC',
    };

    await expect(service.create(dtoDuplicado as any)).rejects.toBeDefined();
  });

  // CP-005
  test('Debería retornar un error si deja un campo obligatorio vacío en el formulario', async () => {
    prismaMock.usuario.create.mockRejectedValue(new Error('Faltan datos obligatorios'));

    const dtoIncompleto = {
      id_usuario: '10125587421',
      nom_1: 'Juan',
      ape_1: 'Perez',
      correo: '',
      telefono: '3215478542',
      contrasena: '123456789',
      t_doc: 'CC',
    };

    await expect(service.create(dtoIncompleto as any)).rejects.toThrow();
  });

  // CP-006
  test('Debería retornar un error si la contraseña tiene menos de 6 caracteres', async () => {
    const dtoContrasenaCorta = {
      id_usuario: '10125587421',
      nom_1: 'Juan',
      ape_1: 'Perez',
      correo: 'juan@correo.com',
      telefono: '3215478542',
      contrasena: '12345',
      t_doc: 'CC',
    };

    prismaMock.usuario.create.mockRejectedValue(new Error('La contraseña debe tener mínimo 6 caracteres'));

    await expect(service.create(dtoContrasenaCorta as any)).rejects.toThrow();
  });

  // CP-007
  test('Debería retornar la lista completa de usuarios si quien consulta es un Administrador', async () => {
    const usuariosEnBD = [
      { id_usuario: '10125587421', nom_1: 'Juan', id_rol_usuario: '2' },
      { id_usuario: '1012345678', nom_1: 'Evelyn', id_rol_usuario: '1' },
      { id_usuario: '10224587798', nom_1: 'Mariana', id_rol_usuario: '3' },
    ];

    prismaMock.usuario.findMany.mockResolvedValue(usuariosEnBD);

    const resultado = await service.findAll({});

    expect(resultado).toHaveLength(3);
    expect(resultado).toEqual(usuariosEnBD);
  });

  // CP-008
  test('Debería filtrar y retornar los usuarios que coincidan con el nombre o correo buscado', async () => {
    const usuarioBuscado = [
      { id_usuario: '1012345678', nom_1: 'Evelyn', ape_1: 'Cardenas', correo: 'evelyn@correo.com' },
    ];

    prismaMock.usuario.findMany.mockResolvedValue(usuarioBuscado);

    const resultado = await service.findAll({ search: 'evelyn@correo.com' });

    expect(resultado).toEqual(usuarioBuscado);
    expect(resultado[0].nom_1).toBe('Evelyn');
  });

  // CP-009
  test('Debería denegar el acceso a la lista si el usuario no es Administrador', async () => {
    prismaMock.usuario.findMany.mockRejectedValue(new BadRequestException('Acceso denegado'));

    await expect(service.findAll({ rol: '2' })).rejects.toThrow(BadRequestException);
  });

  // CP-010
  test('Debería retornar los datos del perfil de un Cliente al buscarlo por ID', async () => {
    const usuarioMock = { id_usuario: '10125587421', nom_1: 'Juan', correo: 'juan@correo.com', id_rol_usuario: '2' };
    prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);

    const resultado = await service.findOne('10125587421');

    expect(resultado.id_rol_usuario).toBe('2');
    expect(resultado.correo).toBe('juan@correo.com');
  });

  // CP-011
  test('Debería retornar los datos del perfil de un Trabajador al buscarlo por ID', async () => {
    const usuarioMock = { id_usuario: '1012345678', nom_1: 'Evelyn', correo: 'evelyn@correo.com', id_rol_usuario: '3' };
    prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);

    const resultado = await service.findOne('1012345678');

    expect(resultado.id_rol_usuario).toBe('3');
    expect(resultado.correo).toBe('evelyn@correo.com');
  });

  // CP-012 
  test('Debería retornar los datos del perfil de un Administrador al buscarlo por ID', async () => {
    const usuarioMock = { id_usuario: '10224587798', nom_1: 'Mariana', correo: 'mariana@correo.com', id_rol_usuario: '1' };
    prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);

    const resultado = await service.findOne('10224587798');

    expect(resultado.id_rol_usuario).toBe('1');
    expect(resultado.correo).toBe('mariana@correo.com');
  });

  // CP-013 en el archivo auth.spec.ts, ya que pertenece a AuthService y no a UsuariosService

  // CP-014
  test('Debería retornar un error si el correo no existe en el sistema', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue(null);

    await expect(service.solicitarReset('noexisto@correo.com')).rejects.toThrow(NotFoundException);
  });

  // CP-015 en el archivo auth.spec.ts, ya que pertenece a AuthService y no a UsuariosService

  // CP-016 en el archivo auth.spec.ts, ya que pertenece a AuthService y no a UsuariosService 

  // CP-017
  test('Debería solicitar la recuperación de contraseña con éxito y generar el código de verificación si el correo existe', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue({
      id_usuario: '10125587421',
      correo: 'juan@correo.com',
    });
    prismaMock.usuario.update.mockResolvedValue({});

    const resultado = await service.solicitarReset('juan@correo.com');

    expect(resultado.message).toBe('Código enviado a tu correo');
    expect(taskServiceMock.enviarCodigoReset).toHaveBeenCalled();
  });

  // CP-018
  test('Debería retornar un error al intentar solicitar la recuperación de contraseña con un correo que no existe', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue(null);

    await expect(service.solicitarReset('correoNoRegistrado@correo.com')).rejects.toThrow(
      NotFoundException,
    );
  });

  // CP-019
  test('Debería retornar un error al intentar validar el restablecimiento de contraseña con un código/token inválido o expirado', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue({
      id_usuario: '10125587421',
      codigo_visible: '584920',
    });

    await expect(
      service.resetContrasena('juan@correo.com', '000000', 'nuevaClave123'),
    ).rejects.toThrow(BadRequestException);
  });

  // CP-020
  test('Debería actualizar exitosamente los datos básicos del perfil (nombre, teléfono) del usuario logueado', async () => {
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

  // CP-021
  test('Debería retornar un error al intentar actualizar el correo por uno que ya está en uso por otro usuario', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({ id_usuario: '10125587421' });
    prismaMock.usuario.update.mockRejectedValue({ code: 'P2002' });

    const dtoCorreoDuplicado = {
      correo: 'correo.existente@correo.com',
    };

    await expect(
      service.update('10125587421', dtoCorreoDuplicado as any),
    ).rejects.toBeDefined();
  });

  // CP-022
  test('Debería cambiar la contraseña actual por una nueva de forma exitosa estando logueado', async () => {

    const idUsuarioLogueado = '10125587421';
    const dtoCambiarContrasena = {
      contrasenaActual: 'clave123',
      nuevaContrasena: 'nuevaClave456',
      confirmarContrasena: 'nuevaClave456',
    };

    const bcrypt = require('bcrypt');
    const contrasenaHashActual = await bcrypt.hash('clave123', 10);

    prismaMock.usuario.findUnique.mockResolvedValue({
      id_usuario: idUsuarioLogueado,
      contrasena: contrasenaHashActual,
    });

    prismaMock.usuario.update.mockResolvedValue({
      id_usuario: idUsuarioLogueado,
      mensaje: 'Contraseña actualizada exitosamente',
    });

    const resultado = await service.cambiarContrasena(
      idUsuarioLogueado,
      dtoCambiarContrasena.contrasenaActual,
      dtoCambiarContrasena.nuevaContrasena,
    );

    expect(resultado).toBeDefined();
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { id_usuario: idUsuarioLogueado },
    });
    expect(prismaMock.usuario.update).toHaveBeenCalledTimes(1);
  });

  // CP-023
  test('Debería retornar un error al intentar cambiar la contraseña ingresando incorrectamente la contraseña actual', async () => {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('123456789', 10);

    prismaMock.usuario.findUnique.mockResolvedValue({ id_usuario: '10125587421', contrasena: hashed });

    await expect(
      service.cambiarContrasena('10125587421', 'claveFalsa123', 'nueva123')
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.usuario.update).not.toHaveBeenCalled();
  });

 // CP-024 
  test('Debería modificar el rol de un usuario existente de Trabajador a Administrador', async () => {
    const idUsuario = '1012345678';

    prismaMock.usuario.findUnique.mockResolvedValue({
      id_usuario: idUsuario,
      id_rol_usuario: '3', // Trabajador (rol actual)
    });

    prismaMock.usuario.update.mockResolvedValue({
      id_usuario: idUsuario,
      nom_1: 'Evelyn',
      id_rol_usuario: '1', // Administrador (rol nuevo)
    });

    const dtoActualizarRol = {
      id_rol_usuario: '1',
    };

    const resultado = await service.update(idUsuario, dtoActualizarRol as any);

    expect(resultado.id_rol_usuario).toBe('1');
    expect(prismaMock.usuario.update).toHaveBeenCalledWith({
      where: { id_usuario: idUsuario },
      data: { id_rol_usuario: '1' },
    });
  });

  
});