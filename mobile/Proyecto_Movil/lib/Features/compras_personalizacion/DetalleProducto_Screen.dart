import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Data/models/producto_model.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/providers/carrito_provider.dart';

class DetalleProductoScreen extends StatefulWidget {
  final ProductoModel producto;
  const DetalleProductoScreen({super.key, required this.producto});

  @override
  State<DetalleProductoScreen> createState() => _DetalleProductoScreenState();
}

class _DetalleProductoScreenState extends State<DetalleProductoScreen> {
  int _cantidad = 1;

  @override
  void dispose() {
    // Limpia de forma segura todos los snackbars de la pantalla al destruirse para evitar fugas de memoria
    if (mounted) {
      ScaffoldMessenger.of(context).clearSnackBars();
    }
    super.dispose();
  }

  int get _stockDisponible => widget.producto.stockActual;

  void _incrementar() {
    if (_cantidad < _stockDisponible) {
      setState(() => _cantidad++);
    }
  }

  void _decrementar() {
    if (_cantidad > 1) setState(() => _cantidad--);
  }

  void _agregarAlCarrito() {
    final carrito = context.read<CarritoProvider>();

    // Cuántas unidades ya están en el carrito para este producto
    final enCarrito = carrito.cantidadDeProducto(widget.producto.idProducto);
    final disponibleReal = _stockDisponible - enCarrito;

    if (disponibleReal <= 0) {
      ScaffoldMessenger.of(context)
        ..clearSnackBars()
        ..showSnackBar(
          const SnackBar(
            content: Text('Ya tienes el máximo de unidades disponibles en el carrito.'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 3),
          ),
        );
      return;
    }

    // Topa la cantidad seleccionada al disponible real
    final cantidadFinal = _cantidad.clamp(1, disponibleReal);

    // ✅ Una sola llamada — sin loop, sin notifyListeners() múltiples
    carrito.agregarCantidad(widget.producto, cantidadFinal);

    // Cierra snackbars anteriores de manera segura a través del ScaffoldMessenger global
    ScaffoldMessenger.of(context).clearSnackBars();

    // Muestra el nuevo indicador informativo
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          cantidadFinal == 1
              ? '¡Producto agregado al carrito!'
              : '$cantidadFinal unidades agregadas al carrito.',
        ),
        backgroundColor: AppColors.primario,
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'Ver carrito',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).clearSnackBars();
            Navigator.pushNamed(context, '/cliente/carrito');
          },
        ),
      ),
    );

    // Reseteamos el selector de cantidad local a 1 de forma segura
    setState(() => _cantidad = 1);
  }

  @override
  Widget build(BuildContext context) {
    final producto = widget.producto;
    final imgUrl = producto.rutaImagen != null
        ? '${AppConstants.baseUrl}${producto.rutaImagen}'
        : null;

    final agotado   = _stockDisponible <= 0;
    final stockBajo = _stockDisponible > 0 && _stockDisponible <= 3;

    return Scaffold(
      backgroundColor: AppColors.fondo,
      appBar: _buildAppBar(producto),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Imagen hero con gradientes decorativos
            _buildImagenHero(imgUrl, agotado, stockBajo),

            // ── Tarjeta flotante de información
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
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
                  child: _buildInfo(producto, agotado, stockBajo),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── AppBar Corporativo
  PreferredSizeWidget _buildAppBar(ProductoModel producto) {
    return AppBar(
      backgroundColor: AppColors.blanco,
      elevation: 0,
      scrolledUnderElevation: 0,
      iconTheme: const IconThemeData(color: AppColors.primario),
      centerTitle: true,
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
        Consumer<CarritoProvider>(
          builder: (_, carrito, __) => Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined,
                    color: AppColors.secundario, size: 24),
                onPressed: () =>
                    Navigator.pushNamed(context, '/cliente/carrito'),
              ),
              if (carrito.totalProductos > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: const BoxDecoration(
                        color: AppColors.primario, shape: BoxShape.circle),
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
        ),
        const SizedBox(width: 4),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: AppColors.grisBorde),
      ),
    );
  }

  // ── Hero Imagen con estados visuales (Agotado / Stock Bajo)
  Widget _buildImagenHero(String? imgUrl, bool agotado, bool stockBajo) {
    return SizedBox(
      width: double.infinity,
      height: 300,
      child: Stack(
        fit: StackFit.expand,
        children: [
          imgUrl != null && imgUrl.isNotEmpty
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
                  child: const Icon(Icons.shopping_bag_outlined,
                      color: AppColors.textoClaro, size: 64),
                ),

          // Gradiente inferior estilizado
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xCCb4788b),
                  Color(0x44b4788b),
                  Colors.transparent,
                ],
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
              ),
            ),
          ),

          if (stockBajo)
            Positioned(
              top: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.orange.shade600,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('Últimas unidades',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold)),
              ),
            ),

          if (agotado)
            Container(
              color: Colors.black45,
              child: const Center(
                child: Text(
                  'AGOTADO',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ── Bloques informativos de la tarjeta de producto
  Widget _buildInfo(ProductoModel producto, bool agotado, bool stockBajo) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (producto.nombreCategoria != null)
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primario.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              producto.nombreCategoria!,
              style: const TextStyle(
                  color: AppColors.primario,
                  fontSize: 12,
                  fontWeight: FontWeight.w600),
            ),
          ),

        const SizedBox(height: 10),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                producto.nomProducto,
                style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secundario,
                    height: 1.2),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              producto.precioFormateado,
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primario),
            ),
          ],
        ),

        const SizedBox(height: 12),

        // Chip descriptivo de Disponibilidad/Stock
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
                    ? 'Últimas $_stockDisponible unidades'
                    : 'Disponible · $_stockDisponible uds.',
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
                    style: TextStyle(
                        color: Color(0xFF856404), fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 16),
        const Divider(color: AppColors.grisBorde),
        const SizedBox(height: 12),

        const Text(
          'Descripción',
          style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.secundario),
        ),
        const SizedBox(height: 6),
        Text(
          producto.descripcion ?? 'Sin descripción disponible.',
          style: const TextStyle(
              fontSize: 14,
              color: AppColors.textoSecundario,
              height: 1.6),
        ),

        // Fila dinámica de especificaciones de producto
        if (producto.color != null ||
            producto.talla != null ||
            producto.tamanio != null) ...[
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
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: AppColors.secundario)),
                const SizedBox(height: 8),
                if (producto.color != null)
                  _detalleRow(
                      Icons.palette_rounded, 'Color', producto.color!),
                if (producto.talla != null)
                  _detalleRow(Icons.straighten_rounded, 'Talla',
                      producto.talla!),
                if (producto.tamanio != null)
                  _detalleRow(Icons.open_in_full_rounded, 'Tamaño',
                      producto.tamanio!),
              ],
            ),
          ),
        ],

        const SizedBox(height: 24),

        // Controladores interactivos de venta
        if (!agotado) ...[
          Row(
            children: [
              const Text(
                'Cantidad:',
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.secundario),
              ),
              const Spacer(),
              _BtnCantidad(
                icono: Icons.remove_rounded,
                onTap: _decrementar,
                activo: _cantidad > 1,
              ),
              const SizedBox(width: 4),
              Container(
                width: 48,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.blanco,
                  border: Border.all(color: AppColors.grisBorde),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$_cantidad',
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.texto),
                ),
              ),
              const SizedBox(width: 4),
              _BtnCantidad(
                icono: Icons.add_rounded,
                onTap: _incrementar,
                activo: _cantidad < _stockDisponible,
              ),
            ],
          ),

          if (_cantidad >= _stockDisponible)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                'Máximo disponible: $_stockDisponible uds.',
                style: TextStyle(
                    fontSize: 11,
                    color: Colors.orange.shade700,
                    fontWeight: FontWeight.w500),
              ),
            ),

          const SizedBox(height: 16),
        ],

        // Botón principal interactivo de envío a Carrito
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
            onPressed: agotado ? null : _agregarAlCarrito,
            icon: const Icon(Icons.shopping_cart_outlined,
                color: Colors.white),
            label: Text(
              agotado
                  ? 'Producto agotado'
                  : 'Agregar $_cantidad al carrito',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
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

        // Botón Volver
        OutlinedButton.icon(
          onPressed: () => Navigator.pop(context),
          icon: Icon(Icons.arrow_back_rounded,
              color: Colors.grey.shade500, size: 18),
          label: Text('Volver al catálogo',
              style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
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

  Widget _detalleRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primario),
          const SizedBox(width: 8),
          Text('$label: ',
              style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  color: AppColors.texto)),
          Text(value,
              style: const TextStyle(
                  fontSize: 13, color: AppColors.textoSecundario)),
        ],
      ),
    );
  }
}

// ── Botón Redondeado Personalizado para cantidad
class _BtnCantidad extends StatelessWidget {
  final IconData icono;
  final VoidCallback onTap;
  final bool activo;

  const _BtnCantidad({
    required this.icono,
    required this.onTap,
    required this.activo,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: activo ? onTap : null,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: activo
              ? AppColors.primario.withOpacity(0.12)
              : AppColors.grisClaro,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: activo
                ? AppColors.primario.withOpacity(0.3)
                : AppColors.grisBorde,
          ),
        ),
        child: Icon(
          icono,
          size: 20,
          color: activo ? AppColors.primario : AppColors.textoClaro,
        ),
      ),
    );
  }
}