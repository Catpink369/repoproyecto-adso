import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../Data/models/usuario_model.dart';
import '../../Data/models/producto_model.dart';
import '../../Shared/providers/producto_provider.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/AdminSidebar.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/services/api_service.dart';


class ProductosScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const ProductosScreen({super.key, required this.usuario});

  @override
  State<ProductosScreen> createState() => _ProductosScreenState();
}

class _ProductosScreenState extends State<ProductosScreen> {
  String busqueda = '';
  final TextEditingController busquedaController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductoProvider>().cargarProductos();
    });
  }

  Future<void> _cambiarEstadoProducto(ProductoModel p) async {
    final accion = p.estado ? 'desactivar' : 'activar';
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(p.estado ? 'Desactivar producto' : 'Activar producto'),
        content: Text('¿Seguro que deseas $accion "${p.nomProducto}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: p.estado ? Colors.red : Colors.green,
            ),
            onPressed: () => Navigator.pop(context, true),
            child: Text(p.estado ? 'Desactivar' : 'Activar'),
          ),
        ],
      ),
    ) ?? false;

    if (!confirmar) return;

    try {
      final res = await ApiService.patch(
        '${AppConstants.obtenerProductos}/${p.idProducto}',
        {'estado': !p.estado},
      );
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        Navigator.pop(context); // cierra el modal de detalle
        context.read<ProductoProvider>().cargarProductos();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error al cambiar el estado')),
        );
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error de conexión')),
      );
    }
  }

  void _mostrarDetalleProducto(BuildContext context, ProductoModel p) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.4,
        expand: false,
        builder: (_, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40, height: 4,
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                if (p.rutaImagen != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: '${AppConstants.baseUrl}${p.rutaImagen}',
                      httpHeaders: ApiService.headers,
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        height: 200,
                        color: AppColors.fondo,
                        child: Center(
                          child: CircularProgressIndicator(color: AppColors.primario),
                        ),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        height: 200,
                        color: AppColors.fondo,
                        child: const Icon(Icons.image_not_supported, size: 60, color: Colors.grey),
                      ),
                    ),
                  )
                else
                  Container(
                    height: 200,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.fondo,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.inventory, size: 60, color: AppColors.primario),
                  ),
                const SizedBox(height: 16),
                // Botones editar / activar-desactivar
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primario),
                        icon: const Icon(Icons.edit, color: AppColors.blanco),
                        label: const Text('Editar', style: TextStyle(color: AppColors.blanco)),
                        onPressed: () {
                          Navigator.pop(context); // cierra el modal
                          Navigator.pushNamed(
                            context,
                            '/admin/editar-producto',
                            arguments: {'producto': p, 'usuario': widget.usuario},
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: p.estado ? Colors.red.shade400 : Colors.green.shade600,
                        ),
                        icon: Icon(
                          p.estado ? Icons.block : Icons.check_circle,
                          color: Colors.white,
                        ),
                        label: Text(
                          p.estado ? 'Desactivar' : 'Activar',
                          style: const TextStyle(color: Colors.white),
                        ),
                        onPressed: () => _cambiarEstadoProducto(p),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        p.nomProducto,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.secundario,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: p.estado ? Colors.green.shade100 : Colors.red.shade100,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        p.estado ? 'Activo' : 'Inactivo',
                        style: TextStyle(
                          color: p.estado ? Colors.green.shade700 : Colors.red.shade700,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 8),
                _DetalleItem(label: 'ID Producto', valor: '${p.idProducto}'),
                _DetalleItem(label: 'Precio unitario', valor: '\$${p.precioUnitario.toStringAsFixed(2)}'),
                _DetalleItem(
                  label: 'Stock actual',
                  valor: '${p.stockActual}',
                  color: p.stockActual <= p.stockMinimo ? Colors.red : Colors.green,
                ),
                _DetalleItem(label: 'Stock mínimo', valor: '${p.stockMinimo}'),
                if (p.descripcion != null && p.descripcion!.isNotEmpty)
                  _DetalleItem(label: 'Descripción', valor: p.descripcion!),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ProductoProvider>();

    final List<ProductoModel> productosFiltrados = provider.productos.where((p) {
      return busqueda.isEmpty ||
          p.nomProducto.toLowerCase().contains(busqueda.toLowerCase());
    }).toList();

    return Scaffold(
      appBar: CustomAppBar(title: 'Productos'),
      drawer: AdminSidebar(usuario: widget.usuario),
      backgroundColor: AppColors.fondo,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primario,
        onPressed: () {
          Navigator.pushNamed(
            context,
            '/admin/registro-producto',
            arguments: widget.usuario,
          );
        },
        child: const Icon(Icons.add, color: AppColors.blanco),
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.blanco,
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: busquedaController,
              onChanged: (v) => setState(() => busqueda = v),
              decoration: InputDecoration(
                hintText: 'Buscar producto...',
                prefixIcon: const Icon(Icons.search, color: AppColors.primario),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
          ),
          if (!provider.cargando)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Mostrando ${productosFiltrados.length} de ${provider.productos.length} productos',
                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                ),
              ),
            ),
          Expanded(
            child: provider.cargando
                ? Center(child: CircularProgressIndicator(color: AppColors.primario))
                : provider.error != null
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(provider.error!, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<ProductoProvider>().cargarProductos(),
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            )
                : productosFiltrados.isEmpty
                ? const Center(
              child: Text('No hay productos', style: TextStyle(color: Colors.grey)),
            )
                : RefreshIndicator(
              onRefresh: () => context.read<ProductoProvider>().cargarProductos(),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: productosFiltrados.length,
                itemBuilder: (context, i) {
                  final p = productosFiltrados[i];
                  final stockBajo = p.stockActual <= p.stockMinimo;

                  return GestureDetector(
                    onTap: () => _mostrarDetalleProducto(context, p),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: BoxDecoration(
                        color: AppColors.blanco,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withValues(alpha: 0.1),
                            blurRadius: 4,
                          )
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Container(
                              width: 60, height: 60,
                              decoration: BoxDecoration(
                                color: AppColors.fondo,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: p.rutaImagen != null
                                  ? ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: CachedNetworkImage(
                                  imageUrl: '${AppConstants.baseUrl}${p.rutaImagen}',
                                  httpHeaders: ApiService.headers,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Center(
                                    child: CircularProgressIndicator(
                                      color: AppColors.primario,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  errorWidget: (context, url, error) => const Icon(
                                    Icons.image_not_supported,
                                    color: Colors.grey,
                                  ),
                                ),
                              )
                                  : const Icon(Icons.inventory, color: AppColors.primario),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p.nomProducto,
                                      style: const TextStyle(fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 4),
                                  Text('Precio: \$${p.precioUnitario.toStringAsFixed(2)}',
                                      style: const TextStyle(fontSize: 13, color: Colors.grey)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: stockBajo ? Colors.red.shade100 : Colors.green.shade100,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          'Stock: ${p.stockActual}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: stockBajo ? Colors.red.shade700 : Colors.green.shade700,
                                          ),
                                        ),
                                      ),
                                      if (stockBajo) ...[
                                        const SizedBox(width: 6),
                                        const Icon(Icons.warning, color: Colors.orange, size: 16),
                                      ],
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: p.estado ? Colors.green.shade100 : Colors.red.shade100,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                p.estado ? 'Activo' : 'Inactivo',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: p.estado ? Colors.green.shade700 : Colors.red.shade700,
                                ),
                              ),
                            ),
                          ],
                        ),
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

class _DetalleItem extends StatelessWidget {
  final String label;
  final String valor;
  final Color? color;

  const _DetalleItem({required this.label, required this.valor, this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ),
          Expanded(
            child: Text(
              valor,
              style: TextStyle(fontWeight: FontWeight.w600, color: color ?? AppColors.texto),
            ),
          ),
        ],
      ),
    );
  }
}