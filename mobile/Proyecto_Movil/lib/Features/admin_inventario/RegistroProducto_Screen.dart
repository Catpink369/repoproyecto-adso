import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/Custom_Button.dart';
import '../../Shared/widgets/Custom_TextField.dart';
import '../../Shared/widgets/Custom_Sizedbox.dart';
import '../../Shared/providers/producto_provider.dart';
import '../../Shared/services/api_service.dart';
import '../../Data/models/usuario_model.dart';

class RegistroProductoScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const RegistroProductoScreen({super.key, required this.usuario});

  @override
  State<RegistroProductoScreen> createState() => _RegistroProductoScreenState();
}

class _RegistroProductoScreenState extends State<RegistroProductoScreen> {
  final nombreController      = TextEditingController();
  final precioController      = TextEditingController();
  final stockController       = TextEditingController();
  final stockMinimoController = TextEditingController();
  final colorController       = TextEditingController();
  final tallaController       = TextEditingController();
  final tamanoController      = TextEditingController();
  final descripcionController = TextEditingController();

  List categorias      = [];
  List clasificaciones = [];
  int? categoriaSeleccionada;
  int? clasificacionSeleccionada;

  File? imagenNueva;

  bool cargando         = false;
  bool cargandoDatos    = true;
  String? error;
  String? mensaje;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  @override
  void dispose() {
    nombreController.dispose();
    precioController.dispose();
    stockController.dispose();
    stockMinimoController.dispose();
    colorController.dispose();
    tallaController.dispose();
    tamanoController.dispose();
    descripcionController.dispose();
    super.dispose();
  }

  Future<void> _cargarDatos() async {
    try {
      final results = await Future.wait([
        ApiService.get(AppConstants.obtenerCategorias),
        ApiService.get(AppConstants.obtenerClasificaciones),
      ]);

      print('>>> Categorias Status: ${results[0].statusCode} Body: ${results[0].body}');
      print('>>> Clasificaciones Status: ${results[1].statusCode} Body: ${results[1].body}');

      if (results[0].statusCode == 200 && results[1].statusCode == 200) {
        setState(() {
          categorias      = jsonDecode(results[0].body);
          clasificaciones = jsonDecode(results[1].body);
          cargandoDatos   = false;
        });
      } else {
        setState(() => cargandoDatos = false);
      }
    } catch (e) {
      print('>>> Error al cargar datos: $e');
      setState(() => cargandoDatos = false);
    }
  }

