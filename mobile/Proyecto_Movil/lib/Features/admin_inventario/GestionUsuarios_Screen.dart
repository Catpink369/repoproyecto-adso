import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:math';

import '../../Data/models/usuario_model.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/AdminSidebar.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/services/api_service.dart';
import '../../Shared/widgets/app_snackbar.dart';

// ─── Helpers ─────────────────────────────────────────────────────────────────
Color _avatarColor(String seed) {
  final colores = [
    AppColors.primario,
    AppColors.primarioOscuro,
    const Color(0xFF7B6CF0),
    const Color(0xFFE8885A),
    const Color(0xFF4CAF7D),
    const Color(0xFF5B8DEE),
  ];
  final hash = seed.codeUnits.fold(0, (h, c) => h + c);
  return colores[hash % colores.length];
}

String _generarCodigo() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  final rand  = Random();
  final parte = List.generate(5, (_) => chars[rand.nextInt(chars.length)]).join();
  return 'TRB-$parte';
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANTALLA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
class GestionUsuariosScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const GestionUsuariosScreen({super.key, required this.usuario});

  @override
  State<GestionUsuariosScreen> createState() => _GestionUsuariosScreenState();
}

class _GestionUsuariosScreenState extends State<GestionUsuariosScreen>
    with SingleTickerProviderStateMixin {

  late TabController _tabController;

  List<UsuarioModel> _todos        = [];
  bool   _cargando                 = true;
  String _busqueda                 = '';
  String _filtroEstado             = 'todos';
  final  _busquedaCtrl             = TextEditingController();

  int get _tabIndex => _tabController.index;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this)
      ..addListener(() => setState(() {}));
    _cargarUsuarios();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _busquedaCtrl.dispose();
    super.dispose();
  }

  // ── API ───────────────────────────────────────────────────────────────────
  Future<void> _cargarUsuarios() async {
    setState(() => _cargando = true);
    try {
      final res = await ApiService.get(AppConstants.obtenerUsuarios);
      if (!mounted) return;
      if (res.statusCode == 200) {
        final data  = jsonDecode(res.body);
        final lista = (data is List ? data : data['data'] ?? []) as List;
        setState(() {
          _todos    = lista.map((j) => UsuarioModel.fromJson(j)).toList();
          _cargando = false;
        });
      } else {
        setState(() => _cargando = false);
        _toast('Error al cargar usuarios', ok: false);
      }
    } catch (_) {
      setState(() => _cargando = false);
      _toast('Error de conexión', ok: false);
    }
  }

  Future<void> _cambiarEstado(UsuarioModel u) async {
    final accion   = u.estado ? 'desactivar' : 'activar';
    final confirmar = await _dialogConfirmar(
      titulo:    u.estado ? 'Desactivar usuario' : 'Activar usuario',
      msg:       '¿Seguro que deseas $accion a ${u.nombreCompleto}?',
      colorBoton: u.estado ? AppColors.error : AppColors.exito,
      labelBoton: u.estado ? 'Desactivar' : 'Activar',
    );
    if (!confirmar) return;

    try {
      final res = await ApiService.patch(
          '${AppConstants.obtenerUsuarios}/${u.idUsuario}/estado', {});
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        _toast(u.estado ? 'Usuario desactivado' : 'Usuario activado');
        _cargarUsuarios();
      } else {
        _toast('Error al cambiar estado', ok: false);
      }
    } catch (_) {
      _toast('Error de conexión', ok: false);
    }
  }

  // ── Filtros ───────────────────────────────────────────────────────────────
  List<UsuarioModel> get _porTab {
    final rol = _tabIndex == 0 ? '2' : '3';
    return _todos.where((u) => u.idRolUsuario == rol).toList();
  }

  List<UsuarioModel> get _visibles {
    final term = _busqueda.toLowerCase();
    return _porTab.where((u) {
      final coincideBusc = term.isEmpty ||
          u.nombreCompleto.toLowerCase().contains(term) ||
          u.correo.toLowerCase().contains(term) ||
          (u.telefono ?? '').contains(term) ||
          u.idUsuario.toLowerCase().contains(term);
      final coincideEstado = _filtroEstado == 'todos' ||
          (_filtroEstado == 'activos'   &&  u.estado) ||
          (_filtroEstado == 'inactivos' && !u.estado);
      return coincideBusc && coincideEstado;
    }).toList();
  }

  int _cuentaPorRol(String rol) =>
      _todos.where((u) => u.idRolUsuario == rol).length;

  // ── UI helpers ────────────────────────────────────────────────────────────
  void _toast(String msg, {bool ok = true}) {
    if (!mounted) return;
    ok ? AppSnackBar.success(context, msg) : AppSnackBar.error(context, msg);
  }

  Future<bool> _dialogConfirmar({
    required String titulo,
    required String msg,
    required Color  colorBoton,
    required String labelBoton,
  }) async {
    return await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(titulo,
            style: const TextStyle(fontWeight: FontWeight.bold,
                color: AppColors.secundario, fontSize: 17)),
        content: Text(msg,
            style: const TextStyle(color: AppColors.texto, fontSize: 14)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar',
                style: TextStyle(color: AppColors.textoSecundario)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: colorBoton,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(labelBoton,
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    ) ?? false;
  }

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.fondo,
      appBar: CustomAppBar(title: 'Gestión de Usuarios', showProfile: false),
      drawer: AdminSidebar(usuario: widget.usuario),
      body: _cargando
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primario))
          : Column(
              children: [
                _buildHeader(),
                _buildStatsRow(),
                _buildTabBar(),
                _buildToolbar(),
                Expanded(child: _buildLista()),
              ],
            ),
      floatingActionButton: _tabIndex == 1
          ? FloatingActionButton.extended(
              onPressed: _abrirModalRegistrar,
              backgroundColor: AppColors.primario,
              icon: const Icon(Icons.person_add_rounded, color: Colors.white),
              label: const Text('Registrar Trabajador',
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
    );
  }

  // ── Header ────────────────────────────────────────────────────────────────
  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: const BoxDecoration(gradient: AppColors.gradientePrimario),
      child: Row(
        children: [
          const Icon(Icons.group_rounded, color: Colors.white, size: 28),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Usuarios',
                  style: TextStyle(color: Colors.white, fontSize: 18,
                      fontWeight: FontWeight.bold)),
              Text('Total: ${_todos.length} registros',
                  style: const TextStyle(
                      color: Colors.white70, fontSize: 12)),
            ],
          ),
          const Spacer(),
          IconButton(
            onPressed: _cargarUsuarios,
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Recargar',
          ),
        ],
      ),
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  Widget _buildStatsRow() {
    final tab       = _porTab;
    final activos   = tab.where((u) => u.estado).length;
    final inactivos = tab.length - activos;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          _statCard('Total',     tab.length.toString(),
              AppColors.primario, Icons.people_rounded),
          const SizedBox(width: 10),
          _statCard('Activos',   activos.toString(),
              AppColors.exito,    Icons.check_circle_rounded),
          const SizedBox(width: 10),
          _statCard('Inactivos', inactivos.toString(),
              AppColors.error,    Icons.cancel_rounded),
        ],
      ),
    );
  }

  Widget _statCard(String label, String valor, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: AppColors.blanco,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.25)),
          boxShadow: [
            BoxShadow(color: color.withOpacity(0.08),
                blurRadius: 8, offset: const Offset(0, 3)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 10),
              Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(valor,
                      style: TextStyle(fontSize: 20,
                          fontWeight: FontWeight.w800, color: color)),
                  Text(label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis, 
                      style: const TextStyle(fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textoSecundario)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Tab bar ───────────────────────────────────────────────────────────────
  Widget _buildTabBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.blanco,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.grisBorde),
        ),
        child: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            gradient: AppColors.gradientePrimario,
            borderRadius: BorderRadius.circular(10),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          labelColor: Colors.white,
          unselectedLabelColor: AppColors.textoSecundario,
          labelStyle: const TextStyle(
              fontWeight: FontWeight.bold, fontSize: 13),
          unselectedLabelStyle: const TextStyle(fontSize: 13),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Clientes'),
                  const SizedBox(width: 6),
                  _tabBadge(_cuentaPorRol('2'), _tabIndex == 0),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Trabajadores'),
                  const SizedBox(width: 6),
                  _tabBadge(_cuentaPorRol('3'), _tabIndex == 1),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tabBadge(int count, bool activo) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
    decoration: BoxDecoration(
      color: activo
          ? Colors.white.withOpacity(0.3)
          : AppColors.grisClaro,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text('$count',
        style: TextStyle(
          fontSize: 11, fontWeight: FontWeight.w700,
          color: activo ? Colors.white : AppColors.textoSecundario,
        )),
  );

  // ── Toolbar ───────────────────────────────────────────────────────────────
  Widget _buildToolbar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _busquedaCtrl,
              onChanged: (v) => setState(() => _busqueda = v),
              style: const TextStyle(color: AppColors.texto, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Buscar por nombre, correo, ID...',
                hintStyle: const TextStyle(
                    color: AppColors.textoClaro, fontSize: 13),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: AppColors.primario, size: 20),
                suffixIcon: _busqueda.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded,
                            color: AppColors.textoClaro, size: 18),
                        onPressed: () {
                          _busquedaCtrl.clear();
                          setState(() => _busqueda = '');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.blanco,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: AppColors.grisBorde)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: AppColors.grisBorde)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                        color: AppColors.primario, width: 1.5)),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 11),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            height: 46,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: AppColors.blanco,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grisBorde),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _filtroEstado,
                icon: const Icon(Icons.filter_list_rounded,
                    color: AppColors.primario, size: 18),
                style: const TextStyle(
                    color: AppColors.texto, fontSize: 13),
                items: const [
                  DropdownMenuItem(value: 'todos',    child: Text('Todos')),
                  DropdownMenuItem(value: 'activos',  child: Text('Activos')),
                  DropdownMenuItem(value: 'inactivos',child: Text('Inactivos')),
                ],
                onChanged: (v) => setState(() => _filtroEstado = v!),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Lista ─────────────────────────────────────────────────────────────────
  Widget _buildLista() {
    final lista = _visibles;

    if (lista.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _busqueda.isNotEmpty
                  ? Icons.search_off_rounded
                  : Icons.group_off_rounded,
              size: 56, color: AppColors.textoClaro,
            ),
            const SizedBox(height: 14),
            Text(
              _busqueda.isNotEmpty
                  ? 'Sin resultados para "$_busqueda"'
                  : _tabIndex == 0
                      ? 'No hay clientes registrados'
                      : 'No hay trabajadores registrados',
              style: const TextStyle(color: AppColors.textoSecundario,
                  fontWeight: FontWeight.w600, fontSize: 15),
            ),
            const SizedBox(height: 6),
            Text(
              _tabIndex == 1
                  ? 'Registra el primero con el botón +'
                  : 'Los clientes aparecen al registrarse',
              style: const TextStyle(
                  color: AppColors.textoClaro, fontSize: 13),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _cargarUsuarios,
      color: AppColors.primario,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
        itemCount: lista.length + 1,
        itemBuilder: (_, i) {
          if (i == lista.length) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Mostrando ${lista.length} de ${_porTab.length} '
                '${_tabIndex == 0 ? 'clientes' : 'trabajadores'}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                    color: AppColors.textoClaro, fontSize: 12),
              ),
            );
          }
          return _buildCard(lista[i]);
        },
      ),
    );
  }

  // ── Tarjeta de usuario ────────────────────────────────────────────────────
  Widget _buildCard(UsuarioModel u) {
    final color    = _avatarColor(u.idUsuario);
    final iniciales =
        '${u.nom1.isNotEmpty ? u.nom1[0] : ''}${u.ape1.isNotEmpty ? u.ape1[0] : ''}'
            .toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.blanco,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grisBorde.withOpacity(0.6)),
        boxShadow: [
          BoxShadow(color: AppColors.primario.withOpacity(0.05),
              blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          // ── Fila principal
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              children: [
                // Avatar
                Container(
                  width: 46, height: 46,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                  child: Center(
                    child: Text(iniciales,
                        style: const TextStyle(color: Colors.white,
                            fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ),
                const SizedBox(width: 12),

                // Nombre + ID
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(u.nombreCompleto,
                          style: const TextStyle(fontWeight: FontWeight.bold,
                              fontSize: 14, color: AppColors.texto),
                          maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 2),
                      Text('ID: ${u.idUsuario}',
                          style: const TextStyle(
                              fontSize: 11, color: AppColors.textoClaro)),
                    ],
                  ),
                ),

                // Badges
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _badgeRol(u.idRolUsuario),
                    const SizedBox(height: 4),
                    _badgeEstado(u.estado),
                  ],
                ),
              ],
            ),
          ),

          // ── Contacto
          Padding(
            padding: const EdgeInsets.fromLTRB(72, 0, 14, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (u.correo.isNotEmpty)
                  Row(children: [
                    const Icon(Icons.email_outlined,
                        size: 13, color: AppColors.textoClaro),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(u.correo,
                          style: const TextStyle(fontSize: 12,
                              color: AppColors.textoSecundario),
                          overflow: TextOverflow.ellipsis),
                    ),
                  ]),
                if ((u.telefono ?? '').isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Row(children: [
                    const Icon(Icons.phone_outlined,
                        size: 13, color: AppColors.textoClaro),
                    const SizedBox(width: 5),
                    Text(u.telefono!,
                        style: const TextStyle(fontSize: 12,
                            color: AppColors.textoSecundario)),
                  ]),
                ],
              ],
            ),
          ),

          // ── Acciones
          Divider(height: 1, color: AppColors.grisBorde.withOpacity(0.5)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Row(
              children: [
                _accionBtn(
                  label:   'Editar',
                  icon:    Icons.edit_rounded,
                  color:   AppColors.primario,
                  bgColor: AppColors.fondo,
                  onTap:   () => _abrirModalEditar(u),
                ),
                const SizedBox(width: 8),
                _accionBtn(
                  label:   u.estado ? 'Desactivar' : 'Activar',
                  icon:    u.estado
                      ? Icons.block_rounded
                      : Icons.check_circle_rounded,
                  color:   u.estado ? AppColors.error : AppColors.exito,
                  bgColor: u.estado
                      ? AppColors.error.withOpacity(0.08)
                      : AppColors.exito.withOpacity(0.08),
                  onTap:   () => _cambiarEstado(u),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _badgeRol(String id) {
    final map = <String, (Color, Color)>{
      '1': (AppColors.secundario,        const Color(0xFFEDE8FF)),
      '2': (AppColors.primario,          AppColors.fondo),
      '3': (const Color(0xFF1565C0),     const Color(0xFFE8F4FD)),
    };
    final c = map[id] ?? (AppColors.textoClaro, AppColors.grisClaro);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
          color: c.$2, borderRadius: BorderRadius.circular(20)),
      child: Text(u_rolNombre(id),
          style: TextStyle(fontSize: 10,
              fontWeight: FontWeight.w700, color: c.$1)),
    );
  }

  Widget _badgeEstado(bool activo) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: activo
          ? AppColors.exito.withOpacity(0.10)
          : AppColors.error.withOpacity(0.10),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(
        color: activo
            ? AppColors.exito.withOpacity(0.35)
            : AppColors.error.withOpacity(0.35),
      ),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.circle, size: 7,
            color: activo ? AppColors.exito : AppColors.error),
        const SizedBox(width: 4),
        Text(activo ? 'Activo' : 'Inactivo',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                color: activo ? AppColors.exito : AppColors.error)),
      ],
    ),
  );

  Widget _accionBtn({
    required String       label,
    required IconData     icon,
    required Color        color,
    required Color        bgColor,
    required VoidCallback onTap,
  }) =>
      GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
              color: bgColor, borderRadius: BorderRadius.circular(10)),
          child: Row(children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 5),
            Text(label,
                style: TextStyle(fontSize: 12,
                    fontWeight: FontWeight.w600, color: color)),
          ]),
        ),
      );

  // ── Modales ───────────────────────────────────────────────────────────────
  void _abrirModalEditar(UsuarioModel u) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ModalEditarUsuario(
        usuario:   u,
        onGuardado: (msg) { _toast(msg); _cargarUsuarios(); },
      ),
    );
  }

  void _abrirModalRegistrar() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ModalRegistrarTrabajador(
        onGuardado: (msg) { _toast(msg); _cargarUsuarios(); },
      ),
    );
  }
}

