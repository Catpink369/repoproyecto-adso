import 'dart:convert';
import 'package:flutter/material.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/constants/app_colors.dart';

class DProductoScreen extends StatefulWidget {
    const DProductoScreen({super.key});

    @override
    State<DProductoScreen> createState() => _DProductoScreenState();
    }

    class _DProductoScreenState extends State<DProductoScreen> {
    Map<String, dynamic>? _producto;
    bool _cargando = true;
    String? _error;
    String? _idCargado;
    
    @override
    void didChangeDependencies() {
        super.didChangeDependencies();
        final id = ModalRoute.of(context)?.settings.arguments?.toString();
        if (id != null && id != _idCargado) {
            _idCargado = id;
            _cargarProducto(id);
        }
    }

    Future<void> _cargarProducto(String id) async {
        setState(() { _cargando = true; _error = null; });
        try {
        final res = await ApiService.get('${AppConstants.obtenerProducto}/$id');
        if (res.statusCode == 200) {
            final data = jsonDecode(res.body) as Map<String, dynamic>;
            setState(() {
            _producto = {
                ...data,
                'nombre_clas': data['clasificacion']?['nombre_clas'] ?? data['nombre_clas'],
                'nombre_c':    data['categoria']?['nombre_c']        ?? data['nombre_c'],
            };
            _cargando = false;
            });
        } else {
            setState(() { _error = 'No se pudo cargar el producto'; _cargando = false; });
        }
        } catch (_) {
        setState(() { _error = 'Error de conexión'; _cargando = false; });
        }
    }

    String _getImageUrl(String? ruta) {
        if (ruta == null || ruta.isEmpty) return '';
        return '${AppConstants.baseUrl}$ruta';
    }

    bool _isStockBajo() {
        if (_producto == null) return false;
        final stock  = (_producto!['stock_actual']  ?? 0) as num;
        final minimo = (_producto!['stock_minimo'] ?? 0) as num;
        return stock > 0 && stock <= minimo;
    }

    Map<String, dynamic>? _getBadge() {
        if (_producto == null) return null;
        final stock = (_producto!['stock_actual'] ?? 0) as num;

        if (_isStockBajo()) {
        return {'texto': 'Últimas Unidades', 'color': const Color(0xFFF88787)};
        }

        final clas = (_producto!['nombre_clas'] ?? '').toString().toLowerCase();
        if (clas.isEmpty || clas == 'sin clasificar') return null;

        if (clas == 'nuevo' || clas == 'nuevos') {
        return {'texto': 'Nuevo', 'color': const Color(0xFF33F321)};
        }
        if (clas == 'en oferta' || clas == 'oferta') {
        return {'texto': 'En Oferta', 'color': const Color(0xFFEC9614)};
        }
        if (clas.contains('vendido') || clas == 'mas vendidos') {
        return {'texto': 'Más Vendido', 'color': const Color(0xFF0B87EC)};
        }
        if (clas == 'ultimas unidades') {
        return {'texto': 'Últimas Unidades', 'color': const Color(0xFFEB54BD)};
        }
        if (clas == 'destacado' || clas == 'destacados') {
        return {'texto': 'Destacado', 'color': AppColors.secundario};
        }
        if (clas == 'edición limitada' || clas == 'limitado') {
        return {'texto': 'Edición Limitada', 'color': const Color(0xFF5C6BC0)};
        }
        return {'texto': _producto!['nombre_clas'], 'color': const Color(0xFFBBBBBB)};
    }

    // ── Abre el mismo bottom sheet del landing
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
        body: _buildBody(),
        bottomNavigationBar: _buildBotonAcceso(),
        );
    }

    // ── AppBar idéntico al landing
    PreferredSizeWidget _buildAppBar() {
        return AppBar(
        backgroundColor: AppColors.blanco,
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.primario, size: 20),
            onPressed: () => Navigator.pop(context),
        ),
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

    // ── Botón inferior idéntico al landing
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

    Widget _buildBody() {
        if (_cargando) {
        return const Center(
            child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
                CircularProgressIndicator(color: AppColors.primario),
                SizedBox(height: 16),
                Text('Cargando producto...',
                    style: TextStyle(color: AppColors.textoClaro)),
            ],
            ),
        );
        }

        if (_error != null || _producto == null) {
        return Center(
            child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                const Icon(Icons.wifi_off_rounded, color: AppColors.textoClaro, size: 64),
                const SizedBox(height: 16),
                const Text('Producto no encontrado',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold,
                        color: AppColors.secundario)),
                const SizedBox(height: 8),
                Text(_error ?? 'El producto que buscas no existe',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textoSecundario)),
                const SizedBox(height: 24),
                ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primario,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30))),
                    child: const Text('Volver', style: TextStyle(color: Colors.white)),
                ),
                ],
            ),
            ),
        );
        }

        final p         = _producto!;
        final stock     = (p['stock_actual']  ?? 0) as num;
        final minimo    = (p['stock_minimo'] ?? 0) as num;
        final agotado   = stock <= 0;
        final stockBajo = stock <= minimo && stock > 0;
        final precio    = double.tryParse(p['precio_unitario']?.toString() ??
                        p['precio_venta']?.toString() ?? '0') ?? 0;
        final badge     = _getBadge();
        final imgUrl    = _getImageUrl(p['ruta_imagen']);

        return SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
            children: [
            // ── Imagen hero con badge y overlay
            _buildImagenHero(imgUrl, badge, agotado),

            // ── Info card
            Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Transform.translate(
                offset: const Offset(0, -20),
                child: Container(
                    decoration: BoxDecoration(
                    color: AppColors.fondoTarjeta,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                        BoxShadow(
                        color: AppColors.primario.withOpacity(0.08),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                        ),
                    ],
                    ),
                    padding: const EdgeInsets.all(20),
                    child: _buildInfo(p, precio, stock, agotado, stockBajo),
                ),
                ),
            ),
            ],
        ),
        );
    }

    Widget _buildImagenHero(String imgUrl, Map<String, dynamic>? badge, bool agotado) {
        return SizedBox(
        width: double.infinity,
        height: 300,
        child: Stack(
            fit: StackFit.expand,
            children: [
            // Imagen
            imgUrl.isNotEmpty
                ? Image.network(
                    imgUrl,
                    fit: BoxFit.cover,
                    headers: {'x-api-key': AppConstants.apiKey},
                    errorBuilder: (_, __, ___) => Container(
                        color: AppColors.grisClaro,
                        child: const Icon(Icons.image_not_supported_rounded,
                            color: AppColors.textoClaro, size: 64),
                    ),
                    )
                : Container(
                    color: AppColors.grisClaro,
                    child: const Icon(Icons.inventory_2_rounded,
                        color: AppColors.textoClaro, size: 64),
                    ),

            // Gradiente inferior
            Container(
                decoration: const BoxDecoration(
                gradient: LinearGradient(
                    colors: [Color(0xCCb4788b), Color(0x44b4788b), Colors.transparent],
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                ),
                ),
            ),

            // Badge
            if (badge != null)
                Positioned(
                top: 16,
                right: 16,
                child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                    color: badge['color'] as Color,
                    borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                    badge['texto'],
                    style: const TextStyle(
                        color: Colors.white, fontSize: 12,
                        fontWeight: FontWeight.bold),
                    ),
                ),
                ),

            // Overlay "Agotado"
            if (agotado)
                Container(
                color: Colors.black45,
                child: const Center(
                    child: Text(
                    'AGOTADO',
                    style: TextStyle(
                        color: Colors.white, fontSize: 28,
                        fontWeight: FontWeight.bold, letterSpacing: 4),
                    ),
                ),
                ),
            ],
        ),
        );
    }

    Widget _buildInfo(
        Map<String, dynamic> p,
        double precio,
        num stock,
        bool agotado,
        bool stockBajo,
    ) {
        final precioFmt = '\$${precio.toStringAsFixed(0).replaceAllMapped(
            RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';

        return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
            // Categoría pill
            if (p['nombre_c'] != null)
            Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                color: AppColors.primario.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                p['nombre_c'],
                style: const TextStyle(
                    color: AppColors.primario, fontSize: 12,
                    fontWeight: FontWeight.w600),
                ),
            ),

            const SizedBox(height: 10),

            // Nombre
            Text(
            p['nom_producto'] ?? '',
            style: const TextStyle(
                fontSize: 22, fontWeight: FontWeight.bold,
                color: AppColors.secundario, height: 1.2),
            ),

            const SizedBox(height: 12),

            // Precio
            Text(
            precioFmt,
            style: const TextStyle(
                fontSize: 28, fontWeight: FontWeight.bold,
                color: AppColors.primario),
            ),

            const SizedBox(height: 10),

            // Estado stock
            Row(
            children: [
                Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                    color: agotado
                        ? Colors.red.shade50
                        : stockBajo
                            ? Colors.orange.shade50
                            : Colors.green.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                    color: agotado
                        ? Colors.red.shade200
                        : stockBajo
                            ? Colors.orange.shade200
                            : Colors.green.shade200,
                    ),
                ),
                child: Text(
                    agotado
                        ? 'Agotado'
                        : stockBajo
                            ? 'Últimas $stock unidades'
                            : 'Disponible · $stock uds.',
                    style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
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

            // Alerta stock bajo
            if (stockBajo) ...[
            const SizedBox(height: 10),
            Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                color: const Color(0xFFFFF3CD),
                border: Border.all(color: const Color(0xFFFFC107)),
                borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                children: [
                    Icon(Icons.warning_amber_rounded,
                        color: Color(0xFF856404), size: 18),
                    SizedBox(width: 8),
                    Expanded(
                    child: Text(
                        '¡Últimas unidades! Date prisa antes de que se agoten.',
                        style: TextStyle(color: Color(0xFF856404), fontSize: 12),
                    ),
                    ),
                ],
                ),
            ),
            ],

            const SizedBox(height: 16),
            const Divider(color: AppColors.grisBorde),
            const SizedBox(height: 12),

            // Descripción
            const Text(
            'Descripción',
            style: TextStyle(
                fontSize: 14, fontWeight: FontWeight.bold,
                color: AppColors.secundario),
            ),
            const SizedBox(height: 6),
            Text(
            p['descripcion'] ?? 'Sin descripción disponible.',
            style: const TextStyle(
                fontSize: 14, color: AppColors.textoSecundario, height: 1.6),
            ),

            // Detalles extra
            if (p['color'] != null || p['talla'] != null || p['tamaño'] != null) ...[
            const SizedBox(height: 16),
            Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                color: AppColors.grisClaro,
                borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    const Text('Detalles del producto',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 13,
                            color: AppColors.secundario)),
                    const SizedBox(height: 8),
                    if (p['color']  != null) _detalleRow(Icons.palette_rounded, 'Color', p['color']),
                    if (p['talla']  != null) _detalleRow(Icons.straighten_rounded, 'Talla', p['talla']),
                    if (p['tamaño'] != null) _detalleRow(Icons.open_in_full_rounded, 'Tamaño', p['tamaño']),
                ],
                ),
            ),
            ],

            const SizedBox(height: 24),

            // CTA principal — lleva al bottom sheet igual que el landing
            DecoratedBox(
            decoration: BoxDecoration(
                gradient: agotado ? null : AppColors.gradientePrimario,
                color: agotado ? Colors.grey.shade300 : null,
                borderRadius: BorderRadius.circular(14),
                boxShadow: agotado
                    ? null
                    : [
                        BoxShadow(
                        color: AppColors.primario.withOpacity(0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                        ),
                    ],
            ),
            child: ElevatedButton.icon(
                onPressed: agotado ? null : _abrirAcceso,
                icon: const Icon(Icons.shopping_bag_rounded, color: Colors.white),
                label: const Text(
                'Añadir al carrito',
                style: TextStyle(
                    color: Colors.white, fontSize: 15,
                    fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                ),
            ),
            ),

            const SizedBox(height: 12),

            // Volver
            OutlinedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.arrow_back_rounded,
                color: Colors.grey.shade500, size: 18),
            label: Text('Volver al catálogo',
                style: TextStyle(
                    color: Colors.grey.shade600, fontSize: 14,
                    fontWeight: FontWeight.w500)),
            style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
            ),
            ),
        ],
        );
    }

    Widget _detalleRow(IconData icon, String label, dynamic value) {
        return Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(
            children: [
            Icon(icon, size: 16, color: AppColors.primario),
            const SizedBox(width: 8),
            Text('$label: ',
                style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13, color: AppColors.texto)),
            Text(value.toString(),
                style: const TextStyle(
                    fontSize: 13, color: AppColors.textoSecundario)),
            ],
        ),
        );
    }
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // Bottom Sheet de Acceso — idéntico al del landing
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
            Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                color: AppColors.grisBorde,
                borderRadius: BorderRadius.circular(2),
                ),
            ),
            const SizedBox(height: 24),

            Container(
                width: 64, height: 64,
                decoration: BoxDecoration(
                gradient: AppColors.gradientePrimario,
                shape: BoxShape.circle,
                boxShadow: AppColors.sombra,
                ),
                child: const Icon(Icons.lock_open_rounded,
                    color: Colors.white, size: 30),
            ),
            const SizedBox(height: 14),

            const Text(
                '¡Bienvenida a Gurama Online!',
                style: TextStyle(
                    fontSize: 20, fontWeight: FontWeight.bold,
                    color: AppColors.secundario),
            ),
            const SizedBox(height: 6),
            const Text(
                'Inicia sesión o crea tu cuenta para\nagregar productos y realizar pedidos.',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 13, color: AppColors.textoSecundario, height: 1.5),
            ),
            const SizedBox(height: 28),

            _SheetBoton(
                texto: 'Iniciar Sesión',
                icono: Icons.login_rounded,
                usarGradiente: true,
                onTap: onLogin,
            ),
            const SizedBox(height: 12),

            _SheetBoton(
                texto: 'Crear Cuenta',
                icono: Icons.person_add_alt_1_rounded,
                usarGradiente: false,
                onTap: onRegistro,
            ),
            const SizedBox(height: 16),

            TextButton.icon(
                onPressed: onOlvide,
                icon: const Icon(Icons.key_off_rounded,
                    color: AppColors.textoSecundario, size: 16),
                label: const Text(
                '¿Olvidaste tu contraseña?',
                style: TextStyle(
                    color: AppColors.textoSecundario, fontSize: 13,
                    fontWeight: FontWeight.w500),
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
            label: Text(texto,
                style: const TextStyle(
                    color: Colors.white, fontSize: 15,
                    fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
            ),
            ),
        );
        }

        return OutlinedButton.icon(
        onPressed: onTap,
        icon: Icon(icono, color: AppColors.primario, size: 20),
        label: Text(texto,
            style: const TextStyle(
                color: AppColors.primario, fontSize: 15,
                fontWeight: FontWeight.bold)),
        style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 52),
            side: const BorderSide(color: AppColors.primario, width: 1.5),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        );
    }
}