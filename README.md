# Gurama Online — proyecto-adso

Sistema de gestión de pedidos y comercio electrónico para Gurama Online (SENA · ADSO · Ficha 3206403), enfocado en la venta de amigurumis y productos textiles personalizados (sábanas y cubrelechos).

## Estructura del repositorio (Monorepo)

```
proyecto-adso/
├── docs/            → Documentación general del proyecto (RF, RNF, Casos de Uso, BPMN, DER, Diccionario BD, Manuales)
├── frontend/         → Interfaz web (Vite + React)
├── backend/          → API y lógica de negocio (NestJS + Prisma + MySQL)
├── mobile/           → Aplicación móvil (Flutter)
├── database/         → Scripts de creación, migración y carga de la BD
├── qa/               → Todo el trabajo de Quality Assurance
│   ├── Plan Maestro/
│   ├── Casos Prueba/
│   ├── Bugs/
│   ├── Evidencias/
│   └── Métricas/
├── docker/           → Configuración de despliegue en contenedores
├── .github/          → Plantillas de Issues y automatizaciones
└── README.md
```

Se eligió la estructura **Monorepo** para mantener en un único repositorio el código fuente (frontend, backend, mobile, database) y toda la documentación del proyecto y de QA, reduciendo la complejidad de gestión para un equipo pequeño.

## Equipo QA

| Integrante | Rol |
|---|---|
| Camila Mahecha | QA Lead |
| Evelyn Cárdenas | QA Analyst / Tester |
| Reinel Loaiza | QA Analyst / Tester |

Ver detalle de roles, matriz RACI y flujo de trabajo en `qa/Plan Maestro/`.

## Herramientas

GitHub · GitHub Projects · GitHub Issues · Google Drive (backup) · Google Meet · Swagger · Visual Paradigm.
