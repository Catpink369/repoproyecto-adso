import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/providers/carrito_provider.dart';
import '../../Shared/widgets/app_drawer.dart';
import 'Personalizacion_Sabanas_Screen.dart';
import 'Personalizacion_Cubrelechos_Screen.dart';

class PedidosPersonalizadosScreen extends StatelessWidget {
  const PedidosPersonalizadosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final scaffoldKey = GlobalKey<ScaffoldState>();
    final carrito     = context.watch<CarritoProvider>();

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: AppColors.fondo,
      drawer: AppDrawer(totalCarrito: carrito.totalProductos),
      appBar: _buildAppBar(scaffoldKey),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Banner informativo
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppColors.gradientePrimario,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                      color: AppColors.primario.withOpacity(0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 4)),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.auto_fix_high,
                      color: Colors.white, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Personaliza tu pedido',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Elige el tipo de producto, tamaño, tela y color. Todo hecho a tu medida.',
                          style: TextStyle(
                              color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),
            const Text(
              '¿Qué deseas personalizar?',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secundario),
            ),
            const SizedBox(height: 20),

            // ── Tarjeta Sábanas
            _tarjetaProducto(
              context: context,
              titulo: 'Sábanas',
              descripcion:
                  'Personaliza tu sábana con la tela, color, tamaño y extras que prefieras.',
              icono: Icons.king_bed_outlined,
              color: AppColors.primario,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) =>
                        const PersonalizacionSabanasScreen()),
              ),
            ),
            const SizedBox(height: 15),

            // ── Tarjeta Cubrelechos
            _tarjetaProducto(
              context: context,
              titulo: 'Cubrelechos',
              descripcion:
                  'Diseña tu cubrelecho con dos telas, colores y diseños diferentes.',
              icono: Icons.layers_outlined,
              color: AppColors.secundario,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) =>
                        const PersonalizacionCubrelechosScreen()),
              ),
            ),
            const SizedBox(height: 25),

            // ── Nota informativa
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: AppColors.fondoTarjeta,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: AppColors.grisBorde),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline,
                      color: AppColors.primario),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'El pago se realiza contra entrega. Recibirás un ticket con los detalles de tu pedido.',
                      style: TextStyle(
                          color: AppColors.textoSecundario,
                          fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(GlobalKey<ScaffoldState> key) {
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
      title: const Text(
        'Pedidos Personalizados',
        style: TextStyle(
            color: AppColors.secundario,
            fontWeight: FontWeight.bold,
            fontSize: 18),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: AppColors.grisBorde),
      ),
    );
  }

  Widget _tarjetaProducto({
    required BuildContext context,
    required String titulo,
    required String descripcion,
    required IconData icono,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.fondoTarjeta,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
                color: color.withOpacity(0.12),
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
                  color: color.withOpacity(0.10),
                  borderRadius: BorderRadius.circular(15)),
              child:
                  Center(child: Icon(icono, color: color, size: 35)),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    titulo,
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: color),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    descripcion,
                    style: const TextStyle(
                        color: AppColors.textoSecundario,
                        fontSize: 13),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded,
                color: color.withOpacity(0.5), size: 24),
          ],
        ),
      ),
    );
  }
}