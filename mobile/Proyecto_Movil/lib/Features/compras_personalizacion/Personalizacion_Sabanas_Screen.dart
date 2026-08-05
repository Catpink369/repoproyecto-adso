import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:proyecto_movil/Shared/providers/auth_provider.dart';
import 'package:proyecto_movil/Data/models/material_model.dart';
import 'package:proyecto_movil/Shared/constants/app_constants.dart';
import 'TicketPedido_Screen.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PersonalizacionSabanasScreen extends StatefulWidget {
    const PersonalizacionSabanasScreen({super.key});

    @override
    State<PersonalizacionSabanasScreen> createState() =>
        _PersonalizacionSabanasScreenState();
    }

    class _PersonalizacionSabanasScreenState
        extends State<PersonalizacionSabanasScreen> {
    final Map<String, Map<String, dynamic>> _tamanios = {
        'Cuna':        {'metros': 3.0, 'dimensiones': '100 x 145 cm'},
        'Individual':  {'metros': 6.0, 'dimensiones': '180 x 275 cm'},
        'Doble':       {'metros': 7.0, 'dimensiones': '230 x 275 cm'},
        'Rey':         {'metros': 8.0, 'dimensiones': '275 x 275 cm'},
        'Rey europeo': {'metros': 8.5, 'dimensiones': '300 x 275 cm'},
        'Emperador':   {'metros': 9.0, 'dimensiones': '320 x 290 cm'},
    };

    String? _tamanioSeleccionado;
    MaterialModel? _telaSeleccionada;
    ColorMaterialModel? _colorSeleccionado;
    bool _incluirSobresabana = false;
    String _fundasAlmohada = 'Sin fundas';

    List<MaterialModel> _telas = [];
    List<ColorMaterialModel> _colores = [];
    List<DisenoMaterialModel> _disenos = [];
    DisenoMaterialModel? _disenoSeleccionado;
    bool _cargandoTelas = true;
    bool _cargandoColores = false;
    bool _cargaIniciada = false;

    @override
    void didChangeDependencies() {
        super.didChangeDependencies();
        if (!_cargaIniciada) {
        _cargaIniciada = true;
        _cargarTelas();
        }
    }

    double get _metrosTotales {
        if (_tamanioSeleccionado == null) return 0;
        double metros = _tamanios[_tamanioSeleccionado]!['metros'] as double;
        if (_incluirSobresabana) metros += 2;
        if (_fundasAlmohada == 'Una funda') metros += 1;
        if (_fundasAlmohada == 'Dos fundas') metros += 2;
        return metros;
    }

    double get _precioEstimado {
        if (_telaSeleccionada == null) return 0;
        return _telaSeleccionada!.precioUnitario * _metrosTotales;
    }

    String get _precioFormateado =>
        '\$${_precioEstimado.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';

    Map<String, String> _headers({bool withContentType = false}) {
        final token = context.read<AuthProvider>().token;
        return {
        'x-api-key': AppConstants.apiKey,
        if (token != null) 'Authorization': 'Bearer $token',
        if (withContentType) 'Content-Type': 'application/json',
        };
    }

    Future<void> _cargarTelas() async {
        try {
        final response = await http.get(
            Uri.parse('${AppConstants.baseUrl}/pedidos-personalizados/materiales/Tela'),
            headers: _headers(),
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode == 200) {
            final List<dynamic> json = jsonDecode(response.body);
            if (mounted) {
            setState(() {
                _telas = json.map((e) => MaterialModel.fromJson(e)).toList();
                _cargandoTelas = false;
            });
            }
        } else {
            if (mounted) setState(() => _cargandoTelas = false);
        }
        } catch (e) {
        if (mounted) setState(() => _cargandoTelas = false);
        }
    }

    Future<void> _cargarColoresYDisenos(int idMaterial) async {
        if (mounted) setState(() => _cargandoColores = true);
        try {
        final results = await Future.wait([
            http.get(
            Uri.parse('${AppConstants.baseUrl}/pedidos-personalizados/materiales/$idMaterial/colores'),
            headers: _headers(),
            ),
            http.get(
            Uri.parse('${AppConstants.baseUrl}/pedidos-personalizados/materiales/$idMaterial/disenos'),
            headers: _headers(),
            ),
        ]).timeout(const Duration(seconds: 10));

        if (mounted) {
            setState(() {
            if (results[0].statusCode == 200) {
                _colores = (jsonDecode(results[0].body) as List)
                    .map((e) => ColorMaterialModel.fromJson(e))
                    .toList();
            }
            if (results[1].statusCode == 200) {
                _disenos = (jsonDecode(results[1].body) as List)
                    .map((e) => DisenoMaterialModel.fromJson(e))
                    .toList();
            }
            _cargandoColores = false;
            });
        }
        } catch (e) {
        if (mounted) setState(() => _cargandoColores = false);
        }
    }

    bool get _puedeConfirmar =>
        _tamanioSeleccionado != null &&
        _telaSeleccionada != null &&
        _colorSeleccionado != null;

    Future<void> _confirmarPedido() async {
        final usuario = context.read<AuthProvider>().usuario!;

        showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(
            child: CircularProgressIndicator(color: Color(0xFFc45a77))),
        );

        try {
        final response = await http.post(
            Uri.parse('${AppConstants.baseUrl}/pedidos-personalizados'),
            headers: _headers(withContentType: true),
            body: jsonEncode({
            'id_usuario': usuario.idUsuario,
            'tipo_producto': 'Sabana',
            'tamanio': _tamanioSeleccionado,
            'materiales': [
                {
                'id_material': _telaSeleccionada!.idMaterial,
                'cantidad': _metrosTotales.toInt()
                },
            ],
            }),
        ).timeout(const Duration(seconds: 15));

        if (mounted) Navigator.pop(context);

        if (response.statusCode == 200 || response.statusCode == 201) {
            final data = jsonDecode(response.body);
            if (mounted) {
            Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                    builder: (_) => TicketPedidoScreen(data: data)),
            );
            }
        } else {
            final error = jsonDecode(response.body);
            if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text(error['message'] ?? 'Error al crear el pedido'),
                backgroundColor: const Color(0xFFc45a77),
                duration: const Duration(seconds: 2)
            ));
        }
    }
        } catch (e) {
            if (mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Error de conexión: $e'),
                    backgroundColor: Colors.red,
                    duration: const Duration(seconds: 2)
                ));
            }
        }
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
        backgroundColor: const Color(0xFFf3e4e9),
        appBar: AppBar(
            title: const Text('Personalizar Sábana',
                style:
                    TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            centerTitle: true,
            backgroundColor: const Color(0xFFb4788b),
            iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: _cargandoTelas
            ? const Center(
                child: CircularProgressIndicator(color: Color(0xFFc45a77)))
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                    _seccionTamanio(),
                    const SizedBox(height: 20),
                    _seccionTela(),
                    if (_telaSeleccionada != null) ...[
                        const SizedBox(height: 20),
                        _seccionColor(),
                    ],
                    if (_telaSeleccionada != null && _disenos.isNotEmpty) ...[
                        const SizedBox(height: 20),
                        _seccionDiseno(),
                    ],
                    const SizedBox(height: 20),
                    _seccionExtras(),
                    const SizedBox(height: 100),
                    ],
                ),
                ),
        bottomNavigationBar: _panelInferior(),
        );
    }

    Widget _seccionTamanio() {
        return _contenedor(
        titulo: 'Tamaño de sábana',
        icono: Icons.king_bed_outlined,
        child: GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.5,
            children: _tamanios.entries.map((entry) {
            final seleccionado = _tamanioSeleccionado == entry.key;
            return GestureDetector(
                onTap: () => setState(() => _tamanioSeleccionado = entry.key),
                child: Container(
                decoration: BoxDecoration(
                    color: seleccionado
                        ? const Color(0xFFc45a77).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: seleccionado
                            ? const Color(0xFFc45a77)
                            : const Color(0xFFd4a9c2),
                        width: seleccionado ? 2 : 1),
                ),
                child: Row(
                    children: [
                    Radio<String>(
                        value: entry.key,
                        groupValue: _tamanioSeleccionado,
                        onChanged: (v) =>
                            setState(() => _tamanioSeleccionado = v),
                        activeColor: const Color(0xFFc45a77),
                    ),
                    Expanded(
                        child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            Text(entry.key,
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: seleccionado
                                        ? const Color(0xFFc45a77)
                                        : const Color(0xFFb4788b))),
                            Text(entry.value['dimensiones'],
                                style: const TextStyle(
                                    fontSize: 10,
                                    color: Color(0xFF5a3d54))),
                        ],
                        ),
                    ),
                    ],
                ),
                ),
            );
            }).toList(),
        ),
        );
    }

    Widget _seccionTela() {
        return _contenedor(
        titulo: 'Tipo de tela',
        icono: Icons.texture,
        child: Column(
            children: _telas.map((tela) {
            final seleccionada =
                _telaSeleccionada?.idMaterial == tela.idMaterial;
            return GestureDetector(
                onTap: () {
                setState(() {
                    _telaSeleccionada = tela;
                    _colorSeleccionado = null;
                    _disenoSeleccionado = null;
                    _colores = [];
                    _disenos = [];
                });
                _cargarColoresYDisenos(tela.idMaterial);
                },
                child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                decoration: BoxDecoration(
                    color: seleccionada
                        ? const Color(0xFFc45a77).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: seleccionada
                            ? const Color(0xFFc45a77)
                            : const Color(0xFFd4a9c2),
                        width: seleccionada ? 2 : 1),
                ),
                child: Row(
                    children: [
                    if (seleccionada)
                        const Icon(Icons.check,
                            color: Color(0xFFc45a77), size: 16),
                    if (seleccionada) const SizedBox(width: 8),
                    Expanded(
                        child: Text(tela.nombre,
                            style: TextStyle(
                                fontWeight: seleccionada
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                                color: seleccionada
                                    ? const Color(0xFFc45a77)
                                    : const Color(0xFF5a3d54))),
                    ),
                    Text(
                        '\$${tela.precioUnitario.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}/metro',
                        style: const TextStyle(
                            color: Color(0xFFb4788b),
                            fontSize: 12,
                            fontWeight: FontWeight.bold),
                    ),
                    ],
                ),
                ),
            );
            }).toList(),
        ),
        );
    }

    Widget _seccionColor() {
        if (_cargandoColores) {
        return const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(
                child: CircularProgressIndicator(color: Color(0xFFc45a77))),
        );
        }
        if (_colores.isEmpty) return const SizedBox();

        return _contenedor(
        titulo: 'Color de tela',
        icono: Icons.palette_outlined,
        child: Wrap(
            spacing: 10,
            runSpacing: 10,
            children: _colores.map((color) {
            final seleccionado =
                _colorSeleccionado?.idColor == color.idColor;
            Color colorWidget = const Color(0xFFd4a9c2);
            if (color.codigoHex != null) {
                try {
                colorWidget = Color(
                    int.parse(color.codigoHex!.replaceAll('#', '0xFF')));
                } catch (_) {}
            }
            return GestureDetector(
                onTap: () => setState(() => _colorSeleccionado = color),
                child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                    color: seleccionado
                        ? const Color(0xFFc45a77).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(
                        color: seleccionado
                            ? const Color(0xFFc45a77)
                            : const Color(0xFFd4a9c2),
                        width: seleccionado ? 2 : 1),
                ),
                child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                    Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                            color: colorWidget,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white))),
                    const SizedBox(width: 6),
                    Text(color.nombre,
                        style: TextStyle(
                            color: seleccionado
                                ? const Color(0xFFc45a77)
                                : const Color(0xFF5a3d54),
                            fontSize: 13,
                            fontWeight: seleccionado
                                ? FontWeight.bold
                                : FontWeight.normal)),
                    if (seleccionado) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.check,
                            color: Color(0xFFc45a77), size: 14),
                    ],
                    ],
                ),
                ),
            );
            }).toList(),
        ),
        );
    }

    Widget _seccionDiseno() {
        return _contenedor(
        titulo: 'Diseño',
        icono: Icons.style_outlined,
        child: Column(
            children: _disenos.map((diseno) {
            final seleccionado =
                _disenoSeleccionado?.idDiseno == diseno.idDiseno;
            return GestureDetector(
                onTap: () => setState(() =>
                    _disenoSeleccionado = seleccionado ? null : diseno),
                child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                decoration: BoxDecoration(
                    color: seleccionado
                        ? const Color(0xFFc45a77).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: seleccionado
                            ? const Color(0xFFc45a77)
                            : const Color(0xFFd4a9c2),
                        width: seleccionado ? 2 : 1),
                ),
                child: Row(
                    children: [
                    if (seleccionado)
                        const Icon(Icons.check,
                            color: Color(0xFFc45a77), size: 16),
                    if (seleccionado) const SizedBox(width: 8),
                    Text(diseno.nombre,
                        style: TextStyle(
                            color: seleccionado
                                ? const Color(0xFFc45a77)
                                : const Color(0xFF5a3d54))),
                    ],
                ),
                ),
            );
            }).toList(),
        ),
        );
    }

    Widget _seccionExtras() {
        return _contenedor(
        titulo: 'Extras',
        icono: Icons.add_circle_outline,
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(
                children: [
                Checkbox(
                    value: _incluirSobresabana,
                    onChanged: (v) =>
                        setState(() => _incluirSobresabana = v ?? false),
                    activeColor: const Color(0xFFc45a77),
                ),
                const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                    Text('Incluir sobresábana',
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF5a3d54))),
                    Text('+2 metros de tela adicionales',
                        style: TextStyle(
                            fontSize: 12, color: Color(0xFF5a3d54))),
                    ],
                ),
                ],
            ),
            const SizedBox(height: 15),
            const Text('Fundas de almohada',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF5a3d54))),
            const SizedBox(height: 10),
            ...['Sin fundas', 'Una funda', 'Dos fundas'].map((opcion) {
                final descripcion = opcion == 'Sin fundas'
                    ? 'No incluir'
                    : opcion == 'Una funda'
                        ? '+1 metro de tela'
                        : '+2 metros de tela';
                final seleccionado = _fundasAlmohada == opcion;
                return GestureDetector(
                onTap: () => setState(() => _fundasAlmohada = opcion),
                child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                    color: seleccionado
                        ? const Color(0xFFc45a77).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                        color: seleccionado
                            ? const Color(0xFFc45a77)
                            : const Color(0xFFd4a9c2),
                        width: seleccionado ? 2 : 1),
                    ),
                    child: Row(
                    children: [
                        Radio<String>(
                        value: opcion,
                        groupValue: _fundasAlmohada,
                        onChanged: (v) =>
                            setState(() => _fundasAlmohada = v!),
                        activeColor: const Color(0xFFc45a77),
                        ),
                        Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                            Text(opcion,
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: seleccionado
                                        ? const Color(0xFFc45a77)
                                        : const Color(0xFF5a3d54))),
                            Text(descripcion,
                                style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF5a3d54))),
                        ],
                        ),
                    ],
                    ),
                ),
                );
            }),
            ],
        ),
        );
    }

    Widget _panelInferior() {
        return Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
        ),
        child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
            if (_telaSeleccionada != null) ...[
                Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                    const Text('Tela:',
                        style: TextStyle(color: Color(0xFF5a3d54))),
                    Text(_telaSeleccionada!.nombre,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFb4788b))),
                ],
                ),
                if (_colorSeleccionado != null)
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                    const Text('Color:',
                        style: TextStyle(color: Color(0xFF5a3d54))),
                    Text(_colorSeleccionado!.nombre,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFb4788b))),
                    ],
                ),
                if (_tamanioSeleccionado != null)
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                    const Text('Tamaño:',
                        style: TextStyle(color: Color(0xFF5a3d54))),
                    Text(_tamanioSeleccionado!,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFb4788b))),
                    ],
                ),
                Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                    const Text('Metros:',
                        style: TextStyle(color: Color(0xFF5a3d54))),
                    Text('${_metrosTotales.toStringAsFixed(1)} m',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFb4788b))),
                ],
                ),
                const Divider(color: Color(0xFFd4a9c2)),
            ],
            Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                const Text('Precio estimado',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFb4788b))),
                Text(
                    _telaSeleccionada != null ? _precioFormateado : '-',
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFc45a77)),
                ),
                ],
            ),
            const SizedBox(height: 10),
            SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                onPressed: _puedeConfirmar ? _confirmarPedido : null,
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFc45a77),
                    disabledBackgroundColor: const Color(0xFFd4a9c2),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Confirmar pedido',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white)),
                ),
            ),
            ],
        ),
        );
    }

    Widget _contenedor(
        {required String titulo,
        required IconData icono,
        required Widget child}) {
        return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
            boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.05), blurRadius: 5)
            ],
        ),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(
                children: [
                Icon(icono, color: const Color(0xFFc45a77), size: 20),
                const SizedBox(width: 8),
                Text(titulo,
                    style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFb4788b))),
                ],
            ),
            const SizedBox(height: 15),
            child,
            ],
        ),
        );
    }
}