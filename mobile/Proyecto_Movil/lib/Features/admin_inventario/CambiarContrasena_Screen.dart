import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/providers/auth_provider.dart';

class CambiarContrasenaAScreen extends StatefulWidget {
  const CambiarContrasenaAScreen({super.key});

  @override
  State<CambiarContrasenaAScreen> createState() => _CambiarContrasenaAScreenState();
}

class _CambiarContrasenaAScreenState extends State<CambiarContrasenaAScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _actualController = TextEditingController();
  final _nuevaController = TextEditingController();
  final _confirmarController = TextEditingController();
  
  bool _ocultarActual = true;
  bool _ocultarNueva = true;
  bool _ocultarConfirmar = true;
  
  bool _cargando = false;

  Future<void> _CambiarContrasenaA() async {
    if (!_formKey.currentState!.validate()) return;

    if (_nuevaController.text != _confirmarController.text) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Las nuevas contraseñas no coinciden'), backgroundColor: Colors.red));
      return;
    }

    setState(() => _cargando = true);

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final idUsuario = auth.usuario?.idUsuario;

    if (idUsuario == null) {
      setState(() => _cargando = false);
      return;
    }

    final body = {
      "contrasenaActual": _actualController.text,
      "nuevaContrasena": _nuevaController.text,
    };

    try {
      final res = await ApiService.patch('${AppConstants.actualizarUsuario}/$idUsuario/cambiar-contrasena', body);
      
      if (res.statusCode == 200) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('¡Contraseña actualizada exitosamente!'), backgroundColor: Colors.green));
        Navigator.pop(context);
      } else {
        final errorData = jsonDecode(res.body);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${errorData['message'] ?? res.body}'), backgroundColor: Colors.red));
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error de conexión: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Cambiar Contraseña'),
      backgroundColor: AppColors.fondo,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.blanco,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [BoxShadow(color: Colors.grey.withValues(alpha: 0.1), blurRadius: 10)],
          ),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildPasswordField(
                  'Contraseña actual *', 
                  _actualController, 
                  _ocultarActual, 
                  () => setState(() => _ocultarActual = !_ocultarActual)
                ),
                _buildPasswordField(
                  'Nueva contraseña *', 
                  _nuevaController, 
                  _ocultarNueva, 
                  () => setState(() => _ocultarNueva = !_ocultarNueva),
                  minLength: 8
                ),
                _buildPasswordField(
                  'Confirmar nueva contraseña *', 
                  _confirmarController, 
                  _ocultarConfirmar, 
                  () => setState(() => _ocultarConfirmar = !_ocultarConfirmar),
                  matchController: _nuevaController
                ),
                
                const SizedBox(height: 30),

                ElevatedButton(
                  onPressed: _cargando ? null : _CambiarContrasenaA,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primario,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _cargando 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Guardar', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: _cargando ? null : () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Cancelar'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordField(String label, TextEditingController controller, bool isObscured, VoidCallback toggleVisibility, {int minLength = 0, TextEditingController? matchController}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextFormField(
            controller: controller,
            obscureText: isObscured,
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              suffixIcon: IconButton(
                icon: Icon(isObscured ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                onPressed: toggleVisibility,
              ),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Este campo es obligatorio';
              }
              if (minLength > 0 && value.length < minLength) {
                return 'Debe tener al menos $minLength caracteres';
              }
              if (matchController != null && value != matchController.text) {
                return 'Las contraseñas no coinciden';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}
