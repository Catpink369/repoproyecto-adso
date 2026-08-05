import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Shared/providers/carrito_provider.dart';
import '../../Shared/providers/comprobante_provider.dart';
import '../../Shared/providers/auth_provider.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Data/models/carrito_model.dart';
import '../../Shared/constants/app_constants.dart';
import 'Comprobante_Screen.dart';
import '../../Shared/widgets/app_drawer.dart';

class CarritoScreen extends StatelessWidget {
  const CarritoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CarritoProvider>(
      builder: (context, carrito, _) {
        final scaffoldKey = GlobalKey<ScaffoldState>();
        return Scaffold(
          key: scaffoldKey,
          backgroundColor: AppColors.fondo,
          drawer: AppDrawer(totalCarrito: carrito.totalProductos),
          appBar: _buildAppBar(context, scaffoldKey, carrito),
          body: carrito.items.isEmpty
              ? _carritoVacio(context)
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(15),
                        itemCount: carrito.items.length,
                        itemBuilder: (_, i) => _ItemCarrito(
                          item: carrito.items[i],
                          carrito: carrito,
                        ),
                      ),
                    ),
                    _PanelTotal(carrito: carrito),
                  ],
                ),
        );
      },
    );
  }

  PreferredSizeWidget _buildAppBar(
    BuildContext context,
    GlobalKey<ScaffoldState> key,
    CarritoProvider carrito,
  ) {
    return AppBar(
      backgroundColor: AppColors.blanco,
      elevation: 0,
      scrolledUnderElevation: 0,
      automaticallyImplyLeading: false,
      centerTitle: true,
      leading: IconButton(
        icon: const Icon(Icons.menu_rounded,
            color: AppColors.secundario, size: 26),
        onPressed: () => key.currentState?.openDrawer(),
        tooltip: 'Menú',
      ),
      title: Text(
        'Carrito (${carrito.totalProductos})',
        style: const TextStyle(
            color: AppColors.secundario,
            fontWeight: FontWeight.bold,
            fontSize: 18),
      ),
      actions: [
        if (carrito.items.isNotEmpty)
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.primario),
            onPressed: () => showDialog(
              context: context,
              builder: (_) => AlertDialog(
                title: const Text('¿Vaciar carrito?'),
                content: const Text(
                    'Se eliminarán todos los productos del carrito.'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancelar',
                        style: TextStyle(color: AppColors.secundario)),
                  ),
                  TextButton(
                    onPressed: () {
                      carrito.vaciar();
                      Navigator.pop(context);
                    },
                    child: const Text('Vaciar',
                        style: TextStyle(color: AppColors.primario)),
                  ),
                ],
              ),
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

  Widget _carritoVacio(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.shopping_cart_outlined,
              color: AppColors.acento, size: 80),
          const SizedBox(height: 15),
          const Text(
            'Tu carrito está vacío',
            style: TextStyle(
                fontSize: 18,
                color: AppColors.secundario,
                fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

// ── Panel de total y acción — StatefulWidget para bloquear doble envío
class _PanelTotal extends StatefulWidget {
  final CarritoProvider carrito;
  const _PanelTotal({required this.carrito});

  @override
  State<_PanelTotal> createState() => _PanelTotalState();
}

class _PanelTotalState extends State<_PanelTotal> {
  // ✅ Flag que bloquea el botón mientras se procesa el pedido
  bool _procesando = false;

  Future<void> _generarTicket(BuildContext context) async {
    // ✅ Guard contra double-tap: si ya está procesando, ignorar
    if (_procesando) return;
    setState(() => _procesando = true);

    try {
      final usuario = context.read<AuthProvider>().usuario;
      final token   = context.read<AuthProvider>().token;

      if (usuario == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Sesión expirada. Por favor inicia sesión de nuevo.'),
          backgroundColor: AppColors.primario,
        ));
        return;
      }

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(
            child: CircularProgressIndicator(color: AppColors.primario)),
      );

      final exito = await context.read<ComprobanteProvider>().crearTicket(
            items: widget.carrito.items,
            usuario: usuario,
            metodoPago: 'Efectivo contra entrega',
            token: token ?? '',
          );

      if (context.mounted) Navigator.pop(context); // cierra el loading

      if (exito) {
        if (context.mounted) {
          Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const ComprobanteScreen()));
        }
      } else {
        final error = context.read<ComprobanteProvider>().error;
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(error ?? 'Error al procesar el pedido'),
            backgroundColor: AppColors.primario,
          ));
        }
      }
    } finally {
      // ✅ Siempre libera el flag, incluso si hubo error
      if (mounted) setState(() => _procesando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.fondoTarjeta,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
        boxShadow: [
          BoxShadow(
              color: AppColors.primario.withOpacity(0.10), blurRadius: 10)
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Productos:',
                  style: TextStyle(color: AppColors.textoSecundario)),
              Text('${widget.carrito.totalProductos}',
                  style: const TextStyle(color: AppColors.textoSecundario)),
            ],
          ),
          const Divider(height: 20, color: AppColors.grisBorde),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total:',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secundario),
              ),
              Text(
                widget.carrito.totalFormateado,
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primario),
              ),
            ],
          ),
          const SizedBox(height: 15),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: DecoratedBox(
              decoration: BoxDecoration(
                // ✅ Gris mientras procesa, gradiente cuando está listo
                gradient: _procesando ? null : AppColors.gradientePrimario,
                color: _procesando ? Colors.grey.shade300 : null,
                borderRadius: BorderRadius.circular(15),
              ),
              child: ElevatedButton(
                // ✅ null deshabilita el botón completamente mientras procesa
                onPressed: _procesando ? null : () => _generarTicket(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15)),
                ),
                child: _procesando
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2.5),
                      )
                    : const Text(
                        'Generar Comprobante de Pedido',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Item individual del carrito
class _ItemCarrito extends StatelessWidget {
  final CarritoItemModel item;
  final CarritoProvider  carrito;
  const _ItemCarrito({required this.item, required this.carrito});

  @override
  Widget build(BuildContext context) {
    final imgUrl = item.producto.rutaImagen != null
        ? '${AppConstants.baseUrl}${item.producto.rutaImagen}'
        : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.fondoTarjeta,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
              color: AppColors.primario.withOpacity(0.08),
              blurRadius: 8,
              offset: const Offset(0, 3))
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
                color: AppColors.fondo,
                borderRadius: BorderRadius.circular(10)),
            child: imgUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      imgUrl,
                      fit: BoxFit.cover,
                      headers: {'x-api-key': AppConstants.apiKey},
                      errorBuilder: (_, __, ___) => const Icon(
                          Icons.shopping_bag_outlined,
                          color: AppColors.acento),
                    ),
                  )
                : const Icon(Icons.shopping_bag_outlined,
                    color: AppColors.acento),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.producto.nomProducto,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.secundario,
                      fontSize: 14),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(item.producto.precioFormateado,
                    style: const TextStyle(
                        color: AppColors.primario,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  'Subtotal: ${item.subtotalFormateado}',
                  style: const TextStyle(
                      color: AppColors.textoSecundario, fontSize: 12),
                ),
              ],
            ),
          ),
          Column(
            children: [
              GestureDetector(
                onTap: () => carrito.eliminar(item.producto.idProducto),
                child: const Icon(Icons.delete_outline,
                    color: AppColors.primario, size: 20),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _BtnCantidad(
                    icono: Icons.remove,
                    onTap: () =>
                        carrito.disminuirCantidad(item.producto.idProducto),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      '${item.cantidad}',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.secundario),
                    ),
                  ),
                  _BtnCantidad(
                    icono: Icons.add,
                    onTap: () =>
                        carrito.aumentarCantidad(item.producto.idProducto),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BtnCantidad extends StatelessWidget {
  final IconData     icono;
  final VoidCallback onTap;
  const _BtnCantidad({required this.icono, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
            color: AppColors.primario,
            borderRadius: BorderRadius.circular(8)),
        child: Icon(icono, color: Colors.white, size: 16),
      ),
    );
  }
}