// ─── Helper nombre de rol (función libre para uso en badges) ─────────────────
String u_rolNombre(String id) {
  switch (id) {
    case '1': return 'Admin';
    case '2': return 'Cliente';
    case '3': return 'Trabajador';
    default:  return 'N/A';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  MODAL: EDITAR USUARIO
// ══════════════════════════════════════════════════════════════════════════════
class _ModalEditarUsuario extends StatefulWidget {
  final UsuarioModel           usuario;
  final void Function(String)  onGuardado;
  const _ModalEditarUsuario(
      {required this.usuario, required this.onGuardado});

  @override
  State<_ModalEditarUsuario> createState() => _ModalEditarUsuarioState();
}

class _ModalEditarUsuarioState extends State<_ModalEditarUsuario> {
  late final TextEditingController _nom1Ctrl;
  late final TextEditingController _nom2Ctrl;
  late final TextEditingController _ape1Ctrl;
  late final TextEditingController _ape2Ctrl;
  late final TextEditingController _correoCtrl;
  late final TextEditingController _telCtrl;
  late String _rol;

  bool   _guardando = false;
  String _error     = '';

  @override
  void initState() {
    super.initState();
    final u     = widget.usuario;
    _nom1Ctrl   = TextEditingController(text: u.nom1);
    _nom2Ctrl   = TextEditingController(text: u.nom2 ?? '');
    _ape1Ctrl   = TextEditingController(text: u.ape1);
    _ape2Ctrl   = TextEditingController(text: u.ape2 ?? '');
    _correoCtrl = TextEditingController(text: u.correo);
    _telCtrl    = TextEditingController(text: u.telefono ?? '');
    _rol        = u.idRolUsuario;
  }

  @override
  void dispose() {
    _nom1Ctrl.dispose(); _nom2Ctrl.dispose();
    _ape1Ctrl.dispose(); _ape2Ctrl.dispose();
    _correoCtrl.dispose(); _telCtrl.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    if (_nom1Ctrl.text.trim().isEmpty ||
        _ape1Ctrl.text.trim().isEmpty ||
        _correoCtrl.text.trim().isEmpty) {
      setState(() =>
          _error = 'Nombre, apellido y correo son obligatorios.');
      return;
    }
    setState(() { _guardando = true; _error = ''; });
    try {
      final body = {
        'nom_1':          _nom1Ctrl.text.trim(),
        'nom_2':          _nom2Ctrl.text.trim(),
        'ape_1':          _ape1Ctrl.text.trim(),
        'ape_2':          _ape2Ctrl.text.trim(),
        'correo':         _correoCtrl.text.trim(),
        'telefono':       _telCtrl.text.trim(),
        'id_rol_usuario': _rol,
      };
      final res = await ApiService.patch(
          '${AppConstants.obtenerUsuarios}/${widget.usuario.idUsuario}',
          body);
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        Navigator.pop(context);
        widget.onGuardado('Usuario actualizado exitosamente.');
      } else {
        final d = jsonDecode(res.body);
        setState(() =>
            _error = d['message']?.toString() ?? 'Error al actualizar.');
      }
    } catch (_) {
      setState(() => _error = 'Error de conexión.');
    } finally {
      if (mounted) setState(() => _guardando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _ModalBase(
      titulo:     'Editar Usuario',
      subtitulo:  'ID: ${widget.usuario.idUsuario}',
      icono:      Icons.edit_rounded,
      error:      _error,
      guardando:  _guardando,
      onGuardar:  _guardar,
      labelBoton: 'Guardar Cambios',
      children: [
        _fila2([
          _campo('Primer Nombre *', _nom1Ctrl),
          _campo('Segundo Nombre',  _nom2Ctrl),
        ]),
        const SizedBox(height: 14),
        _fila2([
          _campo('Primer Apellido *', _ape1Ctrl),
          _campo('Segundo Apellido',  _ape2Ctrl),
        ]),
        const SizedBox(height: 14),
        _campo('Correo *', _correoCtrl,
            tipo: TextInputType.emailAddress, icon: Icons.email_outlined),
        const SizedBox(height: 14),
        _campo('Teléfono', _telCtrl,
            tipo: TextInputType.phone,   icon: Icons.phone_outlined),
        const SizedBox(height: 14),
        // Dropdown rol
        _labelCampo('Rol'),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: AppColors.fondoInput,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.grisBorde),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _rol,
              isExpanded: true,
              style: const TextStyle(color: AppColors.texto, fontSize: 14),
              items: const [
                DropdownMenuItem(value: '1', child: Text('Administrador')),
                DropdownMenuItem(value: '2', child: Text('Cliente')),
                DropdownMenuItem(value: '3', child: Text('Trabajador')),
              ],
              onChanged: (v) => setState(() => _rol = v!),
            ),
          ),
        ),
      ],
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  MODAL: REGISTRAR TRABAJADOR
// ══════════════════════════════════════════════════════════════════════════════
class _ModalRegistrarTrabajador extends StatefulWidget {
  final void Function(String) onGuardado;
  const _ModalRegistrarTrabajador({required this.onGuardado});

  @override
  State<_ModalRegistrarTrabajador> createState() =>
      _ModalRegistrarTrabajadorState();
}

class _ModalRegistrarTrabajadorState
    extends State<_ModalRegistrarTrabajador> {
  final _idCtrl     = TextEditingController();
  final _nom1Ctrl   = TextEditingController();
  final _nom2Ctrl   = TextEditingController();
  final _ape1Ctrl   = TextEditingController();
  final _ape2Ctrl   = TextEditingController();
  final _correoCtrl = TextEditingController();
  final _telCtrl    = TextEditingController();
  final _passCtrl   = TextEditingController();
  late final _codigoCtrl =
      TextEditingController(text: _generarCodigo());

  String _tDoc      = 'CC';
  bool   _guardando = false;
  bool   _verPass   = false;
  String _error     = '';

  @override
  void dispose() {
    _idCtrl.dispose();     _nom1Ctrl.dispose(); _nom2Ctrl.dispose();
    _ape1Ctrl.dispose();   _ape2Ctrl.dispose(); _correoCtrl.dispose();
    _telCtrl.dispose();    _passCtrl.dispose(); _codigoCtrl.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    if (_idCtrl.text.trim().isEmpty    ||
        _nom1Ctrl.text.trim().isEmpty  ||
        _ape1Ctrl.text.trim().isEmpty  ||
        _correoCtrl.text.trim().isEmpty ||
        _passCtrl.text.trim().isEmpty) {
      setState(() => _error =
          'Documento, nombre, apellido, correo y contraseña son obligatorios.');
      return;
    }
    if (_passCtrl.text.trim().length < 6) {
      setState(() =>
          _error = 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setState(() { _guardando = true; _error = ''; });
    try {
      final body = {
        'id_usuario':     _idCtrl.text.trim(),
        't_doc':          _tDoc,
        'nom_1':          _nom1Ctrl.text.trim(),
        'nom_2':          _nom2Ctrl.text.trim().isEmpty
            ? null : _nom2Ctrl.text.trim(),
        'ape_1':          _ape1Ctrl.text.trim(),
        'ape_2':          _ape2Ctrl.text.trim().isEmpty
            ? null : _ape2Ctrl.text.trim(),
        'correo':         _correoCtrl.text.trim(),
        'telefono':       _telCtrl.text.trim(),
        'contrasena':     _passCtrl.text.trim(),
        'codigo':         _codigoCtrl.text.trim(),
        'id_rol_usuario': '3',
        'estado':         1,
      };
      final res =
          await ApiService.post(AppConstants.obtenerUsuarios, body);
      if (!mounted) return;
      if (res.statusCode == 200 || res.statusCode == 201) {
        Navigator.pop(context);
        widget.onGuardado('Trabajador registrado exitosamente.');
      } else {
        final d = jsonDecode(res.body);
        final m = d['message'];
        setState(() => _error =
            (m is List ? m.join(', ') : m?.toString()) ??
                'Error al registrar.');
      }
    } catch (_) {
      setState(() => _error = 'Error de conexión.');
    } finally {
      if (mounted) setState(() => _guardando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _ModalBase(
      titulo:     'Registrar Trabajador',
      subtitulo:  'El admin asigna un código único al nuevo trabajador.',
      icono:      Icons.person_add_rounded,
      error:      _error,
      guardando:  _guardando,
      onGuardar:  _guardar,
      labelBoton: 'Registrar',
      children: [
        // Código asignado
        _labelCampo('Código asignado'),
        const SizedBox(height: 6),
        Row(children: [
          Expanded(
            child: TextField(
              controller: _codigoCtrl,
              readOnly: true,
              style: const TextStyle(
                  color: AppColors.textoSecundario,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.grisClaro,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: AppColors.grisBorde)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide:
                        const BorderSide(color: AppColors.grisBorde)),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 12),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => setState(
                () => _codigoCtrl.text = _generarCodigo()),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.fondo,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grisBorde),
              ),
              child: const Icon(Icons.refresh_rounded,
                  color: AppColors.primario, size: 20),
            ),
          ),
        ]),
        const SizedBox(height: 16),

        // Documento
        _fila2([
          _campoDropdown(
            'Tipo doc.',
            _tDoc,
            {'CC': 'Cédula', 'CE': 'C. Extranjería', 'TI': 'T. Identidad'},
            (v) => setState(() => _tDoc = v!),
          ),
          _campo('Número de documento *', _idCtrl,
              tipo: TextInputType.number),
        ]),
        const SizedBox(height: 14),
        _fila2([
          _campo('Primer Nombre *', _nom1Ctrl),
          _campo('Segundo Nombre',  _nom2Ctrl),
        ]),
        const SizedBox(height: 14),
        _fila2([
          _campo('Primer Apellido *', _ape1Ctrl),
          _campo('Segundo Apellido',  _ape2Ctrl),
        ]),
        const SizedBox(height: 14),
        _campo('Correo *', _correoCtrl,
            tipo: TextInputType.emailAddress, icon: Icons.email_outlined),
        const SizedBox(height: 14),
        _campo('Teléfono', _telCtrl,
            tipo: TextInputType.phone, icon: Icons.phone_outlined),
        const SizedBox(height: 14),

        // Contraseña con ojo
        _labelCampo('Contraseña inicial *'),
        const SizedBox(height: 6),
        StatefulBuilder(
          builder: (_, setSt) => TextField(
            controller: _passCtrl,
            obscureText: !_verPass,
            style: const TextStyle(color: AppColors.texto, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Mínimo 6 caracteres',
              hintStyle:
                  const TextStyle(color: AppColors.textoClaro),
              prefixIcon: const Icon(Icons.lock_outline_rounded,
                  color: AppColors.primario, size: 18),
              suffixIcon: IconButton(
                icon: Icon(
                  _verPass
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: AppColors.textoClaro, size: 18,
                ),
                onPressed: () => setSt(() => _verPass = !_verPass),
              ),
              filled: true,
              fillColor: AppColors.fondoInput,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:
                      const BorderSide(color: AppColors.grisBorde)),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:
                      const BorderSide(color: AppColors.grisBorde)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                      color: AppColors.primario, width: 1.5)),
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  MODAL BASE
// ══════════════════════════════════════════════════════════════════════════════
class _ModalBase extends StatelessWidget {
  final String       titulo;
  final String       subtitulo;
  final IconData     icono;
  final String       error;
  final bool         guardando;
  final VoidCallback onGuardar;
  final String       labelBoton;
  final List<Widget> children;

  const _ModalBase({
    required this.titulo,
    required this.subtitulo,
    required this.icono,
    required this.error,
    required this.guardando,
    required this.onGuardar,
    required this.labelBoton,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.fondoTarjeta,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(
          20, 16, 20,
          MediaQuery.of(context).viewInsets.bottom + 28),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                    color: AppColors.grisBorde,
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),

            Row(children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  gradient: AppColors.gradientePrimario,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icono, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(titulo,
                        style: const TextStyle(fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.secundario)),
                    Text(subtitulo,
                        style: const TextStyle(fontSize: 12,
                            color: AppColors.textoSecundario)),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close_rounded,
                    color: AppColors.textoClaro),
              ),
            ]),
            const SizedBox(height: 20),

            if (error.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                      color: AppColors.error.withOpacity(0.25)),
                ),
                child: Row(children: [
                  const Icon(Icons.error_outline_rounded,
                      color: AppColors.error, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(error,
                        style: const TextStyle(
                            color: AppColors.error, fontSize: 12)),
                  ),
                ]),
              ),

            ...children,
            const SizedBox(height: 24),

            Row(children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: guardando
                      ? null
                      : () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    padding:
                        const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppColors.grisBorde),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Cancelar',
                      style: TextStyle(
                          color: AppColors.textoSecundario,
                          fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: AppColors.gradientePrimario,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                          color: AppColors.primario.withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4)),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: guardando ? null : onGuardar,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding:
                          const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: guardando
                        ? const SizedBox(
                            height: 18, width: 18,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : Text(labelBoton,
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold)),
                  ),
                ),
              ),
            ]),
          ],
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS de campos (funciones de nivel de archivo)
// ══════════════════════════════════════════════════════════════════════════════
Widget _labelCampo(String texto) => Text(
      texto,
      style: const TextStyle(
          fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.texto),
    );

