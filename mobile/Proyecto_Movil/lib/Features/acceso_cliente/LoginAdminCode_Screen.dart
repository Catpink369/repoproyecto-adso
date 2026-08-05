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

class LoginAdminCodeScreen extends StatefulWidget {
  final String idUsuario;

  const LoginAdminCodeScreen({super.key, required this.idUsuario});

  @override
  State<LoginAdminCodeScreen> createState() => _LoginAdminCodeScreenState();
}

class _LoginAdminCodeScreenState extends State<LoginAdminCodeScreen> {
  final TextEditingController _codigoController = TextEditingController();
  bool _loading = false;

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
    _codigoController.dispose();
    super.dispose();
  }

  Future<void> _verificarCodigo() async {
    final codigo = _codigoController.text.trim();

    if (codigo.isEmpty) {
      AppSnackBar.warning(context, 'Ingresa el código de administrador');
      return;
    }

    setState(() => _loading = true);

    final result = await _authRepo.verifyCode(
      idUsuario: widget.idUsuario,
      codigo: codigo,
    );

    if (!mounted) return;
    setState(() => _loading = false);

    result.fold(
      (failure) => AppSnackBar.error(context, failure.message),
      (data) async {
        final authProvider = context.read<AuthProvider>();
        final userJson    = data['user'] as Map<String, dynamic>;
        final idUsuario   = userJson['id_usuario'].toString();
        final rol         = userJson['id_rol_usuario']?.toString() ?? '';

        if (data['token'] != null) {
          await authProvider.setToken(data['token']);
          ApiService.setToken(data['token']);
        }
        authProvider.setUsuario(userJson);
        await FcmService.registrarToken(idUsuario);
        await FcmService.suscribirPorRol(rol);

        if (!mounted) return;
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/admin/panel',
          (route) => false,
          arguments: UsuarioModel.fromJson(userJson),
        );
      },
    );
  }

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
              _buildHeader(),
              const SizedBox(height: 32),
              _buildCard(),
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
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            color: AppColors.primario, size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      title: Image.asset(
        'lib/Assest/Logo_GO.jpeg',
        height: 44,
        errorBuilder: (_, __, ___) => const Icon(
          Icons.storefront,
          size: 36,
          color: AppColors.primario,
        ),
      ),
      centerTitle: false,
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            gradient: AppColors.gradientePrimario,
            shape: BoxShape.circle,
            boxShadow: AppColors.sombra,
          ),
          child: const Icon(Icons.admin_panel_settings_rounded,
              color: AppColors.blanco, size: 38),
        ),
        const SizedBox(height: 20),
        const Text(
          'Verificación Admin',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: AppColors.secundario,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Ingresa el código de administrador\npara acceder al panel',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            color: AppColors.textoSecundario,
            height: 1.5,
          ),
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
          // Info banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.grisClaro,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline_rounded,
                    color: AppColors.primarioOscuro, size: 18),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Estás iniciando como administrador. Revisa tu correo para obtener el código.',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.texto,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),

          const Text(
            'Código de administrador',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.texto,
            ),
          ),
          const SizedBox(height: 8),
          _buildCodigoField(),
          const SizedBox(height: 28),
          _buildBotonPrincipal(),
          const SizedBox(height: 12),
          _buildBotonVolver(),
        ],
      ),
    );
  }

  Widget _buildCodigoField() {
    return TextField(
      controller: _codigoController,
      obscureText: true,
      textAlign: TextAlign.center,
      style: const TextStyle(
        color: AppColors.texto,
        fontSize: 22,
        letterSpacing: 8,
        fontWeight: FontWeight.bold,
      ),
      decoration: InputDecoration(
        hintText: '• • • • • •',
        hintStyle: const TextStyle(
          color: AppColors.textoClaro,
          fontSize: 20,
          letterSpacing: 6,
        ),
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
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
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
        onPressed: _verificarCodigo,
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

  Widget _buildBotonVolver() {
    return OutlinedButton(
      onPressed: () => Navigator.pop(context),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 14),
        side: const BorderSide(color: AppColors.grisBorde, width: 1.5),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      child: const Text(
        'Volver',
        style: TextStyle(
          color: AppColors.textoSecundario,
          fontSize: 15,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}