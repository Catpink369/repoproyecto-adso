import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static String get _baseUrl => dotenv.env['BASE_URL'] ?? 'http://localhost:3000';
  static String get baseUrl => _baseUrl;

  // API KEY
  static String get apiKey => dotenv.env['API_KEY'] ?? '';

  // Headers globales
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  // Función para construir URLs de imágenes
  static String getImageUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    final safePath = path.startsWith('/') ? path.substring(1) : path;
    final safeBase = baseUrl.endsWith('/') ? baseUrl : '$baseUrl/';
    return '$safeBase$safePath';
  }

  // AUTH
  static String get login => '$_baseUrl/auth/login';
  static String get verifyCode => '$_baseUrl/auth/verify-code';
  static String get logout => '$_baseUrl/auth/logout';

  // USUARIOS
  static String get crearUsuario => '$_baseUrl/usuarios';
  static String get obtenerUsuarios => '$_baseUrl/usuarios';
  static String get obtenerUsuario => '$_baseUrl/usuarios';
  static String get actualizarUsuario => '$_baseUrl/usuarios';
  static String get eliminarUsuario => '$_baseUrl/usuarios';
  static String get cambiarContrasena => '$_baseUrl/usuarios';
  static String get subirImagen => '$_baseUrl/usuarios';
  static String get solicitarReset => '$_baseUrl/usuarios/solicitar-reset';
  static String get resetContrasena => '$_baseUrl/usuarios/reset-contrasena';
  static String get cambiarEstado => '$_baseUrl/usuarios';

  // PRODUCTOS
  static String get crearProducto => '$_baseUrl/productos';
  static String get obtenerProductos => '$_baseUrl/productos';
  static String get verificarProducto => '$_baseUrl/productos/check';
  static String get obtenerProducto => '$_baseUrl/productos';
  static String get actualizarProducto => '$_baseUrl/productos';
  static String get eliminarProducto => '$_baseUrl/productos';
  static String get subirImagenProducto => '$_baseUrl/productos';

  // CATEGORIAS
  static String get obtenerCategorias => '$_baseUrl/categorias';
  static String get obtenerClasificaciones => '$_baseUrl/categorias/clasificaciones';

  // MOVIMIENTOS
  static String get obtenerMovimientos => '$_baseUrl/movimientos';
  static String get crearMovimiento => '$_baseUrl/movimientos';
  static String get resumenGeneral => '$_baseUrl/movimientos/resumen-general';
  static String get movimientosPorDia => '$_baseUrl/movimientos/por-dia';
  static String get movimientosPorTipo => '$_baseUrl/movimientos/por-tipo';
  static String get topProductos => '$_baseUrl/movimientos/top-productos';
  static String get resumenMensual => '$_baseUrl/movimientos/resumen-mensual';
  static String get movimientosTipo => '$_baseUrl/movimientos/tipo';
  static String get obtenerMovimiento => '$_baseUrl/movimientos';
  static String get actualizarMovimiento => '$_baseUrl/movimientos';
  static String get eliminarMovimiento => '$_baseUrl/movimientos';

  // PEDIDOS
  static String get crearPedido => '$_baseUrl/pedidos/crear';
  static String get obtenerPedidos => '$_baseUrl/pedidos';
  static String get pedidosPorUsuario => '$_baseUrl/pedidos/usuario';
  static String get detallePedido => '$_baseUrl/pedidos/detalle';
  static String get actualizarPedido => '$_baseUrl/pedidos';
  static String get eliminarPedido => '$_baseUrl/pedidos';

  // NOTIFICACIONES
  static String get obtenerNotificaciones => '$_baseUrl/notificaciones';
  static String get contarNotificaciones => '$_baseUrl/notificaciones/count';
  static String get notificacionesStockBajo => '$_baseUrl/notificaciones/stock-bajo';
  static String get notificacionesAgotados => '$_baseUrl/notificaciones/agotados';
  static String get notificacionesPedidosRecientes => '$_baseUrl/notificaciones/pedidos-recientes';
  static String get estadisticasNotificaciones => '$_baseUrl/notificaciones/estadisticas';

  // PEDIDOS PERSONALIZADOS
  static String get obtenerMateriales => '$_baseUrl/pedidos-personalizados/materiales';
  static String get crearMaterial => '$_baseUrl/pedidos-personalizados/materiales';
  static String get materialesPorTipo => '$_baseUrl/pedidos-personalizados/materiales';
  static String get coloresMaterial => '$_baseUrl/pedidos-personalizados/materiales';
  static String get disenosMaterial => '$_baseUrl/pedidos-personalizados/materiales';
  static String get actualizarMaterial => '$_baseUrl/pedidos-personalizados/materiales';
  static String get subirImagenMaterial => '$_baseUrl/pedidos-personalizados/materiales';
  static String get crearPedidoPersonalizado => '$_baseUrl/pedidos-personalizados';
  static String get obtenerPedidosPersonalizados => '$_baseUrl/pedidos-personalizados';
  static String get pedidosPersonalizadosPorUsuario => '$_baseUrl/pedidos-personalizados/usuario';
}