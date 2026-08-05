import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:proyecto_movil/Shared/providers/auth_provider.dart';
import 'package:proyecto_movil/Data/models/material_model.dart';
import 'package:proyecto_movil/Shared/constants/app_constants.dart';
import 'TicketPedido_Screen.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PersonalizacionCubrelechosScreen extends StatefulWidget {
    const PersonalizacionCubrelechosScreen({super.key});

    @override
    State<PersonalizacionCubrelechosScreen> createState() =>
        _PersonalizacionCubrelechosScreenState();
    }

    class _PersonalizacionCubrelechosScreenState
        extends State<PersonalizacionCubrelechosScreen> {
    final Map<String, Map<String, dynamic>> _tamanios = {
        'Sencilla':  {'metros': 4.0},
        'Semidoble': {'metros': 5.0},
        'Doble':     {'metros': 6.0},
        'Queen':     {'metros': 7.0},
        'King':      {'metros': 8.0},
    };

    String? _tamanioSeleccionado;

    MaterialModel? _telaLado1;
    ColorMaterialModel? _colorLado1;
    DisenoMaterialModel? _disenoLado1;
    List<ColorMaterialModel> _coloresLado1 = [];
    List<DisenoMaterialModel> _disenosLado1 = [];

    MaterialModel? _telaLado2;
    ColorMaterialModel? _colorLado2;
    DisenoMaterialModel? _disenoLado2;
    List<ColorMaterialModel> _coloresLado2 = [];
    List<DisenoMaterialModel> _disenosLado2 = [];

    List<MaterialModel> _telas = [];
    bool _cargandoTelas = true;
    bool _cargandoLado1 = false;
    bool _cargandoLado2 = false;
    bool _cargaIniciada = false;

    @override
    void didChangeDependencies() {
        super.didChangeDependencies();
        if (!_cargaIniciada) {
        _cargaIniciada = true;
        _cargarTelas();
        }
    }

    double get _metrosPorLado {
        if (_tamanioSeleccionado == null) return 0;
        return (_tamanios[_tamanioSeleccionado]!['metros'] as double) / 2;
    }

    double get _precioEstimado {
        double total = 0;
        if (_telaLado1 != null) total += _telaLado1!.precioUnitario * _metrosPorLado;
        if (_telaLado2 != null) total += _telaLado2!.precioUnitario * _metrosPorLado;
        return total;
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

    Future<void> _cargarDatosLado(int idMaterial, int lado) async {
        if (lado == 1) {
        if (mounted) setState(() => _cargandoLado1 = true);
        } else {
        if (mounted) setState(() => _cargandoLado2 = true);
        }

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
            if (lado == 1) {
                _coloresLado1 = results[0].statusCode == 200
                    ? (jsonDecode(results[0].body) as List)
                        .map((e) => ColorMaterialModel.fromJson(e))
                        .toList()
                    : [];
                _disenosLado1 = results[1].statusCode == 200
                    ? (jsonDecode(results[1].body) as List)
                        .map((e) => DisenoMaterialModel.fromJson(e))
                        .toList()
                    : [];
                _cargandoLado1 = false;
            } else {
                _coloresLado2 = results[0].statusCode == 200
                    ? (jsonDecode(results[0].body) as List)
                        .map((e) => ColorMaterialModel.fromJson(e))
                        .toList()
                    : [];
                _disenosLado2 = results[1].statusCode == 200
                    ? (jsonDecode(results[1].body) as List)
                        .map((e) => DisenoMaterialModel.fromJson(e))
                        .toList()
                    : [];
                _cargandoLado2 = false;
            }
            });
        }
        } catch (e) {
        if (mounted) {
            setState(() {
            if (lado == 1) _cargandoLado1 = false;
            else _cargandoLado2 = false;
            });
        }
        }
    }

    bool get _puedeConfirmar =>
        _tamanioSeleccionado != null &&
        _telaLado1 != null &&
        _colorLado1 != null &&
        _telaLado2 != null &&
        _colorLado2 != null;

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
            'tipo_producto': 'Cubrelecho',
            'tamanio': _tamanioSeleccionado,
            'materiales': [
                {
                'id_material': _telaLado1!.idMaterial,
                'cantidad': _metrosPorLado.toInt()
                },
                {
                'id_material': _telaLado2!.idMaterial,
                'cantidad': _metrosPorLado.toInt()
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
            title: const Text('Personalizar Cubrelecho',
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
                    children: [
                    _seccionTamanio(),
                    const SizedBox(height: 20),
                    _seccionTelas(),
                    if (_telaLado1 != null || _telaLado2 != null) ...[
                        const SizedBox(height: 20),
                        _seccionColores(),
                    ],
                    if ((_disenosLado1.isNotEmpty && _telaLado1 != null) ||
                        (_disenosLado2.isNotEmpty && _telaLado2 != null)) ...[
                        const SizedBox(height: 20),
                        _seccionDisenos(),
                    ],
                    const SizedBox(height: 100),
                    ],
                ),
                ),
        bottomNavigationBar: _panelInferior(),
        );
    }

    Widget _seccionTamanio() {
        return _contenedor(
        titulo: 'Tamaño de cama',
        icono: Icons.king_bed_outlined,
        child: GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 2,
            children: _tamanios.keys.map((tamanio) {
            final seleccionado = _tamanioSeleccionado == tamanio;
            return GestureDetector(
                onTap: () => setState(() => _tamanioSeleccionado = tamanio),
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
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                    Radio<String>(
                        value: tamanio,
                        groupValue: _tamanioSeleccionado,
                        onChanged: (v) =>
                            setState(() => _tamanioSeleccionado = v),
                        activeColor: const Color(0xFFc45a77),
                    ),
                    Flexible(
                        child: Text(tamanio,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                                color: seleccionado
                                    ? const Color(0xFFc45a77)
                                    : const Color(0xFFb4788b))),
                    ),
                    ],
                ),
                ),
            );
            }).toList(),
        ),
        );
    }

    Widget _seccionTelas() {
        return _contenedor(
        titulo: 'Tipo de tela',
        icono: Icons.texture,
        child: Column(
            children: [
            Row(
                children: [
                Expanded(child: _tabLado('Lado 1', _telaLado1 != null, true)),
                const SizedBox(width: 10),
                Expanded(child: _tabLado('Lado 2', _telaLado2 != null, false)),
                ],
            ),
            const SizedBox(height: 15),
            _subtituloLado('LADO 1'),
            const Text('Telas disponibles',
                style: TextStyle(color: Color(0xFF5a3d54), fontSize: 13)),
            const SizedBox(height: 10),
            ..._telas.map((tela) => _itemTela(tela, 1)),
            const SizedBox(height: 20),
            _subtituloLado('LADO 2'),
            const Text('Telas disponibles',
                style: TextStyle(color: Color(0xFF5a3d54), fontSize: 13)),
            const SizedBox(height: 10),
            ..._telas.map((tela) => _itemTela(tela, 2)),
            ],
        ),
        );
    }

    Widget _tabLado(String texto, bool completado, bool esLado1) {
        final telaSeleccionada = esLado1 ? _telaLado1 : _telaLado2;
        final colorSeleccionado = esLado1 ? _colorLado1 : _colorLado2;
        final subtexto = telaSeleccionada != null
            ? '${telaSeleccionada.nombre}${colorSeleccionado != null ? ' - ${colorSeleccionado.nombre}' : ''}'
            : '';

        return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
            color: completado
                ? const Color(0xFFc45a77)
                : const Color(0xFFf3e4e9),
            borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
            children: [
            Icon(
                completado
                    ? Icons.check_circle
                    : Icons.radio_button_unchecked,
                color: completado ? Colors.white : const Color(0xFFb4788b),
                size: 16,
            ),
            const SizedBox(width: 6),
            Expanded(
                child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                    Text(texto,
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: completado
                                ? Colors.white
                                : const Color(0xFFb4788b),
                            fontSize: 13)),
                    if (subtexto.isNotEmpty)
                    Text(subtexto,
                        style: const TextStyle(
                            color: Colors.white70, fontSize: 11),
                        overflow: TextOverflow.ellipsis),
                ],
                ),
            ),
            ],
        ),
        );
    }

    Widget _subtituloLado(String texto) {
        return Padding(
        padding: const EdgeInsets.only(bottom: 5),
        child: Text(texto,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF5a3d54))),
        );
    }

    Widget _itemTela(MaterialModel tela, int lado) {
        final telaActual = lado == 1 ? _telaLado1 : _telaLado2;
        final seleccionada = telaActual?.idMaterial == tela.idMaterial;

        return GestureDetector(
        onTap: () {
            setState(() {
            if (lado == 1) {
                _telaLado1 = tela;
                _colorLado1 = null;
                _disenoLado1 = null;
                _coloresLado1 = [];
                _disenosLado1 = [];
            } else {
                _telaLado2 = tela;
                _colorLado2 = null;
                _disenoLado2 = null;
                _coloresLado2 = [];
                _disenosLado2 = [];
            }
            });
            _cargarDatosLado(tela.idMaterial, lado);
        },
        child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
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
                const Icon(Icons.check, color: Color(0xFFc45a77), size: 16),
                if (seleccionada) const SizedBox(width: 8),
                Expanded(
                    child: Text(tela.nombre,
                        style: TextStyle(
                            color: seleccionada
                                ? const Color(0xFFc45a77)
                                : const Color(0xFF5a3d54),
                            fontWeight: seleccionada
                                ? FontWeight.bold
                                : FontWeight.normal))),
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
    }

    Widget _seccionColores() {
        return _contenedor(
        titulo: 'Colores',
        icono: Icons.palette_outlined,
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            if (_telaLado1 != null) ...[
                const Text('Color - Lado 1',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFb4788b))),
                const SizedBox(height: 10),
                _cargandoLado1
                    ? const Center(
                        child: CircularProgressIndicator(
                            color: Color(0xFFc45a77)))
                    : _coloresLado1.isEmpty
                        ? const Text('No hay colores disponibles',
                            style: TextStyle(color: Color(0xFF5a3d54)))
                        : _wrapColores(_coloresLado1, _colorLado1,
                            (c) => setState(() => _colorLado1 = c)),
                const SizedBox(height: 20),
            ],
            if (_telaLado2 != null) ...[
                const Text('Color - Lado 2',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFb4788b))),
                const SizedBox(height: 10),
                _cargandoLado2
                    ? const Center(
                        child: CircularProgressIndicator(
                            color: Color(0xFFc45a77)))
                    : _coloresLado2.isEmpty
                        ? const Text('No hay colores disponibles',
                            style: TextStyle(color: Color(0xFF5a3d54)))
                        : _wrapColores(_coloresLado2, _colorLado2,
                            (c) => setState(() => _colorLado2 = c)),
            ],
            ],
        ),
        );
    }

    Widget _wrapColores(
        List<ColorMaterialModel> colores,
        ColorMaterialModel? seleccionado,
        Function(ColorMaterialModel) onSeleccionar) {
        return Wrap(
        spacing: 10,
        runSpacing: 10,
        children: colores.map((color) {
            final estaSeleccionado = seleccionado?.idColor == color.idColor;
            Color colorWidget = const Color(0xFFd4a9c2);
            if (color.codigoHex != null) {
            try {
                colorWidget = Color(
                    int.parse(color.codigoHex!.replaceAll('#', '0xFF')));
            } catch (_) {}
            }
            return GestureDetector(
            onTap: () => onSeleccionar(color),
            child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                color: estaSeleccionado
                    ? const Color(0xFFc45a77).withOpacity(0.1)
                    : Colors.white,
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                    color: estaSeleccionado
                        ? const Color(0xFFc45a77)
                        : const Color(0xFFd4a9c2),
                    width: estaSeleccionado ? 2 : 1),
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
                            color: estaSeleccionado
                                ? const Color(0xFFc45a77)
                                : const Color(0xFF5a3d54),
                            fontSize: 13)),
                    if (estaSeleccionado) ...[
                    const SizedBox(width: 4),
                    const Icon(Icons.check,
                        color: Color(0xFFc45a77), size: 14),
                    ],
                ],
                ),
            ),
            );
        }).toList(),
        );
    }

    Widget _seccionDisenos() {
        return _contenedor(
        titulo: 'Diseño',
        icono: Icons.style_outlined,
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            if (_disenosLado1.isNotEmpty && _telaLado1 != null) ...[
                const Text('Diseño - Lado 1',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFb4788b))),
                const SizedBox(height: 10),
                ..._disenosLado1.map((d) => _itemDiseno(d, _disenoLado1,
                    (v) => setState(() => _disenoLado1 = v))),
                const SizedBox(height: 15),
            ],
            if (_disenosLado2.isNotEmpty && _telaLado2 != null) ...[
                const Text('Diseño - Lado 2',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFb4788b))),
                const SizedBox(height: 10),
                ..._disenosLado2.map((d) => _itemDiseno(d, _disenoLado2,
                    (v) => setState(() => _disenoLado2 = v))),
            ],
            ],
        ),
        );
    }

    Widget _itemDiseno(
        DisenoMaterialModel diseno,
        DisenoMaterialModel? seleccionado,
        Function(DisenoMaterialModel?) onSeleccionar) {
        final estaSeleccionado = seleccionado?.idDiseno == diseno.idDiseno;
        return GestureDetector(
        onTap: () => onSeleccionar(estaSeleccionado ? null : diseno),
        child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
            decoration: BoxDecoration(
            color: estaSeleccionado
                ? const Color(0xFFc45a77).withOpacity(0.1)
                : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
                color: estaSeleccionado
                    ? const Color(0xFFc45a77)
                    : const Color(0xFFd4a9c2),
                width: estaSeleccionado ? 2 : 1),
            ),
            child: Row(
            children: [
                if (estaSeleccionado)
                const Icon(Icons.check, color: Color(0xFFc45a77), size: 16),
                if (estaSeleccionado) const SizedBox(width: 8),
                Text(diseno.nombre,
                    style: TextStyle(
                        color: estaSeleccionado
                            ? const Color(0xFFc45a77)
                            : const Color(0xFF5a3d54))),
            ],
            ),
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
            if (_tamanioSeleccionado != null) ...[
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
                    const Text('Metros totales:',
                        style: TextStyle(color: Color(0xFF5a3d54))),
                    Text(
                    '${(_tamanios[_tamanioSeleccionado]!['metros'] as double).toStringAsFixed(0)} m',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFb4788b)),
                    ),
                ],
                ),
                if (_telaLado1 != null)
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                    const Text('Lado 1:',
                        style: TextStyle(color: Color(0xFF5a3d54))),
                    Flexible(
                        child: Text(
                        '${_telaLado1!.nombre}${_colorLado1 != null ? ' - ${_colorLado1!.nombre}' : ''}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFb4788b)),
                        overflow: TextOverflow.ellipsis,
                        ),
                    ),
                    ],
                ),
                if (_telaLado2 != null)
                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                    const Text('Lado 2:',
                        style: TextStyle(color: Color(0xFF5a3d54))),
                    Flexible(
                        child: Text(
                        '${_telaLado2!.nombre}${_colorLado2 != null ? ' - ${_colorLado2!.nombre}' : ''}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFb4788b)),
                        overflow: TextOverflow.ellipsis,
                        ),
                    ),
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
                    _precioEstimado > 0 ? _precioFormateado : '-',
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