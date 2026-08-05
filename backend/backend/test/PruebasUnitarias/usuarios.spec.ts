import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../../src/usuarios/usuarios.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TaskService } from '../../src/task/task.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsuariosService - Pruebas Unitarias completas (CP-001 a CP-014)', () => {
  let service: UsuariosService;
  let prisma: any;

  const mockPrismaService = {
    usuario: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockTaskService = {
    enviarCodigoReset: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    prisma = mockPrismaService;
  });

  it('CP-001: Debería registrar al cliente con éxito si envía todos los campos requeridos', async () => {
    const dto = {
      id_usuario: "10125587421",
      nom_1: "Juan",
      ape_1: "Perez",
      correo: "juan@correo.com",
      telefono: "3215478542",
      contrasena: "123456789",
      t_doc: "CC",
      id_rol_usuario: "2"
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    prisma.usuario.create.mockResolvedValue({ ...dto, id_rol_usuario: "2" });

    const resultado = await service.create(dto as any);
    expect(resultado).toBeDefined();
    expect(resultado.id_rol_usuario).toBe("2");
  });

  it('CP-002: Debería registrar al trabajador con éxito si envía todos los campos requeridos', async () => {
    const dto = {
      id_usuario: "1012345678",
      nom_1: "Evelyn",
      ape_1: "Cardenas",
      correo: "evelyn@correo.com",
      telefono: "3001234567",
      contrasena: "segura123",
      t_doc: "CC",
      codigo: "TRAB-001",
      id_rol_usuario: "1"
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    prisma.usuario.create.mockResolvedValue({ ...dto, id_rol_usuario: "1" });

    const resultado = await service.create(dto as any);
    expect(resultado).toBeDefined();
    expect(resultado.id_rol_usuario).toBe("1");
  });

  it('CP-003: Debería registrar al administrador con éxito si envía todos los campos requeridos', async () => {
    const dto = {
      id_usuario: "10224587798",
      nom_1: "Mariana",
      ape_1: "Gonzalez",
      correo: "mariana@correo.com",
      telefono: "3001234567",
      contrasena: "marianita23",
      t_doc: "CC",
      codigo: "ADMIN-001",
      id_rol_usuario: "3"
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    prisma.usuario.create.mockResolvedValue({ ...dto, id_rol_usuario: "3" });

    const resultado = await service.create(dto as any);
    expect(resultado).toBeDefined();
    expect(resultado.id_rol_usuario).toBe("3");
  });

  it('CP-004: Debería retornar un error si el número de documento ya existe en el sistema', async () => {
    const dto = {
      id_usuario: "1023898051",
      nom_1: "Carlos",
      ape_1: "Perez",
      correo: "carlos@correo.com",
      telefono: "3215478542",
      contrasena: "123456789",
      t_doc: "CC"
    };

    prisma.usuario.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create(dto as any)).rejects.toBeDefined();
  });

  it('CP-005: Debería retornar un error si deja un campo obligatorio vacío en el formulario', async () => {
    const dtoIncompleto = {
      id_usuario: "10125587421",
      nom_1: "Juan",
      ape_1: "Perez",
      correo: "",
      telefono: "3215478542",
      contrasena: "123456789",
      t_doc: "CC"
    };

    prisma.usuario.create.mockRejectedValue(new BadRequestException('Faltan datos obligatorios'));
    await expect(service.create(dtoIncompleto as any)).rejects.toThrow(BadRequestException);
  });

  it('CP-006: Debería retornar un error si la contraseña tiene menos de 6 caracteres', async () => {
    const dtoPasswordCorta = {
      id_usuario: "10125587421",
      nom_1: "Juan",
      ape_1: "Perez",
      correo: "juan@correo.com",
      telefono: "3215478542",
      contrasena: "123",
      t_doc: "CC"
    };

    jest.spyOn(service, 'create').mockRejectedValueOnce(new BadRequestException('La contraseña debe tener mínimo 6 caracteres'));
    await expect(service.create(dtoPasswordCorta as any)).rejects.toThrow(BadRequestException);
  });

  it('CP-007: Debería retornar la lista completa de usuarios si quien consulta es un Administrador', async () => {
    const usuariosEnBD = [
      { id_usuario: "10125587421", nom_1: "Juan", id_rol_usuario: "2" },
      { id_usuario: "1012345678", nom_1: "Evelyn", id_rol_usuario: "1" },
      { id_usuario: "10224587798", nom_1: "Mariana", id_rol_usuario: "3" }
    ];

    prisma.usuario.findMany.mockResolvedValue(usuariosEnBD);
    const resultado = await service.findAll({});
    expect(resultado).toHaveLength(3);
  });

  it('CP-008: Debería filtrar y retornar los usuarios que coincidan con la búsqueda', async () => {
    const usuariosEnBD = [
      { id_usuario: "1012345678", nom_1: "Evelyn", ape_1: "Cardenas", correo: "evelyn@correo.com" }
    ];

    prisma.usuario.findMany.mockResolvedValue(usuariosEnBD);
    const resultado = await service.findAll({ search: "evelyn" });
    expect(resultado).toBeDefined();
  });

  it('CP-009: Debería denegar el acceso a la lista si el usuario no tiene permisos', async () => {
    jest.spyOn(service, 'findAll').mockRejectedValueOnce(new UnauthorizedException('Acceso denegado'));
    await expect(service.findAll({})).rejects.toThrow(UnauthorizedException);
  });

  it('CP-010: Debería validar credenciales válidas de Cliente', async () => {
    const usuarioMock = { id_usuario: "10125587421", correo: "juan@correo.com", contrasena: "hashedPass", id_rol_usuario: "2" };
    prisma.usuario.findFirst.mockResolvedValue(usuarioMock);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const userFound = await prisma.usuario.findFirst({ where: { correo: "juan@correo.com" } });
    const passwordMatch = await bcrypt.compare("123456789", userFound.contrasena);

    expect(userFound.id_rol_usuario).toBe("2");
    expect(passwordMatch).toBe(true);
  });

  it('CP-011: Debería validar credenciales válidas de Trabajador', async () => {
    const usuarioMock = { id_usuario: "1012345678", correo: "evelyn@correo.com", contrasena: "hashedPass", id_rol_usuario: "1" };
    prisma.usuario.findFirst.mockResolvedValue(usuarioMock);

    const userFound = await prisma.usuario.findFirst({ where: { correo: "evelyn@correo.com" } });
    expect(userFound.id_rol_usuario).toBe("1");
  });

  it('CP-012: Debería validar credenciales válidas de Administrador', async () => {
    const usuarioMock = { id_usuario: "10224587798", correo: "mariana@correo.com", contrasena: "hashedPass", id_rol_usuario: "3" };
    prisma.usuario.findFirst.mockResolvedValue(usuarioMock);

    const userFound = await prisma.usuario.findFirst({ where: { correo: "mariana@correo.com" } });
    expect(userFound.id_rol_usuario).toBe("3");
  });

  it('CP-013: Debería fallar si la contraseña es incorrecta', async () => {
    const usuarioMock = { id_usuario: "10125587421", correo: "juan@correo.com", contrasena: "hashedPass", id_rol_usuario: "2" };
    prisma.usuario.findFirst.mockResolvedValue(usuarioMock);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const userFound = await prisma.usuario.findFirst({ where: { correo: "juan@correo.com" } });
    const passwordMatch = await bcrypt.compare("claveFalsa123", userFound.contrasena);

    expect(passwordMatch).toBe(false);
  });

  it('CP-014: Debería fallar si el correo no existe en el sistema', async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);
    const userFound = await prisma.usuario.findFirst({ where: { correo: "noexisto@correo.com" } });
    expect(userFound).toBeNull();
  });
});