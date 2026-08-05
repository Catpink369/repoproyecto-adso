import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/app_snackbar.dart';
import '../../Shared/providers/auth_provider.dart';
import '../../Data/models/usuario_model.dart';

class CambiarDatosScreen extends StatefulWidget {
    const CambiarDatosScreen({super.key});

    @override
    State<CambiarDatosScreen> createState() => _CambiarDatosScreenState();
    }

    class _CambiarDatosScreenState extends State<CambiarDatosScreen> {
    final _nom1Ctrl     = TextEditingController();
    final _nom2Ctrl     = TextEditingController();
    final _ape1Ctrl     = TextEditingController();
    final _ape2Ctrl     = TextEditingController();
    final _correoCtrl   = TextEditingController();
    final _telefonoCtrl = TextEditingController();

    bool _loading = false;
    UsuarioModel? _usuario;

    @override
    void initState() {
        super.initState();
        _usuario = context.read<AuthProvider>().usuario;
        if (_usuario != null) {
        _nom1Ctrl.text     = _usuario!.nom1;
        _nom2Ctrl.text     = _usuario!.nom2 ?? '';
        _ape1Ctrl.text     = _usuario!.ape1;
        _ape2Ctrl.text     = _usuario!.ape2 ?? '';
        _correoCtrl.text   = _usuario!.correo;
        _telefonoCtrl.text = _usuario!.telefono ?? '';
        }
    }

    @override
    void dispose() {
        _nom1Ctrl.dispose();  _nom2Ctrl.dispose();
        _ape1Ctrl.dispose();  _ape2Ctrl.dispose();
        _correoCtrl.dispose(); _telefonoCtrl.dispose();
        super.dispose();
    }

    Future<void> _guardar() async {
        if (_usuario == null) return;

        if (_nom1Ctrl.text.trim().isEmpty || _ape1Ctrl.text.trim().isEmpty ||
            _correoCtrl.text.trim().isEmpty || _telefonoCtrl.text.trim().isEmpty) {
        AppSnackBar.warning(context, 'Los campos obligatorios no pueden estar vacíos.');
        return;
        }

        setState(() => _loading = true);

        try {
        final body = {
            'nom_1':    _nom1Ctrl.text.trim(),
            'nom_2':    _nom2Ctrl.text.trim().isEmpty ? null : _nom2Ctrl.text.trim(),
            'ape_1':    _ape1Ctrl.text.trim(),
            'ape_2':    _ape2Ctrl.text.trim().isEmpty ? null : _ape2Ctrl.text.trim(),
            'correo':   _correoCtrl.text.trim(),
            'telefono': _telefonoCtrl.text.trim(),
        };

        final res = await ApiService.patch(
            '${AppConstants.actualizarUsuario}/${_usuario!.idUsuario}',
            body,
        );

        if (!mounted) return;
        setState(() => _loading = false);

        if (res.statusCode == 200 || res.statusCode == 201) {
            // Actualizar provider con los nuevos datos
            final data = jsonDecode(res.body) as Map<String, dynamic>;
            context.read<AuthProvider>().setUsuario(data);
            AppSnackBar.success(context, '¡Datos actualizados correctamente!');
            await Future.delayed(const Duration(seconds: 1));
            if (mounted) Navigator.pop(context);
        } else {
            final data = jsonDecode(res.body);
            AppSnackBar.error(context, data['message']?.toString() ?? 'Error al actualizar.');
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
                width: 500,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 12)
                ],
                ),
                child: Column(
                children: [
                    // Título estilo tu compañero
                    Container(
                    padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                    decoration: BoxDecoration(
                        color: const Color(0xFF7B395C),
                        borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Text('Cambiar datos',
                        style: TextStyle(color: Colors.white, fontSize: 22,
                            fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 28),

                    _Campo('Primer nombre *', _nom1Ctrl),
                    const SizedBox(height: 16),
                    _Campo('Segundo nombre', _nom2Ctrl),
                    const SizedBox(height: 16),
                    _Campo('Primer apellido *', _ape1Ctrl),
                    const SizedBox(height: 16),
                    _Campo('Segundo apellido', _ape2Ctrl),
                    const SizedBox(height: 16),
                    _Campo('Correo electrónico *', _correoCtrl,
                        tipo: TextInputType.emailAddress),
                    const SizedBox(height: 16),
                    _Campo('Teléfono *', _telefonoCtrl,
                        tipo: TextInputType.phone),
                    const SizedBox(height: 16),

                    // Tipo doc y documento — solo lectura
                    Row(
                    children: [
                        Expanded(
                        child: _Campo('Tipo documento', 
                            TextEditingController(text: _usuario?.tDoc ?? 'CC'),
                            enabled: false),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                        child: _Campo('Documento',
                            TextEditingController(text: _usuario?.idUsuario ?? ''),
                            enabled: false),
                        ),
                    ],
                    ),
                    const SizedBox(height: 28),

                    _loading
                        ? const CircularProgressIndicator(color: Color(0xFFC45A77))
                        : SizedBox(
                            width: 220,
                            child: ElevatedButton(
                            onPressed: _guardar,
                            style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF7B395C),
                                padding: const EdgeInsets.symmetric(vertical: 15),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(30)),
                            ),
                            child: const Text('Guardar',
                                style: TextStyle(fontSize: 16, color: Colors.white,
                                    fontWeight: FontWeight.bold)),
                            ),
                        ),
                ],
                ),
            ),
            ),
        ),
        );
    }

    Widget _Campo(String label, TextEditingController ctrl,
        {TextInputType tipo = TextInputType.text, bool enabled = true}) =>
        TextField(
            controller: ctrl,
            keyboardType: tipo,
            enabled: enabled,
            decoration: InputDecoration(
            labelText: label,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: const BorderSide(color: Color(0xFFD2A1BA), width: 2)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: const BorderSide(color: Color(0xFF7B395C), width: 2)),
            disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 1)),
            ),
        );
}