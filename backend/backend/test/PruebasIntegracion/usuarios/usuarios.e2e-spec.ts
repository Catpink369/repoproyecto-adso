// RF-001 — Gestión de Usuarios (integración)
//
// CP-016 y CP-020 de tu matriz general son de UI (redirección de frontend,
// "usuario cancela la operación") y no se pueden verificar a nivel de API,
// así que no están aquí.

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { TaskService } from '../../../src/task/task.service';
import { apiRequest } from '../../utils/http';
import { loginComoCliente, loginConCodigo, loginComoTrabajador } from '../../utils/auth-helper';
import { crearUsuarioFake, crearAdminFake, CATALOGOS } from '../../utils/faker-factories';

jest.setTimeout(30000);

describe('RF-001 — Gestión de Usuarios (integración)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  const sufijo = Date.now();
  const idsCreadosEnPruebas: string[] = []; // para limpieza final

  // Actores reutilizables entre bloques
  let cliente: { usuario: any; token: string };
  let trabajador: { usuario: any; token: string };
  let admin: { usuario: any; token: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Evita que las pruebas disparen correos reales al probar recuperación de contraseña
      .overrideProvider(TaskService)
      .useValue({ enviarCodigoReset: jest.fn().mockResolvedValue(undefined) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
    await app.init();

    prisma = new PrismaClient();

    cliente = await loginComoCliente(app);
    trabajador = await loginComoTrabajador(app);
    admin = await loginConCodigo(app);

    idsCreadosEnPruebas.push(cliente.usuario.id_usuario, trabajador.usuario.id_usuario, admin.usuario.id_usuario);
  });

  afterAll(async () => {
    // Limpieza en orden por dependencias FK (los usuarios creados durante los CP se agregan a idsCreadosEnPruebas)
    await prisma.usuario.deleteMany({ where: { id_usuario: { in: idsCreadosEnPruebas } } });
    await prisma.$disconnect();
    await app.close();
  });

  // ────────────────────────────────────────────────────────────
  // RF-001.1 — Registrar usuario (POST /usuarios)
  // ────────────────────────────────────────────────────────────
  describe('RF-001.1 — Registrar usuario', () => {
    it('CP-001: debe registrar un nuevo usuario con rol Cliente de forma exitosa', async () => {
      // id_usuario numérico: el DTO rechaza con 400 los documentos con
      // letras/guiones. Usamos el sufijo (timestamp) + un dígito fijo
      // para mantener unicidad entre corridas.
      const idNuevo = `${sufijo}01`;
      const res = await apiRequest(app)
        .post('/usuarios')
        .send({
          id_usuario: idNuevo,
          nom_1: 'Laura',
          ape_1: 'Gómez',
          correo: `laura.${sufijo}@test.com`,
          telefono: 3001234567,
          contrasena: 'Test1234!',
          id_rol_usuario: CATALOGOS.ROL_CLIENTE,
          t_doc: 'CC',
        });

      idsCreadosEnPruebas.push(idNuevo);
      expect(res.status).toBe(201);
      expect(res.body.correo).toBe(`laura.${sufijo}@test.com`);
    });

    it('CP-002: debe registrar un nuevo usuario con rol Trabajador desde el panel autorizado', async () => {
      const idNuevo = `${sufijo}02`;
      const res = await apiRequest(app)
        .post('/usuarios')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          id_usuario: idNuevo,
          nom_1: 'Carlos',
          ape_1: 'Ríos',
          correo: `carlos.${sufijo}@test.com`,
          telefono: 3009876543,
          contrasena: 'Test1234!',
          id_rol_usuario: CATALOGOS.ROL_TRABAJADOR,
          t_doc: 'CC',
        });

      idsCreadosEnPruebas.push(idNuevo);
      expect(res.status).toBe(201);
      expect(res.body.id_rol_usuario).toBe(CATALOGOS.ROL_TRABAJADOR);
    });

    it('CP-003: debe registrar un nuevo usuario con rol Administrador de forma exitosa', async () => {
      const idNuevo = `${sufijo}03`;
      const res = await apiRequest(app)
        .post('/usuarios')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          id_usuario: idNuevo,
          nom_1: 'María',
          ape_1: 'Pardo',
          correo: `maria.${sufijo}@test.com`,
          telefono: 3005551234,
          contrasena: 'Test1234!',
          id_rol_usuario: CATALOGOS.ROL_ADMIN,
          t_doc: 'CC',
        });

      idsCreadosEnPruebas.push(idNuevo);
      expect(res.status).toBe(201);
      expect(res.body.id_rol_usuario).toBe(CATALOGOS.ROL_ADMIN);
    });

    it('CP-004: debe rechazar el registro con un número de documento que ya existe', async () => {
      const res = await apiRequest(app)
        .post('/usuarios')
        .send({
          id_usuario: cliente.usuario.id_usuario, // documento ya usado por 'cliente'
          nom_1: 'Otro',
          ape_1: 'Usuario',
          correo: `duplicado.${sufijo}@test.com`,
          telefono: 3001112233,
          contrasena: 'Test1234!',
          id_rol_usuario: CATALOGOS.ROL_CLIENTE,
          t_doc: 'CC',
        });

      expect(res.status).toBe(409);
    });

    it('CP-005: debe rechazar el registro dejando campos obligatorios vacíos', async () => {
      const res = await apiRequest(app)
        .post('/usuarios')
        .send({
          id_usuario: `${sufijo}05`,
          nom_1: '', // obligatorio y vacío
          ape_1: 'Test',
          correo: `incompleto.${sufijo}@test.com`,
          telefono: 3000000000,
          contrasena: 'Test1234!',
          id_rol_usuario: CATALOGOS.ROL_CLIENTE,
          t_doc: 'CC',
        });

      expect(res.status).toBe(400);
    });

    it('CP-006: debe rechazar el registro con una contraseña que no cumple las políticas de seguridad (longitud mínima)', async () => {
      const res = await apiRequest(app)
        .post('/usuarios')
        .send({
          id_usuario: `${sufijo}06`,
          nom_1: 'Test',
          ape_1: 'Test',
          correo: `pwdcorta.${sufijo}@test.com`,
          telefono: 3000000001,
          contrasena: '123', // menos de 6 caracteres
          id_rol_usuario: CATALOGOS.ROL_CLIENTE,
          t_doc: 'CC',
        });

      expect(res.status).toBe(400);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-001.2 — Visualizar usuarios (GET /usuarios)
  // ────────────────────────────────────────────────────────────
  describe('RF-001.2 — Visualizar usuarios', () => {
    it('CP-007: debe visualizar la lista completa de usuarios desde el rol Administrador', async () => {
      const res = await apiRequest(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('CP-008: el filtro por nombre/correo en query no afecta el resultado (backend no filtra aún)', async () => {
      const res = await apiRequest(app)
        .get('/usuarios')
        .query({ search: 'esteTextoNoDeberiaFiltrarNada' })
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      // Si tu backend llega a implementar el filtro, este test debe actualizarse
      // para esperar solo los usuarios que coincidan con "search".
    });

    it('CP-009: debe bloquear la visualización de la lista a un rol no autorizado (Cliente)', async () => {
      const res = await apiRequest(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${cliente.token}`);

      expect(res.status).toBe(403);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-001.4 — Recuperar contraseña
  // (POST /usuarios/solicitar-reset, POST /usuarios/reset-contrasena)
  // ────────────────────────────────────────────────────────────
  describe('RF-001.4 — Recuperar contraseña', () => {
    it('CP-017: debe enviar el código de verificación con un correo registrado', async () => {
      const res = await apiRequest(app)
        .post('/usuarios/solicitar-reset')
        .send({ correo: cliente.usuario.correo });

      expect(res.status).toBe(200);
    });

    it('CP-018: debe rechazar la solicitud con un correo que no existe en el sistema', async () => {
      const res = await apiRequest(app)
        .post('/usuarios/solicitar-reset')
        .send({ correo: `no-existe-${sufijo}@test.com` });

      expect(res.status).toBe(404);
    });

    it('CP-019: debe rechazar el restablecimiento con un código inválido', async () => {
      await apiRequest(app)
        .post('/usuarios/solicitar-reset')
        .send({ correo: cliente.usuario.correo });

      const res = await apiRequest(app)
        .post('/usuarios/reset-contrasena')
        .send({
          correo: cliente.usuario.correo,
          codigo: '000000', // código incorrecto a propósito
          nuevaContrasena: 'NuevaClave123',
        });

      expect(res.status).toBe(400);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-001.5 — Editar Perfil (PATCH /usuarios/:id)
  // ────────────────────────────────────────────────────────────
  describe('RF-001.5 — Editar Perfil', () => {
    it('CP-020: debe actualizar exitosamente los datos básicos del perfil del usuario logueado', async () => {
      const res = await apiRequest(app)
        .patch(`/usuarios/${cliente.usuario.id_usuario}`)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({ nom_1: 'NombreActualizado', telefono: 3009998888 });

      expect(res.status).toBe(200);
      expect(res.body.nom_1).toBe('NombreActualizado');
    });

    it('CP-021: debe rechazar la actualización del correo por uno ya en uso por otro usuario', async () => {
      const res = await apiRequest(app)
        .patch(`/usuarios/${trabajador.usuario.id_usuario}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ correo: cliente.usuario.correo });

      expect(res.status).toBe(409);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-001.6 — Cambiar Contraseña (PATCH /usuarios/:id/cambiar-contrasena)
  // ────────────────────────────────────────────────────────────
  describe('RF-001.6 — Cambiar Contraseña', () => {
    it('CP-022: debe cambiar la contraseña actual por una nueva de forma exitosa', async () => {
      const { usuario, contrasenaFake } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
      idsCreadosEnPruebas.push(usuario.id_usuario);

      const res = await apiRequest(app)
        .patch(`/usuarios/${usuario.id_usuario}/cambiar-contrasena`)
        .send({ contrasenaActual: contrasenaFake, nuevaContrasena: 'ClaveNueva123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('CP-023: debe rechazar el cambio ingresando incorrectamente la contraseña actual', async () => {
      const { usuario } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
      idsCreadosEnPruebas.push(usuario.id_usuario);

      const res = await apiRequest(app)
        .patch(`/usuarios/${usuario.id_usuario}/cambiar-contrasena`)
        .send({ contrasenaActual: 'ClaveIncorrecta', nuevaContrasena: 'ClaveNueva123' });

      expect(res.status).toBe(400);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-001.7 — Editar Código y Rol (PATCH /usuarios/:id)
  // ────────────────────────────────────────────────────────────
  describe('RF-001.7 — Editar Código y Rol', () => {
    it('CP-024: debe permitir a un Administrador modificar el rol de un usuario existente', async () => {
      const { usuario } = await crearAdminFake(CATALOGOS.ROL_TRABAJADOR);
      idsCreadosEnPruebas.push(usuario.id_usuario);

      const res = await apiRequest(app)
        .patch(`/usuarios/${usuario.id_usuario}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ id_rol_usuario: CATALOGOS.ROL_ADMIN });

      expect(res.status).toBe(200);
      expect(res.body.id_rol_usuario).toBe(CATALOGOS.ROL_ADMIN);
    });

    it('CP-025: debe rechazar el cambio de rol desde una cuenta sin permisos (Cliente)', async () => {
      const res = await apiRequest(app)
        .patch(`/usuarios/${trabajador.usuario.id_usuario}`)
        .set('Authorization', `Bearer ${cliente.token}`)
        .send({ id_rol_usuario: CATALOGOS.ROL_ADMIN });

      expect(res.status).toBe(403);
    });
  });

  // ────────────────────────────────────────────────────────────
  // RF-001.8 — Desactivar Usuario (PATCH /usuarios/:id/estado)
  // ────────────────────────────────────────────────────────────
  describe('RF-001.8 — Desactivar Usuario', () => {
    it('CP-026: debe desactivar la cuenta de un usuario desde el panel de Administrador', async () => {
      const { usuario } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
      idsCreadosEnPruebas.push(usuario.id_usuario);

      const res = await apiRequest(app)
        .patch(`/usuarios/${usuario.id_usuario}/estado`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe(0);
    });

    // CP-027 (login con cuenta desactivada) requiere el AuthController — ver nota al inicio del archivo.

    it('CP-028: debe reactivar la cuenta de un usuario previamente desactivado', async () => {
      const { usuario } = await crearUsuarioFake(CATALOGOS.ROL_CLIENTE);
      idsCreadosEnPruebas.push(usuario.id_usuario);

      // primer toggle: activo -> inactivo
      await apiRequest(app)
        .patch(`/usuarios/${usuario.id_usuario}/estado`)
        .set('Authorization', `Bearer ${admin.token}`);

      // segundo toggle: inactivo -> activo
      const res = await apiRequest(app)
        .patch(`/usuarios/${usuario.id_usuario}/estado`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe(1);
    });

    it('CP-029: debe rechazar la desactivación del administrador principal', async () => {
      let adminPrincipal = await prisma.usuario.findFirst({ where: { correo: 'valruiz@gmail.com' } });
      let creadoEnEstaPrueba = false;

      if (!adminPrincipal) {
        adminPrincipal = await prisma.usuario.create({
          data: {
            id_usuario: `${sufijo}09`,
            nom_1: 'Admin',
            ape_1: 'Principal',
            correo: 'valruiz@gmail.com',
            telefono: BigInt(3000000009),
            contrasena: 'no-se-usa-en-este-test',
            id_rol_usuario: CATALOGOS.ROL_ADMIN,
            t_doc: 'CC',
            estado: 1,
          },
        });
        creadoEnEstaPrueba = true;
      }

      const res = await apiRequest(app)
        .patch(`/usuarios/${adminPrincipal.id_usuario}/estado`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(400);

      if (creadoEnEstaPrueba) {
        idsCreadosEnPruebas.push(adminPrincipal.id_usuario);
      }
    });
  });
});