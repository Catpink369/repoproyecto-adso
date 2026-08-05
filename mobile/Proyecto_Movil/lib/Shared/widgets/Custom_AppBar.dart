// para los headers
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showProfile;

  const CustomAppBar({
    super.key,
    required this.title,
    this.showProfile = true,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final usuario = auth.usuario;

    return AppBar(
      title: Text(
        title,
        style: const TextStyle(
          color: AppColors.blanco,
          fontWeight: FontWeight.bold,
        ),
      ),
      centerTitle: true,
      backgroundColor: AppColors.primario,
      elevation: 0,
      iconTheme: const IconThemeData(color: AppColors.blanco), // Asegura que el hamburguesa sea blanca
      actions: [
        if (showProfile && usuario != null)
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                Navigator.pushNamed(context, '/admin/perfil', arguments: usuario);
              },
              child: CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.blanco.withOpacity(0.2),
                backgroundImage: usuario.imgPerfil != null
                    ? NetworkImage(AppConstants.getImageUrl(usuario.imgPerfil), headers: ApiService.headers)
                    : null,
                child: usuario.imgPerfil == null
                    ? const Icon(Icons.person, color: AppColors.blanco, size: 20)
                    : null,
              ),
            ),
          ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}