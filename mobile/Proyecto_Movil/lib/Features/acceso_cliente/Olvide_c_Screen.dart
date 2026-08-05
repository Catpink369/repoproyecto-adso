import 'package:flutter/material.dart';
import 'dart:convert';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/widgets/app_snackbar.dart';

class Olvide_c_Screen extends StatefulWidget {
    const Olvide_c_Screen({super.key});

    @override
    State<Olvide_c_Screen> createState() => _Olvide_c_ScreenState();
    }

    class _Olvide_c_ScreenState extends State<Olvide_c_Screen> {
    int  _paso    = 1;
    bool _loading = false;

    final _correoCtrl    = TextEditingController();
    final _codigoCtrl    = TextEditingController();
    final _nuevaCtrl     = TextEditingController();
    final _confirmarCtrl = TextEditingController();

    @override
    void dispose() {
        _correoCtrl.dispose();
        _codigoCtrl.dispose();
        _nuevaCtrl.dispose();
        _confirmarCtrl.dispose();
        super.dispose();
    }

    Future<void> _solicitarCodigo() async {
        final correo = _correoCtrl.text.trim();
        if (correo.isEmpty) {
        AppSnackBar.warning(context, 'Ingresa tu correo electrónico.');
        return;
        }
        setState(() => _loading = true);
        try {
        final res = await ApiService.post(
            AppConstants.solicitarReset,
            {'correo': correo},
        );
        if (!mounted) return;
        setState(() => _loading = false);
        if (res.statusCode == 200 || res.statusCode == 201) {
            AppSnackBar.success(context, 'Código enviado. Revisa tu bandeja de entrada.');
            setState(() => _paso = 2);
        } else {
            final data = jsonDecode(res.body);
            AppSnackBar.error(context, data['message']?.toString() ?? 'Error al enviar el código.');
        }
        } catch (_) {
        setState(() => _loading = false);
        AppSnackBar.error(context, 'Error de conexión. Intenta de nuevo.');
        }
    }

    Future<void> _restablecerContrasena() async {
        final codigo    = _codigoCtrl.text.trim();
        final nueva     = _nuevaCtrl.text.trim();
        final confirmar = _confirmarCtrl.text.trim();

        if (codigo.isEmpty || nueva.isEmpty || confirmar.isEmpty) {
        AppSnackBar.warning(context, 'Por favor completa todos los campos.');
        return;
        }
        if (nueva != confirmar) {
        AppSnackBar.error(context, 'Las contraseñas no coinciden.');
        return;
        }
        if (nueva.length < 6) {
        AppSnackBar.error(context, 'La contraseña debe tener al menos 6 caracteres.');
        return;
        }

        setState(() => _loading = true);
        try {
        final res = await ApiService.post(
            AppConstants.resetContrasena,
            {
            'correo': _correoCtrl.text.trim(),
            'codigo': codigo,
            'nuevaContrasena': nueva,
            },
        );
        if (!mounted) return;
        setState(() => _loading = false);
        if (res.statusCode == 200 || res.statusCode == 201) {
            AppSnackBar.success(context, '¡Contraseña actualizada exitosamente!');
            await Future.delayed(const Duration(seconds: 2));
            if (mounted) Navigator.pushReplacementNamed(context, '/login');
        } else {
            final data = jsonDecode(res.body);
            AppSnackBar.error(
                context, data['message']?.toString() ?? 'Error al restablecer la contraseña.');
        }
        } catch (_) {
        setState(() => _loading = false);
        AppSnackBar.error(context, 'Error de conexión. Intenta de nuevo.');
        }
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
        backgroundColor: AppColors.fondo,
        appBar: AppBar(
            backgroundColor: AppColors.blanco,
            elevation: 0,
            leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.primario, size: 20),
            onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
            ),
            title: Image.asset(
            'lib/Assest/Logo_GO.jpeg',
            height: 44,
            errorBuilder: (_, __, ___) =>
                const Icon(Icons.storefront, size: 36, color: AppColors.primario),
            ),
            centerTitle: false,
        ),
        body: Center(
            child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
                children: [
                _buildHeader(),
                const SizedBox(height: 28),
                _buildStepIndicator(),
                const SizedBox(height: 24),
                _buildCard(),
                const SizedBox(height: 20),
                TextButton(
                    onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                    child: const Text(
                    'Volver al inicio de sesión',
                    style: TextStyle(color: AppColors.textoSecundario, fontSize: 13),
                    ),
                ),
                ],
            ),
            ),
        ),
        );
    }

    Widget _buildHeader() {
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
            child: const Icon(Icons.key_rounded, color: AppColors.blanco, size: 34),
            ),
            const SizedBox(height: 16),
            const Text(
            'Recuperar Contraseña',
            style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.secundario,
                letterSpacing: -0.5,
            ),
            ),
            const SizedBox(height: 6),
            Text(
            _paso == 1
                ? 'Te enviaremos un código a tu correo'
                : 'Ingresa el código y tu nueva contraseña',
            style: const TextStyle(fontSize: 13, color: AppColors.textoSecundario),
            ),
        ],
        );
    }

    Widget _buildStepIndicator() {
        return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
            _StepDot(numero: 1, activo: _paso >= 1, completado: _paso > 1),
            _buildLinea(activo: _paso > 1),
            _StepDot(numero: 2, activo: _paso >= 2, completado: false),
        ],
        );
    }

    Widget _buildLinea({required bool activo}) {
        return Container(
        width: 48,
        height: 2,
        color: activo ? AppColors.primario : AppColors.grisBorde,
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
            if (_paso == 1) ..._buildPaso1(),
            if (_paso == 2) ..._buildPaso2(),
            ],
        ),
        );
    }

    List<Widget> _buildPaso1() => [
            _label('Correo electrónico'),
            const SizedBox(height: 8),
            _campo(
            controller: _correoCtrl,
            hint: 'correo@ejemplo.com',
            icon: Icons.email_outlined,
            tipo: TextInputType.emailAddress,
            ),
            const SizedBox(height: 24),
            _boton(
            texto: _loading ? 'Enviando...' : 'Enviar Código',
            onTap: _loading ? null : _solicitarCodigo,
            ),
        ];

    List<Widget> _buildPaso2() => [
            // Correo como referencia (solo lectura)
            Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: AppColors.grisClaro,
                borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
                children: [
                const Icon(Icons.check_circle_outline_rounded,
                    color: AppColors.exito, size: 18),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(
                    'Código enviado a ${_correoCtrl.text.trim()}',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.texto, fontWeight: FontWeight.w500),
                    ),
                ),
                ],
            ),
            ),
            const SizedBox(height: 20),
            _label('Código de verificación'),
            const SizedBox(height: 8),
            _campo(
            controller: _codigoCtrl,
            hint: '123456',
            icon: Icons.tag_rounded,
            tipo: TextInputType.number,
            centrado: true,
            letterSpacing: 6,
            ),
            const SizedBox(height: 18),
            _label('Nueva contraseña'),
            const SizedBox(height: 8),
            _campo(
            controller: _nuevaCtrl,
            hint: 'Mínimo 6 caracteres',
            icon: Icons.lock_outline_rounded,
            esPassword: true,
            ),
            const SizedBox(height: 18),
            _label('Confirmar contraseña'),
            const SizedBox(height: 8),
            _campo(
            controller: _confirmarCtrl,
            hint: 'Repite tu nueva contraseña',
            icon: Icons.lock_reset_rounded,
            esPassword: true,
            ),
            const SizedBox(height: 24),
            _boton(
            texto: _loading ? 'Actualizando...' : 'Restablecer Contraseña',
            onTap: _loading ? null : _restablecerContrasena,
            ),
            const SizedBox(height: 10),
            TextButton(
            onPressed: () => setState(() => _paso = 1),
            child: const Text(
                '← Volver al paso anterior',
                style: TextStyle(color: AppColors.textoSecundario, fontSize: 13),
            ),
            ),
        ];

    Widget _label(String texto) => Padding(
            padding: const EdgeInsets.only(bottom: 0),
            child: Text(
            texto,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.texto,
            ),
            ),
        );

    Widget _campo({
        required TextEditingController controller,
        required String hint,
        required IconData icon,
        TextInputType tipo = TextInputType.text,
        bool esPassword = false,
        bool centrado = false,
        double letterSpacing = 0,
    }) {
        return TextField(
        controller: controller,
        keyboardType: tipo,
        obscureText: esPassword,
        textAlign: centrado ? TextAlign.center : TextAlign.start,
        style: TextStyle(
            color: AppColors.texto,
            fontSize: 15,
            letterSpacing: letterSpacing,
            fontWeight: centrado ? FontWeight.bold : FontWeight.normal,
        ),
        decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textoClaro, fontSize: 14),
            prefixIcon: Icon(icon, color: AppColors.primario, size: 20),
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
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        );
    }

    Widget _boton({required String texto, required VoidCallback? onTap}) {
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
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: Text(
            texto,
            style: const TextStyle(
                color: AppColors.blanco,
                fontSize: 15,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.3,
            ),
            ),
        ),
        );
    }
    }

    // ── Widget: paso indicador
    class _StepDot extends StatelessWidget {
    final int  numero;
    final bool activo;
    final bool completado;

    const _StepDot({
        required this.numero,
        required this.activo,
        required this.completado,
    });

    @override
    Widget build(BuildContext context) {
        return Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: activo ? AppColors.primario : AppColors.grisBorde,
        ),
        child: Center(
            child: completado
                ? const Icon(Icons.check_rounded, color: Colors.white, size: 16)
                : Text(
                    '$numero',
                    style: TextStyle(
                    color: activo ? Colors.white : AppColors.textoClaro,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    ),
                ),
        ),
        );
    }
}