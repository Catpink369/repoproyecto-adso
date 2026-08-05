import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/Custom_Button.dart';
import '../../Shared/widgets/Custom_TextField.dart';
import '../../Shared/widgets/Custom_Sizedbox.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/providers/producto_provider.dart';
import '../../Data/models/producto_model.dart';
import '../../Data/models/usuario_model.dart';

class EditarProductoScreen extends StatefulWidget {
  final ProductoModel producto;
  final UsuarioModel usuario;

  const EditarProductoScreen({
    super.key,
    required this.producto,
    required this.usuario,
  });

  @override
  State<EditarProductoScreen> createState() => _EditarProductoScreenState();
}

class _EditarProductoScreenState extends State<EditarProductoScreen> {
  late final TextEditingController nombreController;
  late final TextEditingController precioController;
  late final TextEditingController stockMinimoController;
  late final TextEditingController colorController;
  late final TextEditingController tallaController;
  late final TextEditingController tamanoController;
  late final TextEditingController descripcionController;

  List categorias = [];
  List clasificaciones = [];
  int? categoriaSeleccionada;
  int? clasificacionSeleccionada;

  File? imagenNueva;
  String? imagenPreviewUrl;

  bool cargando = false;
  bool cargandoDatos = true;
  String? error;
  String? mensaje;

  @override
  void initState() {
    super.initState();
    // Pre-llenar con datos actuales del producto
    final p = widget.producto;
    nombreController     = TextEditingController(text: p.nomProducto);
    precioController     = TextEditingController(text: p.precioUnitario.toString());
    stockMinimoController = TextEditingController(text: p.stockMinimo.toString());
    colorController      = TextEditingController(text: p.color ?? '');
    tallaController      = TextEditingController(text: p.talla ?? '');
    tamanoController     = TextEditingController(text: p.tamano ?? '');
    descripcionController = TextEditingController(text: p.descripcion ?? '');
    categoriaSeleccionada    = p.idCategoria;
    clasificacionSeleccionada = p.idClasificacion;

    if (p.rutaImagen != null) {
      imagenPreviewUrl = '${AppConstants.baseUrl}${p.rutaImagen}';
    }

    _cargarCategorias();
  }

  @override
  void dispose() {
    nombreController.dispose();
    precioController.dispose();
    stockMinimoController.dispose();
    colorController.dispose();
    tallaController.dispose();
    tamanoController.dispose();
    descripcionController.dispose();
    super.dispose();
  }

