import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../../Data/models/usuario_model.dart';

/// Drawer lateral compartido por todas las pantallas de cliente
/// (Cliente_Screen, Catalogo_Screen, Carrito_Screen,
/// PedidosPersonalizados_Screen, Personalizacion_*_Screen).
/// Solo necesita el total del carrito; el usuario lo toma del
/// AuthProvider si no se le pasa explícitamente, y maneja su propia
/// navegación con rutas con nombre, así que basta con:
///   drawer: AppDrawer(totalCarrito: carrito.totalProductos),
class AppDrawer extends StatelessWidget {
  final int totalCarrito;
  final UsuarioModel? usuario;

  const AppDrawer({
    super.key,
    required this.totalCarrito,
    this.usuario,
  });

  @override
  Widget build(BuildContext context) {
    final usuarioActual = usuario ?? context.watch<AuthProvider>().usuario;

    return Drawer(
      // 78% del ancho de pantalla — se siente nativo, no demasiado ancho
      width: MediaQuery.of(context).size.width * 0.78,
      backgroundColor: AppColors.fondoTarjeta,
      child: SafeArea(
        child: Column(
          children: [
            // ── Cabecera con gradiente
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFb4788b), Color(0xFF9B497D)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.white.withOpacity(0.20),
                    child: Text(
                      usuarioActual?.nom1.isNotEmpty == true
                          ? usuarioActual!.nom1[0].toUpperCase()
                          : 'U',
                      style: const TextStyle(
                        fontSize: 24,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          usuarioActual?.nombreCompleto ?? 'Usuario',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.20),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            usuarioActual?.nombreRol ?? 'Cliente',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // ── Opciones de navegación
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _Opcion(
                    icon: Icons.home_rounded,
                    label: 'Inicio',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamedAndRemoveUntil(
                          context, '/cliente', (r) => false);
                    },
                  ),
                  _Opcion(
                    icon: Icons.grid_view_rounded,
                    label: 'Catálogo',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/cliente/catalogo');
                    },
                  ),
                  _Opcion(
                    icon: Icons.shopping_bag_outlined,
                    label: 'Mi carrito',
                    badge: totalCarrito > 0 ? '$totalCarrito' : null,
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/cliente/carrito');
                    },
                  ),
                  _Opcion(
                    icon: Icons.palette_outlined,
                    label: 'Pedido personalizado',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(
                          context, '/cliente/pedido-personalizado');
                    },
                  ),
                  _Opcion(
                    icon: Icons.person_outline_rounded,
                    label: 'Mi perfil',
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/perfil');
                    },
                  ),
                ],
              ),
            ),

            // ── Cerrar sesión anclado abajo
            const Divider(color: AppColors.grisBorde, height: 1),
            _Opcion(
              icon: Icons.logout_rounded,
              label: 'Cerrar sesión',
              color: Colors.red.shade400,
              onTap: () {
                Navigator.pop(context);
                context.read<AuthProvider>().logout();
                Navigator.pushNamedAndRemoveUntil(
                    context, '/landing', (r) => false);
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}

class _Opcion extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? badge;
  final Color? color;
  final VoidCallback onTap;

  const _Opcion({
    required this.icon,
    required this.label,
    required this.onTap,
    this.badge,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.secundario;
    return ListTile(
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: c.withOpacity(0.10),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: c, size: 20),
      ),
      title: Text(
        label,
        style: TextStyle(color: c, fontSize: 15, fontWeight: FontWeight.w500),
      ),
      trailing: badge != null
          ? Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.primario,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                badge!,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          : Icon(Icons.chevron_right_rounded,
              color: c.withOpacity(0.4), size: 20),
      onTap: onTap,
    );
  }
}