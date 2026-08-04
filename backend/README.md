# backend/

Código fuente de la API y lógica de negocio (NestJS + Prisma + MySQL).

## Pruebas
- Unitarias: `test/PruebasUnitarias/` — un archivo por RF (`rf-00X-nombre.spec.ts`), con un `describe()` por RF y un `it('CP-XXX: ...')` por cada caso de prueba.
- Integración/E2E: `test/PruebasIntegracion/` — misma convención, sufijo `.e2e-spec.ts`.
