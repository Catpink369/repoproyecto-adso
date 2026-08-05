import 'package:flutter/material.dart';
import 'dart:convert';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/constants/app_colors.dart';

class LandingPageScreen extends StatefulWidget {
    const LandingPageScreen({super.key});

    @override
    State<LandingPageScreen> createState() => _LandingPageScreenState();
    }

    class _LandingPageScreenState extends State<LandingPageScreen>
        with SingleTickerProviderStateMixin {
    bool    _mostrarVentana  = true;
    bool    _cargando        = true;
    String? _error;

    List<Map<String, dynamic>> _productos          = [];
    List<Map<String, dynamic>> _productosFiltrados = [];
    List<String> _categorias      = ['Todo'];
    List<String> _clasificaciones = ['Todas'];

    String _catSeleccionada  = 'Todo';
    String _clasSeleccionada = 'Todas';
    String _busqueda         = '';

    final _busquedaCtrl    = TextEditingController();
    final _scrollController = ScrollController();

    // Animación sutil del botón inferior
    late AnimationController _pulseCtrl;
    late Animation<double>   _pulseAnim;

    // Mapa de íconos por categoría
    static const Map<String, IconData> _catIconos = {
        'Todo'       : Icons.grid_view_rounded,
        'Amigurumis' : Icons.pets_rounded,
        'Sábanas'    : Icons.bed_rounded,
        'Destacados' : Icons.star_rounded,
        'Peluches'   : Icons.toys_rounded,
        'Ropa'       : Icons.checkroom_rounded,
        'Accesorios' : Icons.diamond_rounded,
    };

    @override
    void initState() {
        super.initState();
        _cargarProductos();

        _pulseCtrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 1400),
        )..repeat(reverse: true);

        _pulseAnim = Tween<double>(begin: 1.0, end: 1.06).animate(
        CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
        );
    }

    @override
    void dispose() {
        _busquedaCtrl.dispose();
        _scrollController.dispose();
        _pulseCtrl.dispose();
        super.dispose();
    }

    // ── API
    Future<void> _cargarProductos() async {
        setState(() { _cargando = true; _error = null; });
        try {
        final res = await ApiService.get(AppConstants.obtenerProductos);
        if (res.statusCode == 200) {
            final data    = jsonDecode(res.body);
            final lista   = (data is List ? data : data['data'] ?? []) as List;
            final productos = lista.cast<Map<String, dynamic>>();

            final cats = <String>{'Todo'};
            for (final p in productos) {
            if (p['nombre_c'] != null) cats.add(p['nombre_c']);
            }

            final clas = <String>{'Todas', 'Últimas Unidades'};
            for (final p in productos) {
            final c = p['nombre_clas']?.toString() ?? '';
            if (c.isNotEmpty && c.toLowerCase() != 'sin clasificar') clas.add(c);
            }

            setState(() {
            _productos       = productos;
            _categorias      = cats.toList();
            _clasificaciones = clas.toList();
            _cargando        = false;
            });
            _aplicarFiltros();
        } else {
            setState(() { _error = 'Error al cargar productos'; _cargando = false; });
        }
        } catch (_) {
        setState(() { _error = 'Error de conexión'; _cargando = false; });
        }
    }

    void _aplicarFiltros() {
        final term = _busqueda.toLowerCase();
        setState(() {
        _productosFiltrados = _productos.where((p) {
            final coincideCat = _catSeleccionada == 'Todo' || p['nombre_c'] == _catSeleccionada;

            bool coincideClas = true;
            if (_clasSeleccionada != 'Todas') {
            if (_clasSeleccionada == 'Últimas Unidades') {
                final stock  = (p['stock_actual'] ?? 0) as num;
                final minimo = (p['stock_minimo'] ?? 0) as num;
                coincideClas = stock <= minimo;
            } else {
                final clasProd = (p['nombre_clas'] ?? '').toString().toLowerCase();
                final clasBusc = _clasSeleccionada.toLowerCase();
                if (clasBusc == 'nuevo' || clasBusc == 'nuevos') {
                coincideClas = clasProd == 'nuevo' || clasProd == 'nuevos';
                } else if (clasBusc == 'en oferta' || clasBusc == 'oferta') {
                coincideClas = clasProd == 'en oferta' || clasProd == 'oferta';
                } else {
                coincideClas = clasProd == clasBusc;
                }
            }
            }

            final nombre       = (p['nom_producto'] ?? '').toString().toLowerCase();
            final desc         = (p['descripcion'] ?? '').toString().toLowerCase();
            final coincideBusc = term.isEmpty || nombre.contains(term) || desc.contains(term);

            return coincideCat && coincideClas && coincideBusc;
        }).toList();
        });
    }

    Map<String, dynamic> _getBadge(Map<String, dynamic> p) {
        final stock    = (p['stock_actual'] ?? 0) as num;
        final minimo   = (p['stock_minimo'] ?? 0) as num;
        final stockBajo = stock <= minimo && stock > 0;

        if (stockBajo) return {'texto': 'Últimas Unidades', 'color': const Color(0xFFF88787), 'mostrar': true};

        final clas = (p['nombre_clas'] ?? '').toString().toLowerCase();
        if (clas.isEmpty || clas == 'sin clasificar') return {'mostrar': false};
        if (clas == 'nuevo' || clas == 'nuevos')       return {'texto': 'Nuevo',           'color': const Color(0xFF33F321), 'mostrar': true};
        if (clas == 'en oferta' || clas == 'oferta')   return {'texto': 'En Oferta',       'color': const Color(0xFFEC9614), 'mostrar': true};
        if (clas.contains('vendido') || clas == 'mas vendidos') return {'texto': 'Más Vendido', 'color': const Color(0xFF0B87EC), 'mostrar': true};
        if (clas == 'ultimas unidades')                return {'texto': 'Últimas Unidades', 'color': const Color(0xFFEB54BD), 'mostrar': true};
        return {'texto': p['nombre_clas'], 'color': const Color(0xFFBBBBBB), 'mostrar': true};
    }

    String _getImageUrl(String? ruta) {
        if (ruta == null || ruta.isEmpty) return '';
        return '${AppConstants.baseUrl}$ruta';
    }

    // ── Abre el bottom sheet de acceso (sin cambios)
    void _abrirAcceso() {
        showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => _AccesoSheet(
            onLogin:    () { Navigator.pop(context); Navigator.pushNamed(context, '/login'); },
            onRegistro: () { Navigator.pop(context); Navigator.pushNamed(context, '/registro'); },
            onOlvide:   () { Navigator.pop(context); Navigator.pushNamed(context, '/olvide_c'); },
        ),
        );
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
        backgroundColor: AppColors.fondo,
        appBar: _buildAppBar(),
        body: Stack(
            children: [
            _buildBody(),
            if (_mostrarVentana) _buildPopup(),
            ],
        ),
        bottomNavigationBar: _buildBotonAcceso(),
        );
    }

    // ── AppBar rediseñado: logo centrado, fondo blanco, sin sombra
    PreferredSizeWidget _buildAppBar() {
        return AppBar(
            backgroundColor: AppColors.blanco,
            elevation: 0,
            scrolledUnderElevation: 0,
            automaticallyImplyLeading: false,
            centerTitle: true,
            leading: const SizedBox.shrink(),
            actions: const [],
            title: Image.asset(
            'lib/Assest/Logo_GO.jpeg',
            height: 40,
            errorBuilder: (_, __, ___) => const Text(
                'Gurama Online',
                style: TextStyle(
                color: AppColors.secundario,
                fontWeight: FontWeight.bold,
                fontSize: 18,
                ),
            ),
            ),
            bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: AppColors.grisBorde),
            ),
        );
        }
    // ── Botón inferior compacto "Acceder / Iniciar Sesión"
    Widget _buildBotonAcceso() {
        return GestureDetector(
        onTap: _abrirAcceso,
        onVerticalDragEnd: (details) {
            if (details.primaryVelocity != null && details.primaryVelocity! < 0) {
            _abrirAcceso();
            }
        },
        child: Container(
            height: 64,
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 20),
            decoration: BoxDecoration(
            gradient: AppColors.gradientePrimario,
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
                BoxShadow(
                color: AppColors.primario.withOpacity(0.40),
                blurRadius: 18,
                offset: const Offset(0, 6),
                ),
            ],
            ),
            child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
                Icon(Icons.key_rounded, color: AppColors.blanco, size: 20),
                SizedBox(width: 10),
                Text(
                'Acceder / Iniciar Sesión',
                style: TextStyle(
                    color: AppColors.blanco,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.3,
                ),
                ),
                SizedBox(width: 10),
                Icon(Icons.keyboard_arrow_up_rounded, color: AppColors.blanco, size: 22),
            ],
            ),
        ),
        );
    }

    // ── Body principal
    Widget _buildBody() {
        return RefreshIndicator(
        onRefresh: _cargarProductos,
        color: AppColors.primario,
        child: SingleChildScrollView(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
            children: [
                _buildHero(),
                _buildBuscador(),
                _buildCategoriasChips(),
                _buildClasificacionChips(),
                _buildCatalogo(),
                _buildFooter(),
                const SizedBox(height: 16),
            ],
            ),
        ),
        );
    }

    // ── Hero banner mejorado: imagen de fondo + overlay gradiente
    Widget _buildHero() {
        final imagenUrl = _productos.isNotEmpty && _productos[0]['ruta_imagen'] != null
            ? _getImageUrl(_productos[0]['ruta_imagen'])
            : null;

        return SizedBox(
        width: double.infinity,
        height: 220,
        child: Stack(
            fit: StackFit.expand,
            children: [
            // Imagen de fondo (primer producto o color sólido)
            if (imagenUrl != null && imagenUrl.isNotEmpty)
                Image.network(
                imagenUrl,
                fit: BoxFit.cover,
                headers: {'x-api-key': AppConstants.apiKey},
                errorBuilder: (_, __, ___) => Container(color: AppColors.secundario),
                )
            else
                Container(color: AppColors.secundario),

            // Gradiente oscuro sobre la imagen
            Container(
                decoration: const BoxDecoration(
                gradient: LinearGradient(
                    colors: [
                    Color(0xCCb4788b), // vino con 80 % opacidad
                    Color(0x88b4788b),
                    Color(0x00000000),
                    ],
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                ),
                ),
            ),

            // Contenido del hero
            Positioned(
                left: 20,
                right: 20,
                bottom: 20,
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                    Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                        'Gurama · Confecciones y pedidos',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.8,
                        ),
                        ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                        '¡Crea momentos\nespeciales\npersonalizados!',
                        style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        height: 1.2,
                        shadows: [
                            Shadow(color: Color(0x66000000), blurRadius: 8, offset: Offset(0, 2)),
                        ],
                        ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton(
                        onPressed: _abrirAcceso,
                        style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.white, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                        backgroundColor: Colors.white.withOpacity(0.12),
                        ),
                        child: const Text(
                        'Ver mis pedidos',
                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                    ),
                    ],
                ),
                ),  
            ],
            ),     
        );       
    }

    // ── Buscador con botón rosado a la derecha
    Widget _buildBuscador() {
        return Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Row(
            children: [
            Expanded(
                child: TextField(
                controller: _busquedaCtrl,
                onChanged: (v) { _busqueda = v; _aplicarFiltros(); },
                style: const TextStyle(color: AppColors.texto, fontSize: 14),
                decoration: InputDecoration(
                    hintText: 'Buscar productos...',
                    hintStyle: const TextStyle(color: AppColors.textoClaro, fontSize: 14),
                    suffixIcon: _busqueda.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, color: AppColors.textoClaro, size: 18),
                            onPressed: () { _busquedaCtrl.clear(); _busqueda = ''; _aplicarFiltros(); },
                        )
                        : null,
                    filled: true,
                    fillColor: AppColors.blanco,
                    border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: const BorderSide(color: AppColors.grisBorde),
                    ),
                    enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: const BorderSide(color: AppColors.grisBorde),
                    ),
                    focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: const BorderSide(color: AppColors.primario, width: 2),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                ),
                ),
            ),
            const SizedBox(width: 8),
            // Botón rosado de búsqueda
            GestureDetector(
                onTap: () { _aplicarFiltros(); },
                child: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                    gradient: AppColors.gradientePrimario,
                    shape: BoxShape.circle,
                    boxShadow: [
                    BoxShadow(
                        color: AppColors.primario.withOpacity(0.35),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                    ),
                    ],
                ),
                child: const Icon(Icons.search_rounded, color: Colors.white, size: 22),
                ),
            ),
            ],
        ),
        );
    }

    // ── Chips de categoría con ícono + texto debajo
    Widget _buildCategoriasChips() {
        return Container(
        height: 88,
        margin: const EdgeInsets.only(top: 16),
        child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: _categorias.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (_, i) {
            final cat         = _categorias[i];
            final seleccionado = cat == _catSeleccionada;
            final icono       = _catIconos[cat] ?? Icons.category_rounded;

            return GestureDetector(
                onTap: () { setState(() => _catSeleccionada = cat); _aplicarFiltros(); },
                child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 70,
                decoration: BoxDecoration(
                    gradient: seleccionado ? AppColors.gradientePrimario : null,
                    color: seleccionado ? null : AppColors.blanco,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                    color: seleccionado ? Colors.transparent : AppColors.grisBorde,
                    ),
                    boxShadow: seleccionado
                        ? [BoxShadow(color: AppColors.primario.withOpacity(0.30), blurRadius: 10, offset: const Offset(0, 4))]
                        : null,
                ),
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                    Icon(
                        icono,
                        color: seleccionado ? Colors.white : AppColors.primario,
                        size: 24,
                    ),
                    const SizedBox(height: 5),
                    Text(
                        cat,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                        color: seleccionado ? Colors.white : AppColors.textoSecundario,
                        fontSize: 10,
                        fontWeight: seleccionado ? FontWeight.bold : FontWeight.normal,
                        height: 1.2,
                        ),
                    ),
                    ],
                ),
                ),
            );
            },
        ),
        );
    }

    // ── Chips de clasificación (sin cambios de lógica, solo ajuste visual)
    Widget _buildClasificacionChips() {
        if (_clasificaciones.length <= 1) return const SizedBox.shrink();
        return SizedBox(
        height: 44,
        child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
            scrollDirection: Axis.horizontal,
            itemCount: _clasificaciones.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (_, i) {
            final clas         = _clasificaciones[i];
            final seleccionado = clas == _clasSeleccionada;
            return GestureDetector(
                onTap: () { setState(() => _clasSeleccionada = clas); _aplicarFiltros(); },
                child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                    color: seleccionado ? AppColors.acento.withOpacity(0.2) : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                    color: seleccionado ? AppColors.primario : AppColors.grisBorde,
                    ),
                ),
                child: Text(
                    clas,
                    style: TextStyle(
                    color: seleccionado ? AppColors.primario : AppColors.textoClaro,
                    fontSize: 12,
                    fontWeight: seleccionado ? FontWeight.bold : FontWeight.normal,
                    ),
                ),
                ),
            );
            },
        ),
        );
    }

    // ── Catálogo de productos
    Widget _buildCatalogo() {
        if (_cargando) {
        return const Padding(
            padding: EdgeInsets.all(40),
            child: Center(child: CircularProgressIndicator(color: AppColors.primario)),
        );
        }
        if (_error != null) {
        return Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
            children: [
                const Icon(Icons.wifi_off_rounded, color: AppColors.textoClaro, size: 48),
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: AppColors.textoSecundario)),
                const SizedBox(height: 12),
                ElevatedButton(
                onPressed: _cargarProductos,
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primario),
                child: const Text('Reintentar', style: TextStyle(color: Colors.white)),
                ),
            ],
            ),
        );
        }
        if (_productosFiltrados.isEmpty) {
        return const Padding(
            padding: EdgeInsets.all(40),
            child: Center(
            child: Text('No se encontraron productos',
                style: TextStyle(color: AppColors.textoSecundario)),
            ),
        );
        }

        return Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(
                children: [
                const Text(
                    'Catálogo de productos',
                    style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secundario,
                    ),
                ),
                const SizedBox(width: 8),
                Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                    color: AppColors.primario.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                    '${_productosFiltrados.length}',
                    style: const TextStyle(
                        color: AppColors.primario,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                    ),
                    ),
                ),
                ],
            ),
            const SizedBox(height: 4),
            const Text(
                'Explora todos nuestros productos.',
                style: TextStyle(color: AppColors.textoClaro, fontSize: 12),
            ),
            const SizedBox(height: 12),
            GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _productosFiltrados.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.72,
                ),
                itemBuilder: (_, i) => _buildProductoCard(_productosFiltrados[i]),
            ),
            ],
        ),
        );
    }

    Widget _buildProductoCard(Map<String, dynamic> p) {
        final imageUrl  = _getImageUrl(p['ruta_imagen']);
        final precio = num.tryParse((p['precio_venta'] ?? p['precio_unitario'] ?? 0).toString()) ?? 0;
        final stock     = (p['stock_actual'] ?? 0) as num;
        final minimo    = (p['stock_minimo'] ?? 0) as num;
        final agotado   = stock <= 0;
        final stockBajo = stock <= minimo && stock > 0;
        final badge     = _getBadge(p);

        return GestureDetector(
        onTap: () {
            final id = p['id_producto'] ?? p['id'];
            if (id != null) {
                Navigator.pushNamed(context, '/cliente/producto', arguments: id);
            } else {
                _abrirAcceso();
            }
        },
        child: Container(
            decoration: BoxDecoration(
            color: AppColors.fondoTarjeta,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
                BoxShadow(
                color: AppColors.primario.withOpacity(0.08),
                blurRadius: 10,
                offset: const Offset(0, 4),
                ),
            ],
            ),
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
                // Imagen
                Expanded(
                child: Stack(
                    fit: StackFit.expand,
                    children: [
                    ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                        child: imageUrl.isNotEmpty
                            ? Image.network(
                                imageUrl,
                                fit: BoxFit.cover,
                                headers: {'x-api-key': AppConstants.apiKey},
                                errorBuilder: (_, __, ___) => Container(
                                color: AppColors.grisClaro,
                                child: const Icon(Icons.image_not_supported_rounded,
                                    color: AppColors.textoClaro, size: 36),
                                ),
                            )
                            : Container(
                                color: AppColors.grisClaro,
                                child: const Icon(Icons.image_rounded,
                                    color: AppColors.textoClaro, size: 36),
                            ),
                    ),
                    if (badge['mostrar'] == true)
                        Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                            color: badge['color'] as Color,
                            borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(badge['texto'],
                                style: const TextStyle(
                                    color: Colors.white, fontSize: 9,
                                    fontWeight: FontWeight.bold)),
                        ),
                        ),
                    // Overlay "Inicia sesión para comprar"
                    Positioned(
                        bottom: 0, left: 0, right: 0,
                        child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        decoration: BoxDecoration(
                            gradient: LinearGradient(
                            colors: [Colors.transparent, AppColors.primario.withOpacity(0.7)],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            ),
                        ),
                        child: const Text(
                            'Inicia sesión para pedir',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                color: Colors.white, fontSize: 9,
                                fontWeight: FontWeight.w600),
                        ),
                        ),
                    ),
                    ],
                ),
                ),

                // Info
                Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                    Text(
                        p['nom_producto'] ?? '',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 12,
                            color: AppColors.texto),
                        maxLines: 2, overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(p['nombre_c'] ?? '',
                        style: const TextStyle(color: AppColors.textoClaro, fontSize: 10)),
                    const SizedBox(height: 6),
                    Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                        Text(
                            '\$${precio.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                            style: const TextStyle(
                                color: AppColors.primario,
                                fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                            color: agotado
                                ? Colors.red.shade50
                                : stockBajo
                                    ? Colors.orange.shade50
                                    : Colors.green.shade50,
                            borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                            agotado ? 'Agotado' : stockBajo ? 'Pocas' : 'Disponible',
                            style: TextStyle(
                                fontSize: 9, fontWeight: FontWeight.bold,
                                color: agotado
                                    ? Colors.red.shade700
                                    : stockBajo
                                        ? Colors.orange.shade700
                                        : Colors.green.shade700,
                            ),
                            ),
                        ),
                        ],
                    ),
                    ],
                ),
                ),
            ],
            ),
        ),
        );
    }

    // ── Footer (sin cambios)
    Widget _buildFooter() {
        return Container(
        margin: const EdgeInsets.only(top: 28),
        padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
        decoration: const BoxDecoration(
            gradient: LinearGradient(
            colors: [Color(0xFFb4788b), Color(0xFF9B497D)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            ),
        ),
        child: Column(
            children: [
            Image.asset('lib/Assest/Logo_GO2.jpeg', height: 40,
                errorBuilder: (_, __, ___) =>
                    const Icon(Icons.storefront, size: 40, color: Colors.white)),
            const SizedBox(height: 10),
            const Text('Gurama Online',
                style: TextStyle(color: Colors.white, fontSize: 16,
                    fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Confecciones hechas con amor',
                style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 14),
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                _footerIcono(Icons.camera_alt_outlined, 'Instagram'),
                const SizedBox(width: 24),
                _footerIcono(Icons.music_note_rounded, 'TikTok'),
                ],
            ),
            const SizedBox(height: 14),
            const Text('© 2025 Gurama Online. Todos los derechos reservados.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white38, fontSize: 10)),
            ],
        ),
        );
    }

    Widget _footerIcono(IconData icon, String label) {
        return Column(
        children: [
            Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 18),
            ),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10)),
        ],
        );
    }

    // ── Popup de ofertas (sin cambios de lógica)
    Widget _buildPopup() {
        final imagenUrl = _productos.isNotEmpty && _productos[0]['ruta_imagen'] != null
            ? _getImageUrl(_productos[0]['ruta_imagen'])
            : null;

        return Container(
        color: Colors.black54,
        child: Center(
            child: Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
                color: AppColors.fondoTarjeta,
                borderRadius: BorderRadius.circular(20),
            ),
            child: SingleChildScrollView(
                child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                    Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                        GestureDetector(
                        onTap: () => setState(() => _mostrarVentana = false),
                        child: Container(
                            width: 28, height: 28,
                            decoration: BoxDecoration(
                            color: AppColors.grisClaro,
                            shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.close_rounded,
                                color: AppColors.textoSecundario, size: 16),
                        ),
                        ),
                    ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                    width: 56, height: 56,
                    decoration: BoxDecoration(
                        gradient: AppColors.gradientePrimario,
                        shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.local_offer_rounded,
                        color: Colors.white, size: 26),
                    ),
                    const SizedBox(height: 14),
                    const Text('¡Descubre nuestras\nmejores ofertas!',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold,
                            color: AppColors.secundario, height: 1.3)),
                    const SizedBox(height: 10),
                    const Text(
                        'Dale un toque tierno y único a tu mundo con nuestros amigurumis hechos a mano.\nHasta 30% de descuento en modelos seleccionados.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.textoSecundario, fontSize: 13, height: 1.4)),
                    const SizedBox(height: 14),
                    if (imagenUrl != null)
                    ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(imagenUrl,
                            height: 140, fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const SizedBox()),
                    ),
                    const SizedBox(height: 18),
                    DecoratedBox(
                    decoration: BoxDecoration(
                        gradient: AppColors.gradientePrimario,
                        borderRadius: BorderRadius.circular(12),
                    ),
                    child: ElevatedButton(
                        onPressed: () {
                        setState(() {
                            _mostrarVentana   = false;
                            _clasSeleccionada = 'En Oferta';
                        });
                        _aplicarFiltros();
                        },
                        style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Ver ofertas',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                    ),
                ],
                ),
            ),
            ),
        ),
        );
    }
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // Bottom Sheet de Acceso — sin cambios respecto al original
    // ══════════════════════════════════════════════════════════════════════════════
    class _AccesoSheet extends StatelessWidget {
    final VoidCallback onLogin;
    final VoidCallback onRegistro;
    final VoidCallback onOlvide;

    const _AccesoSheet({
        required this.onLogin,
        required this.onRegistro,
        required this.onOlvide,
    });

    @override
    Widget build(BuildContext context) {
        return Container(
        decoration: const BoxDecoration(
            color: AppColors.fondoTarjeta,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: EdgeInsets.fromLTRB(
            24, 16, 24, MediaQuery.of(context).viewInsets.bottom + 32),
        child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
            // Handle
            Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                color: AppColors.grisBorde,
                borderRadius: BorderRadius.circular(2),
                ),
            ),
            const SizedBox(height: 24),

            // Ícono
            Container(
                width: 64, height: 64,
                decoration: BoxDecoration(
                gradient: AppColors.gradientePrimario,
                shape: BoxShape.circle,
                boxShadow: AppColors.sombra,
                ),
                child: const Icon(Icons.lock_open_rounded, color: Colors.white, size: 30),
            ),
            const SizedBox(height: 14),

            const Text(
                '¡Bienvenida a Gurama Online!',
                style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.secundario,
                ),
            ),
            const SizedBox(height: 6),
            const Text(
                'Inicia sesión o crea tu cuenta para\nagregar productos y realizar pedidos.',
                textAlign: TextAlign.center,
                style: TextStyle(
                fontSize: 13,
                color: AppColors.textoSecundario,
                height: 1.5,
                ),
            ),
            const SizedBox(height: 28),

            // Botón: Iniciar sesión
            _SheetBoton(
                texto: 'Iniciar Sesión',
                icono: Icons.login_rounded,
                usarGradiente: true,
                onTap: onLogin,
            ),
            const SizedBox(height: 12),

            // Botón: Registrarse
            _SheetBoton(
                texto: 'Crear Cuenta',
                icono: Icons.person_add_alt_1_rounded,
                usarGradiente: false,
                onTap: onRegistro,
            ),
            const SizedBox(height: 16),

            // Enlace: olvidé contraseña
            TextButton.icon(
                onPressed: onOlvide,
                icon: const Icon(Icons.key_off_rounded,
                    color: AppColors.textoSecundario, size: 16),
                label: const Text(
                '¿Olvidaste tu contraseña?',
                style: TextStyle(
                    color: AppColors.textoSecundario,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                ),
                ),
            ),
            ],
        ),
        );
    }
    }

    class _SheetBoton extends StatelessWidget {
    final String       texto;
    final IconData     icono;
    final bool         usarGradiente;
    final VoidCallback onTap;

    const _SheetBoton({
        required this.texto,
        required this.icono,
        required this.usarGradiente,
        required this.onTap,
    });

    @override
    Widget build(BuildContext context) {
        if (usarGradiente) {
        return DecoratedBox(
            decoration: BoxDecoration(
            gradient: AppColors.gradientePrimario,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
                BoxShadow(
                color: AppColors.primario.withOpacity(0.35),
                blurRadius: 12,
                offset: const Offset(0, 4),
                ),
            ],
            ),
            child: ElevatedButton.icon(
            onPressed: onTap,
            icon: Icon(icono, color: Colors.white, size: 20),
            label: Text(
                texto,
                style: const TextStyle(
                    color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
            ),
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            ),
        );
        }

        return OutlinedButton.icon(
        onPressed: onTap,
        icon: Icon(icono, color: AppColors.primario, size: 20),
        label: Text(
            texto,
            style: const TextStyle(
                color: AppColors.primario, fontSize: 15, fontWeight: FontWeight.bold),
        ),
        style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 52),
            side: const BorderSide(color: AppColors.primario, width: 1.5),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        );
    }
}