import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../Shared/providers/auth_provider.dart';
import '../../Shared/widgets/AdminSidebar.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/services/api_service.dart';
import '../../Data/models/usuario_model.dart';


class PerfilAdminScreen extends StatefulWidget {
  const PerfilAdminScreen({super.key});

  @override
  State<PerfilAdminScreen> createState() => _PerfilAdminScreenState();
}

class _PerfilAdminScreenState extends State<PerfilAdminScreen> {
  bool _cargando = true;
  bool _subiendoImagen = false;
  String? _errorMensaje;

  final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  Future<void> _cargarDatos() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final idUsuario = auth.usuario?.idUsuario;

    if (idUsuario == null) {
      if (mounted) setState(() {
        _cargando = false;
        _errorMensaje = 'Usuario no encontrado en sesión.';
      });
      return;
    }

    try {
      final res = await ApiService.get('${AppConstants.obtenerUsuario}/$idUsuario');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        // Actualizamos auth provider, esto notificará a los listeners
        auth.setUsuario(data);
        if (mounted) setState(() { _cargando = false; });
      } else {
        if (mounted) setState(() {
          _cargando = false;
          _errorMensaje = 'Error al cargar datos. Status: ${res.statusCode}';
        });
      }
    } catch (e) {
      if (mounted) setState(() {
        _cargando = false;
        _errorMensaje = 'Error de conexión: $e';
      });
    }
  }

  Future<void> _cambiarImagen() async {
    XFile? pickedFile;
    try {
      final picker = ImagePicker();
      pickedFile = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    } catch (e) {
      // Si esto se dispara, el problema casi siempre es de permisos:
      // revisa READ_MEDIA_IMAGES (Android 13+) o READ_EXTERNAL_STORAGE
      // en AndroidManifest.xml.
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No se pudo abrir la galería: $e'), backgroundColor: Colors.red),
        );
      }
      return;
    }

    if (pickedFile == null) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final idUsuario = auth.usuario?.idUsuario;
    if (idUsuario == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Usuario no encontrado en sesión.'), backgroundColor: Colors.red),
        );
      }
      return;
    }

    setState(() => _subiendoImagen = true);

    try {
      final res = await ApiService.postMultipart(
        '${AppConstants.subirImagen}/$idUsuario/imagen',
        File(pickedFile.path),
        fileField: 'profileImage',
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final dataStr = await res.stream.bytesToString();
        final data = jsonDecode(dataStr);

        // Actualizar la foto en el usuario actual del provider
        if (auth.usuario != null) {
          final usuarioJson = auth.usuario!.toJson();
          usuarioJson['img_perfil'] = data['img_perfil'];
          auth.setUsuario(usuarioJson);
        }

        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Imagen actualizada exitosamente')));
      } else {
        final responseData = await res.stream.bytesToString();
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${res.statusCode} - $responseData'), backgroundColor: Colors.red));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error de conexión al subir imagen: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _subiendoImagen = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Escuchamos los cambios del usuario global
    final auth = Provider.of<AuthProvider>(context);
    final usuario = auth.usuario;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.fondo,
      drawer: usuario != null ? AdminSidebar(usuario: usuario) : null,
      body: _cargando && usuario == null
          ? const Center(child: CircularProgressIndicator(color: AppColors.primario))
          : _errorMensaje != null && usuario == null
              ? Center(child: Text(_errorMensaje!, style: const TextStyle(color: Colors.red)))
              : CustomScrollView(
                  slivers: [
                    _buildSliverAppBar(usuario),
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                        child: Column(
                          children: [
                            const SizedBox(height: 20),
                            _buildTarjetaDatos(usuario),
                            const SizedBox(height: 20),
                            _buildAcciones(),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  // ── SliverAppBar con gradiente y avatar editable
  Widget _buildSliverAppBar(UsuarioModel? usuario) {
    return SliverAppBar(
      expandedHeight: 240,
      pinned: true,
      automaticallyImplyLeading: false,
      backgroundColor: AppColors.secundario,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            // Fondo con gradiente
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF7A235F), Color(0xFFb4788b)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            // Círculos decorativos de fondo
            Positioned(
              top: -30,
              right: -30,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.06),
                ),
              ),
            ),
            Positioned(
              bottom: -20,
              left: -20,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.06),
                ),
              ),
            ),
            // Contenido: avatar + nombre + rol
            SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 8),
                  _buildAvatar(usuario),
                  const SizedBox(height: 12),
                  Text(
                    usuario?.nombreCompleto ?? 'Usuario',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.20),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      usuario?.nombreRol ?? 'Administrador',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
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
      // Barra superior con menú hamburguesa (drawer) y logo,
      // a diferencia de PerfilScreen (cliente) que usa "Volver".
      title: Row(
        children: [
          IconButton(
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
            tooltip: 'Menú',
          ),
          Image.asset(
            'lib/Assest/Logo_GO2.jpeg',
            height: 36,
            errorBuilder: (_, __, ___) => const Icon(
              Icons.storefront,
              size: 28,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  // ── Avatar con borde blanco, indicador de carga y botón de cámara
  Widget _buildAvatar(UsuarioModel? usuario) {
    return GestureDetector(
      onTap: _subiendoImagen ? null : _cambiarImagen,
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.20),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: CircleAvatar(
              radius: 46,
              backgroundColor: Colors.white.withOpacity(0.20),
              backgroundImage: usuario?.imgPerfil != null
                  ? CachedNetworkImageProvider(AppConstants.getImageUrl(usuario!.imgPerfil), headers: ApiService.headers)
                  : null,
              child: usuario?.imgPerfil == null
                  ? Text(
                      (usuario?.nom1.isNotEmpty ?? false) ? usuario!.nom1[0].toUpperCase() : 'U',
                      style: const TextStyle(
                        fontSize: 38,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
          ),
          if (_subiendoImagen)
            Positioned.fill(
              child: Container(
                decoration: const BoxDecoration(color: Colors.black45, shape: BoxShape.circle),
                child: const Center(child: CircularProgressIndicator(color: Colors.white)),
              ),
            ),
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primario,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
              child: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
            ),
          ),
        ],
      ),
    );
  }

  // ── Tarjeta de datos personales
  Widget _buildTarjetaDatos(UsuarioModel? usuario) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.fondoTarjeta,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primario.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Encabezado de la tarjeta
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  gradient: AppColors.gradientePrimario,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.person_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              const Text(
                'Información personal',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.secundario,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(height: 1, color: AppColors.grisBorde),
          const SizedBox(height: 4),
          _FilaDato(
            icono: Icons.badge_outlined,
            label: 'Número de usuario',
            valor: '${usuario?.tDoc ?? ''} ${usuario?.idUsuario ?? ''}',
          ),
          Container(height: 1, color: AppColors.grisBorde),
          _FilaDato(
            icono: Icons.email_outlined,
            label: 'Correo electrónico',
            valor: usuario?.correo ?? 'No disponible',
          ),
          Container(height: 1, color: AppColors.grisBorde),
          _FilaDato(
            icono: Icons.phone_outlined,
            label: 'Número telefónico',
            valor: usuario?.telefono ?? 'No registrado',
          ),
          Container(height: 1, color: AppColors.grisBorde),
          _FilaDato(
            icono: Icons.fingerprint_rounded,
            label: 'Identificación',
            valor: usuario?.idUsuario.toString() ?? '',
          ),
        ],
      ),
    );
  }

  // ── Botones de acción
  Widget _buildAcciones() {
    return Column(
      children: [
        _BotonAccion(
          icono: Icons.edit_outlined,
          texto: 'Cambiar datos',
          onTap: () => Navigator.pushNamed(context, '/cambiar-datos'),
        ),
        const SizedBox(height: 12),
        _BotonAccion(
          icono: Icons.lock_outline_rounded,
          texto: 'Cambiar contraseña',
          onTap: () => Navigator.pushNamed(context, '/cambiar-contrasena'),
        ),
        const SizedBox(height: 12),
        _BotonAccionCerrar(
          onTap: () {
            context.read<AuthProvider>().logout();
            Navigator.pushNamedAndRemoveUntil(context, '/landing', (route) => false);
          },
        ),
      ],
    );
  }
}

