import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';

import '../../Data/models/usuario_model.dart';
import '../../Data/models/material_model.dart';
import '../../Shared/providers/material_provider.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/AdminSidebar.dart';
import '../../Shared/constants/app_colors.dart';


class MaterialesScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const MaterialesScreen({super.key, required this.usuario});

  @override
  State<MaterialesScreen> createState() => _MaterialesScreenState();
}

class _MaterialesScreenState extends State<MaterialesScreen> {
  String _filtro = 'Todos';
  String _busqueda = '';
  final List<String> _tipos = ['Todos', 'Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MaterialProvider>().cargarMateriales();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Gestión de Materiales'),
      drawer: AdminSidebar(usuario: widget.usuario),
      backgroundColor: AppColors.fondo,
      body: Column(
        children: [
          _buildStats(),
          _buildFiltros(),
          Expanded(child: _buildLista()),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primario,
        onPressed: () => _mostrarFormulario(context),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildStats() {
    return Consumer<MaterialProvider>(
      builder: (context, provider, _) {
        final total = provider.materiales.length;
        final bajoStock = provider.materiales.where((m) => m.stockActual <= m.stockMinimo).length;

        return Container(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              _statCard('Total', total.toString(), AppColors.primario),
              const SizedBox(width: 12),
              _statCard('Stock Bajo', bajoStock.toString(), AppColors.error),
            ],
          ),
        );
      },
    );
  }

  Widget _statCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
            Text(value, style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }

  Widget _buildFiltros() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          TextField(
            onChanged: (v) => setState(() => _busqueda = v),
            decoration: InputDecoration(
              hintText: 'Buscar material...',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _tipos.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final t = _tipos[i];
                final selected = _filtro == t;
                return ChoiceChip(
                  label: Text(t),
                  selected: selected,
                  selectedColor: AppColors.primario,
                  labelStyle: TextStyle(color: selected ? Colors.white : AppColors.texto),
                  onSelected: (v) => setState(() => _filtro = t),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLista() {
    return Consumer<MaterialProvider>(
      builder: (context, provider, _) {
        if (provider.cargando) return const Center(child: CircularProgressIndicator(color: AppColors.primario));

        final lista = provider.materiales.where((m) {
          final matchesBusqueda = m.nombre.toLowerCase().contains(_busqueda.toLowerCase());
          final matchesFiltro = _filtro == 'Todos' || m.tipo == _filtro;
          return matchesBusqueda && matchesFiltro;
        }).toList();

        if (lista.isEmpty) return const Center(child: Text('No se encontraron materiales'));

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: lista.length,
          itemBuilder: (context, i) => _MaterialCard(
            material: lista[i],
            onTap: () => _mostrarDetalle(context, lista[i]),
          ),
        );
      },
    );
  }

  // ── Detalle del material (reemplaza el botón de editar suelto) ──
  void _mostrarDetalle(BuildContext context, MaterialModel material) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MaterialDetalle(
        material: material,
        onEditar: () {
          Navigator.pop(context); // cierra el detalle
          _mostrarFormulario(context, material: material);
        },
      ),
    );
  }

  void _mostrarFormulario(BuildContext context, {MaterialModel? material}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _MaterialForm(material: material),
    );
  }
}

