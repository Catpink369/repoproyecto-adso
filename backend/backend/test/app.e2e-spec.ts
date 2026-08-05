import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) sin token debe rechazar el acceso (401)', () => {
    // La ruta raíz está protegida por el guard global de autenticación.
    // Nadie debe poder acceder sin un JWT válido, ni siquiera a "/".
    return request(app.getHttpServer())
      .get('/')
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});