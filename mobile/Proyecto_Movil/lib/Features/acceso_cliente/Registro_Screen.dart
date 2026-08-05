import 'package:flutter/material.dart';
import 'dart:convert';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/app_snackbar.dart';

class RegistroScreen extends StatefulWidget {
    const RegistroScreen({super.key});

    @override
    State<RegistroScreen> createState() => _RegistroScreenState();
    }

    class _RegistroScreenState extends State<RegistroScreen> {
    final _formKey = GlobalKey<FormState>();

    final _idController         = TextEditingController();
    final _nom1Controller       = TextEditingController();
    final _nom2Controller       = TextEditingController();
    final _ape1Controller       = TextEditingController();
    final _ape2Controller       = TextEditingController();
    final _correoController     = TextEditingController();
    final _telefonoController   = TextEditingController();
    final _contrasenaController  = TextEditingController();

    String _tipoDoc       = 'CC';
    bool   _loading       = false;
    bool   _verContrasena = false;

    @override
    void dispose() {
        _idController.dispose();
        _nom1Controller.dispose();
        _nom2Controller.dispose();
        _ape1Controller.dispose();
        _ape2Controller.dispose();
        _correoController.dispose();
        _telefonoController.dispose();
        _contrasenaController.dispose();
        super.dispose();
    }

    Future<void> _registrar() async {
        if (!_formKey.currentState!.validate()) return;

        setState(() => _loading = true);
        try {
        final body = {
            'id_usuario': _idController.text.trim(),
            'nom_1': _nom1Controller.text.trim(),
            'nom_2': _nom2Controller.text.trim().isEmpty ? null : _nom2Controller.text.trim(),
            'ape_1': _ape1Controller.text.trim(),
            'ape_2': _ape2Controller.text.trim().isEmpty ? null : _ape2Controller.text.trim(),
            'correo': _correoController.text.trim(),
            'telefono': _telefonoController.text.trim(),
            'contrasena': _contrasenaController.text.trim(),
            't_doc': _tipoDoc,
            'id_rol_usuario': '2',
        };

        final res = await ApiService.postPublic(AppConstants.crearUsuario, body);

        if (!mounted) return;
        setState(() => _loading = false);

        if (res.statusCode == 201 || res.statusCode == 200) {
            AppSnackBar.success(context, '¡Registro exitoso! Ya puedes iniciar sesión.');
            Navigator.pushReplacementNamed(context, '/login');
        } else {
            final data = jsonDecode(res.body);
            final msg  = data['message'];
            final texto = msg is List ? msg.join(', ') : msg.toString();
            AppSnackBar.error(context, texto);
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
            onPressed: () => Navigator.pop(context),
            ),
            title: Image.asset(
            'lib/Assest/Logo_GO.jpeg',
            height: 44,
            errorBuilder: (_, __, ___) =>
                const Icon(Icons.storefront, size: 36, color: AppColors.primario),
            ),
            centerTitle: false,
            actions: [
            TextButton(
                onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                child: const Text(
                'Iniciar sesión',
                style: TextStyle(color: AppColors.primario, fontWeight: FontWeight.w600),
                ),
            ),
            const SizedBox(width: 8),
            ],
        ),
        body: Center(
            child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
            child: Column(
                children: [
                // Header
                Container(
                    width: 68,
                    height: 68,
                    decoration: BoxDecoration(
                    gradient: AppColors.gradientePrimario,
                    shape: BoxShape.circle,
                    boxShadow: AppColors.sombra,
                    ),
                    child: const Icon(Icons.person_add_alt_1_rounded,
                        color: AppColors.blanco, size: 32),
                ),
                const SizedBox(height: 14),
                const Text(
                    'Crear Cuenta',
                    style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secundario,
                    letterSpacing: -0.5,
                    ),
                ),
                const SizedBox(height: 4),
                const Text(
                    'Únete a Gurama Online',
                    style: TextStyle(fontSize: 13, color: AppColors.textoSecundario),
                ),
                const SizedBox(height: 28),

                // Tarjeta formulario
                Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                    color: AppColors.fondoTarjeta,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: AppColors.sombra,
                    ),
                    child: Form(
                    key: _formKey,
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                        // ── Sección: Documento
                        _sectionTitle('Documento de identidad'),
                        const SizedBox(height: 14),
                        _label('Tipo de documento'),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                            value: _tipoDoc,
                            decoration: _inputDeco(icon: Icons.badge_outlined),
                            items: const [
                            DropdownMenuItem(
                                value: 'CC', child: Text('Cédula de Ciudadanía')),
                            DropdownMenuItem(
                                value: 'CE', child: Text('Cédula de Extranjería')),
                            DropdownMenuItem(
                                value: 'TI', child: Text('Tarjeta de Identidad')),
                            ],
                            onChanged: (v) => setState(() => _tipoDoc = v!),
                            dropdownColor: AppColors.blanco,
                            style: const TextStyle(color: AppColors.texto, fontSize: 15),
                        ),
                        const SizedBox(height: 14),
                        _label('Número de documento *'),
                        const SizedBox(height: 8),
                        _campo(
                            controller: _idController,
                            hint: 'Número de documento',
                            icon: Icons.numbers_rounded,
                            tipo: TextInputType.number,
                            validator: (v) => v!.isEmpty ? 'Campo obligatorio' : null,
                        ),

                        // ── Sección: Nombres
                        const SizedBox(height: 22),
                        _sectionTitle('Nombres y apellidos'),
                        const SizedBox(height: 14),
                        Row(
                            children: [
                            Expanded(
                                child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    _label('Primer nombre *'),
                                    const SizedBox(height: 8),
                                    _campo(
                                    controller: _nom1Controller,
                                    hint: 'Primer nombre',
                                    icon: Icons.person_outline_rounded,
                                    validator: (v) =>
                                        v!.isEmpty ? 'Obligatorio' : null,
                                    ),
                                ],
                                ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                                child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    _label('Segundo nombre'),
                                    const SizedBox(height: 8),
                                    _campo(
                                    controller: _nom2Controller,
                                    hint: 'Opcional',
                                    icon: Icons.person_outline_rounded,
                                    ),
                                ],
                                ),
                            ),
                            ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                            children: [
                            Expanded(
                                child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    _label('Primer apellido *'),
                                    const SizedBox(height: 8),
                                    _campo(
                                    controller: _ape1Controller,
                                    hint: 'Primer apellido',
                                    icon: Icons.person_outline_rounded,
                                    validator: (v) =>
                                        v!.isEmpty ? 'Obligatorio' : null,
                                    ),
                                ],
                                ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                                child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                    _label('Segundo apellido'),
                                    const SizedBox(height: 8),
                                    _campo(
                                    controller: _ape2Controller,
                                    hint: 'Opcional',
                                    icon: Icons.person_outline_rounded,
                                    ),
                                ],
                                ),
                            ),
                            ],
                        ),

                        // ── Sección: Contacto
                        const SizedBox(height: 22),
                        _sectionTitle('Información de contacto'),
                        const SizedBox(height: 14),
                        _label('Correo electrónico *'),
                        const SizedBox(height: 8),
                        _campo(
                            controller: _correoController,
                            hint: 'ejemplo@correo.com',
                            icon: Icons.email_outlined,
                            tipo: TextInputType.emailAddress,
                            validator: (v) {
                            if (v!.isEmpty) return 'Campo obligatorio';
                            if (!v.contains('@')) return 'Correo inválido';
                            return null;
                            },
                        ),
                        const SizedBox(height: 14),
                        _label('Teléfono *'),
                        const SizedBox(height: 8),
                        _campo(
                            controller: _telefonoController,
                            hint: 'Número de teléfono',
                            icon: Icons.phone_outlined,
                            tipo: TextInputType.phone,
                            validator: (v) =>
                                v!.isEmpty ? 'Campo obligatorio' : null,
                        ),

                        // ── Sección: Seguridad
                        const SizedBox(height: 22),
                        _sectionTitle('Seguridad'),
                        const SizedBox(height: 14),
                        _label('Contraseña *'),
                        const SizedBox(height: 8),
                        TextFormField(
                            controller: _contrasenaController,
                            obscureText: !_verContrasena,
                            style: const TextStyle(color: AppColors.texto, fontSize: 15),
                            decoration: _inputDeco(
                            icon: Icons.lock_outline_rounded,
                            hint: 'Mínimo 6 caracteres',
                            ).copyWith(
                            suffixIcon: IconButton(
                                icon: Icon(
                                _verContrasena
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                color: AppColors.textoClaro,
                                size: 20,
                                ),
                                onPressed: () =>
                                    setState(() => _verContrasena = !_verContrasena),
                            ),
                            ),
                            validator: (v) {
                            if (v!.isEmpty) return 'Campo obligatorio';
                            if (v.length < 6) return 'Mínimo 6 caracteres';
                            return null;
                            },
                        ),

                        const SizedBox(height: 32),

                        // Botón registrar
                        _loading
                            ? const SizedBox(
                                height: 52,
                                child: Center(
                                    child: CircularProgressIndicator(
                                        color: AppColors.primario, strokeWidth: 2.5),
                                ),
                                )
                            : DecoratedBox(
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
                                    onPressed: _registrar,
                                    style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.transparent,
                                    shadowColor: Colors.transparent,
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 16),
                                    shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14)),
                                    ),
                                    child: const Text(
                                    'Crear Cuenta',
                                    style: TextStyle(
                                        color: AppColors.blanco,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.3,
                                    ),
                                    ),
                                ),
                                ),

                        const SizedBox(height: 16),
                        Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                            const Text(
                                '¿Ya tienes cuenta?',
                                style: TextStyle(
                                    color: AppColors.textoSecundario, fontSize: 13),
                            ),
                            TextButton(
                                onPressed: () =>
                                    Navigator.pushReplacementNamed(context, '/login'),
                                child: const Text(
                                'Inicia sesión',
                                style: TextStyle(
                                    color: AppColors.primario,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                ),
                                ),
                            ),
                            ],
                        ),
                        ],
                    ),
                    ),
                ),
                ],
            ),
            ),
        ),
        );
    }

    Widget _sectionTitle(String texto) {
        return Row(
        children: [
            Container(
            width: 4,
            height: 18,
            decoration: BoxDecoration(
                gradient: AppColors.gradientePrimario,
                borderRadius: BorderRadius.circular(2),
            ),
            ),
            const SizedBox(width: 10),
            Text(
            texto,
            style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppColors.secundario,
                letterSpacing: 0.2,
            ),
            ),
        ],
        );
    }

    Widget _label(String texto) => Padding(
            padding: const EdgeInsets.only(bottom: 0),
            child: Text(
            texto,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.texto,
            ),
            ),
        );

    InputDecoration _inputDeco({IconData? icon, String hint = ''}) =>
        InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textoClaro, fontSize: 14),
            prefixIcon: icon != null
                ? Icon(icon, color: AppColors.primario, size: 20)
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
            errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.error, width: 2),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        );

    Widget _campo({
        required TextEditingController controller,
        required String hint,
        required IconData icon,
        TextInputType tipo = TextInputType.text,
        bool esPassword = false,
        String? Function(String?)? validator,
    }) =>
        TextFormField(
            controller: controller,
            keyboardType: tipo,
            obscureText: esPassword,
            style: const TextStyle(color: AppColors.texto, fontSize: 15),
            decoration: _inputDeco(icon: icon, hint: hint),
            validator: validator,
        );
}