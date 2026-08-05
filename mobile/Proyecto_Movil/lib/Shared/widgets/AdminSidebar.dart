import 'package:flutter/material.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/services/api_service.dart';
import '../../Data/models/usuario_model.dart';
import '../../Shared/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class AdminSidebar extends StatelessWidget {
  final UsuarioModel usuario;

  const AdminSidebar({super.key, required this.usuario});

  void _navegar(BuildContext context, String ruta) {
    Navigator.pop(context); // cierra el drawer
    // Si ya estamos en esa ruta, no hacemos nada (opcional)
    if (ModalRoute.of(context)?.settings.name == ruta) return;
    
    Navigator.pushNamed(context, ruta, arguments: usuario);
  }

  void _logout(BuildContext context) {
    context.read<AuthProvider>().logout();
    ApiService.clearToken();
    Navigator.pushReplacementNamed(context, '/landing');
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Header del drawer con datos del usuario
          DrawerHeader(
            decoration: const BoxDecoration(color: AppColors.primario),
            child: GestureDetector(
              onTap: () => _navegar(context, '/admin/perfil'),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.blanco,
                    backgroundImage: usuario.imgPerfil != null
                        ? NetworkImage(AppConstants.getImageUrl(usuario.imgPerfil), headers: ApiService.headers)
                        : null,
                    child: usuario.imgPerfil == null
                        ? const Icon(Icons.person, color: AppColors.primario, size: 35)
                        : null,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    usuario.nombreCompleto,
                    style: const TextStyle(
                      color: AppColors.blanco,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    usuario.correo,
                    style: const TextStyle(color: AppColors.blanco, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),

          _MenuItem(
            icon: Icons.dashboard,
            title: 'Panel de control',
            onTap: () => _navegar(context, '/admin/panel'),
          ),
          _MenuItem(
            icon: Icons.inventory,
            title: 'Productos',
            onTap: () => _navegar(context, '/admin/productos'),
          ),
          _MenuItem(
            icon: Icons.category,
            title: 'Materiales',
            onTap: () => _navegar(context, '/admin/materiales'),
          ),
          _MenuItem(
            icon: Icons.swap_horiz,
            title: 'Movimientos',
            onTap: () => _navegar(context, '/admin/movimientos'),
          ),
          _MenuItem(
            icon: Icons.receipt_long,
            title: 'Pedidos realizados',
            onTap: () => _navegar(context, '/admin/pedidos'),
          ),

          // Solo admin (rol 1)
          if (usuario.isAdmin) ...[
            const Divider(),
            _MenuItem(
              icon: Icons.people,
              title: 'Gestión de usuarios',
              onTap: () => _navegar(context, '/admin/usuarios'),
            ),
          ],

          const Divider(),
          _MenuItem(
            icon: Icons.logout,
            title: 'Cerrar sesión',
            color: Colors.red,
            onTap: () => _logout(context),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color? color;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.primario;
    return ListTile(
      leading: Icon(icon, color: c),
      title: Text(title, style: TextStyle(color: color ?? AppColors.texto)),
      onTap: onTap,
    );
  }
}
