import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import '../../Data/models/usuario_model.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/AdminSidebar.dart';
import '../../Shared/constants/app_colors.dart';
import '../../Shared/constants/app_constants.dart';
import '../../Shared/services/api_service.dart';


class PanelControlScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const PanelControlScreen({super.key, required this.usuario});

  @override
  State<PanelControlScreen> createState() => _PanelControlScreenState();
}

class _PanelControlScreenState extends State<PanelControlScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  // null = placeholder (ninguna opción activa)
  String? _seccionActiva;

  final List<Map<String, dynamic>> _opciones = [
    {'key': 'reportes', 'label': 'Reportes', 'icon': Icons.bar_chart},
    {'key': 'historial', 'label': 'Historial de ventas', 'icon': Icons.history},
    {'key': 'notificaciones', 'label': 'Notificaciones', 'icon': Icons.notifications},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _seleccionar(String key) {
    setState(() {
      if (_seccionActiva == key) {
        _seccionActiva = null;
      } else {
        _seccionActiva = key;
        final idx = _opciones.indexWhere((o) => o['key'] == key);
        if (idx >= 0) _tabController.animateTo(idx);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Panel de Control', showProfile: false),
      drawer: AdminSidebar(usuario: widget.usuario),
      backgroundColor: AppColors.fondo,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header azul (igual que la web)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            color: AppColors.primario,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  widget.usuario.isAdmin ? 'Admin' : 'Trabajador',
                  style: const TextStyle(
                    color: AppColors.blanco,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pushNamed(
                    context, '/admin/perfil',
                    arguments: widget.usuario,
                  ),
                  child: Row(
                    children: [
                      Text(widget.usuario.nombreCompleto,
                          style: const TextStyle(color: AppColors.blanco)),
                      const SizedBox(width: 8),
                      CircleAvatar(
                        radius: 16,
                        backgroundColor: AppColors.blanco.withOpacity(0.2),
                        backgroundImage: widget.usuario.imgPerfil != null
                            ? NetworkImage(
                                AppConstants.getImageUrl(widget.usuario.imgPerfil),
                                headers: ApiService.headers)
                            : null,
                        child: widget.usuario.imgPerfil == null
                            ? const Icon(Icons.person,
                                color: AppColors.blanco, size: 18)
                            : null,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Selector de opciones (botones como la web)
          Container(
            color: AppColors.blanco,
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Selecciona una opción',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.secundario,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: _opciones.map((op) {
                    final activo = _seccionActiva == op['key'];
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: GestureDetector(
                          onTap: () => _seleccionar(op['key'] as String),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: activo
                                  ? AppColors.primario
                                  : AppColors.fondo,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: activo
                                    ? AppColors.primario
                                    : AppColors.suave,
                              ),
                              boxShadow: activo
                                  ? [
                                      BoxShadow(
                                          color: AppColors.primario
                                              .withOpacity(0.25),
                                          blurRadius: 8,
                                          offset: const Offset(0, 3))
                                    ]
                                  : [],
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(op['icon'] as IconData,
                                    color: activo
                                        ? AppColors.blanco
                                        : AppColors.primario,
                                    size: 24),
                                const SizedBox(height: 6),
                                Text(
                                  op['label'] as String,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: activo
                                        ? AppColors.blanco
                                        : AppColors.texto,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),

          // ── Contenido dinámico
          Expanded(
            child: _seccionActiva == null
                ? _Placeholder()
                : _seccionActiva == 'reportes'
                    ? _ReportesPanel(usuario: widget.usuario)
                    : _seccionActiva == 'historial'
                        ? _HistorialPanel(usuario: widget.usuario)
                        : _NotificacionesPanel(usuario: widget.usuario),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  PLACEHOLDER
// ─────────────────────────────────────────────────────────────
class _Placeholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.dashboard_outlined,
              size: 64, color: AppColors.suave),
          const SizedBox(height: 16),
          const Text(
            'Selecciona una opción para ver su contenido',
            style: TextStyle(color: Colors.grey, fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  PANEL REPORTES
// ─────────────────────────────────────────────────────────────
class _ReportesPanel extends StatefulWidget {
  final UsuarioModel usuario;
  const _ReportesPanel({required this.usuario});

  @override
  State<_ReportesPanel> createState() => _ReportesPanelState();
}

class _ReportesPanelState extends State<_ReportesPanel> {
  bool cargando = true;
  String? error;

  DateTime fechaDesde =
      DateTime.now().subtract(const Duration(days: 30));
  DateTime fechaHasta = DateTime.now();

  Map<String, dynamic>? resumenGeneral;
  List topClientes = [];
  List productosStockBajo = [];
  List ingresosPorPedido = [];
  List resumenMensual = [];
  List ventasPorMetodoPago = [];

  double get totalVentas => ventasPorMetodoPago.fold(
      0, (s, m) => s + (double.tryParse('${m['monto_total']}') ?? 0));

  @override
  void initState() {
    super.initState();
    cargarDatos();
  }

  Future<void> cargarDatos() async {
    try {
      setState(() {
        cargando = true;
        error = null;
      });
      final p =
          'desde=${fechaDesde.toIso8601String().split('T')[0]}&hasta=${fechaHasta.toIso8601String().split('T')[0]}';

      final resRes =
          await ApiService.get('${AppConstants.resumenGeneral}?$p');
      final topRes =
          await ApiService.get('${AppConstants.topProductos}?$p&limit=10');
      final mensRes =
          await ApiService.get(AppConstants.resumenMensual);
      final pedRes = await ApiService.get(AppConstants.obtenerPedidos);

      if (resRes.statusCode == 200) {
        resumenGeneral =
            jsonDecode(resRes.body) as Map<String, dynamic>;
      }
      if (topRes.statusCode == 200) {
        final lista = jsonDecode(topRes.body) as List;
        productosStockBajo = lista
            .where((p) =>
                (p['stock_actual'] ?? 999) < (p['stock_minimo'] ?? 0) ||
                (p['stock_actual'] ?? 999) < 5)
            .toList()
          ..sort((a, b) =>
              (a['stock_actual'] ?? 0).compareTo(b['stock_actual'] ?? 0));
        if (productosStockBajo.length > 5) {
          productosStockBajo = productosStockBajo.sublist(0, 5);
        }
      }
      if (mensRes.statusCode == 200) {
        resumenMensual = jsonDecode(mensRes.body) as List;
      }
      if (pedRes.statusCode == 200) {
        final pedidos = jsonDecode(pedRes.body) as List;
        _procesarPedidos(pedidos);
      }

      setState(() {
        cargando = false;
      });
    } catch (e) {
      setState(() {
        cargando = false;
        error = 'Error de conexión';
      });
    }
  }

  void _procesarPedidos(List pedidos) {
    // Métodos de pago
    final metodosPago = <String, Map<String, dynamic>>{};
    for (final p in pedidos) {
      final ticket = p['ticket_compra'];
      final estadoPago =
          (ticket?['estado_pago']?['nom_metodo'] ?? '').toString().toLowerCase();
      final metodoPago =
          (ticket?['metodo_pago']?['nom_metodo'] ?? '').toString();
      if (estadoPago.contains('pendiente') ||
          metodoPago.toLowerCase().contains('pendiente')) continue;
      final m = metodoPago.isNotEmpty ? metodoPago : 'Sin definir';
      metodosPago[m] ??= {'metodo': m, 'monto_total': 0.0, 'cantidad': 0};
      metodosPago[m]!['monto_total'] =
          (metodosPago[m]!['monto_total'] as double) +
              (double.tryParse('${ticket?['total_ticket']}') ?? 0);
      metodosPago[m]!['cantidad'] =
          (metodosPago[m]!['cantidad'] as int) + 1;
    }
    ventasPorMetodoPago = metodosPago.values.toList();

    // Top clientes
    final clientes = <dynamic, Map<String, dynamic>>{};
    for (final p in pedidos) {
      final id = p['id_usuario'];
      final u = p['usuario'];
      final nombre = u != null
          ? '${u['nom_1'] ?? ''} ${u['ape_1'] ?? ''}'.trim()
          : '$id';
      final ticket = p['ticket_compra'];
      final estadoPago =
          (ticket?['estado_pago']?['nom_metodo'] ?? '').toString().toLowerCase();
      final metodoPago =
          (ticket?['metodo_pago']?['nom_metodo'] ?? '').toString().toLowerCase();
      final esPendiente = estadoPago.contains('pendiente') ||
          metodoPago.contains('pendiente');

      clientes[id] ??= {
        'nombre': nombre,
        'telefono': u?['telefono'] ?? '',
        'cantidad_pedidos': 0,
        'total_monto': 0.0,
      };
      clientes[id]!['cantidad_pedidos'] =
          (clientes[id]!['cantidad_pedidos'] as int) + 1;
      if (!esPendiente) {
        clientes[id]!['total_monto'] =
            (clientes[id]!['total_monto'] as double) +
                (double.tryParse('${ticket?['total_ticket']}') ?? 0);
      }
    }
    final sorted = clientes.values.toList()
      ..sort((a, b) =>
          (b['total_monto'] as double).compareTo(a['total_monto'] as double));
    topClientes = sorted.take(3).toList();

    // Últimos 10 pedidos
    final pedidosOrdenados = [...pedidos]
      ..sort((a, b) => DateTime.parse(b['fecha'] ?? '1970-01-01')
          .compareTo(DateTime.parse(a['fecha'] ?? '1970-01-01')));
    ingresosPorPedido = pedidosOrdenados.take(10).map((p) {
      final ticket = p['ticket_compra'];
      final estadoPago =
          (ticket?['estado_pago']?['nom_metodo'] ?? p['estado'] ?? '')
              .toString();
      final metodoPago =
          (ticket?['metodo_pago']?['nom_metodo'] ?? '').toString();
      final esPendiente =
          estadoPago.toLowerCase().contains('pendiente') ||
              metodoPago.toLowerCase().contains('pendiente');
      final u = p['usuario'];
      return {
        'id_pedido': p['id_pedido'],
        'cliente': u != null
            ? '${u['nom_1'] ?? ''} ${u['ape_1'] ?? ''}'.trim()
            : '${p['id_usuario']}',
        'fecha': _formatFecha(p['fecha'] ?? ''),
        'metodo': metodoPago.isNotEmpty ? metodoPago : '-',
        'estado': estadoPago,
        'total': esPendiente
            ? 0.0
            : (double.tryParse('${ticket?['total_ticket']}') ?? 0.0),
      };
    }).toList();
  }

  String _formatFecha(String f) {
    final d = DateTime.tryParse(f);
    if (d == null) return f;
    return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
  }

  Future<void> _exportarPDF() async {
    final pdf = pw.Document();

    pdf.addPage(pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(24),
      header: (ctx) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text('Reporte — Gurama Online',
              style: pw.TextStyle(
                  fontSize: 18,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#a0405f'))),
          pw.SizedBox(height: 4),
          pw.Text(
              'Generado el ${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year} — '
              'Período: ${fechaDesde.toIso8601String().split('T')[0]} → ${fechaHasta.toIso8601String().split('T')[0]}',
              style: const pw.TextStyle(
                  fontSize: 10, color: PdfColors.grey600)),
          pw.Divider(color: PdfColor.fromHex('#e8d5dc')),
        ],
      ),
      build: (ctx) => [
        // Stats
        if (resumenGeneral != null) ...[
          pw.Text('Resumen General',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#a0405f'))),
          pw.SizedBox(height: 8),
          pw.Row(children: [
            _pdfStatCard('Total Entradas',
                '${resumenGeneral!['totalEntradas'] ?? 0}',
                'unidades recibidas', PdfColor.fromHex('#edf7ed'),
                PdfColor.fromHex('#2e7d32')),
            pw.SizedBox(width: 10),
            _pdfStatCard('Total Salidas',
                '${resumenGeneral!['totalSalidas'] ?? 0}',
                'unidades vendidas', PdfColor.fromHex('#fdecea'),
                PdfColor.fromHex('#c62828')),
            pw.SizedBox(width: 10),
            _pdfStatCard(
                'Balance Neto',
                '${(int.tryParse('${resumenGeneral!['totalEntradas']}') ?? 0) - (int.tryParse('${resumenGeneral!['totalSalidas']}') ?? 0)}',
                'diferencia',
                PdfColor.fromHex('#e8f4fd'),
                PdfColor.fromHex('#1565c0')),
            pw.SizedBox(width: 10),
            _pdfStatCard('Valor Total',
                '\$${totalVentas.toStringAsFixed(0)}',
                'en ventas', PdfColor.fromHex('#fdf0f4'),
                PdfColor.fromHex('#a0405f')),
          ]),
          pw.SizedBox(height: 16),
        ],

        // Top clientes
        if (topClientes.isNotEmpty) ...[
          pw.Text('Top 3 Mejores Clientes',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#a0405f'))),
          pw.SizedBox(height: 8),
          pw.Table(
            border: pw.TableBorder.all(
                color: PdfColor.fromHex('#e8d5dc'), width: 0.5),
            columnWidths: {
              0: const pw.FlexColumnWidth(0.5),
              1: const pw.FlexColumnWidth(2),
              2: const pw.FlexColumnWidth(1.5),
              3: const pw.FlexColumnWidth(1),
            },
            children: [
              pw.TableRow(
                decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#c45c7e')),
                children: ['#', 'Cliente', 'Total', 'Pedidos']
                    .map((h) => pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text(h,
                              style: pw.TextStyle(
                                  color: PdfColors.white,
                                  fontWeight: pw.FontWeight.bold,
                                  fontSize: 10)),
                        ))
                    .toList(),
              ),
              ...topClientes.asMap().entries.map((e) => pw.TableRow(
                    decoration: pw.BoxDecoration(
                        color: e.key % 2 == 0
                            ? PdfColors.white
                            : PdfColor.fromHex('#fdf0f4')),
                    children: [
                      '${e.key + 1}',
                      '${e.value['nombre']}',
                      '\$${(e.value['total_monto'] as double).toStringAsFixed(0)}',
                      '${e.value['cantidad_pedidos']}',
                    ]
                        .map((t) => pw.Padding(
                              padding: const pw.EdgeInsets.all(6),
                              child: pw.Text(t,
                                  style: const pw.TextStyle(fontSize: 10)),
                            ))
                        .toList(),
                  )),
            ],
          ),
          pw.SizedBox(height: 16),
        ],

        // Stock bajo
        if (productosStockBajo.isNotEmpty) ...[
          pw.Text('⚠ Productos con Stock Bajo',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#c62828'))),
          pw.SizedBox(height: 8),
          pw.Table(
            border: pw.TableBorder.all(
                color: PdfColor.fromHex('#f9a8a8'), width: 0.5),
            columnWidths: {
              0: const pw.FlexColumnWidth(3),
              1: const pw.FlexColumnWidth(1),
              2: const pw.FlexColumnWidth(1),
            },
            children: [
              pw.TableRow(
                decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#c62828')),
                children: ['Producto', 'Stock Actual', 'Stock Mínimo']
                    .map((h) => pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text(h,
                              style: pw.TextStyle(
                                  color: PdfColors.white,
                                  fontWeight: pw.FontWeight.bold,
                                  fontSize: 10)),
                        ))
                    .toList(),
              ),
              ...productosStockBajo.map((p) => pw.TableRow(children: [
                    '${p['producto']}',
                    '${p['stock_actual']}',
                    '${p['stock_minimo']}',
                  ]
                      .map((t) => pw.Padding(
                            padding: const pw.EdgeInsets.all(6),
                            child:
                                pw.Text(t, style: const pw.TextStyle(fontSize: 10)),
                          ))
                      .toList())),
            ],
          ),
          pw.SizedBox(height: 16),
        ],

        // Últimos pedidos
        if (ingresosPorPedido.isNotEmpty) ...[
          pw.Text('Últimos 10 Ingresos por Pedido',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#a0405f'))),
          pw.SizedBox(height: 8),
          pw.Table(
            border: pw.TableBorder.all(
                color: PdfColor.fromHex('#e8d5dc'), width: 0.5),
            columnWidths: {
              0: const pw.FlexColumnWidth(0.8),
              1: const pw.FlexColumnWidth(2),
              2: const pw.FlexColumnWidth(1.2),
              3: const pw.FlexColumnWidth(1.5),
              4: const pw.FlexColumnWidth(1),
              5: const pw.FlexColumnWidth(1.2),
            },
            children: [
              pw.TableRow(
                decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#c45c7e')),
                children:
                    ['Pedido', 'Cliente', 'Fecha', 'Método', 'Estado', 'Total']
                        .map((h) => pw.Padding(
                              padding: const pw.EdgeInsets.all(5),
                              child: pw.Text(h,
                                  style: pw.TextStyle(
                                      color: PdfColors.white,
                                      fontWeight: pw.FontWeight.bold,
                                      fontSize: 9)),
                            ))
                        .toList(),
              ),
              ...ingresosPorPedido.asMap().entries.map((e) {
                final p = e.value;
                return pw.TableRow(
                  decoration: pw.BoxDecoration(
                      color: e.key % 2 == 0
                          ? PdfColors.white
                          : PdfColor.fromHex('#fdf0f4')),
                  children: [
                    '#${p['id_pedido']}',
                    '${p['cliente']}',
                    '${p['fecha']}',
                    '${p['metodo']}',
                    '${p['estado']}',
                    '\$${(p['total'] as double).toStringAsFixed(0)}',
                  ]
                      .map((t) => pw.Padding(
                            padding: const pw.EdgeInsets.all(5),
                            child:
                                pw.Text(t, style: const pw.TextStyle(fontSize: 9)),
                          ))
                      .toList(),
                );
              }),
              // Total
              pw.TableRow(
                decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#fdf0f4')),
                children: [
                  pw.SizedBox(),
                  pw.SizedBox(),
                  pw.SizedBox(),
                  pw.SizedBox(),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Total:',
                        style: pw.TextStyle(
                            fontWeight: pw.FontWeight.bold, fontSize: 9)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text(
                      '\$${ingresosPorPedido.where((p) => !(p['estado'] as String).toLowerCase().contains('pendiente')).fold(0.0, (s, p) => s + (p['total'] as double)).toStringAsFixed(0)}',
                      style: pw.TextStyle(
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColor.fromHex('#2e7d32'),
                          fontSize: 9),
                    ),
                  ),
                ],
              ),
            ],
          ),
          pw.SizedBox(height: 16),
        ],

        // Resumen mensual en tabla
        if (resumenMensual.isNotEmpty) ...[
          pw.Text('Resumen Mensual',
              style: pw.TextStyle(
                  fontSize: 13,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#a0405f'))),
          pw.SizedBox(height: 8),
          pw.Table(
            border: pw.TableBorder.all(
                color: PdfColor.fromHex('#e8d5dc'), width: 0.5),
            children: [
              pw.TableRow(
                decoration: pw.BoxDecoration(
                    color: PdfColor.fromHex('#c45c7e')),
                children: ['Mes', 'Entradas', 'Salidas']
                    .map((h) => pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text(h,
                              style: pw.TextStyle(
                                  color: PdfColors.white,
                                  fontWeight: pw.FontWeight.bold,
                                  fontSize: 10)),
                        ))
                    .toList(),
              ),
              ...resumenMensual.map((m) => pw.TableRow(children: [
                    '${m['mes']}',
                    '${m['entradas'] ?? 0}',
                    '${m['salidas'] ?? 0}',
                  ]
                      .map((t) => pw.Padding(
                            padding: const pw.EdgeInsets.all(6),
                            child: pw.Text(t,
                                style: const pw.TextStyle(fontSize: 10)),
                          ))
                      .toList())),
            ],
          ),
        ],

        pw.SizedBox(height: 24),
        pw.Divider(color: PdfColor.fromHex('#e8d5dc')),
        pw.Center(
          child: pw.Text(
            'Sistema de Gestión de Inventario — Gurama Online',
            style: const pw.TextStyle(
                fontSize: 9, color: PdfColors.grey500),
          ),
        ),
      ],
    ));

    await Printing.layoutPdf(
        onLayout: (_) async => pdf.save());
  }

  pw.Widget _pdfStatCard(String label, String value, String sub,
      PdfColor bg, PdfColor valueColor) {
    return pw.Expanded(
      child: pw.Container(
        padding: const pw.EdgeInsets.all(10),
        decoration: pw.BoxDecoration(
          color: bg,
          borderRadius: pw.BorderRadius.circular(6),
        ),
        child: pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Text(label,
                style: pw.TextStyle(
                    fontSize: 8,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColors.grey700)),
            pw.SizedBox(height: 4),
            pw.Text(value,
                style: pw.TextStyle(
                    fontSize: 16,
                    fontWeight: pw.FontWeight.bold,
                    color: valueColor)),
            pw.Text(sub,
                style: const pw.TextStyle(
                    fontSize: 8, color: PdfColors.grey500)),
          ],
        ),
      ),
    );
  }

  Future<void> _seleccionarFecha(bool esDesde) async {
    final fecha = await showDatePicker(
      context: context,
      initialDate: esDesde ? fechaDesde : fechaHasta,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (c, child) => Theme(
        data: Theme.of(c).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primario),
        ),
        child: child!,
      ),
    );
    if (fecha != null) {
      setState(() {
        if (esDesde) fechaDesde = fecha;
        else fechaHasta = fecha;
      });
      cargarDatos();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Filtros de fecha + botón PDF
        Container(
          color: AppColors.blanco,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Expanded(
                child: _FechaSelector(
                  label: 'Desde',
                  fecha: fechaDesde,
                  onTap: () => _seleccionarFecha(true),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _FechaSelector(
                  label: 'Hasta',
                  fecha: fechaHasta,
                  onTap: () => _seleccionarFecha(false),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton.icon(
                onPressed: cargarDatos,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Actualizar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primario,
                  foregroundColor: AppColors.blanco,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 12),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: cargando ? null : _exportarPDF,
                icon: const Icon(Icons.picture_as_pdf, size: 16),
                label: const Text('PDF'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFc45a77),
                  foregroundColor: AppColors.blanco,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 12),
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: cargando
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primario))
              : error != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(error!,
                              style: const TextStyle(color: Colors.red)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                              onPressed: cargarDatos,
                              child: const Text('Reintentar')),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: cargarDatos,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Stats 4 tarjetas
                            if (resumenGeneral != null) ...[
                              Row(children: [
                                _StatCard4(
                                  label: 'Total Entradas',
                                  value: '${int.tryParse('${resumenGeneral!['totalEntradas']}') ?? 0}',
                                  sub: 'unidades recibidas',
                                  color: Colors.green.shade50,
                                  borderColor: Colors.green.shade200,
                                  valueColor: Colors.green.shade800,
                                ),
                                const SizedBox(width: 10),
                                _StatCard4(
                                  label: 'Total Salidas',
                                  value: '${int.tryParse('${resumenGeneral!['totalSalidas']}') ?? 0}',
                                  sub: 'unidades vendidas',
                                  color: Colors.red.shade50,
                                  borderColor: Colors.red.shade200,
                                  valueColor: Colors.red.shade800,
                                ),
                              ]),
                              const SizedBox(height: 10),
                              Row(children: [
                                _StatCard4(
                                  label: 'Balance Neto',
                                  value:
                                      '${(int.tryParse('${resumenGeneral!['totalEntradas']}') ?? 0) - (int.tryParse('${resumenGeneral!['totalSalidas']}') ?? 0)}',
                                  sub: 'diferencia',
                                  color: Colors.blue.shade50,
                                  borderColor: Colors.blue.shade200,
                                  valueColor: Colors.blue.shade800,
                                ),
                                const SizedBox(width: 10),
                                _StatCard4(
                                  label: 'Valor Total',
                                  value:
                                      '\$${totalVentas.toStringAsFixed(0)}',
                                  sub: 'en ventas',
                                  color: const Color(0xFFfdf0f4),
                                  borderColor: const Color(0xFFf0d0db),
                                  valueColor: const Color(0xFFa0405f),
                                  smallValue: true,
                                ),
                              ]),
                              const SizedBox(height: 20),
                            ],

                            // Top 3 clientes
                            if (topClientes.isNotEmpty) ...[
                              _SeccionTitulo('Top 3 Mejores Clientes'),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  for (var i = 0;
                                      i < topClientes.length;
                                      i++) ...[
                                    if (i > 0) const SizedBox(width: 10),
                                    Expanded(
                                      child: _ClienteCard(
                                          data: topClientes[i],
                                          puesto: i + 1),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 20),
                            ],

                            // Stock bajo
                            if (productosStockBajo.isNotEmpty) ...[
                              const Text(
                                '⚠ Productos con Stock Bajo',
                                style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColors.blanco,
                                  borderRadius: BorderRadius.circular(10),
                                  border:
                                      Border.all(color: Colors.red.shade200),
                                ),
                                child: Column(
                                  children: productosStockBajo
                                      .map((p) => ListTile(
                                            title: Text('${p['producto']}',
                                                style: const TextStyle(
                                                    fontWeight:
                                                        FontWeight.w600)),
                                            subtitle: Text(
                                                'Mínimo: ${p['stock_minimo']}'),
                                            trailing: Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 10,
                                                      vertical: 4),
                                              decoration: BoxDecoration(
                                                  color: Colors.red.shade100,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          20)),
                                              child: Text(
                                                  '${p['stock_actual']}',
                                                  style: TextStyle(
                                                      color:
                                                          Colors.red.shade700,
                                                      fontWeight:
                                                          FontWeight.bold)),
                                            ),
                                          ))
                                      .toList(),
                                ),
                              ),
                              const SizedBox(height: 20),
                            ],

                            // Últimos pedidos
                            if (ingresosPorPedido.isNotEmpty) ...[
                              _SeccionTitulo(
                                  'Últimos 10 Ingresos por Pedido'),
                              const SizedBox(height: 10),
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColors.blanco,
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: [
                                    BoxShadow(
                                        color:
                                            Colors.grey.withOpacity(0.08),
                                        blurRadius: 4)
                                  ],
                                ),
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: DataTable(
                                    headingRowColor: WidgetStateProperty.all(
                                        const Color(0xFFc45a77)),
                                    headingTextStyle: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12),
                                    dataTextStyle:
                                        const TextStyle(fontSize: 12),
                                    columnSpacing: 16,
                                    columns: const [
                                      DataColumn(label: Text('Pedido')),
                                      DataColumn(label: Text('Cliente')),
                                      DataColumn(label: Text('Fecha')),
                                      DataColumn(label: Text('Método')),
                                      DataColumn(label: Text('Estado')),
                                      DataColumn(
                                          label: Text('Total'),
                                          numeric: true),
                                    ],
                                    rows: ingresosPorPedido.map((p) {
                                      final isPagado = (p['estado'] as String)
                                          .toLowerCase()
                                          .contains('pagado');
                                      return DataRow(cells: [
                                        DataCell(Text('#${p['id_pedido']}',
                                            style: const TextStyle(
                                                color: Color(0xFFa0405f),
                                                fontWeight:
                                                    FontWeight.bold))),
                                        DataCell(
                                            Text('${p['cliente']}')),
                                        DataCell(Text('${p['fecha']}',
                                            style: const TextStyle(
                                                color: Colors.grey))),
                                        DataCell(Text('${p['metodo']}',
                                            style: const TextStyle(
                                                color: Colors.grey))),
                                        DataCell(Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: isPagado
                                                ? Colors.green.shade100
                                                : Colors.orange.shade100,
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: Text('${p['estado']}',
                                              style: TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                  color: isPagado
                                                      ? Colors.green.shade800
                                                      : Colors
                                                          .orange.shade800)),
                                        )),
                                        DataCell(Text(
                                            '\$${(p['total'] as double).toStringAsFixed(0)}',
                                            style: const TextStyle(
                                                fontWeight:
                                                    FontWeight.bold))),
                                      ]);
                                    }).toList(),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),
                            ],

                            // Resumen mensual
                            if (resumenMensual.isNotEmpty) ...[
                              _SeccionTitulo('Resumen Mensual'),
                              const SizedBox(height: 10),
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColors.blanco,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Column(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 16, vertical: 10),
                                      decoration: const BoxDecoration(
                                        color: AppColors.primario,
                                        borderRadius: BorderRadius.vertical(
                                            top: Radius.circular(10)),
                                      ),
                                      child: const Row(children: [
                                        Expanded(
                                            child: Text('Mes',
                                                style: TextStyle(
                                                    color: AppColors.blanco,
                                                    fontWeight:
                                                        FontWeight.bold))),
                                        Expanded(
                                            child: Text('Entradas',
                                                textAlign: TextAlign.center,
                                                style: TextStyle(
                                                    color: AppColors.blanco,
                                                    fontWeight:
                                                        FontWeight.bold))),
                                        Expanded(
                                            child: Text('Salidas',
                                                textAlign: TextAlign.right,
                                                style: TextStyle(
                                                    color: AppColors.blanco,
                                                    fontWeight:
                                                        FontWeight.bold))),
                                      ]),
                                    ),
                                    ...resumenMensual.map((m) => Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 16, vertical: 10),
                                          decoration: BoxDecoration(
                                            border: Border(
                                                bottom: BorderSide(
                                                    color: AppColors.suave
                                                        .withOpacity(0.5))),
                                          ),
                                          child: Row(children: [
                                            Expanded(
                                                child: Text('${m['mes']}',
                                                    style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w500))),
                                            Expanded(
                                                child: Text(
                                                    '${m['entradas'] ?? 0}',
                                                    textAlign: TextAlign.center,
                                                    style: TextStyle(
                                                        color: Colors
                                                            .green.shade700,
                                                        fontWeight:
                                                            FontWeight.bold))),
                                            Expanded(
                                                child: Text(
                                                    '${m['salidas'] ?? 0}',
                                                    textAlign: TextAlign.right,
                                                    style: TextStyle(
                                                        color:
                                                            Colors.red.shade700,
                                                        fontWeight:
                                                            FontWeight.bold))),
                                          ]),
                                        )),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  PANEL HISTORIAL DE VENTAS
// ─────────────────────────────────────────────────────────────
class _HistorialPanel extends StatefulWidget {
  final UsuarioModel usuario;
  const _HistorialPanel({required this.usuario});

  @override
  State<_HistorialPanel> createState() => _HistorialPanelState();
}

class _HistorialPanelState extends State<_HistorialPanel> {
  bool cargando = true;
  String? error;
  Map<String, dynamic>? resumen;
  List topProductos = [];
  List resumenMensual = [];

  DateTime fechaDesde =
      DateTime.now().subtract(const Duration(days: 30));
  DateTime fechaHasta = DateTime.now();

  @override
  void initState() {
    super.initState();
    cargarDatos();
  }

  Future<void> cargarDatos() async {
    try {
      setState(() {
        cargando = true;
        error = null;
      });
      final p =
          'desde=${fechaDesde.toIso8601String().split('T')[0]}&hasta=${fechaHasta.toIso8601String().split('T')[0]}';

      final resRes =
          await ApiService.get('${AppConstants.resumenGeneral}?$p');
      final topRes =
          await ApiService.get('${AppConstants.topProductos}?$p&limit=10');
      final mensRes =
          await ApiService.get(AppConstants.resumenMensual);

      if (resRes.statusCode == 200) resumen = jsonDecode(resRes.body);
      if (topRes.statusCode == 200) topProductos = jsonDecode(topRes.body);
      if (mensRes.statusCode == 200) resumenMensual = jsonDecode(mensRes.body);

      setState(() {
        cargando = false;
      });
    } catch (e) {
      setState(() {
        cargando = false;
        error = 'Error de conexión';
      });
    }
  }

  Future<void> _seleccionarFecha(bool esDesde) async {
    final fecha = await showDatePicker(
      context: context,
      initialDate: esDesde ? fechaDesde : fechaHasta,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (c, child) => Theme(
        data: Theme.of(c).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primario),
        ),
        child: child!,
      ),
    );
    if (fecha != null) {
      setState(() {
        if (esDesde) fechaDesde = fecha;
        else fechaHasta = fecha;
      });
      cargarDatos();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: AppColors.blanco,
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: _FechaSelector(
                  label: 'Desde',
                  fecha: fechaDesde,
                  onTap: () => _seleccionarFecha(true),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _FechaSelector(
                  label: 'Hasta',
                  fecha: fechaHasta,
                  onTap: () => _seleccionarFecha(false),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton.icon(
                onPressed: cargarDatos,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Actualizar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primario,
                  foregroundColor: AppColors.blanco,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: cargando
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primario))
              : error != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(error!,
                              style: const TextStyle(color: Colors.red)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                              onPressed: cargarDatos,
                              child: const Text('Reintentar')),
                        ],
                      ),
                    )
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (resumen != null)
                            Row(children: [
                              _StatCard4(
                                label: 'Total Entradas',
                                value: '${resumen!['totalEntradas'] ?? 0}',
                                color: Colors.green.shade50,
                                borderColor: Colors.green.shade200,
                                valueColor: Colors.green.shade800,
                              ),
                              const SizedBox(width: 12),
                              _StatCard4(
                                label: 'Total Salidas',
                                value: '${resumen!['totalSalidas'] ?? 0}',
                                color: Colors.red.shade50,
                                borderColor: Colors.red.shade200,
                                valueColor: Colors.red.shade800,
                              ),
                            ]),
                          const SizedBox(height: 20),

                          if (resumenMensual.isNotEmpty) ...[
                            _SeccionTitulo('Resumen Mensual'),
                            const SizedBox(height: 10),
                            Container(
                              decoration: BoxDecoration(
                                color: AppColors.blanco,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Column(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 10),
                                    decoration: const BoxDecoration(
                                      color: AppColors.primario,
                                      borderRadius: BorderRadius.vertical(
                                          top: Radius.circular(10)),
                                    ),
                                    child: const Row(children: [
                                      Expanded(
                                          child: Text('Mes',
                                              style: TextStyle(
                                                  color: AppColors.blanco,
                                                  fontWeight: FontWeight.bold))),
                                      Expanded(
                                          child: Text('Entradas',
                                              textAlign: TextAlign.center,
                                              style: TextStyle(
                                                  color: AppColors.blanco,
                                                  fontWeight: FontWeight.bold))),
                                      Expanded(
                                          child: Text('Salidas',
                                              textAlign: TextAlign.right,
                                              style: TextStyle(
                                                  color: AppColors.blanco,
                                                  fontWeight: FontWeight.bold))),
                                    ]),
                                  ),
                                  ...resumenMensual.map((m) => Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 16, vertical: 10),
                                        decoration: BoxDecoration(
                                          border: Border(
                                              bottom: BorderSide(
                                                  color: AppColors.suave
                                                      .withOpacity(0.5))),
                                        ),
                                        child: Row(children: [
                                          Expanded(
                                              child: Text('${m['mes']}',
                                                  style: const TextStyle(
                                                      fontWeight:
                                                          FontWeight.w500))),
                                          Expanded(
                                              child: Text(
                                                  '${m['entradas'] ?? 0}',
                                                  textAlign: TextAlign.center,
                                                  style: TextStyle(
                                                      color:
                                                          Colors.green.shade700,
                                                      fontWeight:
                                                          FontWeight.bold))),
                                          Expanded(
                                              child: Text(
                                                  '${m['salidas'] ?? 0}',
                                                  textAlign: TextAlign.right,
                                                  style: TextStyle(
                                                      color:
                                                          Colors.red.shade700,
                                                      fontWeight:
                                                          FontWeight.bold))),
                                        ]),
                                      )),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],

                          if (topProductos.isNotEmpty) ...[
                            _SeccionTitulo('Productos Más Movidos'),
                            const SizedBox(height: 10),
                            ...topProductos.asMap().entries.map((entry) {
                              final i = entry.key;
                              final p = entry.value;
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.blanco,
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: [
                                    BoxShadow(
                                        color: Colors.grey.withOpacity(0.1),
                                        blurRadius: 4)
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 30,
                                      height: 30,
                                      decoration: BoxDecoration(
                                          color: AppColors.primario,
                                          shape: BoxShape.circle),
                                      child: Center(
                                          child: Text('${i + 1}',
                                              style: const TextStyle(
                                                  color: AppColors.blanco,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12))),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text('${p['producto']}',
                                              style: const TextStyle(
                                                  fontWeight: FontWeight.w600)),
                                          Text(
                                              'Total movimientos: ${p['total_movimientos']}',
                                              style: const TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey)),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        Text('+${p['entradas'] ?? 0}',
                                            style: TextStyle(
                                                color: Colors.green.shade700,
                                                fontWeight: FontWeight.bold)),
                                        Text('-${p['salidas'] ?? 0}',
                                            style: TextStyle(
                                                color: Colors.red.shade700,
                                                fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ],
                      ),
                    ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  PANEL NOTIFICACIONES
// ─────────────────────────────────────────────────────────────
class _NotificacionesPanel extends StatefulWidget {
  final UsuarioModel usuario;
  const _NotificacionesPanel({required this.usuario});

  @override
  State<_NotificacionesPanel> createState() => _NotificacionesPanelState();
}

class _NotificacionesPanelState extends State<_NotificacionesPanel> {
  bool cargando = true;
  String? error;
  List notificaciones = [];
  Map<String, dynamic>? estadisticas;
  String filtroActivo = 'todas';

  static const List<Map<String, dynamic>> _filtros = [
    {'key': 'todas', 'label': 'Todas'},
    {'key': 'stock-bajo', 'label': 'Stock Bajo'},
    {'key': 'agotado', 'label': 'Agotados'},
    {'key': 'pedido', 'label': 'Pedidos'},
  ];

  @override
  void initState() {
    super.initState();
    cargarDatos();
  }

  Future<void> cargarDatos() async {
    try {
      setState(() {
        cargando = true;
        error = null;
      });
      final notifRes =
          await ApiService.get(AppConstants.obtenerNotificaciones);
      final statsRes =
          await ApiService.get(AppConstants.estadisticasNotificaciones);

      if (notifRes.statusCode == 200) notificaciones = jsonDecode(notifRes.body);
      if (statsRes.statusCode == 200) estadisticas = jsonDecode(statsRes.body);

      setState(() {
        cargando = false;
      });
    } catch (e) {
      setState(() {
        cargando = false;
        error = 'Error de conexión';
      });
    }
  }

  List get _filtradas {
    if (filtroActivo == 'todas') return notificaciones;
    return notificaciones.where((n) => n['tipo'] == filtroActivo).toList();
  }

  int _contar(String key) {
    if (key == 'todas') return notificaciones.length;
    return notificaciones.where((n) => n['tipo'] == key).length;
  }

  Color _colorTipo(String tipo) {
    switch (tipo) {
      case 'stock-bajo': return Colors.orange;
      case 'agotado': return Colors.red;
      case 'pedido': return Colors.blue;
      default: return Colors.grey;
    }
  }

  String _labelTipo(String tipo) {
    switch (tipo) {
      case 'stock-bajo': return 'Stock Bajo';
      case 'agotado': return 'Agotado';
      case 'pedido': return 'Pedido';
      default: return 'Info';
    }
  }

  String _formatFecha(String f) {
    final date = DateTime.tryParse(f);
    if (date == null) return f;
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Hace un momento';
    if (diff.inMinutes < 60) return 'Hace ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Hace ${diff.inHours}h';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Stats chips
        if (estadisticas != null)
          Container(
            color: AppColors.blanco,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _StatChip(
                    label: 'Stock Bajo',
                    value: '${estadisticas!['productos_stock_bajo'] ?? 0}',
                    color: Colors.orange),
                const SizedBox(width: 8),
                _StatChip(
                    label: 'Agotados',
                    value: '${estadisticas!['productos_agotados'] ?? 0}',
                    color: Colors.red),
                const SizedBox(width: 8),
                _StatChip(
                    label: 'Pedidos hoy',
                    value: '${estadisticas!['pedidos_hoy'] ?? 0}',
                    color: Colors.blue),
                const SizedBox(width: 8),
                _StatChip(
                    label: '7 días',
                    value: '${estadisticas!['pedidos_semana'] ?? 0}',
                    color: Colors.green),
              ],
            ),
          ),

        // Filtros
        Container(
          color: AppColors.blanco,
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                ..._filtros.map((f) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () =>
                            setState(() => filtroActivo = f['key'] as String),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: filtroActivo == f['key']
                                ? AppColors.primario
                                : AppColors.fondo,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.suave),
                          ),
                          child: Text(
                            '${f['label']} (${_contar(f['key'] as String)})',
                            style: TextStyle(
                              color: filtroActivo == f['key']
                                  ? AppColors.blanco
                                  : AppColors.texto,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    )),
                GestureDetector(
                  onTap: cargarDatos,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.secundario,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text('Actualizar',
                        style: TextStyle(
                            color: AppColors.blanco,
                            fontWeight: FontWeight.w600,
                            fontSize: 13)),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Lista tabla (igual que la web)
        Expanded(
          child: cargando
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primario))
              : error != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(error!,
                              style: const TextStyle(color: Colors.red)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                              onPressed: cargarDatos,
                              child: const Text('Reintentar')),
                        ],
                      ),
                    )
                  : _filtradas.isEmpty
                      ? Center(
                          child: Text(
                            'No hay notificaciones${filtroActivo != 'todas' ? ' de este tipo' : ''}',
                            style: const TextStyle(color: Colors.grey),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: cargarDatos,
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                // Tabla con encabezado (estilo web)
                                Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.blanco,
                                    borderRadius: BorderRadius.circular(10),
                                    boxShadow: [
                                      BoxShadow(
                                          color:
                                              Colors.grey.withOpacity(0.08),
                                          blurRadius: 4)
                                    ],
                                  ),
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: DataTable(
                                      headingRowColor:
                                          WidgetStateProperty.all(
                                              const Color(0xFFc45a77)),
                                      headingTextStyle: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12),
                                      dataTextStyle:
                                          const TextStyle(fontSize: 12),
                                      columnSpacing: 14,
                                      columns: const [
                                        DataColumn(label: Text('#')),
                                        DataColumn(label: Text('Tipo')),
                                        DataColumn(label: Text('Mensaje')),
                                        DataColumn(label: Text('Detalles')),
                                        DataColumn(label: Text('Fecha')),
                                      ],
                                      rows: _filtradas
                                          .asMap()
                                          .entries
                                          .map((entry) {
                                        final i = entry.key;
                                        final n = entry.value;
                                        final tipo = n['tipo'] ?? '';
                                        final color = _colorTipo(tipo);
                                        return DataRow(cells: [
                                          DataCell(Text('${i + 1}')),
                                          DataCell(Container(
                                            padding:
                                                const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 3),
                                            decoration: BoxDecoration(
                                              color:
                                                  color.withOpacity(0.1),
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            child: Text(
                                                _labelTipo(tipo),
                                                style: TextStyle(
                                                    color: color,
                                                    fontSize: 11,
                                                    fontWeight:
                                                        FontWeight.bold)),
                                          )),
                                          DataCell(Text(
                                              '${n['mensaje']}',
                                              style: const TextStyle(
                                                  fontWeight:
                                                      FontWeight.w600))),
                                          DataCell(Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              if (n['detalles'] != null)
                                                Text('${n['detalles']}',
                                                    style: const TextStyle(
                                                        fontSize: 11,
                                                        color: Colors.grey)),
                                              if (n['stock_actual'] != null)
                                                Text(
                                                  n['stock_actual'] == 0
                                                      ? 'SIN STOCK'
                                                      : 'Stock: ${n['stock_actual']} (Mín: ${n['stock_minimo']})',
                                                  style: TextStyle(
                                                      fontSize: 11,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: n['stock_actual'] ==
                                                              0
                                                          ? Colors.red
                                                          : Colors.orange),
                                                ),
                                            ],
                                          )),
                                          DataCell(Text(
                                              _formatFecha(
                                                  n['fecha'] ?? ''),
                                              style: const TextStyle(
                                                  color: Colors.grey,
                                                  fontSize: 11))),
                                        ]);
                                      }).toList(),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  WIDGETS AUXILIARES
