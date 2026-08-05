import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/providers/auth_provider.dart';
import '../../Shared/providers/carrito_provider.dart';
import '../../Shared/widgets/app_drawer.dart';
import '../../Data/models/producto_model.dart';

class ClienteScreen extends StatefulWidget {
    const ClienteScreen({super.key});

    @override
    State<ClienteScreen> createState() => _ClienteScreenState();
    }

    class _ClienteScreenState extends State<ClienteScreen> {
    // ── Key para abrir el Drawer programáticamente
    final _scaffoldKey = GlobalKey<ScaffoldState>();

    bool _mostrarPopup = true;
    bool _cargando     = true;

    List<Map<String, dynamic>> _productos       = [];
    List<Map<String, dynamic>> _productosNuevos = [];
    Map<String, dynamic>?      _primerProducto;

    final _buscadorCtrl = TextEditingController();

    // ── Notificaciones
    bool _mostrarNotif        = false;
    // Cada notificación ahora incluye 'leida': bool para poder
    // marcarla individualmente y que desaparezca de la lista.
    List<Map<String, dynamic>> _notificaciones = [];
    int  _cantidadNoLeidas   = 0;

    static const String _whatsapp = 'https://wa.me/573123456789';
    static const String _direccion = 'Calle 123 #45-67, Bogotá';

    @override
    void initState() {
        super.initState();
        _cargarProductos();
        _cargarNotificaciones();
    }

    @override
    void dispose() {
        _buscadorCtrl.dispose();
        super.dispose();
    }

    Future<void> _cargarProductos() async {
        setState(() => _cargando = true);
        try {
        final res = await ApiService.get(AppConstants.obtenerProductos);
        if (res.statusCode == 200) {
            final data  = jsonDecode(res.body);
            final lista = (data is List ? data : data['data'] ?? []) as List;
            final todos = lista.cast<Map<String, dynamic>>();

            final nuevos = todos.where((p) {
            final clas = (p['nombre_clas'] ?? '').toString().toLowerCase();
            return clas == 'nuevo' || clas == 'nuevos';
            }).take(4).toList();

            setState(() {
            _productos       = todos;
            _productosNuevos = nuevos;
            _primerProducto  = todos.isNotEmpty ? todos.first : null;
            _cargando        = false;
            });
        }
        } catch (_) {
        setState(() => _cargando = false);
        }
    }

    Future<void> _cargarNotificaciones() async {
        final usuario = context.read<AuthProvider>().usuario;
        if (usuario == null) return;
        try {
            final res = await ApiService.get('/pedidos/usuario/${usuario.idUsuario}');
            if (res.statusCode != 200) return;
            final data = jsonDecode(res.body);
            final lista = (data is List ? data : data['data'] ?? []) as List;
            final notifs = <Map<String, dynamic>>[];
            for (final pedido in lista) {
                final id = pedido['id_pedido'];
                final fecha = pedido['fecha'] ?? '';
                notifs.add({
                    'id': 'confirmacion-$id',
                    'tipo': 'confirmacion',
                    'titulo': 'Pedido registrado',
                    'mensaje': 'Tu pedido #$id fue registrado exitosamente. Pronto lo estaremos preparando.',
                    'fecha': fecha,
                    'leida': false,
                });
                if (pedido['estado'] == 'En proceso') {
                    notifs.add({
                        'id': 'proceso-$id',
                        'tipo': 'proceso',
                        'titulo': 'Pedido en proceso',
                        'mensaje': 'Tu pedido #$id ya está siendo preparado con mucho amor.',
                        'fecha': fecha,
                        'leida': false,
                    });
                }
                if (pedido['estado'] == 'Entregado' || pedido['estado'] == 'Finalizado') {
                    notifs.add({
                        'id': 'listo-$id',
                        'tipo': 'listo',
                        'titulo': '¡Tu pedido está listo!',
                        'mensaje': 'Tu pedido #$id está listo para recoger en: $_direccion. ¡Te esperamos!',
                        'fecha': fecha,
                        'leida': false,
                    });
                }
            }
            setState(() {
                _notificaciones    = notifs;
                _cantidadNoLeidas  = notifs.where((n) => n['leida'] == false).length;
            });
        } catch (e) {
            debugPrint('Error notificaciones: $e');
        }
    }

    // ── Marca una notificación como leída y la quita de la lista visible.
    void _marcarLeida(String id) {
        setState(() {
            _notificaciones.removeWhere((n) => n['id'] == id);
            _cantidadNoLeidas = _notificaciones.where((n) => n['leida'] == false).length;
        });
    }

    // ── Limpia todas las notificaciones de la lista visible.
    void _limpiarTodas() {
        setState(() {
            _notificaciones   = [];
            _cantidadNoLeidas = 0;
        });
    }

    Color _colorTipo(String tipo) {
        switch (tipo) {
            case 'confirmacion': return const Color(0xFF4CAF50);
            case 'proceso':      return const Color(0xFF2196F3);
            case 'listo':        return AppColors.primario;
            default:             return AppColors.grisBorde;
        }
    }

    String _getImageUrl(String? ruta) {
        if (ruta == null || ruta.isEmpty) return '';
        return '${AppConstants.baseUrl}$ruta';
    }

    void _buscar() {
        final termino = _buscadorCtrl.text.trim();
        if (termino.isNotEmpty) {
        Navigator.pushNamed(context, '/cliente/catalogo',
            arguments: {'search': termino});
        }
    }

    // ── Abre el Drawer lateral en lugar del bottom sheet
    void _abrirMenu() {
        _scaffoldKey.currentState?.openDrawer();
    }

    @override
    Widget build(BuildContext context) {
        final carrito = context.watch<CarritoProvider>();
        final usuario = context.watch<AuthProvider>().usuario;

        return Scaffold(
        key: _scaffoldKey,
        backgroundColor: AppColors.fondo,
        appBar: _buildAppBar(carrito.totalProductos),

        // ── Drawer lateral (izquierda → derecha), compartido con
        // Catalogo, Carrito y PedidosPersonalizados.
        drawer: AppDrawer(
            usuario:      usuario,
            totalCarrito: carrito.totalProductos,
        ),

        body: Stack(
            children: [
            RefreshIndicator(
                onRefresh: _cargarProductos,
                color: AppColors.primario,
                child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                    children: [
                    _buildHero(),
                    _buildBuscador(),
                    _buildFranjaPromo(),
                    _buildProductosNuevos(),
                    _buildVerCatalogo(),
                    _buildFooter(),
                    const SizedBox(height: 16),
                    ],
                ),
                ),
            ),
            if (_mostrarPopup) _buildPopup(),
            if (_mostrarNotif) _buildPanelNotif(),
            ],
        ),
        );
    }

    // ── AppBar
    PreferredSizeWidget _buildAppBar(int totalCarrito) {
        return AppBar(
        backgroundColor: AppColors.blanco,
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        leading: IconButton(
            icon: const Icon(Icons.menu_rounded,
                color: AppColors.secundario, size: 26),
            onPressed: _abrirMenu,
            tooltip: 'Menú',
        ),
        title: Image.asset(
            'lib/Assest/Logo_GO.jpeg',
            height: 40,
            errorBuilder: (_, __, ___) => const Text(
            'Gurama Online',
            style: TextStyle(
                color: AppColors.secundario,
                fontWeight: FontWeight.bold,
                fontSize: 18),
            ),
        ),
        actions: [
            Stack(
                clipBehavior: Clip.none,
                children: [
                    IconButton(
                        icon: const Icon(Icons.notifications_outlined,
                            color: AppColors.secundario, size: 26),
                        onPressed: () {
                            setState(() {
                                _mostrarNotif     = !_mostrarNotif;
                            });
                        },
                    ),
                    if (_cantidadNoLeidas > 0)
                        Positioned(
                            right: 6, top: 6,
                            child: Container(
                                width: 16, height: 16,
                                decoration: const BoxDecoration(
                                    color: AppColors.primario,
                                    shape: BoxShape.circle),
                                child: Text(
                                    '$_cantidadNoLeidas',
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
            const SizedBox(width: 4),
        ],
        bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: AppColors.grisBorde),
        ),
        );
    }

    // ── Hero banner
    Widget _buildHero() {
        final imagenUrl = _primerProducto?['ruta_imagen'] != null
            ? _getImageUrl(_primerProducto!['ruta_imagen'])
            : null;

        return SizedBox(
        width: double.infinity,
        height: 220,
        child: Stack(
            fit: StackFit.expand,
            children: [
            if (imagenUrl != null && imagenUrl.isNotEmpty)
                Image.network(
                imagenUrl,
                fit: BoxFit.cover,
                headers: {'x-api-key': AppConstants.apiKey},
                errorBuilder: (_, __, ___) =>
                    Container(color: AppColors.secundario),
                )
            else
                Container(color: AppColors.secundario),
            Container(
                decoration: const BoxDecoration(
                gradient: LinearGradient(
                    colors: [
                    Color(0xCCb4788b),
                    Color(0x88b4788b),
                    Color(0x00000000),
                    ],
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                ),
                ),
            ),
            Positioned(
                left: 20,
                right: 20,
                bottom: 20,
                child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                    Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
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
                            letterSpacing: 0.8),
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
                        Shadow(
                            color: Color(0x66000000),
                            blurRadius: 8,
                            offset: Offset(0, 2)),
                        ],
                    ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton(
                    onPressed: () =>
                        Navigator.pushNamed(context, '/cliente/catalogo'),
                    style: OutlinedButton.styleFrom(
                        side: const BorderSide(
                            color: Colors.white, width: 1.5),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 18, vertical: 8),
                        backgroundColor:
                            Colors.white.withOpacity(0.12),
                    ),
                    child: const Text(
                        'Ver catálogo',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600),
                    ),
                    ),
                ],
                ),
            ),
            ],
        ),
        );
    }

    // ── Buscador
    Widget _buildBuscador() {
        return Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Row(
            children: [
            Expanded(
                child: TextField(
                controller: _buscadorCtrl,
                onSubmitted: (_) => _buscar(),
                style: const TextStyle(
                    color: AppColors.texto, fontSize: 14),
                decoration: InputDecoration(
                    hintText: 'Buscar productos...',
                    hintStyle: const TextStyle(
                        color: AppColors.textoClaro, fontSize: 14),
                    filled: true,
                    fillColor: AppColors.blanco,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: const BorderSide(
                            color: AppColors.grisBorde)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: const BorderSide(
                            color: AppColors.grisBorde)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: const BorderSide(
                            color: AppColors.primario, width: 2)),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 18, vertical: 12),
                ),
                ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
                onTap: _buscar,
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
                child: const Icon(Icons.search_rounded,
                    color: Colors.white, size: 22),
                ),
            ),
            ],
        ),
        );
    }

    // ── Franja promo
    Widget _buildFranjaPromo() {
        return Container(
        margin: const EdgeInsets.only(top: 24),
        width: double.infinity,
        padding:
            const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
        decoration: BoxDecoration(
            gradient: LinearGradient(
            colors: [
                AppColors.primario.withOpacity(0.08),
                AppColors.acento.withOpacity(0.08),
            ],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            ),
            border: Border.symmetric(
            horizontal: BorderSide(
                color: AppColors.primario.withOpacity(0.2), width: 1),
            ),
        ),
        child: Column(
            children: [
            const Text(
                'Sorprende a tus seres queridos\ncon regalos únicos hechos con amor 🧶',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 15,
                    color: AppColors.secundario,
                    fontWeight: FontWeight.w600,
                    height: 1.4),
            ),
            const SizedBox(height: 16),
            GestureDetector(
                onTap: () =>
                    Navigator.pushNamed(context, '/cliente/catalogo'),
                child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 28, vertical: 12),
                decoration: BoxDecoration(
                    gradient: AppColors.gradientePrimario,
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                    BoxShadow(
                        color: AppColors.primario.withOpacity(0.30),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                    ),
                    ],
                ),
                child: const Text(
                    'Explorar catálogo',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold),
                ),
                ),
            ),
            ],
        ),
        );
    }

    // ── Productos nuevos
    Widget _buildProductosNuevos() {
        if (_cargando) {
        return const Padding(
            padding: EdgeInsets.all(40),
            child: Center(
                child: CircularProgressIndicator(
                    color: AppColors.primario)),
        );
        }
        if (_productosNuevos.isEmpty) return const SizedBox.shrink();

        return Padding(
        padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(
                children: [
                const Text(
                    '¡Nuevos Productos!',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secundario),
                ),
                const SizedBox(width: 8),
                Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                    color: AppColors.primario.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                    '${_productosNuevos.length}',
                    style: const TextStyle(
                        color: AppColors.primario,
                        fontSize: 12,
                        fontWeight: FontWeight.bold),
                    ),
                ),
                ],
            ),
            const SizedBox(height: 4),
            const Text(
                'Las últimas novedades hechas con amor.',
                style: TextStyle(
                    color: AppColors.textoClaro, fontSize: 12),
            ),
            const SizedBox(height: 12),
            GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _productosNuevos.length,
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 0.72,
                ),
                itemBuilder: (_, i) {
                final p = _productosNuevos[i];
                return _ProductoCard(
                    producto: p,
                    getImageUrl: _getImageUrl,
                    onTap: () {
                    final id = p['id_producto'] ?? p['id'];
                    if (id != null) {
                        Navigator.pushNamed(
                            context, '/cliente/producto',
                            arguments: {'producto': ProductoModel.fromJson(p)},
                            );
                    }
                    },
                );
                },
            ),
            ],
        ),
        );
    }

    // ── Banner ver catálogo completo
    Widget _buildVerCatalogo() {
        return Padding(
        padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
        child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
            color: AppColors.fondoTarjeta,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
                BoxShadow(
                    color: AppColors.primario.withOpacity(0.07),
                    blurRadius: 10,
                    offset: const Offset(0, 4)),
            ],
            ),
            child: Column(
            children: [
                const Icon(Icons.grid_view_rounded,
                    color: AppColors.primario, size: 32),
                const SizedBox(height: 10),
                const Text(
                'Explora todo nuestro catálogo',
                style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secundario),
                ),
                const SizedBox(height: 6),
                const Text(
                'Descubre todos nuestros productos y\nencuentra el regalo perfecto.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: AppColors.textoClaro,
                    fontSize: 12,
                    height: 1.4),
                ),
                const SizedBox(height: 16),
                GestureDetector(
                onTap: () =>
                    Navigator.pushNamed(context, '/cliente/catalogo'),
                child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 32, vertical: 12),
                    decoration: BoxDecoration(
                    gradient: AppColors.gradientePrimario,
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                        BoxShadow(
                        color: AppColors.primario.withOpacity(0.30),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                        ),
                    ],
                    ),
                    child: const Text(
                    'Ver Catálogo Completo',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold),
                    ),
                ),
                ),
            ],
            ),
        ),
        );
    }

    // ── Footer
    Widget _buildFooter() {
        return Container(
        margin: const EdgeInsets.only(top: 28),
        padding:
            const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
        decoration: const BoxDecoration(
            gradient: LinearGradient(
            colors: [Color(0xFFb4788b), Color(0xFF9B497D)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            ),
        ),
        child: Column(
            children: [
            Image.asset(
                'lib/Assest/Logo_GO2.jpeg',
                height: 40,
                errorBuilder: (_, __, ___) => const Icon(
                    Icons.storefront,
                    size: 40,
                    color: Colors.white),
            ),
            const SizedBox(height: 10),
            const Text(
                'Gurama Online',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text(
                'Confecciones hechas con amor',
                style:
                    TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 14),
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                _footerIcono(
                    Icons.camera_alt_outlined, 'Instagram'),
                const SizedBox(width: 24),
                _footerIcono(
                    Icons.music_note_rounded, 'TikTok'),
                ],
            ),
            const SizedBox(height: 14),
            const Text(
                '© 2025 Gurama Online. Todos los derechos reservados.',
                textAlign: TextAlign.center,
                style:
                    TextStyle(color: Colors.white38, fontSize: 10),
            ),
            ],
        ),
        );
    }

    Widget _footerIcono(IconData icon, String label) {
        return Column(
        children: [
            Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                shape: BoxShape.circle),
            child: Icon(icon, color: Colors.white, size: 18),
            ),
            const SizedBox(height: 4),
            Text(label,
                style: const TextStyle(
                    color: Colors.white60, fontSize: 10)),
        ],
        );
    }

    // ── Popup de ofertas
    Widget _buildPopup() {
        final imagenUrl = _primerProducto?['ruta_imagen'] != null
            ? _getImageUrl(_primerProducto!['ruta_imagen'])
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
                        onTap: () =>
                            setState(() => _mostrarPopup = false),
                        child: Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                                color: AppColors.grisClaro,
                                shape: BoxShape.circle),
                            child: const Icon(Icons.close_rounded,
                                color: AppColors.textoSecundario,
                                size: 16),
                        ),
                        ),
                    ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                        gradient: AppColors.gradientePrimario,
                        shape: BoxShape.circle),
                    child: const Icon(Icons.local_offer_rounded,
                        color: Colors.white, size: 26),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                    '¡Descubre nuestras\nmejores ofertas!',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.secundario,
                        height: 1.3),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                    'Dale un toque tierno y único a tu mundo con\nnuestros amigurumis hechos a mano.\nHasta 30% de descuento en modelos seleccionados.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: AppColors.textoSecundario,
                        fontSize: 13,
                        height: 1.4),
                    ),
                    const SizedBox(height: 14),
                    if (imagenUrl != null)
                    ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                        imagenUrl,
                        height: 140,
                        fit: BoxFit.cover,
                        headers: {'x-api-key': AppConstants.apiKey},
                        errorBuilder: (_, __, ___) =>
                            const SizedBox(),
                        ),
                    ),
                    const SizedBox(height: 18),
                    // ── Al presionar "Ver ofertas" se navega al catálogo
                    // y CatalogoScreen.dart ya lee este argumento para
                    // filtrar realmente los productos en oferta.
                    DecoratedBox(
                    decoration: BoxDecoration(
                        gradient: AppColors.gradientePrimario,
                        borderRadius: BorderRadius.circular(12)),
                    child: ElevatedButton(
                        onPressed: () {
                        setState(() => _mostrarPopup = false);
                        Navigator.pushNamed(
                            context, '/cliente/catalogo',
                            arguments: {
                                'clasificacion': 'En Oferta'
                            });
                        },
                        style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 32, vertical: 12),
                        shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(12)),
                        ),
                        child: const Text(
                        'Ver ofertas',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold),
                        ),
                    ),
                    ),
                ],
                ),
            ),
            ),
        ),
        );
    }

    // ── Panel de notificaciones: tap individual marca como leída
    // y desaparece; botón "Limpiar todas" vacía la lista completa.
    Widget _buildPanelNotif() {
        return Positioned(
            top: 0, right: 8,
            child: Material(
                elevation: 8,
                borderRadius: BorderRadius.circular(16),
                color: AppColors.fondoTarjeta,
                child: Container(
                    width: 300,
                    constraints: const BoxConstraints(maxHeight: 460),
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.grisBorde),
                    ),
                    child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                            // Header del panel
                            Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 12),
                                decoration: const BoxDecoration(
                                    gradient: LinearGradient(
                                        colors: [Color(0xFF7A235F), Color(0xFF9B497D)],
                                        begin: Alignment.centerLeft,
                                        end: Alignment.centerRight,
                                    ),
                                    borderRadius: BorderRadius.vertical(
                                        top: Radius.circular(16)),
                                ),
                                child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                        const Text('Notificaciones',
                                            style: TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15)),
                                        GestureDetector(
                                            onTap: () => setState(
                                                () => _mostrarNotif = false),
                                            child: const Icon(Icons.close_rounded,
                                                color: Colors.white, size: 18),
                                        ),
                                    ],
                                ),
                            ),
                            // Barra de acción "Limpiar todas"
                            if (_notificaciones.isNotEmpty)
                                Padding(
                                    padding: const EdgeInsets.fromLTRB(
                                        12, 8, 12, 0),
                                    child: Align(
                                        alignment: Alignment.centerRight,
                                        child: GestureDetector(
                                            onTap: _limpiarTodas,
                                            child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                    const Icon(
                                                        Icons.done_all_rounded,
                                                        size: 14,
                                                        color: AppColors.primario,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    const Text(
                                                        'Limpiar todas',
                                                        style: TextStyle(
                                                            color: AppColors.primario,
                                                            fontSize: 12,
                                                            fontWeight:
                                                                FontWeight.w600,
                                                        ),
                                                    ),
                                                ],
                                            ),
                                        ),
                                    ),
                                ),
                            // Cuerpo
                            Flexible(
                                child: _notificaciones.isEmpty
                                    ? const Padding(
                                        padding: EdgeInsets.all(24),
                                        child: Text(
                                            'No tienes notificaciones por ahora.',
                                            style: TextStyle(
                                                color: AppColors.textoClaro,
                                                fontSize: 13),
                                            textAlign: TextAlign.center,
                                        ),
                                    )
                                    : ListView.separated(
                                        shrinkWrap: true,
                                        padding: const EdgeInsets.all(12),
                                        itemCount: _notificaciones.length,
                                        separatorBuilder: (_, __) =>
                                            const SizedBox(height: 8),
                                        itemBuilder: (_, i) {
                                            final n = _notificaciones[i];
                                            final color =
                                                _colorTipo(n['tipo'] ?? '');
                                            return GestureDetector(
                                                // Tap en la tarjeta marca como leída
                                                // y la quita de la lista.
                                                onTap: () => _marcarLeida(n['id']),
                                                child: Container(
                                                    padding: const EdgeInsets.all(12),
                                                    decoration: BoxDecoration(
                                                        color: color.withOpacity(0.06),
                                                        borderRadius:
                                                            BorderRadius.circular(10),
                                                        border: Border(
                                                            left: BorderSide(
                                                                color: color,
                                                                width: 4)),
                                                    ),
                                                    child: Row(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment.start,
                                                        children: [
                                                            Expanded(
                                                                child: Column(
                                                                    crossAxisAlignment:
                                                                        CrossAxisAlignment
                                                                            .start,
                                                                    children: [
                                                                        Text(n['titulo'] ?? '',
                                                                            style: TextStyle(
                                                                                fontWeight:
                                                                                    FontWeight.bold,
                                                                                color: color,
                                                                                fontSize: 13)),
                                                                        const SizedBox(height: 4),
                                                                        Text(n['mensaje'] ?? '',
                                                                            style: const TextStyle(
                                                                                color: AppColors
                                                                                    .textoSecundario,
                                                                                fontSize: 12)),
                                                                        const SizedBox(height: 6),
                                                                        GestureDetector(
                                                                            onTap: () async {
                                                                                // abrir WhatsApp
                                                                            },
                                                                            child: const Text(
                                                                                '¿Preguntas? Escríbenos por WhatsApp',
                                                                                style: TextStyle(
                                                                                    color: Color(
                                                                                        0xFF25D366),
                                                                                    fontSize: 11,
                                                                                    fontWeight:
                                                                                        FontWeight
                                                                                            .w600),
                                                                            ),
                                                                        ),
                                                                    ],
                                                                ),
                                                            ),
                                                            const SizedBox(width: 6),
                                                            // Check explícito para marcar como leída,
                                                            // además del tap en toda la tarjeta.
                                                            Icon(
                                                                Icons.check_circle_outline_rounded,
                                                                size: 18,
                                                                color: color.withOpacity(0.5),
                                                            ),
                                                        ],
                                                    ),
                                                ),
                                            );
                                        },
                                    ),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // Tarjeta de producto
    // ══════════════════════════════════════════════════════════════════════════════
    class _ProductoCard extends StatelessWidget {
    final Map<String, dynamic>    producto;
    final String Function(String?) getImageUrl;
    final VoidCallback             onTap;

    const _ProductoCard({
        required this.producto,
        required this.getImageUrl,
        required this.onTap,
    });

    @override
    Widget build(BuildContext context) {
        final stock  = (producto['stock_actual'] ?? 0) as num;
        final precio = num.tryParse(
            (producto['precio_unitario'] ??
                    producto['precio_venta'] ??
                    0)
                .toString()) ??
            0;
        final imgUrl  = getImageUrl(producto['ruta_imagen']);
        final agotado = stock <= 0;

        return GestureDetector(
        onTap: onTap,
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
                Expanded(
                child: Stack(
                    fit: StackFit.expand,
                    children: [
                    ClipRRect(
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(16)),
                        child: imgUrl.isNotEmpty
                            ? Image.network(
                                imgUrl,
                                fit: BoxFit.cover,
                                headers: {
                                'x-api-key': AppConstants.apiKey
                                },
                                errorBuilder: (_, __, ___) =>
                                    Container(
                                color: AppColors.grisClaro,
                                child: const Icon(
                                    Icons
                                        .image_not_supported_rounded,
                                    color: AppColors.textoClaro,
                                    size: 36),
                                ),
                            )
                            : Container(
                                color: AppColors.grisClaro,
                                child: const Icon(
                                    Icons.image_rounded,
                                    color: AppColors.textoClaro,
                                    size: 36),
                            ),
                    ),
                    Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                            color: const Color(0xFF33F321),
                            borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                            'Nuevo',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold),
                        ),
                        ),
                    ),
                    ],
                ),
                ),
                Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                    Text(
                        producto['nom_producto'] ?? '',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: AppColors.texto),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                        producto['nombre_c'] ?? '',
                        style: const TextStyle(
                            color: AppColors.textoClaro,
                            fontSize: 10),
                    ),
                    const SizedBox(height: 6),
                    Row(
                        mainAxisAlignment:
                            MainAxisAlignment.spaceBetween,
                        children: [
                        Text(
                            '\$${precio.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                            style: const TextStyle(
                                color: AppColors.primario,
                                fontWeight: FontWeight.bold,
                                fontSize: 13),
                        ),
                        Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                            color: agotado
                                ? Colors.red.shade50
                                : Colors.green.shade50,
                            borderRadius:
                                BorderRadius.circular(6),
                            ),
                            child: Text(
                            agotado ? 'Agotado' : 'Disponible',
                            style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: agotado
                                    ? Colors.red.shade700
                                    : Colors.green.shade700),
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
}