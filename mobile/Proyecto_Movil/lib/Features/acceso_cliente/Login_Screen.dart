import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/providers/auth_provider.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/services/fcm_service.dart';
import '../../Shared/widgets/app_snackbar.dart';
import '../../core/network/network_info.dart';
import '../../Features/auth/data/repositories/auth_repository_impl.dart';
import '../../Data/models/usuario_model.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _correoController    = TextEditingController();
  final TextEditingController _contrasenaController = TextEditingController();
  bool _loading       = false;
  bool _verContrasena = false;

  late final AuthRepositoryImpl _authRepo;

  @override
  void initState() {
    super.initState();
    _authRepo = AuthRepositoryImpl(
      networkInfo: NetworkInfoImpl(InternetConnection()),
    );
  }

  @override
  void dispose() {
    _correoController.dispose();
    _contrasenaController.dispose();
    super.dispose();
  }

  // ── Lógica principal de login ────────────────────────────────────────────
  Future<void> _login() async {
    final correo     = _correoController.text.trim();
    final contrasena = _contrasenaController.text.trim();

    if (correo.isEmpty || contrasena.isEmpty) {
      AppSnackBar.warning(context, 'Por favor completa todos los campos');
      return;
    }

    setState(() => _loading = true);
    final result = await _authRepo.login(correo: correo, contrasena: contrasena);
    if (!mounted) return;
    setState(() => _loading = false);

    result.fold(
      (failure) => AppSnackBar.error(context, failure.message),
      (data) async {
        final userJson  = data['user'] as Map<String, dynamic>;
        final rol       = userJson['id_rol_usuario']?.toString() ?? '';
        final idUsuario = userJson['id_usuario'].toString();

        // Guardar sesión y registrar FCM — igual para todos los flujos
        await _aplicarSesion(
          data: data,
          userJson: userJson,
          idUsuario: idUsuario,
          rol: rol,
        );
        if (!mounted) return;

        // Admin/trabajador que necesita código — ir a pantalla de verificación
        if (data['needs_code'] == true) {
          Navigator.pushNamed(
            context,
            '/admin-code',
            arguments: {'id_usuario': idUsuario},
          );
          return;
        }

        // Navegar según rol
        final usuario = UsuarioModel.fromJson(userJson);
        if (rol == '2') {
          AppSnackBar.success(context, '¡Bienvenida a Gurama Online!');
          Navigator.pushReplacementNamed(context, '/cliente', arguments: usuario);
        } else {
          AppSnackBar.success(context, '¡Bienvenido a Gurama Online!');
          Navigator.pushReplacementNamed(context, '/admin/panel', arguments: usuario);
        }
      },
    );
  }

  /// Guarda token + usuario en providers/storage y registra FCM.
  /// Se ejecuta igual para cliente, admin y needs_code.
  Future<void> _aplicarSesion({
    required Map<String, dynamic> data,
    required Map<String, dynamic> userJson,
    required String idUsuario,
    required String rol,
  }) async {
    final authProvider = context.read<AuthProvider>();

    if (data['token'] != null) {
      await authProvider.setToken(data['token'] as String);
      ApiService.setToken(data['token'] as String);
    }
    authProvider.setUsuario(userJson);
    await FcmService.registrarToken(idUsuario);
    await FcmService.suscribirPorRol(rol);
  }

  // ── Build ────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.fondo,
      appBar: _buildAppBar(),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            children: [
              _buildLogoHeader(),
              const SizedBox(height: 28),
              _buildCard(),
              const SizedBox(height: 24),
              _buildFooterLinks(),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppColors.blanco,
      elevation: 0,
      centerTitle: false,
      title: Image.asset(
        'lib/Assest/Logo_GO.jpeg',
        height: 44,
        errorBuilder: (_, __, ___) =>
            const Icon(Icons.storefront, size: 36, color: AppColors.primario),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pushNamed(context, '/registro'),
          child: const Text(
            'Registrarse',
            style: TextStyle(color: AppColors.primario, fontWeight: FontWeight.w600),
          ),
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildLogoHeader() {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            gradient: AppColors.gradientePrimario,
            shape: BoxShape.circle,
            boxShadow: AppColors.sombra,
          ),
          child: const Icon(Icons.lock_rounded, color: AppColors.blanco, size: 34),
        ),
        const SizedBox(height: 16),
        const Text(
          'Iniciar Sesión',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: AppColors.secundario,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Accede a tu cuenta de Gurama Online',
          style: TextStyle(fontSize: 13, color: AppColors.textoSecundario),
        ),
      ],
    );
  }

  Widget _buildCard() {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: AppColors.fondoTarjeta,
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppColors.sombra,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildLabel('Correo electrónico'),
          const SizedBox(height: 8),
          _buildTextField(
            controller: _correoController,
            hint: 'correo@ejemplo.com',
            icon: Icons.email_outlined,
            tipo: TextInputType.emailAddress,
          ),
          const SizedBox(height: 18),
          _buildLabel('Contraseña'),
          const SizedBox(height: 8),
          _buildTextField(
            controller: _contrasenaController,
            hint: 'Ingresa tu contraseña',
            icon: Icons.lock_outline_rounded,
            esPassword: true,
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => Navigator.pushNamed(context, '/olvide_c'),
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: const Size(0, 32),
              ),
              child: const Text(
                '¿Olvidaste tu contraseña?',
                style: TextStyle(
                  color: AppColors.primario,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          _buildBotonPrincipal(),
        ],
      ),
    );
  }

  Widget _buildLabel(String texto) {
    return Text(
      texto,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        color: AppColors.texto,
        letterSpacing: 0.2,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType tipo = TextInputType.text,
    bool esPassword = false,
  }) {
    return TextField(
      controller: controller,
      keyboardType: tipo,
      obscureText: esPassword && !_verContrasena,
      style: const TextStyle(color: AppColors.texto, fontSize: 15),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textoClaro, fontSize: 14),
        prefixIcon: Icon(icon, color: AppColors.primario, size: 20),
        suffixIcon: esPassword
            ? IconButton(
                icon: Icon(
                  _verContrasena
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: AppColors.textoClaro,
                  size: 20,
                ),
                onPressed: () => setState(() => _verContrasena = !_verContrasena),
              )
            : null,
        filled: true,
        fillColor: AppColors.fondoInput,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.grisBorde),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.grisBorde),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primario, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildBotonPrincipal() {
    if (_loading) {
      return const SizedBox(
        height: 52,
        child: Center(
          child: CircularProgressIndicator(
              color: AppColors.primario, strokeWidth: 2.5),
        ),
      );
    }
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: AppColors.gradientePrimario,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: AppColors.primario.withOpacity(0.35),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _login,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        child: const Text(
          'Ingresar',
          style: TextStyle(
            color: AppColors.blanco,
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }

  Widget _buildFooterLinks() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          '¿No tienes cuenta?',
          style: TextStyle(color: AppColors.textoSecundario, fontSize: 14),
        ),
        TextButton(
          onPressed: () => Navigator.pushNamed(context, '/registro'),
          child: const Text(
            'Regístrate',
            style: TextStyle(
              color: AppColors.primario,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}