// ─────────────────────────────────────────────────────────────

class _FechaSelector extends StatelessWidget {
  final String label;
  final DateTime fecha;
  final VoidCallback onTap;

  const _FechaSelector({
    required this.label,
    required this.fecha,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.suave),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(
                    fontSize: 11, color: AppColors.texto)),
            Text(
              fecha.toIso8601String().split('T')[0],
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.secundario),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard4 extends StatelessWidget {
  final String label, value;
  final String? sub;
  final Color color, borderColor, valueColor;
  final bool smallValue;

  const _StatCard4({
    required this.label,
    required this.value,
    this.sub,
    required this.color,
    required this.borderColor,
    required this.valueColor,
    this.smallValue = false,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.texto)),
            const SizedBox(height: 4),
            Text(value,
                style: TextStyle(
                    fontSize: smallValue ? 18 : 24,
                    fontWeight: FontWeight.w800,
                    color: valueColor)),
            if (sub != null)
              Text(sub!,
                  style: const TextStyle(
                      fontSize: 11, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

class _ClienteCard extends StatelessWidget {
  final Map<String, dynamic> data;
  final int puesto;

  const _ClienteCard({required this.data, required this.puesto});

  static const List<List<Color>> _gradients = [
    [Color(0xFFFFFDE7), Color(0xFFFFF9C4)], // oro
    [Color(0xFFF5F5F5), Color(0xFFEEEEEE)], // plata
    [Color(0xFFFBE9E7), Color(0xFFFFCCBC)], // bronce
  ];
  static const List<Color> _borders = [
    Color(0xFFF9A825),
    Color(0xFFBDBDBD),
    Color(0xFFE64A19),
  ];
  static const List<String> _labels = ['🥇', '🥈', '🥉'];

  @override
  Widget build(BuildContext context) {
    final idx = puesto - 1;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: _gradients[idx],
        ),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _borders[idx], width: 1.5),
      ),
      child: Column(
        children: [
          Text(_labels[idx], style: const TextStyle(fontSize: 22)),
          const SizedBox(height: 4),
          Text('${data['nombre']}',
              style: const TextStyle(
                  fontWeight: FontWeight.bold, fontSize: 13),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
          if (data['telefono'] != null &&
              '${data['telefono']}'.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text('${data['telefono']}',
                style: const TextStyle(
                    fontSize: 11, color: Colors.grey)),
          ],
          const SizedBox(height: 6),
          Text(
            '\$${(data['total_monto'] as double).toStringAsFixed(0)}',
            style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFFa0405f)),
          ),
          Text('${data['cantidad_pedidos']} pedidos',
              style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _SeccionTitulo extends StatelessWidget {
  final String titulo;
  const _SeccionTitulo(this.titulo);

  @override
  Widget build(BuildContext context) {
    return Text(
      titulo,
      style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.bold,
          color: AppColors.secundario),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label, value;
  final Color color;

  const _StatChip(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text(value,
                style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: color)),
            Text(label,
                style: const TextStyle(
                    fontSize: 10, color: AppColors.texto),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}