import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:provider/provider.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/providers/auth_provider.dart';

class EntradasScreen extends StatefulWidget {
  const EntradasScreen({super.key});

  @override
  State<EntradasScreen> createState() => _EntradasScreenState();
}

class _EntradasScreenState extends State<EntradasScreen> {
  final _idController = TextEditingController();
  final _cantidadController = TextEditingController();
  final _obsController = TextEditingController();

  Map<String, dynamic>? productoEncontrado;
  bool cargando = false;
  String? errorMessage;
  String? successMessage;

  Future<void> buscarProducto() async {
    final idStr = _idController.text.trim();
    if (idStr.isEmpty) return;

    setState(() {
      cargando = true;
      errorMessage = null;
      successMessage = null;
      productoEncontrado = null;
    });

    try {
      final res = await ApiService.get('${AppConstants.verificarProducto}/$idStr');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['found'] == true) {
          setState(() {
            productoEncontrado = data['product'];
            successMessage = 'Producto encontrado: ${productoEncontrado!['nom_producto']} | Stock: ${productoEncontrado!['stock_actual']}';
          });
        } else {
          setState(() { errorMessage = 'Producto no encontrado o inactivo.'; });
        }
      } else {
        setState(() { errorMessage = 'Error al buscar el producto. (Status: ${res.statusCode})'; });
      }
    } catch (e) {
      setState(() { errorMessage = 'Error de conexión: $e'; });
    } finally {
      setState(() { cargando = false; });
    }
  }

  Future<void> guardarEntrada() async {
    if (productoEncontrado == null) {
      setState(() { errorMessage = 'Primero valide el producto con el ID y BUSCAR.'; });
      return;
    }
    
    final cantidad = int.tryParse(_cantidadController.text);
    if (cantidad == null || cantidad <= 0) {
      setState(() { errorMessage = 'La cantidad debe ser un número positivo.'; });
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final userId = auth.usuario?.idUsuario ?? 'Adm-01';

    setState(() {
      cargando = true;
      errorMessage = null;
      successMessage = null;
    });

    final body = {
      "Cantidad_m": cantidad,
      "observaciones": _obsController.text.trim().isEmpty ? null : _obsController.text.trim(),
      "id_m": "M-E",
      "id_producto": productoEncontrado!['id_producto'],
      "id_usuario": userId,
    };

    try {
      final res = await ApiService.post(AppConstants.crearMovimiento, body);
      if (res.statusCode == 201 || res.statusCode == 200) {
        setState(() { successMessage = '¡Stock actualizado exitosamente!'; });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('¡Entrada registrada!'), backgroundColor: Colors.green));
        
        // Return to the previous screen after a delay
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) Navigator.pop(context);
        });
      } else {
        final errorData = jsonDecode(res.body);
        setState(() { errorMessage = 'Error: ${errorData['message'] ?? res.body}'; });
      }
    } catch (e) {
      setState(() { errorMessage = 'Error de conexión al guardar entrada'; });
    } finally {
      setState(() { cargando = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Entrada de Stock'),
      backgroundColor: AppColors.fondo,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Messages
            if (errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(8)),
                child: Text(errorMessage!, style: TextStyle(color: Colors.red.shade800)),
              ),
            if (successMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(8)),
                child: Text(successMessage!, style: TextStyle(color: Colors.green.shade800)),
              ),

            // Form container
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.blanco,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.grey.withValues(alpha: 0.1), blurRadius: 10)],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ID Producto', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _idController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            hintText: 'Ej: 123',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          ),
                          onSubmitted: (_) => buscarProducto(),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: cargando ? null : buscarProducto,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primario,
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('BUSCAR', style: TextStyle(color: AppColors.blanco)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Read-only Product info
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Producto', style: TextStyle(color: Colors.grey, fontSize: 13)),
                            const SizedBox(height: 4),
                            TextField(
                              readOnly: true,
                              controller: TextEditingController(text: productoEncontrado?['nom_producto'] ?? ''),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: Colors.grey.shade100,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 1,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Stock Actual', style: TextStyle(color: Colors.grey, fontSize: 13)),
                            const SizedBox(height: 4),
                            TextField(
                              readOnly: true,
                              controller: TextEditingController(text: productoEncontrado?['stock_actual']?.toString() ?? ''),
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: Colors.green.shade50,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Quantity
                  const Text('Cantidad a ingresar (+)', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _cantidadController,
                    keyboardType: TextInputType.number,
                    enabled: productoEncontrado != null && !cargando,
                    decoration: InputDecoration(
                      hintText: 'Ej: 50',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: productoEncontrado != null ? Colors.blue : Colors.grey),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Observations
                  const Text('Observaciones', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _obsController,
                    maxLines: 3,
                    enabled: productoEncontrado != null && !cargando,
                    decoration: InputDecoration(
                      hintText: 'Detalles sobre la entrada...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Buttons
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (productoEncontrado == null || cargando) ? null : guardarEntrada,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: cargando 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('SUMAR AL STOCK', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