// ── Tarjeta de material: tappable, sin botón suelto (overflow corregido) ──
class _MaterialCard extends StatelessWidget {
  final MaterialModel material;
  final VoidCallback onTap;
  const _MaterialCard({required this.material, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final stockBajo = material.stockActual <= material.stockMinimo;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(15),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: material.rutaImagen != null
                    ? Image.network(material.imagenUrl,
                        width: 60, height: 60, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _noImage())
                    : _noImage(),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(material.nombre,
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.texto),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text('${material.tipo} • ${material.unidad}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textoClaro)),
                    const SizedBox(height: 4),
                    Text(
                      'Stock: ${material.stockActual} ${material.unidad}s',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: stockBajo ? AppColors.error : AppColors.exito,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${material.precioUnitario.toStringAsFixed(0)}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.primario),
                  ),
                  const SizedBox(height: 4),
                  const Icon(Icons.chevron_right_rounded, color: Colors.grey, size: 20),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _noImage() =>
      Container(width: 60, height: 60, color: Colors.grey[200], child: const Icon(Icons.inventory, color: Colors.grey));
}

// ── BottomSheet de detalle del material ──
class _MaterialDetalle extends StatelessWidget {
  final MaterialModel material;
  final VoidCallback onEditar;
  const _MaterialDetalle({required this.material, required this.onEditar});

  @override
  Widget build(BuildContext context) {
    final stockBajo = material.stockActual <= material.stockMinimo;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(20, 14, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle
            Center(
              child: Container(
                width: 40, height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                    color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
              ),
            ),

            // Imagen
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: material.rutaImagen != null
                  ? Image.network(
                      material.imagenUrl,
                      width: double.infinity, height: 180, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _placeholder(),
                    )
                  : _placeholder(),
            ),
            const SizedBox(height: 16),

            Text(material.nombre,
                style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: AppColors.texto)),
            const SizedBox(height: 4),
            Text('${material.tipo} • ${material.unidad}',
                style: const TextStyle(fontSize: 13, color: AppColors.textoClaro)),
            const SizedBox(height: 16),

            // Datos en grid 2 columnas
            Row(
              children: [
                Expanded(
                  child: _dato('Precio unitario', '\$${material.precioUnitario.toStringAsFixed(0)}',
                      AppColors.primario),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _dato('Stock actual', '${material.stockActual} ${material.unidad}s',
                      stockBajo ? AppColors.error : AppColors.exito),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _dato('Stock mínimo', '${material.stockMinimo} ${material.unidad}s',
                      AppColors.texto),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _dato('Estado', stockBajo ? 'Stock bajo' : 'Disponible',
                      stockBajo ? AppColors.error : AppColors.exito),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Acciones — solo Editar por ahora (Eliminar pendiente de backend)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onEditar,
                icon: const Icon(Icons.edit, color: Colors.white, size: 18),
                label: const Text('Editar material', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primario,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.grey),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Cerrar', style: TextStyle(color: Colors.grey)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dato(String label, String valor, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textoClaro)),
          const SizedBox(height: 4),
          Text(valor,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: color),
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _placeholder() => Container(
        width: double.infinity, height: 180,
        color: Colors.grey[200],
        child: const Icon(Icons.inventory, color: Colors.grey, size: 48),
      );
}

// ── Formulario de crear/editar material ──
class _MaterialForm extends StatefulWidget {
  final MaterialModel? material;
  const _MaterialForm({this.material});

  @override
  State<_MaterialForm> createState() => _MaterialFormState();
}

class _MaterialFormState extends State<_MaterialForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nombreCtrl;
  late TextEditingController _precioCtrl;
  late TextEditingController _stockActualCtrl;
  late TextEditingController _stockMinimoCtrl;
  String _tipo = 'Tela';
  String _unidad = 'metro';
  File? _imagen;

  bool get _esNuevo => widget.material == null;

  @override
  void initState() {
    super.initState();
    _nombreCtrl = TextEditingController(text: widget.material?.nombre ?? '');
    _precioCtrl = TextEditingController(text: widget.material?.precioUnitario.toString() ?? '');
    _stockActualCtrl = TextEditingController(text: widget.material?.stockActual.toString() ?? '');
    _stockMinimoCtrl = TextEditingController(text: widget.material?.stockMinimo.toString() ?? '5');
    if (widget.material != null) {
      _tipo = widget.material!.tipo;
      _unidad = widget.material!.unidad;
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked != null) setState(() => _imagen = File(picked.path));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_esNuevo ? 'Registrar Material' : 'Editar Material',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              TextFormField(
                  controller: _nombreCtrl,
                  decoration: const InputDecoration(labelText: 'Nombre'),
                  validator: (v) => v!.isEmpty ? 'Requerido' : null),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _tipo,
                      items: ['Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio']
                          .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                          .toList(),
                      onChanged: (v) => setState(() => _tipo = v!),
                      decoration: const InputDecoration(labelText: 'Tipo'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _unidad,
                      items: ['metro', 'unidad']
                          .map((u) => DropdownMenuItem(value: u, child: Text(u)))
                          .toList(),
                      onChanged: (v) => setState(() => _unidad = v!),
                      decoration: const InputDecoration(labelText: 'Unidad'),
                    ),
                  ),
                ],
              ),
              TextFormField(
                  controller: _precioCtrl,
                  decoration: const InputDecoration(labelText: 'Precio Unitario'),
                  keyboardType: TextInputType.number),
              Row(
                children: [
                  Expanded(
                      child: TextFormField(
                          controller: _stockActualCtrl,
                          decoration: const InputDecoration(labelText: 'Stock Actual'),
                          keyboardType: TextInputType.number)),
                  const SizedBox(width: 10),
                  Expanded(
                      child: TextFormField(
                          controller: _stockMinimoCtrl,
                          decoration: const InputDecoration(labelText: 'Stock Mínimo'),
                          keyboardType: TextInputType.number)),
                ],
              ),
              const SizedBox(height: 15),

              // ── Imagen: texto dinámico según si es nuevo o edición ──
              Row(
                children: [
                  if (_imagen != null)
                    ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(_imagen!, width: 50, height: 50, fit: BoxFit.cover))
                  else if (!_esNuevo && widget.material?.rutaImagen != null)
                    ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(widget.material!.imagenUrl,
                            width: 50, height: 50, fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const SizedBox(width: 50, height: 50))),
                  const SizedBox(width: 10),
                  TextButton.icon(
                    onPressed: _pickImage,
                    icon: const Icon(Icons.image),
                    // Nuevo material → "Subir Imagen". Editando → "Cambiar Imagen".
                    label: Text(_esNuevo ? 'Subir Imagen' : 'Cambiar Imagen'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primario, minimumSize: const Size(double.infinity, 50)),
                onPressed: _guardar,
                child: const Text('GUARDAR', style: TextStyle(color: Colors.white)),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  void _guardar() async {
    if (!_formKey.currentState!.validate()) return;

    final data = {
      'nombre': _nombreCtrl.text,
      'tipo': _tipo,
      'unidad': _unidad,
      'precio_unitario': double.parse(_precioCtrl.text),
      'stock_actual': int.parse(_stockActualCtrl.text),
      'stock_minimo': int.parse(_stockMinimoCtrl.text),
    };

    final provider = context.read<MaterialProvider>();
    bool success;
    if (widget.material == null) {
      success = await provider.crearMaterial(data, _imagen);
    } else {
      success = await provider.actualizarMaterial(widget.material!.idMaterial, data, _imagen);
    }

    if (success) {
      if (mounted) Navigator.pop(context);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Error al guardar material')));
      }
    }
  }
}