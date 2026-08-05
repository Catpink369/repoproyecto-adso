import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:provider/provider.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/providers/auth_provider.dart';

class SalidasScreen extends StatefulWidget {
  const SalidasScreen({super.key});

  @override
  State<SalidasScreen> createState() => _SalidasScreenState();
}

class _SalidasScreenState extends State<SalidasScreen> {
  // Product controllers
  final _idController = TextEditingController();
  final _cantidadController = TextEditingController();
  
  // Client controllers
  final _nombreClienteController = TextEditingController();
  final _telClienteController = TextEditingController();
  final _docClienteController = TextEditingController();
  final _correoClienteController = TextEditingController();
  
  // Others
  String _metodoPago = 'efectivo';
  final _obsController = TextEditingController();

  Map<String, dynamic>? productoEncontrado;
  bool cargando = false;
  String? errorMessage;
  String? successMessage;
  bool mostrarResumen = false;

  @override
  void initState() {
    super.initState();
    _cantidadController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _cantidadController.dispose();
    super.dispose();
  }

  double get calcularTotal {
    final qtyStr = _cantidadController.text;
    if (qtyStr.isEmpty || productoEncontrado == null) return 0;
    final qty = int.tryParse(qtyStr) ?? 0;
    final price = double.tryParse(productoEncontrado!['precio_unitario']?.toString() ?? '0') ?? 0;
    return qty * price;
  }

