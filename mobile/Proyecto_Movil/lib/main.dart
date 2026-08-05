import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'Data/models/usuario_model.dart';
import 'Data/models/producto_model.dart';
import 'Features/index.dart';
import 'Shared/providers/auth_provider.dart';
import 'Shared/providers/producto_provider.dart';
import 'Shared/providers/material_provider.dart';
import 'Shared/providers/pedido_provider.dart';
import 'Shared/services/cache_service.dart';
import 'Shared/constants/app_constants.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'Shared/providers/carrito_provider.dart';
import 'Shared/providers/comprobante_provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'Shared/services/fcm_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  assert(
    AppConstants.apiKey.isNotEmpty,
    'API_KEY no definida en .env — revisa que el archivo exista y tenga la variable API_KEY',
  );
  await Firebase.initializeApp();
  await FcmService.init();
  await CacheService.limpiarCacheSiEsNecesario();
  runApp(const GuramaApp());
}

class GuramaApp extends StatelessWidget {
  const GuramaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProductoProvider()),
        ChangeNotifierProvider(create: (_) => MaterialProvider()),
        ChangeNotifierProvider(create: (_) => PedidoProvider()),
        ChangeNotifierProvider(create: (_) => CarritoProvider()),
        ChangeNotifierProvider(create: (_) => ComprobanteProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Gurama Online',
        initialRoute: '/splash',
        routes: _buildRoutes(),
        onUnknownRoute: (settings) => MaterialPageRoute(
          builder: (_) => const LandingPageScreen(),
        ),
      ),
    );
  }

  Map<String, WidgetBuilder> _buildRoutes() {
    return {
      // ── Splash
      '/splash': (context) => const SplashScreen(),

      // ── Landing
      '/landing': (context) => const LandingPageScreen(),

      // ── Auth
      '/login':      (context) => const LoginScreen(),
      '/registro':   (context) => const RegistroScreen(),
      '/olvide_c':   (context) => const Olvide_c_Screen(),
      '/admin-code': (context) {
        final args = _getArgs(context);
        return LoginAdminCodeScreen(idUsuario: args['id_usuario'].toString());
      },

      // ── Cliente (rol 2)
      '/cliente': (context) => const ClienteScreen(),

      '/cliente/catalogo': (context) => const CatalogoScreen(),

      '/cliente/producto': (context) {
        final args = ModalRoute.of(context)!.settings.arguments;
        // Si llega un id (desde landing sin sesión) DProductoScreen
        if (args is int || args is String) {
          return const DProductoScreen();
        }
        // Si llega un Map con producto (desde catálogo con sesión) DetalleProductoScreen
        final map = args as Map<String, dynamic>;
        return DetalleProductoScreen(producto: map['producto'] as ProductoModel);
      },

      '/cliente/carrito': (context) => const CarritoScreen(),

      '/cliente/pedido-personalizado': (context) =>
          const PedidosPersonalizadosScreen(),

      '/cliente/comprobante': (context) => const ComprobanteScreen(),

      '/cliente/ticket': (context) {
        final data = ModalRoute.of(context)!.settings.arguments
            as Map<String, dynamic>;
        return TicketPedidoScreen(data: data);
      },

      // ── Perfil y configuración CLIENTE
      '/perfil':             (context) => const PerfilScreen(),
      '/cambiar-datos':      (context) => const CambiarDatosScreen(),
      '/cambiar-contrasena': (context) => const CambiarContrasenaScreen(),

      // ── Admin / Trabajador (rol 1 y 3)
      '/admin/panel': (context) {
        final u = ModalRoute.of(context)!.settings.arguments as UsuarioModel;
        return PanelControlScreen(usuario: u);
      },
      '/admin/productos': (context) {
        final u = ModalRoute.of(context)!.settings.arguments as UsuarioModel;
        return ProductosScreen(usuario: u);
      },
      '/admin/materiales': (context) {
        final u = ModalRoute.of(context)!.settings.arguments as UsuarioModel;
        return MaterialesScreen(usuario: u);
      },
      '/admin/movimientos': (context) {
        final u = ModalRoute.of(context)!.settings.arguments as UsuarioModel;
        return MovimientosScreen(usuario: u);
      },
      '/admin/pedidos': (context) {
        final u = ModalRoute.of(context)!.settings.arguments as UsuarioModel;
        return PedidosRealizadosScreen(usuario: u);
      },
      '/admin/usuarios': (context) {
        final u = ModalRoute.of(context)!.settings.arguments as UsuarioModel;
        return GestionUsuariosScreen(usuario: u);
      },
      '/admin/editar-producto': (context) {
        final args = _getArgs(context);
        return EditarProductoScreen(
          producto: args['producto'] as ProductoModel,
          usuario:  args['usuario']  as UsuarioModel,
        );
      },
      '/admin/registro-producto': (context) {
        final u = ModalRoute.of(context)!.settings.arguments as UsuarioModel;
        return RegistroProductoScreen(usuario: u);
      },

      // ── Perfil y configuración ADMIN
      '/admin/perfil':             (context) => const PerfilAdminScreen(),
      '/admin/cambiar-datos':      (context) => const CambiarDatosAScreen(),
      '/admin/cambiar-contrasena': (context) => const CambiarContrasenaAScreen(),

      // ── Compartidas
      '/entradas': (context) => const EntradasScreen(),
      '/salidas':  (context) => const SalidasScreen(),
    };
  }

  static Map<String, dynamic> _getArgs(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments;
    if (args is Map<String, dynamic>) return args;
    // Si por error llega un tipo incorrecto, devuelve mapa vacío sin crashear
    return {};
  }
}

// ─────────────────────────────────────────────────────────────
//  SPLASH SCREEN
// ─────────────────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _resolver();
  }

  Future<void> _resolver() async {
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;

    final authProvider = context.read<AuthProvider>();
    final tieneSesion  = await authProvider.loadTokenFromStorage();

    if (!mounted) return;

    if (tieneSesion && authProvider.usuario != null) {
      final usuario = authProvider.usuario!;
      final rol     = usuario.idRolUsuario ?? '';

      if (rol == '2') {
        Navigator.pushNamedAndRemoveUntil(
          context, '/cliente',
          (route) => false,
          arguments: usuario,
        );
      } else {
        Navigator.pushNamedAndRemoveUntil(
          context, '/admin/panel',
          (route) => false,
          arguments: usuario,
        );
      }
    } else {
      Navigator.pushReplacementNamed(context, '/landing');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFFc45a77),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.storefront, size: 80, color: Colors.white),
            SizedBox(height: 16),
            Text(
              'Gurama Online',
              style: TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
            SizedBox(height: 32),
            CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}