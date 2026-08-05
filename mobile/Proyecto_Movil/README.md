# Gurama Online — App Móvil Flutter

Aplicación móvil para la tienda **Gurama Online**, que permite la gestión de inventario, pedidos, movimientos y compras para clientes y administradores.

---

## Requisitos para ejecutar el proyecto

| Herramienta | Versión mínima |
|---|---|
| Flutter SDK | `^3.11.5` |
| Dart SDK | `^3.11.5` |
| Android Studio / VS Code | Cualquier versión reciente |
| Dispositivo / Emulador | Android o iOS |
| Backend API | Node.js corriendo en `192.168.X.X:3000` (misma red WiFi) |

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd proyecto_movil

# 2. Instalar dependencias
flutter pub get

# 3. Ejecutar
flutter run
```

> **Importante:** Antes de correr la app, actualiza la IP del servidor en:
> `lib/Shared/constants/app_constants.dart` → `_baseUrl`

---

## Dependencias principales

| Paquete | Versión | Para qué se usa |
|---|---|---|
| `http` | `^1.6.0` | Llamadas HTTP al backend |
| `provider` | `^6.1.5` | Manejo de estado global |
| `cached_network_image` | `^3.4.1` | Carga de imágenes desde URL con caché |
| `image_picker` | `^1.2.2` | Seleccionar fotos de galería/cámara |
| `fpdart` | `^1.1.0` | Programación funcional — `Either<Failure, T>` |
| `equatable` | `^2.0.7` | Comparación de objetos (usado en Failures) |
| `internet_connection_checker_plus` | `^2.6.0` | Verificar conectividad a internet |

---

## Estructura del proyecto

```
lib/
├── main.dart                         # Punto de entrada, rutas y providers globales
│
├── core/                             # Núcleo de la app (independiente de features)
│   ├── errors/
│   │   └── failures.dart             # Clases de error: ServerFailure, ConnectionFailure, CacheFailure
│   ├── network/
│   │   └── network_info.dart         # Abstracción para verificar conectividad a internet
│   └── utils/
│       └── error_handler.dart        # safeCall<T>() — envuelve cualquier llamada async en Either<Failure,T>
│
├── features/                         # Arquitectura limpia (dominio + datos)
│   └── auth/
│       ├── domain/
│       │   └── repositories/
│       │       └── auth_repository.dart        # Contrato abstracto de autenticación
│       └── data/
│           └── repositories/
│               └── auth_repository_impl.dart   # Implementación real con manejo de errores
│
├── Data/                             # Modelos de datos de la API
│   └── models/
│       ├── usuario_model.dart        # Modelo de usuario (admin / cliente)
│       ├── producto_model.dart       # Modelo de producto del catálogo
│       ├── pedido_model.dart         # Modelos: PedidoModel, DetallePedido, TicketCompra
│       ├── material_model.dart       # Modelo de materiales para pedidos personalizados
│       └── reporte_model.dart        # ResumenGeneralModel, TopProductoModel (parseo seguro de números)
│
├── Features/                         # Pantallas organizadas por módulo
│   ├── index.dart                    # Exporta todas las screens (barrel file)
│   │
│   ├── acceso_cliente/               # Módulo de autenticación y perfil de cliente
│   │   ├── Login_Screen.dart         # Login con Either — sin pantalla roja posible
│   │   ├── LoginAdminCode_Screen.dart# Verificación de código 2FA para admins
│   │   ├── Registro_Screen.dart      # Registro de nuevos usuarios
│   │   ├── Olvide_c_Screen.dart      # Recuperación de contraseña
│   │   ├── Perfil_Screen.dart        # Perfil del cliente
│   │   ├── Cambiar_datos_Screen.dart # Editar datos personales
│   │   ├── Cambiar_contrasena_Screen.dart
│   │   ├── LandingPage_Screen.dart   # Pantalla de inicio para clientes
│   │   ├── Cliente_Screen.dart       # Vista principal del cliente
│   │   └── D_producto_Screen.dart    # Detalle de producto para cliente
│   │
│   ├── admin_inventario/             # Módulo de administración
│   │   ├── PanelControl_Screen.dart  # Dashboard principal del admin
│   │   ├── Productos_Screen.dart     # Lista y gestión de productos
│   │   ├── RegistroProducto_Screen.dart
│   │   ├── EditarProducto_Screen.dart
│   │   ├── Materiales_Screen.dart    # Gestión de materiales
│   │   ├── Movimientos_Screen.dart   # Historial de movimientos de inventario
│   │   ├── Entradas_Screen.dart      # Registro de entradas de stock
│   │   ├── Salidas_Screen.dart       # Registro de salidas de stock
│   │   ├── PedidosRealizados_Screen.dart
│   │   ├── Reportes_Screen.dart      # Reporte general con ResumenGeneralModel
│   │   ├── HistorialVentas_Screen.dart
│   │   ├── Notificaciones_Screen.dart
│   │   ├── GestionUsuarios_Screen.dart
│   │   ├── PerfilAdmin_Screen.dart
│   │   ├── CambiarDatos_Screen.dart
│   │   └── CambiarContrasena_Screen.dart
│   │
│   └── compras_personalizacion/      # Módulo de compras y personalizaciones
│       ├── Catalogo_Screen.dart      # Catálogo de productos para el cliente
│       ├── DetalleProducto_Screen.dart
│       ├── Carrito_Screen.dart       # Carrito de compras
│       ├── TicketPedido_Screen.dart
│       ├── Comprobante_Screen.dart
│       ├── PedidosPersonalizados_Screen.dart
│       ├── Personalizacion_Cubrelechos_Screen.dart
│       └── Personalizacion_Sabanas_Screen.dart
│
├── Shared/                           # Código reutilizable en toda la app
│   ├── constants/
│   │   ├── app_constants.dart        # URLs de la API, API key, endpoints
│   │   └── app_colors.dart           # Paleta de colores (primario, secundario, fondo...)
│   │
│   ├── services/
│   │   └── api_service.dart          # Cliente HTTP centralizado (GET/POST/PATCH/DELETE/Multipart)
│   │                                 # Gestiona el token Bearer automáticamente
│   │
│   ├── providers/                    # Estado global con Provider
│   │   ├── auth_provider.dart        # Token JWT + usuario autenticado
│   │   ├── producto_provider.dart    # Estado de productos
│   │   ├── material_provider.dart    # Estado de materiales
│   │   └── pedido_provider.dart      # Estado de pedidos
│   │
│   └── widgets/                      # Widgets reutilizables
│       ├── Custom_AppBar.dart        # AppBar personalizada con logo/título
│       ├── Custom_Button.dart        # Botón principal con estilo de marca
│       ├── Custom_TextField.dart     # Campo de texto con ícono y validación
│       ├── Custom_Sizedbox.dart      # Espaciados predefinidos (AppSpaces)
│       ├── AdminSidebar.dart         # Menú lateral para pantallas de admin
│       └── app_snackbar.dart         # SnackBar flotante: .success() .error() .warning() .info()
│
└── Assest/                           # Recursos estáticos
    └── Logo_GO.jpeg                  # Logo de Gurama Online