  Future<void> _cargarCategorias() async {
    try {
      final results = await Future.wait([
        ApiService.get(AppConstants.obtenerCategorias),
        ApiService.get(AppConstants.obtenerClasificaciones),
      ]);

      if (results[0].statusCode == 200 && results[1].statusCode == 200) {
        setState(() {
          categorias       = jsonDecode(results[0].body);
          clasificaciones  = jsonDecode(results[1].body);
          cargandoDatos    = false;
        });
      } else {
        setState(() => cargandoDatos = false);
      }
    } catch (e) {
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

  Future<void> _guardarCambios() async {
    // Validación igual que web
    if (nombreController.text.isEmpty ||
        precioController.text.isEmpty ||
        categoriaSeleccionada == null ||
        clasificacionSeleccionada == null) {
      setState(() => error = 'Faltan campos obligatorios: Nombre, Precio, Categoría y Clasificación.');
      return;
    }

    setState(() { cargando = true; error = null; mensaje = null; });

    try {
      final productoId = widget.producto.idProducto;

      // Actualizar datos del producto (PATCH)
      final res = await ApiService.patch(
        '${AppConstants.actualizarProducto}/$productoId',
        {
          'nom_producto':     nombreController.text,
          'precio_unitario':  double.tryParse(precioController.text) ?? 0,
          'stock_minimo':     int.tryParse(stockMinimoController.text) ?? 0,
          'color':            colorController.text.isEmpty ? null : colorController.text,
          'talla':            tallaController.text.isEmpty ? null : tallaController.text,
          'tamaño':           tamanoController.text.isEmpty ? null : tamanoController.text,
          'descripcion':      descripcionController.text,
          'id_categoria':     categoriaSeleccionada,
          'id_clasificacion': clasificacionSeleccionada,
        },
      );

      if (res.statusCode != 200 && res.statusCode != 201) {
        final data = jsonDecode(res.body);
        setState(() {
          error = data['message'] ?? 'Error al actualizar el producto';
          cargando = false;
        });
        return;
      }

      // Subir imagen nueva si se selecciono
      if (imagenNueva != null) {
        final bytes = await imagenNueva!.readAsBytes();
        final base64Image = base64Encode(bytes);
        await ApiService.post(
          '${AppConstants.subirImagenProducto}/$productoId/imagen',
          {'imagen': base64Image},
        );
      }

      if (mounted) {
        // Recargar lista de productos
        await context.read<ProductoProvider>().cargarProductos();

        setState(() {
          mensaje  = '¡Producto actualizado con éxito!';
          cargando = false;
        });

        await Future.delayed(const Duration(milliseconds: 1500));
        if (mounted) Navigator.pop(context);
      }
    } catch (e) {
      setState(() { error = 'Error de conexión'; cargando = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Editar Producto #${widget.producto.idProducto}'),
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

              // Mensajes 
              if (error != null) ...[
                _MensajeBox(texto: error!, esError: true),
                AppSpaces.verticalMedium,
              ],
              if (mensaje != null) ...[
                _MensajeBox(texto: mensaje!, esError: false),
                AppSpaces.verticalMedium,
              ],

              //Sección: Información 
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

              // ── Stock actual — solo lectura (overflow corregido con Expanded) ──
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.lock, color: Colors.grey, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Stock actual: ${widget.producto.stockActual}',
                            style: const TextStyle(
                                color: Colors.grey, fontWeight: FontWeight.w600),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const Text(
                            'Para modificar stock usa el sistema de movimientos',
                            style: TextStyle(color: Colors.grey, fontSize: 11),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              AppSpaces.verticalMedium,

              CustomTextField(
                label: 'Stock mínimo (alerta)',
                icon: Icons.warning,
                controller: stockMinimoController,
              ),
              AppSpaces.verticalLarge,

              // Sección: Clasificación 
              _SeccionTitulo('Clasificación y Atributos'),
              AppSpaces.verticalMedium,

              // Categoría
              _DropdownLabel('Categoría *'),
              const SizedBox(height: 6),
              _Dropdown(
                valor: categoriaSeleccionada,
                hint: 'Seleccione Categoría',
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
              _DropdownLabel('Clasificación *'),
              const SizedBox(height: 6),
              _Dropdown(
                valor: clasificacionSeleccionada,
                hint: 'Seleccione Clasificación',
                items: clasificaciones.map<DropdownMenuItem<int>>((c) {
                  return DropdownMenuItem<int>(
                    value: c['id_clasificacion'],
                    child: Text('${c['nombre_clas'] ?? ''}'),
                  );
                }).toList(),
                onChanged: (v) => setState(() => clasificacionSeleccionada = v),
              ),
              AppSpaces.verticalMedium,

              // Color, Talla, Tamaño en fila
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
                label: 'Descripción',
                icon: Icons.description,
                controller: descripcionController,
              ),
              AppSpaces.verticalLarge,

              // ── Sección: Imagen ────────────────────────
              _SeccionTitulo('Imagen del Producto'),
              AppSpaces.verticalMedium,

              // Preview imagen
              if (imagenNueva != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.file(imagenNueva!, height: 160, width: double.infinity, fit: BoxFit.cover),
                )
              else if (imagenPreviewUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: CachedNetworkImage(
                    imageUrl: imagenPreviewUrl!,
                    httpHeaders: ApiService.headers,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      height: 160,
                      color: AppColors.fondo,
                      child: const Center(child: CircularProgressIndicator(color: AppColors.primario)),
                    ),
                    errorWidget: (_, __, ___) => Container(
                      height: 160,
                      color: AppColors.fondo,
                      child: const Icon(Icons.image_not_supported, size: 50, color: Colors.grey),
                    ),
                  ),
                ),

              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: _seleccionarImagen,
                icon: const Icon(Icons.photo_library, color: AppColors.primario),
                label: Text(
                  imagenNueva != null ? 'Cambiar imagen' : 'Seleccionar imagen',
                  style: const TextStyle(color: AppColors.primario),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primario),
                  minimumSize: const Size(double.infinity, 44),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Deja vacío para mantener la imagen actual',
                style: TextStyle(color: Colors.grey, fontSize: 11),
              ),
              AppSpaces.verticalLarge,

              // ── Botones ────────────────────────────────
              cargando
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primario))
                  : Column(
                children: [
                  CustomButton(
                    text: 'GUARDAR CAMBIOS',
                    onPressed: _guardarCambios,
                  ),
                  AppSpaces.verticalMedium,
                  OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      side: const BorderSide(color: Colors.grey),
                    ),
                    child: const Text('CANCELAR', style: TextStyle(color: Colors.grey)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Widgets auxiliares ─────────────────────────────────────────────────────────

class _SeccionTitulo extends StatelessWidget {
  final String titulo;
  const _SeccionTitulo(this.titulo);

  @override
  Widget build(BuildContext context) {
    return Text(
      titulo,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: AppColors.secundario,
      ),
    );
  }
}

class _DropdownLabel extends StatelessWidget {
  final String label;
  const _DropdownLabel(this.label);

  @override
  Widget build(BuildContext context) {
    return Text(label, style: const TextStyle(color: AppColors.texto, fontWeight: FontWeight.w500));
  }
}

class _Dropdown extends StatelessWidget {
  final int? valor;
  final String hint;
  final List<DropdownMenuItem<int>> items;
  final ValueChanged<int?> onChanged;

  const _Dropdown({
    required this.valor,
    required this.hint,
    required this.items,
    required this.onChanged,
  });

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