  Future<void> buscarProducto() async {
    final idStr = _idController.text.trim();
    if (idStr.isEmpty) return;

    setState(() {
      cargando = true;
      errorMessage = null;
      successMessage = null;
      productoEncontrado = null;
      mostrarResumen = false;
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

  void validarYMostrarResumen() {
    if (productoEncontrado == null) {
      setState(() { errorMessage = 'Primero valide el producto con el ID y BUSCAR.'; });
      return;
    }
    
    final cantidad = int.tryParse(_cantidadController.text);
    if (cantidad == null || cantidad <= 0) {
      setState(() { errorMessage = 'La cantidad debe ser un número positivo.'; });
      return;
    }
    
    final stockActual = int.tryParse(productoEncontrado!['stock_actual']?.toString() ?? '0') ?? 0;
    if (cantidad > stockActual) {
      setState(() { errorMessage = 'Stock insuficiente. Disponible: $stockActual'; });
      return;
    }
    
    if (_nombreClienteController.text.trim().isEmpty) {
      setState(() { errorMessage = 'El nombre del cliente es obligatorio.'; });
      return;
    }
    
    if (_telClienteController.text.trim().isEmpty) {
      setState(() { errorMessage = 'El teléfono del cliente es obligatorio.'; });
      return;
    }

    setState(() {
      errorMessage = null;
      mostrarResumen = true;
    });
  }

  Future<void> confirmarVenta() async {
    final cantidad = int.tryParse(_cantidadController.text) ?? 0;
    final total = calcularTotal;
    
    final obsExtra = _obsController.text.trim();
    final observacionesCompletas = "VENTA MANUAL - Cliente: ${_nombreClienteController.text.trim()} | Tel: ${_telClienteController.text.trim()} | Total: \$${total.toStringAsFixed(0)} | Pago: ${_metodoPago.toUpperCase()}${obsExtra.isNotEmpty ? ' | Notas: $obsExtra' : ''}";

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final userId = auth.usuario?.idUsuario ?? 'Adm-01';

    setState(() {
      cargando = true;
      errorMessage = null;
    });

    final body = {
      "Cantidad_m": cantidad,
      "observaciones": observacionesCompletas,
      "id_m": "M_S",
      "id_producto": productoEncontrado!['id_producto'],
      "id_usuario": userId,
    };

    try {
      final res = await ApiService.post(AppConstants.crearMovimiento, body);
      if (res.statusCode == 201 || res.statusCode == 200) {
        setState(() { successMessage = '¡Venta registrada exitosamente!'; });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('¡Salida registrada!'), backgroundColor: Colors.green));
        
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) Navigator.pop(context);
        });
      } else {
        final errorData = jsonDecode(res.body);
        setState(() {
          errorMessage = 'Error: ${errorData['message'] ?? res.body}';
          mostrarResumen = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Error de conexión al guardar venta: $e';
        mostrarResumen = false;
      });
    } finally {
      setState(() { cargando = false; });
    }
  }

  void limpiarFormulario() {
    setState(() {
      _idController.clear();
      _cantidadController.clear();
      _nombreClienteController.clear();
      _telClienteController.clear();
      _docClienteController.clear();
      _correoClienteController.clear();
      _obsController.clear();
      _metodoPago = 'efectivo';
      productoEncontrado = null;
      errorMessage = null;
      successMessage = null;
      mostrarResumen = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Venta Manual / Salidas'),
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

            mostrarResumen ? _buildResumen() : _buildFormulario(),
          ],
        ),
      ),
    );
  }

  Widget _buildFormulario() {
    return Column(
      children: [
        // 1. Producto Info
        Container(
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFFDE4EA), // Pinkish similar to React
            borderRadius: BorderRadius.circular(12),
            border: const Border(left: BorderSide(color: Color(0xFFDA819F), width: 4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Información del Producto', style: TextStyle(color: Color(0xFFC06A8A), fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _idController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        hintText: 'ID Producto (Ej: 123)',
                        fillColor: Colors.white,
                        filled: true,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                      ),
                      onSubmitted: (_) => buscarProducto(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: cargando ? null : buscarProducto,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFDA819F),
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('BUSCAR', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
              
              if (productoEncontrado != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(productoEncontrado!['nom_producto'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('Precio: \$${productoEncontrado!['precio_unitario']}', style: const TextStyle(color: Colors.grey)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('Stock', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          Text('${productoEncontrado!['stock_actual']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 18)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _cantidadController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Cantidad a vender *',
                    fillColor: Colors.white,
                    filled: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                  ),
                ),
                if (calcularTotal > 0) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total:', style: TextStyle(fontWeight: FontWeight.w600)),
                        Text('\$${calcularTotal.toStringAsFixed(0)}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.green.shade700)),
                      ],
                    ),
                  )
                ]
              ]
            ],
          ),
        ),

        // 2. Client Info
        Container(
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF8E1), // Yellowish
            borderRadius: BorderRadius.circular(12),
            border: const Border(left: BorderSide(color: Color(0xFFFFD54F), width: 4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Información del Cliente', style: TextStyle(color: Color(0xFFF57F17), fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              TextField(
                controller: _nombreClienteController,
                enabled: productoEncontrado != null,
                decoration: InputDecoration(
                  labelText: 'Nombre Completo *',
                  fillColor: Colors.white,
                  filled: true,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _telClienteController,
                keyboardType: TextInputType.phone,
                enabled: productoEncontrado != null,
                decoration: InputDecoration(
                  labelText: 'Teléfono *',
                  fillColor: Colors.white,
                  filled: true,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _docClienteController,
                      enabled: productoEncontrado != null,
                      decoration: InputDecoration(
                        labelText: 'Documento (Opcional)',
                        fillColor: Colors.white,
                        filled: true,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _correoClienteController,
                      keyboardType: TextInputType.emailAddress,
                      enabled: productoEncontrado != null,
                      decoration: InputDecoration(
                        labelText: 'Correo (Opcional)',
                        fillColor: Colors.white,
                        filled: true,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // 3. Payment
        Container(
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFE8F5E9), // Greenish
            borderRadius: BorderRadius.circular(12),
            border: const Border(left: BorderSide(color: Color(0xFF81C784), width: 4)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Método de Pago', style: TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _metodoPago,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: 'efectivo', child: Text('Efectivo')),
                      DropdownMenuItem(value: 'tarjeta', child: Text('Tarjeta')),
                      DropdownMenuItem(value: 'transferencia', child: Text('Transferencia')),
                      DropdownMenuItem(value: 'nequi', child: Text('Nequi')),
                      DropdownMenuItem(value: 'daviplata', child: Text('DaviPlata')),
                    ],
                    onChanged: productoEncontrado == null ? null : (v) => setState(() => _metodoPago = v!),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _obsController,
                enabled: productoEncontrado != null,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Observaciones Adicionales',
                  fillColor: Colors.white,
                  filled: true,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                ),
              ),
            ],
          ),
        ),

        // 4. Buttons
        Row(
          children: [
            Expanded(
              flex: 1,
              child: OutlinedButton(
                onPressed: cargando ? null : limpiarFormulario,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Limpiar'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: (productoEncontrado == null || cargando) ? null : validarYMostrarResumen,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primario,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('VISTA PREVIA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildResumen() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.grey.withValues(alpha: 0.1), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Confirmación de Venta', textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primario)),
          const Divider(height: 30, thickness: 2),
          
          _buildResumenSeccion('Producto', [
            'Nombre: ${productoEncontrado!['nom_producto']}',
            'Cantidad: ${_cantidadController.text} unidad(es)',
            'Precio Unitario: \$${productoEncontrado!['precio_unitario']}',
          ]),
          
          _buildResumenSeccion('Cliente', [
            'Nombre: ${_nombreClienteController.text}',
            'Teléfono: ${_telClienteController.text}',
            if (_docClienteController.text.isNotEmpty) 'Documento: ${_docClienteController.text}',
            if (_correoClienteController.text.isNotEmpty) 'Correo: ${_correoClienteController.text}',
          ]),
          
          Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('TOTAL:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('\$${calcularTotal.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: Colors.green)),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Método de Pago: ${_metodoPago.toUpperCase()}', style: const TextStyle(fontSize: 14)),
              ],
            ),
          ),
          
          if (_obsController.text.isNotEmpty)
            _buildResumenSeccion('Observaciones', [_obsController.text]),
            
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: cargando ? null : () => setState(() => mostrarResumen = false),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                  child: const Text('Editar'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: cargando ? null : confirmarVenta,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: cargando 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('CONFIRMAR VENTA', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildResumenSeccion(String title, List<String> details) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppColors.primario, fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: details.map((d) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(d, style: const TextStyle(fontSize: 15)),
              )).toList(),
            ),
          )
        ],
      ),
    );
  }
}
