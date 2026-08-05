import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/app_snackbar.dart';
import '../../Shared/providers/auth_provider.dart';

class CambiarContrasenaScreen extends StatefulWidget {
    const CambiarContrasenaScreen({super.key});

    @override
    State<CambiarContrasenaScreen> createState() => _CambiarContrasenaScreenState();
    }

    class _CambiarContrasenaScreenState extends State<CambiarContrasenaScreen> {
    final _actualCtrl    = TextEditingController();
    final _nuevaCtrl     = TextEditingController();
    final _confirmarCtrl = TextEditingController();

    bool _ocultarActual    = true;
    bool _ocultarNueva     = true;
    bool _ocultarConfirmar = true;
    bool _loading          = false;

    @override
    void dispose() {
        _actualCtrl.dispose();
        _nuevaCtrl.dispose();
        _confirmarCtrl.dispose();
        super.dispose();
    }

    Future<void> _cambiarContrasena() async {
        final actual    = _actualCtrl.text.trim();
        final nueva     = _nuevaCtrl.text.trim();
        final confirmar = _confirmarCtrl.text.trim();

        // Validaciones igual que el web
        if (actual.isEmpty || nueva.isEmpty || confirmar.isEmpty) {
        AppSnackBar.warning(context, 'Por favor completa todos los campos.');
        return;
        }
        if (nueva != confirmar) {
        AppSnackBar.error(context, 'Las contraseñas nuevas no coinciden.');
        return;
        }
        if (nueva.length < 8) {
        AppSnackBar.error(context, 'La nueva contraseña debe tener mínimo 8 caracteres.');
        return;
        }
        if (actual == nueva) {
        AppSnackBar.error(context, 'La nueva contraseña debe ser diferente a la actual.');
        return;
        }

        final usuario = context.read<AuthProvider>().usuario;
        if (usuario == null) {
        AppSnackBar.error(context, 'No se encontró la sesión del usuario.');
        return;
        }

        setState(() => _loading = true);

        try {
        final res = await ApiService.patch(
            '${AppConstants.cambiarContrasena}/${usuario.idUsuario}/cambiar-contrasena',
            {'contrasenaActual': actual, 'nuevaContrasena': nueva},
        );

        if (!mounted) return;
        setState(() => _loading = false);

        if (res.statusCode == 200 || res.statusCode == 201) {
            AppSnackBar.success(context, '¡Contraseña actualizada exitosamente!');
            _actualCtrl.clear();
            _nuevaCtrl.clear();
            _confirmarCtrl.clear();
            await Future.delayed(const Duration(seconds: 2));
            if (mounted) Navigator.pop(context);
        } else {
            final data = jsonDecode(res.body);
            final msg  = data['message']?.toString() ?? 'Error al cambiar la contraseña.';
            AppSnackBar.error(context, msg);
        }
        } catch (_) {
        setState(() => _loading = false);
        AppSnackBar.error(context, 'Error de conexión. Intenta de nuevo.');
        }
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
        backgroundColor: const Color(0xFFFAEDF4),
        appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 1,
            automaticallyImplyLeading: false,
            title: Row(
            children: [
                Image.asset('lib/Assest/Logo_GO.jpeg', height: 46,
                    errorBuilder: (_, __, ___) =>
                        const Icon(Icons.storefront, size: 36, color: Color(0xFFC45A77))),
                const Spacer(),
                TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Volver',
                    style: TextStyle(color: Color(0xFFC45A77))),
                ),
            ],
            ),
        ),
        body: Center(
            child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Container(
                width: 380,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 12)
                ],
                ),
                child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                    const Text('Cambiar Contraseña',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 24, fontWeight: FontWeight.bold,
                            color: Color(0xFFb4788b))),
                    const SizedBox(height: 28),

                    _Label('Contraseña actual'),
                    _Campo(controller: _actualCtrl,
                        hint: 'Ingresa tu contraseña actual',
                        ocultar: _ocultarActual,
                        onToggle: () => setState(() => _ocultarActual = !_ocultarActual)),
                    const SizedBox(height: 16),

                    _Label('Nueva contraseña'),
                    _Campo(controller: _nuevaCtrl,
                        hint: 'Mínimo 8 caracteres',
                        ocultar: _ocultarNueva,
                        onToggle: () => setState(() => _ocultarNueva = !_ocultarNueva)),
                    const SizedBox(height: 16),

                    _Label('Confirmar nueva contraseña'),
                    _Campo(controller: _confirmarCtrl,
                        hint: 'Repite la nueva contraseña',
                        ocultar: _ocultarConfirmar,
                        onToggle: () => setState(() => _ocultarConfirmar = !_ocultarConfirmar)),
                    const SizedBox(height: 28),

                    _loading
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFFC45A77)))
                        : ElevatedButton(
                            onPressed: _cambiarContrasena,
                            style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFC45A77),
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18)),
                            ),
                            child: const Text('Cambiar Contraseña',
                                style: TextStyle(color: Colors.white,
                                    fontWeight: FontWeight.bold, fontSize: 15)),
                        ),
                ],
                ),
            ),
            ),
        ),
        );
    }

    Widget _Label(String texto) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Text(texto,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, color: Color(0xFF5A3D54))),
        );

    Widget _Campo({
        required TextEditingController controller,
        required String hint,
        required bool ocultar,
        required VoidCallback onToggle,
    }) =>
        TextField(
            controller: controller,
            obscureText: ocultar,
            decoration: InputDecoration(
            hintText: hint,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(18)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: Color(0xFFD4A9C2), width: 2)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: Color(0xFFC45A77), width: 2)),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            suffixIcon: IconButton(
                icon: Icon(ocultar ? Icons.visibility_off : Icons.visibility,
                    color: Colors.grey),
                onPressed: onToggle,
            ),
            ),
        );
}