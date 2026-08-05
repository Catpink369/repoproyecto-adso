import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Data/models/producto_model.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/providers/carrito_provider.dart';
import '../../Shared/widgets/app_drawer.dart';
import 'DetalleProducto_Screen.dart';
import 'Carrito_Screen.dart';

class CatalogoScreen extends StatefulWidget {
  const CatalogoScreen({super.key});

  @override
  State<CatalogoScreen> createState() => _CatalogoScreenState();
}

class _CatalogoScreenState extends State<CatalogoScreen> {
  final _scaffoldKey   = GlobalKey<ScaffoldState>();
  final _busquedaCtrl  = TextEditingController();

  List<ProductoModel> _productos = [];
  List<ProductoModel> _filtrados = [];
  bool   _cargando = true;
  String? _error;

  // ── Filtro por clasificación (Todas, Nuevo, En Oferta, etc.)
  List<String> _clasificaciones = ['Todas'];
  String _clasSeleccionada = 'Todas';

  bool _argsAplicados = false;

  @override
  void initState() {
    super.initState();
    _cargarProductos();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Lee los argumentos de navegación (search y/o clasificacion) una sola vez,
    // tanto si vienen de ClienteScreen._buscar() como del popup "Ver ofertas".
    if (!_argsAplicados) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Map) {
        final search = args['search'] as String?;
        final clasificacion = args['clasificacion'] as String?;
        if (search != null && search.isNotEmpty) {
          _busquedaCtrl.text = search;
        }
        if (clasificacion != null && clasificacion.isNotEmpty) {
          _clasSeleccionada = clasificacion;
        }
      }
      _argsAplicados = true;
    }
  }

  @override
  void dispose() {
    _busquedaCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargarProductos() async {
    setState(() { _cargando = true; _error = null; });
    try {
      final res = await ApiService.get(AppConstants.obtenerProductos);
      if (res.statusCode == 200) {
        final lista = jsonDecode(res.body) as List;
        final todos = lista
            .map((e) => ProductoModel.fromJson(e))
            .where((p) => p.disponible)
            .toList();

        // Construir lista dinámica de clasificaciones a partir de los productos,
        // igual que hace LandingPage_Screen.
        final clasSet = <String>{'Todas'};
        for (final p in todos) {
          final c = p.nombreClasificacion;
          if (c != null && c.isNotEmpty && c.toLowerCase() != 'sin clasificar') {
            clasSet.add(c);
          }
        }

        setState(() {
          _productos       = todos;
          _clasificaciones = clasSet.toList();
          // Si la clasificación que llegó por argumento no coincide con
          // ninguna real (ej. nombres distintos en BD), cae a "Todas".
          if (!_clasificaciones.contains(_clasSeleccionada)) {
            _clasSeleccionada = 'Todas';
          }
          _cargando = false;
        });
        _aplicarFiltros();
      } else {
        setState(() {
          _error    = 'Error al cargar los productos';
          _cargando = false;
        });
      }
    } catch (_) {
      setState(() { _error = 'Error de conexión'; _cargando = false; });
    }
  }

  void _aplicarFiltros() {
    final termino = _busquedaCtrl.text.toLowerCase();
    setState(() {
      _filtrados = _productos.where((p) {
        final coincideBusqueda = termino.isEmpty ||
            p.nomProducto.toLowerCase().contains(termino) ||
            (p.descripcion?.toLowerCase().contains(termino) ?? false);

        bool coincideClas = true;
        if (_clasSeleccionada != 'Todas') {
          final clasProd = (p.nombreClasificacion ?? '').toLowerCase();
          final clasBusc = _clasSeleccionada.toLowerCase();
          if (clasBusc == 'nuevo' || clasBusc == 'nuevos') {
            coincideClas = clasProd == 'nuevo' || clasProd == 'nuevos';
          } else if (clasBusc == 'en oferta' || clasBusc == 'oferta') {
            coincideClas = clasProd == 'en oferta' || clasProd == 'oferta';
          } else {
            coincideClas = clasProd == clasBusc;
          }
        }

        return coincideBusqueda && coincideClas;
      }).toList();
    });
  }

  void _buscar(String termino) => _aplicarFiltros();

  void _seleccionarClasificacion(String clas) {
    setState(() => _clasSeleccionada = clas);
    _aplicarFiltros();
  }

  @override
  Widget build(BuildContext context) {
    final carrito = context.watch<CarritoProvider>();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.fondo,
      drawer: AppDrawer(totalCarrito: carrito.totalProductos),
      appBar: _buildAppBar(carrito),
      body: Column(
        children: [
          // ── Buscador
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _busquedaCtrl,
              onChanged: _buscar,
              style: const TextStyle(
                  color: AppColors.texto, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Buscar productos...',
                hintStyle: const TextStyle(
                    color: AppColors.textoClaro, fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: AppColors.primario),
                suffixIcon: _busquedaCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded,
                            color: AppColors.textoClaro, size: 18),
                        onPressed: () {
                          _busquedaCtrl.clear();
                          _aplicarFiltros();
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.blanco,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide:
                        const BorderSide(color: AppColors.grisBorde)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide:
                        const BorderSide(color: AppColors.grisBorde)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: const BorderSide(
                        color: AppColors.primario, width: 2)),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 12),
              ),
            ),
          ),

          // ── Chips de clasificación (Todas, Nuevo, En Oferta, etc.)
          if (_clasificaciones.length > 1) _buildClasificacionChips(),

          // ── Grid
          Expanded(
            child: _cargando
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppColors.primario))
                : _error != null
                    ? _estadoError()
                    : _filtrados.isEmpty
                        ? const Center(
                            child: Text(
                              'No hay productos disponibles',
                              style: TextStyle(
                                  color: AppColors.textoSecundario,
                                  fontSize: 16),
                            ),
                          )
                        : Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12),
                            child: GridView.builder(
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 0.75,
                              ),
                              itemCount: _filtrados.length,
                              itemBuilder: (_, i) => _TarjetaProducto(
                                producto: _filtrados[i],
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => DetalleProductoScreen(
                                        producto: _filtrados[i]),
                                  ),
                                ),
                              ),
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildClasificacionChips() {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
        scrollDirection: Axis.horizontal,
        itemCount: _clasificaciones.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final clas = _clasificaciones[i];
          final seleccionado = clas == _clasSeleccionada;
          return GestureDetector(
            onTap: () => _seleccionarClasificacion(clas),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: seleccionado
                    ? AppColors.acento.withOpacity(0.2)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: seleccionado
                      ? AppColors.primario
                      : AppColors.grisBorde,
                ),
              ),
              child: Text(
                clas,
                style: TextStyle(
                  color: seleccionado
                      ? AppColors.primario
                      : AppColors.textoClaro,
                  fontSize: 12,
                  fontWeight:
                      seleccionado ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(CarritoProvider carrito) {
    return AppBar(
      backgroundColor: AppColors.blanco,
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      centerTitle: true,
      leading: IconButton(
        icon: const Icon(Icons.menu_rounded,
            color: AppColors.secundario, size: 26),
        onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        tooltip: 'Menú',
      ),
      title: const Text(
        'Catálogo',
        style: TextStyle(
            color: AppColors.secundario,
            fontWeight: FontWeight.bold,
            fontSize: 18),
      ),
      actions: [
        // Carrito con badge
        Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              icon: const Icon(Icons.shopping_bag_outlined,
                  color: AppColors.secundario, size: 24),
              onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const CarritoScreen())),
            ),
            if (carrito.totalProductos > 0)
              Positioned(
                right: 6,
                top: 6,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                      color: AppColors.primario,
                      shape: BoxShape.circle),
                  child: Text(
                    '${carrito.totalProductos}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.refresh_rounded,
              color: AppColors.secundario),
          onPressed: _cargarProductos,
        ),
        const SizedBox(width: 4),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: AppColors.grisBorde),
      ),
    );
  }

  Widget _estadoError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline,
              color: AppColors.primario, size: 60),
          const SizedBox(height: 10),
          Text(_error!,
              style: const TextStyle(
                  color: AppColors.textoSecundario)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _cargarProductos,
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primario,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20))),
            child: const Text('Reintentar',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// ── Tarjeta de producto
class _TarjetaProducto extends StatelessWidget {
  final ProductoModel producto;
  final VoidCallback  onTap;
  const _TarjetaProducto(
      {required this.producto, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final imgUrl = producto.rutaImagen != null
        ? '${AppConstants.baseUrl}${producto.rutaImagen}'
        : null;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.fondoTarjeta,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: AppColors.primario.withOpacity(0.08),
                blurRadius: 8,
                offset: const Offset(0, 3))
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: AppColors.fondo,
                  borderRadius: BorderRadius.vertical(
                      top: Radius.circular(16)),
                ),
                child: imgUrl != null
                    ? ClipRRect(
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(16)),
                        child: Image.network(
                          imgUrl,
                          fit: BoxFit.cover,
                          headers: {
                            'x-api-key': AppConstants.apiKey
                          },
                          errorBuilder: (_, __, ___) => const Icon(
                              Icons.image_not_supported_rounded,
                              color: AppColors.textoClaro,
                              size: 50),
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.shopping_bag_outlined,
                            color: AppColors.textoClaro, size: 50)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    producto.nomProducto,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.secundario,
                        fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    producto.precioFormateado,
                    style: const TextStyle(
                        color: AppColors.primario,
                        fontWeight: FontWeight.bold,
                        fontSize: 14),
                  ),
                  if (producto.color != null)
                    Text(
                      'Color: ${producto.color}',
                      style: const TextStyle(
                          color: AppColors.textoClaro,
                          fontSize: 11),
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