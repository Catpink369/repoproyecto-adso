import 'dart:convert';
import 'package:flutter/material.dart';

import '../../Data/models/usuario_model.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/AdminSidebar.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/services/api_service.dart';

class MovimientosScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const MovimientosScreen({super.key, required this.usuario});

  @override
  State<MovimientosScreen> createState() => _MovimientosScreenState();
}

class _MovimientosScreenState extends State<MovimientosScreen> {
  bool cargando = true;
  String? error;
  List movimientos = [];
  String filtro = 'todos';
  String busqueda = '';
  final TextEditingController busquedaController = TextEditingController();

  @override
  void initState() {
    super.initState();
    cargarMovimientos();
  }

  Future<void> cargarMovimientos() async {
    try {
      setState(() { cargando = true; error = null; });

      final res = await ApiService.get(AppConstants.obtenerMovimientos);

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        movimientos = data is List ? data : data['data'] ?? [];
      }

      setState(() { cargando = false; });
    } catch (e) {
      setState(() { cargando = false; error = 'Error de conexión'; });
    }
  }

  List get movimientosFiltrados {
    return movimientos.where((m) {
      final coincideFiltro = filtro == 'todos' ||
          (filtro == 'entradas' && m['tipo'] == 'entrada') ||
          (filtro == 'salidas' && m['tipo'] == 'salida');
      final coincideBusqueda = busqueda.isEmpty ||
          (m['nom_producto'] ?? '').toLowerCase().contains(busqueda.toLowerCase()) ||
          (m['nombre_usuario'] ?? '').toLowerCase().contains(busqueda.toLowerCase());
      return coincideFiltro && coincideBusqueda;
    }).toList();
  }

  String formatearFecha(String? fecha) {
    if (fecha == null) return 'N/A';
    final date = DateTime.tryParse(fecha);
    if (date == null) return fecha;
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Movimientos'),
      drawer: AdminSidebar(usuario: widget.usuario),
      backgroundColor: AppColors.fondo,
      body: Column(
        children: [
          // Accesos rápidos
          Container(
            color: AppColors.blanco,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/entradas'),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.add_circle, color: Colors.green.shade700, size: 32),
                          const SizedBox(height: 8),
                          Text('Entradas', style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/salidas'),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.remove_circle, color: Colors.red.shade700, size: 32),
                          const SizedBox(height: 8),
                          Text('Salidas', style: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Búsqueda y filtros
          Container(
            color: AppColors.blanco,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Column(
              children: [
                TextField(
                  controller: busquedaController,
                  onChanged: (v) => setState(() => busqueda = v),
                  decoration: InputDecoration(
                    hintText: 'Buscar por producto o usuario...',
                    prefixIcon: const Icon(Icons.search, color: AppColors.primario),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: ['todos', 'entradas', 'salidas'].map((f) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => filtro = f),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: filtro == f ? AppColors.primario : AppColors.fondo,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.suave),
                        ),
                        child: Text(
                          f[0].toUpperCase() + f.substring(1),
                          style: TextStyle(
                            color: filtro == f ? AppColors.blanco : AppColors.texto,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  )).toList(),
                ),
              ],
            ),
          ),

          // Lista
          Expanded(
            child: cargando
                ? Center(child: CircularProgressIndicator(color: AppColors.primario))
                : error != null
                ? Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(error!, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 16),
                ElevatedButton(onPressed: cargarMovimientos, child: const Text('Reintentar')),
              ],
            ))
                : movimientosFiltrados.isEmpty
                ? Center(child: Text('No hay movimientos', style: TextStyle(color: Colors.grey)))
                : RefreshIndicator(
              onRefresh: cargarMovimientos,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: movimientosFiltrados.length,
                itemBuilder: (context, i) {
                  final m = movimientosFiltrados[i];
                  final esEntrada = m['tipo'] == 'entrada';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: AppColors.blanco,
                      borderRadius: BorderRadius.circular(10),
                      border: Border(
                        left: BorderSide(
                          color: esEntrada ? Colors.green : Colors.red,
                          width: 4,
                        ),
                      ),
                      boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 4)],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    esEntrada ? Icons.arrow_upward : Icons.arrow_downward,
                                    color: esEntrada ? Colors.green : Colors.red,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    esEntrada ? 'Entrada' : 'Salida',
                                    style: TextStyle(
                                      color: esEntrada ? Colors.green : Colors.red,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                '#${m['id_movimiento']}',
                                style: const TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text('${m['nom_producto'] ?? 'Sin nombre'}',
                              style: const TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Cantidad: ${m['Cantidad_m']}',
                                  style: TextStyle(
                                    color: esEntrada ? Colors.green.shade700 : Colors.red.shade700,
                                    fontWeight: FontWeight.bold,
                                  )),
                              Text(formatearFecha(m['fecha_m']),
                                  style: const TextStyle(fontSize: 11, color: Colors.grey)),
                            ],
                          ),
                          if (m['nombre_usuario'] != null) ...[
                            const SizedBox(height: 4),
                            Text('Usuario: ${m['nombre_usuario']}',
                                style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                          if (m['observaciones'] != null) ...[
                            const SizedBox(height: 4),
                            Text('${m['observaciones']}',
                                style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}