  Future<void> _seleccionarImagen() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (picked != null) {
      setState(() => imagenNueva = File(picked.path));
    }
  }

  Future<void> _registrarProducto() async {
    // Validación igual que el web
    if (nombreController.text.isEmpty ||
        precioController.text.isEmpty ||
        stockController.text.isEmpty ||
        stockMinimoController.text.isEmpty ||
        categoriaSeleccionada == null ||
        clasificacionSeleccionada == null) {
      setState(() => error = 'Faltan campos obligatorios: Nombre, Precio, Stock, Categoría y Clasificación.');
      return;
    }

    setState(() { cargando = true; error = null; mensaje = null; });

    try {
      // 1. Crear producto (POST)
      final res = await ApiService.post(
        AppConstants.crearProducto,
        {
          'nom_producto':     nombreController.text,
          'precio_unitario':  double.tryParse(precioController.text) ?? 0,
          'stock_actual':     int.tryParse(stockController.text) ?? 0,
          'stock_minimo':     int.tryParse(stockMinimoController.text) ?? 0,
          'descripcion':      descripcionController.text.isEmpty ? null : descripcionController.text,
          'color':            colorController.text.isEmpty ? null : colorController.text,
          'talla':            tallaController.text.isEmpty ? null : tallaController.text,
          'tamaño':           tamanoController.text.isEmpty ? null : tamanoController.text,
          'id_categoria':     categoriaSeleccionada,
          'id_clasificacion': clasificacionSeleccionada,
          'estado':           true,
        },
      );

      if (res.statusCode != 200 && res.statusCode != 201) {
        final data = jsonDecode(res.body);
        setState(() {
          error   = data['message'] ?? 'Error al registrar producto';
          cargando = false;
        });
        return;
      }

      final nuevoProducto = jsonDecode(res.body);
      final productoId    = nuevoProducto['id_producto'];

      // 2. Subir imagen si se seleccionó
      if (imagenNueva != null && productoId != null) {
        final resImagen = await ApiService.postMultipart(
          '${AppConstants.subirImagenProducto}/$productoId/imagen',
          imagenNueva!,
          fileField: 'imagen_producto',
        );
        if (resImagen.statusCode != 200 && resImagen.statusCode != 201) {
          print('Error al subir imagen: ${resImagen.statusCode}');
        }
      }

      if (mounted) {
        // Actualizar lista y volver a productos
        context.read<ProductoProvider>().agregarProducto(nuevoProducto);
        await context.read<ProductoProvider>().cargarProductos();

        setState(() {
          mensaje  = '¡Producto registrado exitosamente!';
          cargando = false;
        });

        await Future.delayed(const Duration(milliseconds: 1200));
        if (mounted) Navigator.pop(context); // vuelve a Productos_Screen
      }
    } catch (e) {
      setState(() { error = 'Error de conexión'; cargando = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Registrar Producto'),
      backgroundColor: AppColors.fondo,
      body: cargandoDatos
          ? const Center(child: CircularProgressIndicator(color: AppColors.primario))
          : SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.blanco,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [BoxShadow(color: Colors.grey.withValues(alpha: 0.1), blurRadius: 8)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Nuevo Producto',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.secundario),
              ),
              AppSpaces.verticalLarge,

              // ── Mensajes ──────────────────────────────
              if (error != null) ...[
                _MensajeBox(texto: error!, esError: true),
                AppSpaces.verticalMedium,
              ],
              if (mensaje != null) ...[
                _MensajeBox(texto: mensaje!, esError: false),
                AppSpaces.verticalMedium,
              ],

              // ── Información básica ────────────────────
              _SeccionTitulo('Información del Producto'),
              AppSpaces.verticalMedium,

              CustomTextField(
                label: 'Nombre del producto *',
                icon: Icons.inventory,
                controller: nombreController,
              ),
              AppSpaces.verticalMedium,

              CustomTextField(
                label: 'Precio unitario *',
                icon: Icons.attach_money,
                controller: precioController,
              ),
              AppSpaces.verticalMedium,

              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      label: 'Stock inicial *',
                      icon: Icons.numbers,
                      controller: stockController,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      label: 'Stock mínimo *',
                      icon: Icons.warning,
                      controller: stockMinimoController,
                    ),
                  ),
                ],
              ),
              AppSpaces.verticalLarge,

              // ── Clasificación ─────────────────────────
              _SeccionTitulo('Clasificación y Atributos'),
              AppSpaces.verticalMedium,

              // Categoría
              const Text('Categoría *', style: TextStyle(color: AppColors.texto, fontWeight: FontWeight.w500)),
              const SizedBox(height: 8),
              _Dropdown(
                valor: categoriaSeleccionada,
                hint: 'Selecciona una categoría',
                items: categorias.map<DropdownMenuItem<int>>((c) {
                  return DropdownMenuItem<int>(
                    value: c['id_categoria'],
                    child: Text('${c['nombre_c'] ?? c['nom_categoria'] ?? ''}'),
                  );
                }).toList(),
                onChanged: (v) => setState(() => categoriaSeleccionada = v),
              ),
              AppSpaces.verticalMedium,

              // Clasificación
              const Text('Clasificación *', style: TextStyle(color: AppColors.texto, fontWeight: FontWeight.w500)),
              const SizedBox(height: 8),
              _Dropdown(
                valor: clasificacionSeleccionada,
                hint: 'Selecciona una clasificación',
                items: clasificaciones.map<DropdownMenuItem<int>>((c) {
                  return DropdownMenuItem<int>(
                    value: c['id_clasificacion'],
                    child: Text('${c['nombre_clas'] ?? ''}'),
                  );
                }).toList(),
                onChanged: (v) => setState(() => clasificacionSeleccionada = v),
              ),
              AppSpaces.verticalMedium,

              // Color, Talla, Tamaño
              Row(
                children: [
                  Expanded(child: CustomTextField(label: 'Color', icon: Icons.palette, controller: colorController)),
                  const SizedBox(width: 8),
                  Expanded(child: CustomTextField(label: 'Talla', icon: Icons.straighten, controller: tallaController)),
                  const SizedBox(width: 8),
                  Expanded(child: CustomTextField(label: 'Tamaño', icon: Icons.photo_size_select_large, controller: tamanoController)),
                ],
              ),
              AppSpaces.verticalMedium,

              CustomTextField(
                label: 'Descripción (opcional)',
                icon: Icons.description,
                controller: descripcionController,
              ),
              AppSpaces.verticalLarge,

              // ── Imagen ────────────────────────────────
              _SeccionTitulo('Imagen del Producto'),
              AppSpaces.verticalMedium,

              if (imagenNueva != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.file(imagenNueva!, height: 160, width: double.infinity, fit: BoxFit.cover),
                ),
                const SizedBox(height: 10),
              ],

              OutlinedButton.icon(
                onPressed: _seleccionarImagen,
                icon: const Icon(Icons.photo_library, color: AppColors.primario),
                label: Text(
                  imagenNueva != null ? 'Cambiar imagen' : 'Seleccionar imagen (opcional)',
                  style: const TextStyle(color: AppColors.primario),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primario),
                  minimumSize: const Size(double.infinity, 44),
                ),
              ),
              AppSpaces.verticalLarge,

              // ── Botón registrar ───────────────────────
              cargando
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primario))
                  : CustomButton(
                text: 'REGISTRAR PRODUCTO',
                onPressed: _registrarProducto,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Widgets auxiliares ────────────────────────────────────────────────────────

class _SeccionTitulo extends StatelessWidget {
  final String titulo;
  const _SeccionTitulo(this.titulo);

  @override
  Widget build(BuildContext context) {
    return Text(
      titulo,
      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.secundario),
    );
  }
}

class _Dropdown extends StatelessWidget {
  final int? valor;
  final String hint;
  final List<DropdownMenuItem<int>> items;
  final ValueChanged<int?> onChanged;

  const _Dropdown({required this.valor, required this.hint, required this.items, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.suave),
        borderRadius: BorderRadius.circular(10),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: valor,
          isExpanded: true,
          hint: Text(hint),
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }
}

class _MensajeBox extends StatelessWidget {
  final String texto;
  final bool esError;
  const _MensajeBox({required this.texto, required this.esError});

  @override
  Widget build(BuildContext context) {
    final color = esError ? Colors.red : Colors.green;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.shade200),
      ),
      child: Row(
        children: [
          Icon(esError ? Icons.error : Icons.check_circle, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(texto, style: TextStyle(color: color))),
        ],
      ),
    );
  }
}