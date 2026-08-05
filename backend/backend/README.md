# GuramaOnline — Backend

Backend del proyecto **GuramaOnline**, construido con **NestJS**, **TypeScript** y **Prisma ORM v6**, conectado a una base de datos **MySQL**.

---

## Requisitos previos

Antes de iniciar asegúrate de tener instalado:

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| Node.js | v18 o superior | `node --version` |
| npm | v9 o superior | `npm --version` |
| Git | cualquiera | `git --version` |
| MySQL | v8 o superior | desde tu gestor de BD |

---

## Estructura del proyecto

```
backend/
├── prisma/
│   ├── schema.prisma         # Modelos de la base de datos (14 tablas)
│   └── migrations/           # Historial de migraciones
├── src/
│   ├── auth/                 # Módulo de autenticación y roles
│   │   ├── decorators/       # @GetUser, @Public, @Roles
│   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   ├── strategies/       # Estrategia JWT
│   │   ├── enums/            # Roles disponibles
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts  # Módulo global de Prisma
│   │   └── prisma.service.ts # Conexión única a la base de datos
│   ├── usuarios/
│   │   ├── dto/
│   │   │   ├── create-usuario.dto.ts
│   │   │   └── update-usuario.dto.ts
│   │   ├── entities/
│   │   │   └── usuario.entity.ts
│   │   ├── usuarios.controller.ts
│   │   ├── usuarios.module.ts
│   │   └── usuarios.service.ts
│   ├── productos/            # Misma estructura que usuarios
│   ├── categorias/           # Misma estructura que usuarios
│   ├── movimientos/          # Misma estructura que usuarios
│   ├── pedidos/              # Misma estructura que usuarios
│   ├── notificaciones/       # Misma estructura que usuarios
│   ├── app.module.ts         # Módulo raíz — registra todos los módulos
│   └── main.ts               # Punto de entrada — arranca la aplicación
├── test/
├── .env                      # Variables de entorno reales (no subir a Git)
├── .gitignore
├── nest-cli.json
├── prisma.config.ts          # Configuración de conexión de Prisma
├── package.json
└── tsconfig.json
```

---

## ¿Qué hace cada cosa?

### `src/main.ts`
El interruptor que enciende todo. Arranca el servidor en el puerto configurado.

### `src/app.module.ts`
El organigrama general. Registra todos los módulos del proyecto para que NestJS los conozca.

### `src/prisma/prisma.service.ts`
El único punto de contacto con la base de datos. Está marcado como `@Global()` por lo que todos los módulos pueden usarlo sin importarlo individualmente.

### `src/auth/`
Todo el sistema de seguridad: login, tokens JWT y validación de roles. Contiene subcarpetas para decoradores, guards, strategies y enums.

### `src/[modulo]/dto/`
Define qué datos debe enviar el usuario para crear o actualizar un recurso. Actúa como validación automática del formulario de entrada.

### `src/[modulo]/entities/`
Representa cómo luce el recurso completo en la base de datos, incluyendo campos generados automáticamente como `id`, `createdAt`, etc.

### `prisma/schema.prisma`
El mapa de la base de datos. Contiene los 14 modelos generados automáticamente desde la base de datos MySQL existente.

### `prisma.config.ts`
Configuración de Prisma. Define la URL de conexión a la base de datos leyéndola desde el `.env`.

---

## Instalación desde cero

### 1. Instalar NestJS CLI globalmente

```bash
npm install -g @nestjs/cli
nest --version
```

### 2. Crear el proyecto

```bash
nest new nombre-del-proyecto
```

Elegir `npm` como package manager.

### 3. Instalar Prisma v6

> Se usa Prisma v6 porque Prisma v7 aún no tiene soporte estable para MySQL sin adaptadores externos.

```bash
npm install @prisma/client@6
npm install prisma@6 --save-dev
npx prisma init
```

### 4. Configurar variables de entorno

Crear el archivo `.env` en la raíz:

```env
DATABASE_URL="mysql://root:@localhost:3306/guramaOnline"
JWT_SECRET=tu_clave_secreta_aqui
PORT=3000
```

### 5. Configurar `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 6. Configurar `prisma.config.ts`

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
```

### 7. Conectar con la base de datos existente

```bash
npx prisma db pull
npx prisma generate
```

### 8. Crear los módulos

```bash
nest g resource usuarios
nest g resource productos
nest g resource categorias
nest g resource movimientos
nest g resource pedidos
nest g resource notificaciones
```

En cada uno seleccionar `REST API` y `Yes` para CRUD.

```bash
nest g module prisma
nest g service prisma
nest g module auth
nest g service auth
nest g controller auth
```

Crear subcarpetas de auth:
```bash
mkdir src/auth/decorators
mkdir src/auth/guards
mkdir src/auth/strategies
mkdir src/auth/enums
```

### 9. Configurar `src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### 10. Configurar `src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 11. Agregar dotenv en `src/main.ts`

Agregar al inicio del archivo:
```typescript
import 'dotenv/config';
```

### 12. Instalar dotenv

```bash
npm install dotenv
```

### 13. Iniciar el servidor

```bash
npm run start:dev
```

El servidor corre en `http://localhost:3000`.

---

## Flujo de una petición HTTP

```
Petición llega al servidor
        ↓
JwtAuthGuard     → ¿tienes token válido?
        ↓
RolesGuard       → ¿tienes el rol requerido?
        ↓
Controller       → recibe y delega la petición
        ↓
DTO              → valida los datos de entrada
        ↓
Service          → ejecuta la lógica de negocio
        ↓
PrismaService    → consulta o guarda en la BD
        ↓
Respuesta al cliente
```

---

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Inicia el servidor en modo desarrollo (hot reload) |
| `npm run start:prod` | Inicia el servidor en modo producción |
| `npm run test` | Corre todas las pruebas |
| `npx prisma generate` | Regenera el cliente tras cambios en el schema |
| `npx prisma db pull` | Lee la BD y actualiza el schema.prisma |
| `npx prisma studio` | Abre interfaz visual para explorar la BD |
| `npx prisma migrate dev` | Crea y aplica una nueva migración |
| `nest g resource nombre` | Genera un módulo completo nuevo |

---

## Rutas disponibles

> Las rutas existen pero aún no tienen lógica implementada. Se desarrollarán próximamente junto con Swagger.

| Ruta | Descripción |
|---|---|
| `/usuarios` | Gestión de usuarios |
| `/productos` | Gestión de productos |
| `/categorias` | Categorías de productos |
| `/movimientos` | Historial de movimientos de inventario |
| `/pedidos` | Gestión de pedidos |
| `/notificaciones` | Notificaciones del sistema |
| `/auth` | Autenticación y login |

---

## Conexión con el frontend

El frontend corre en `http://localhost:5173/` (Vite + React). El backend tiene CORS configurado para aceptar peticiones desde esa URL.