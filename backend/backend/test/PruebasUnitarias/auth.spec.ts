import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('Pruebas unitarias de AuthService', () => {
  let service: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      usuario: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('token-jwt-simulado'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // CP-013
  test('Debería retornar un error al intentar iniciar sesión con la contraseña incorrecta', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue({
      id_usuario: '10125587421',
      correo: 'juan@correo.com',
      contrasena: hashed,
      estado: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      id_rol_usuario: '2',
    });

    prismaMock.usuario.update.mockResolvedValue({});

    await expect(
      service.login('juan@correo.com', 'claveFalsa123'),
    ).rejects.toThrow(UnauthorizedException);

    expect(prismaMock.usuario.update).toHaveBeenCalledWith({
      where: { id_usuario: '10125587421' },
      data: { intentos_fallidos: 1 },
    });
  });

  // CP-015
  test('Debería bloquear temporalmente la cuenta tras ingresar la contraseña incorrecta 5 veces seguidas', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue({
      id_usuario: '10125587421',
      correo: 'juan@correo.com',
      contrasena: hashed,
      estado: 1,
      intentos_fallidos: 4,
      bloqueado_hasta: null,
      id_rol_usuario: '2',
    });

    prismaMock.usuario.update.mockResolvedValue({});

    await expect(
      service.login('juan@correo.com', 'claveIncorrecta'),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.usuario.update).toHaveBeenCalledWith({
      where: { id_usuario: '10125587421' },
      data: {
        intentos_fallidos: 0,
        bloqueado_hasta: expect.any(Date),
      },
    });
  });

  // CP-016
  test('Debería indicar que se requiere código de verificación al iniciar sesión con un rol de Administrador o Trabajador', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue({
      id_usuario: '1012345678',
      correo: 'evelyn@correo.com',
      contrasena: hashed,
      estado: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      id_rol_usuario: '1', // Trabajador
      codigo: 'codigo-hasheado',
    });

    prismaMock.usuario.update.mockResolvedValue({});

    const resultado = await service.login('evelyn@correo.com', 'claveCorrecta123');

    expect(resultado.needs_code).toBe(true);
    expect(resultado.success).toBeUndefined();
  });
});