Widget _campo(
  String label,
  TextEditingController ctrl, {
  TextInputType tipo = TextInputType.text,
  bool esPassword    = false,
  IconData? icon,
}) =>
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _labelCampo(label),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          keyboardType: tipo,
          obscureText: esPassword,
          style: const TextStyle(color: AppColors.texto, fontSize: 14),
          decoration: InputDecoration(
            prefixIcon: icon != null
                ? Icon(icon, color: AppColors.primario, size: 18)
                : null,
            filled: true,
            fillColor: AppColors.fondoInput,
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: AppColors.grisBorde)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: AppColors.grisBorde)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                    color: AppColors.primario, width: 1.5)),
            contentPadding: const EdgeInsets.symmetric(
                horizontal: 14, vertical: 12),
          ),
        ),
      ],
    );

Widget _campoDropdown(
  String label,
  String value,
  Map<String, String> items,
  void Function(String?) onChanged,
) =>
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _labelCampo(label),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: AppColors.fondoInput,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.grisBorde),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              style: const TextStyle(
                  color: AppColors.texto, fontSize: 13),
              items: items.entries
                  .map((e) => DropdownMenuItem(
                      value: e.key, child: Text(e.value)))
                  .toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );

Widget _fila2(List<Widget> cols) => Row(
      children: cols
          .expand((w) => [Expanded(child: w), const SizedBox(width: 10)])
          .toList()
        ..removeLast(),
    );