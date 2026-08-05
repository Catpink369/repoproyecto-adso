import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/providers/auth_provider.dart';

class CambiarDatosAScreen extends StatefulWidget {
  const CambiarDatosAScreen({super.key});

  @override
  State<CambiarDatosAScreen> createState() => _CambiarDatosAScreenState();
}

class _CambiarDatosAScreenState extends State<CambiarDatosAScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _nom1Controller = TextEditingController();
  final _nom2Controller = TextEditingController();
  final _ape1Controller = TextEditingController();
  final _ape2Controller = TextEditingController();
  final _correoController = TextEditingController();
  final _telController = TextEditingController();
  
  String _tipoDoc = 'CC';
  String _idUsuario = '';
  
  bool _cargando = false;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final u = auth.usuario;
    if (u != null) {
      _nom1Controller.text = u.nom1;
      _nom2Controller.text = u.nom2 ?? '';
      _ape1Controller.text = u.ape1;
      _ape2Controller.text = u.ape2 ?? '';
      _correoController.text = u.correo;
      _telController.text = u.telefono ?? '';
      _tipoDoc = u.tDoc ?? 'CC';
      _idUsuario = u.idUsuario;
    }
  }

  Future<void> _guardarDatos() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _cargando = true);

    final body = {
      "nom_1": _nom1Controller.text.trim(),
      "nom_2": _nom2Controller.text.trim().isEmpty ? null : _nom2Controller.text.trim(),
      "ape_1": _ape1Controller.text.trim(),
      "ape_2": _ape2Controller.text.trim().isEmpty ? null : _ape2Controller.text.trim(),
      "correo": _correoController.text.trim(),
      "telefono": _telController.text.trim(),
      "t_doc": _tipoDoc,
    };

    try {
      final res = await ApiService.patch('${AppConstants.actualizarUsuario}/$_idUsuario', body);
      
      if (res.statusCode == 200) {
        // Update local provider
        final auth = Provider.of<AuthProvider>(context, listen: false);
        final data = jsonDecode(res.body);
        auth.setUsuario(data);
        
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('¡Datos actualizados exitosamente!'), backgroundColor: Colors.green));
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
      appBar: CustomAppBar(title: 'Cambiar Datos'),
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
                _buildTextField('Primer nombre *', _nom1Controller, required: true),
                _buildTextField('Segundo nombre (Opcional)', _nom2Controller),
                _buildTextField('Primer apellido *', _ape1Controller, required: true),
                _buildTextField('Segundo apellido (Opcional)', _ape2Controller),
                _buildTextField('Correo electrónico *', _correoController, required: true, isEmail: true),
                _buildTextField('Número telefónico *', _telController, required: true, isPhone: true),
                
                const Padding(
                  padding: EdgeInsets.only(bottom: 8.0, top: 8.0),
                  child: Text('Tipo de documento', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                DropdownButtonFormField<String>(
                  value: _tipoDoc,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'CC', child: Text('Cédula de Ciudadanía')),
                    DropdownMenuItem(value: 'TI', child: Text('Tarjeta de Identidad')),
                    DropdownMenuItem(value: 'CE', child: Text('Cédula de Extranjería')),
                  ],
                  onChanged: (v) => setState(() => _tipoDoc = v!),
                ),
                
                const SizedBox(height: 16),
                const Padding(
                  padding: EdgeInsets.only(bottom: 8.0),
                  child: Text('Número de documento', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                TextField(
                  controller: TextEditingController(text: _idUsuario),
                  readOnly: true,
                  decoration: InputDecoration(
                    fillColor: Colors.grey.shade200,
                    filled: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 30),

                ElevatedButton(
                  onPressed: _cargando ? null : _guardarDatos,
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

  Widget _buildTextField(String label, TextEditingController controller, {bool required = false, bool isEmail = false, bool isPhone = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextFormField(
            controller: controller,
            keyboardType: isEmail ? TextInputType.emailAddress : isPhone ? TextInputType.phone : TextInputType.text,
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
            validator: (value) {
              if (required && (value == null || value.trim().isEmpty)) {
                return 'Este campo es obligatorio';
              }
              if (isEmail && value != null && !value.contains('@')) {
                return 'Ingrese un correo válido';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}
