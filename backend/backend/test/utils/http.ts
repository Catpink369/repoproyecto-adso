// test/utils/http.ts
//
// El AuthMiddleware global (AppModule) exige el header x-api-key en todas
// las rutas excepto /auth/login, /auth/verify-code, POST /usuarios,
// GET /productos y /uploads/*. Este helper centraliza ese header para no
// tener que repetirlo en cada request de cada spec.
//
// Usamos request.agent(...) en vez de request(...) para que, de paso,
// las cookies (access_token) también persistan entre llamadas del mismo
// actor dentro de un mismo test — no es indispensable para el fix de
// x-api-key, pero no hace daño y se alinea mejor con el comportamiento
// real de la app en el navegador.

import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export function apiRequest(app: INestApplication) {
  const agent = request.agent(app.getHttpServer());

  if (!process.env.API_KEY) {
    // Falla rápido y con un mensaje claro si falta la variable de entorno,
    // en vez de dejar que todas las peticiones fallen en cascada con 401.
    throw new Error(
      'API_KEY no está definida en el entorno de test (revisa .env.test).',
    );
  }

  agent.set('x-api-key', process.env.API_KEY);
  return agent;
}