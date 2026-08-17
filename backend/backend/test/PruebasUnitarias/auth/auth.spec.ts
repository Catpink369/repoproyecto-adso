// auth.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('RF-001.3 - Iniciar sesión', () => {
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

  function mockUsuarioValido(overrides: any = {}) {
    return {
      id_usuario: '10125587421',
      correo: 'juan@correo.com',
      estado: 1,
      intentos_fallidos: 0,
      bloqueado_hasta: null,
      id_rol_usuario: '2',
      codigo: 'codigo-hasheado',
      ...overrides,
    };
  }

  it('CP-010: debe iniciar sesión exitosamente con credenciales válidas de Cliente', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue(
      mockUsuarioValido({ contrasena: hashed, id_rol_usuario: '2' }),
    );
    prismaMock.usuario.update.mockResolvedValue({});

    const resultado = await service.login('juan@correo.com', 'claveCorrecta123');

    expect(resultado.success).toBe(true);
    expect((resultado as any).needs_code).toBeUndefined();
    expect(resultado.user).toBeDefined();
    expect((resultado.user as any).contrasena).toBeUndefined();
    expect((resultado.user as any).codigo).toBeUndefined();
  });

  it('CP-011: debe iniciar sesión exitosamente con credenciales válidas de Trabajador', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue(
      mockUsuarioValido({ contrasena: hashed, id_rol_usuario: '3' }),
    );
    prismaMock.usuario.update.mockResolvedValue({});

    const resultado = await service.login('juan@correo.com', 'claveCorrecta123');

    expect(resultado.needs_code).toBe(true);
    expect(resultado.success).toBeUndefined();
    expect(resultado.user).toBeDefined();
  });

  it('CP-012: debe iniciar sesión exitosamente con credenciales válidas de Administrador', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue(
      mockUsuarioValido({ contrasena: hashed, id_rol_usuario: '1' }),
    );
    prismaMock.usuario.update.mockResolvedValue({});

    const resultado = await service.login('juan@correo.com', 'claveCorrecta123');

    expect(resultado.needs_code).toBe(true);
    expect(resultado.success).toBeUndefined();
    expect(resultado.user).toBeDefined();
  });

  it('CP-013: debe rechazar el inicio de sesión con la contraseña incorrecta', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue(
      mockUsuarioValido({ contrasena: hashed }),
    );
    prismaMock.usuario.update.mockResolvedValue({});

    await expect(service.login('juan@correo.com', 'claveFalsa123')).rejects.toThrow(UnauthorizedException);

    expect(prismaMock.usuario.update).toHaveBeenCalledWith({
      where: { id_usuario: '10125587421' },
      data: { intentos_fallidos: 1 },
    });
  });

  it('CP-014: debe rechazar el inicio de sesión con un correo que no está registrado', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue(null);

    await expect(service.login('noexiste@correo.com', 'cualquierClave')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(prismaMock.usuario.update).not.toHaveBeenCalled();
  });

  it('CP-015: debe bloquear temporalmente la cuenta tras ingresar la contraseña incorrecta 5 veces seguidas', async () => {
    const hashed = await bcrypt.hash('claveCorrecta123', 10);

    prismaMock.usuario.findFirst.mockResolvedValue(
      mockUsuarioValido({ contrasena: hashed, intentos_fallidos: 4 }),
    );
    prismaMock.usuario.update.mockResolvedValue({});

    await expect(service.login('juan@correo.com', 'claveIncorrecta')).rejects.toThrow(BadRequestException);

    expect(prismaMock.usuario.update).toHaveBeenCalledWith({
      where: { id_usuario: '10125587421' },
      data: { intentos_fallidos: 0, bloqueado_hasta: expect.any(Date) },
    });
  });

  describe('CP-016: validación de redirección según el rol', () => {
    it.each([
      ['Cliente', '2', 'success'],
      ['Administrador', '1', 'needs_code'],
    ])('debe redirigir según corresponda para el rol %s', async (_rol, id_rol_usuario, campoEsperado) => {
      const hashed = await bcrypt.hash('claveCorrecta123', 10);

      prismaMock.usuario.findFirst.mockResolvedValue(
        mockUsuarioValido({ contrasena: hashed, id_rol_usuario }),
      );
      prismaMock.usuario.update.mockResolvedValue({});

      const resultado: any = await service.login('juan@correo.com', 'claveCorrecta123');

      expect(resultado[campoEsperado]).toBe(campoEsperado === 'success' ? true : true);
      expect(resultado.user).toBeDefined();
    });
  });

  describe('RF-001.8 - Desactivar Usuario (login)', () => {
    it('CP-027: debe rechazar el inicio de sesión con una cuenta previamente desactivada por el Administrador', async () => {
        const hashed = await bcrypt.hash('claveCorrecta123', 10);

        prismaMock.usuario.findFirst.mockResolvedValue(
        mockUsuarioValido({ contrasena: hashed, estado: 0 }),
        );

        await expect(service.login('juan@correo.com', 'claveCorrecta123')).rejects.toThrow(
        ForbiddenException,
        );

        expect(prismaMock.usuario.update).not.toHaveBeenCalled();
    });
    });
});