```

---

## Manejo de errores (patrón Either)

La app usa programación funcional para que **ningún error rompa la app con pantalla roja**.

### Tipos de Failure

```dart
// lib/core/errors/failures.dart
ServerFailure("mensaje")       // Error del servidor (4xx, 5xx, JSON inválido)
ConnectionFailure("mensaje")   // Sin internet, timeout, socket error
CacheFailure("mensaje")        // Error de datos locales
```

### Cómo usar safeCall en cualquier pantalla

```dart
import '../../core/utils/error_handler.dart';
import '../../Shared/widgets/app_snackbar.dart';

final result = await safeCall(
  () => ApiService.get(AppConstants.resumenGeneral),
  networkInfo: NetworkInfoImpl(InternetConnection()),
);

result.fold(
  (failure) => AppSnackBar.error(context, failure.message),
  (response) {
    // usar response normalmente
  },
);
```

### AppSnackBar — uso rápido

```dart
AppSnackBar.success(context, '¡Operación exitosa!');
AppSnackBar.error(context, 'Sin conexión a internet');
AppSnackBar.warning(context, 'Completa todos los campos');
AppSnackBar.info(context, 'Cargando...');
```

---

## 🌐 Configuración del backend

Edita la IP en `lib/Shared/constants/app_constants.dart`:

```dart
static const String _baseUrl = 'http://TU_IP:3000';
```

La app y el dispositivo deben estar en la **misma red WiFi**.

### Endpoints principales

| Módulo | Prefijo |
|---|---|
| Autenticación | `/auth` |
| Usuarios | `/usuarios` |
| Productos | `/productos` |
| Categorías | `/categorias` |
| Movimientos | `/movimientos` |
| Pedidos | `/pedidos` |
| Notificaciones | `/notificaciones` |
| Pedidos personalizados | `/pedidos-personalizados` |

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| **Cliente** | Catálogo, carrito, pedidos, perfil |
| **Admin / Trabajador** | Todo lo anterior + panel de control, inventario, reportes, usuarios |

Los admins pasan por verificación de código 2FA al iniciar sesión (`/admin-code`).

---

## Paleta de colores

| Nombre | Color | Hex |
|---|---|---|
| Primario | Rosa fuerte | `#c45a77` |
| Secundario | Vino | `#0xFFb4788b` |
| Suave | Rosa claro | `#d4a9c2` |
| Fondo | Rosa muy claro | `#f3e4e9` |
| Texto | Marrón oscuro | `#5a3d54` |