// ── Fila de dato individual
class _FilaDato extends StatelessWidget {
  final IconData icono;
  final String label;
  final String valor;

  const _FilaDato({
    required this.icono,
    required this.label,
    required this.valor,
  });

  @override
  Widget build(BuildContext context) {
    final mostrar = valor.trim().isEmpty ? 'No disponible' : valor;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primario.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icono, color: AppColors.primario, size: 18),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textoClaro,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  mostrar,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.texto,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Botón de acción estándar
class _BotonAccion extends StatelessWidget {
  final IconData icono;
  final String texto;
  final VoidCallback onTap;

  const _BotonAccion({
    required this.icono,
    required this.texto,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: AppColors.primario.withOpacity(0.35)),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          backgroundColor: AppColors.fondoTarjeta,
        ),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: AppColors.primario.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icono, color: AppColors.primario, size: 18),
            ),
            const SizedBox(width: 14),
            Text(
              texto,
              style: const TextStyle(
                color: AppColors.secundario,
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            Icon(Icons.chevron_right_rounded, color: AppColors.primario.withOpacity(0.5), size: 20),
          ],
        ),
      ),
    );
  }
}

// ── Botón cerrar sesión con gradiente rojo
class _BotonAccionCerrar extends StatelessWidget {
  final VoidCallback onTap;

  const _BotonAccionCerrar({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.red.shade400, Colors.red.shade600],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withOpacity(0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.logout_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 14),
              const Text(
                'Cerrar sesión',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              Icon(Icons.chevron_right_rounded, color: Colors.white.withOpacity(0.6), size: 20),
            ],
          ),
        ),
      ),
    );
  }
}