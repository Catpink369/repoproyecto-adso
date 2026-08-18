// RF-001.3 — Iniciar sesión (integración) + CP-027 (cuenta desactivada)
//
// CP-016 (validación de redirección según el rol) es de UI/frontend y no está aquí.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { crearUsuarioFake, crearAdminFake, CATALOGOS } from '../../utils/faker-factories';

jest.setTimeout(30000);

describe('RF-001.3 — Iniciar sesión (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  const idsCreadosEnPruebas: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
    await app.init();

    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id_usuario: { in: idsCreadosEnPruebas } } });
    await prisma.$disconnect();
    await app.close();
  });

  it('CP-010: debe iniciar sesión exitosamente con credenciales válidas de Cliente', async () => {
    const { usuario, contrasenaFake } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
    idsCreadosEnPruebas.push(usuario.id_usuario);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, contrasena: contrasenaFake });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.needs_code).toBeUndefined();
  });

  it('CP-011: debe iniciar sesión exitosamente con credenciales válidas de Trabajador (login + código)', async () => {
    const { usuario, codigofake } = await crearAdminFake(CATALOGOS.ROL_TRABAJADOR);
    idsCreadosEnPruebas.push(usuario.id_usuario);
    const contrasenaFake = 'Admin1234!';

    const resLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, contrasena: contrasenaFake });

    expect(resLogin.status).toBe(201);
    expect(resLogin.body.needs_code).toBe(true);

    const resCodigo = await request(app.getHttpServer())
      .post('/auth/verify-code')
      .send({ id_usuario: usuario.id_usuario, codigo: codigofake });

    expect(resCodigo.status).toBe(201);
    expect(resCodigo.body.success).toBe(true);
    expect(resCodigo.body.token).toBeDefined();
  });

  it('CP-012: debe iniciar sesión exitosamente con credenciales válidas de Administrador (login + código)', async () => {
    const { usuario, codigofake } = await crearAdminFake(CATALOGOS.ROL_ADMIN);
    idsCreadosEnPruebas.push(usuario.id_usuario);
    const contrasenaFake = 'Admin1234!';

    const resLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, contrasena: contrasenaFake });

    expect(resLogin.status).toBe(201);
    expect(resLogin.body.needs_code).toBe(true);

    const resCodigo = await request(app.getHttpServer())
      .post('/auth/verify-code')
      .send({ id_usuario: usuario.id_usuario, codigo: codigofake });

    expect(resCodigo.status).toBe(201);
    expect(resCodigo.body.success).toBe(true);
    expect(resCodigo.body.token).toBeDefined();
  });

  it('CP-013: debe rechazar el inicio de sesión con una contraseña incorrecta', async () => {
    const { usuario } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
    idsCreadosEnPruebas.push(usuario.id_usuario);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, contrasena: 'ClaveIncorrecta1!' });

    expect(res.status).toBe(401);
  });

  it('CP-014: debe rechazar el inicio de sesión con un correo que no está registrado', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: `no-existe-${Date.now()}@test.com`, contrasena: 'Cualquiera123' });

    expect(res.status).toBe(401);
  });

  it('CP-015: debe bloquear temporalmente la cuenta tras 5 intentos fallidos consecutivos', async () => {
    const { usuario } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
    idsCreadosEnPruebas.push(usuario.id_usuario);

    for (let intento = 1; intento <= 4; intento++) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ correo: usuario.correo, contrasena: 'ClaveIncorrecta1!' });
      expect(res.status).toBe(401);
    }

    const quintoIntento = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, contrasena: 'ClaveIncorrecta1!' });
    expect(quintoIntento.status).toBe(400);

    const sextoIntento = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, contrasena: 'ClaveIncorrecta1!' });
    expect(sextoIntento.status).toBe(400);
  });

  it('CP-027: debe rechazar el inicio de sesión con una cuenta que ha sido previamente desactivada', async () => {
    const { usuario, contrasenaFake } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
    idsCreadosEnPruebas.push(usuario.id_usuario);

    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { estado: 0 },
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: usuario.correo, contrasena: contrasenaFake });

    expect(res.status).toBe(403);
  });
});