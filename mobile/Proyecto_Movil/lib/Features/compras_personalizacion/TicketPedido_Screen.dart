import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../../Shared/providers/auth_provider.dart';
import '../../Shared/constants/app_colors.dart';

class TicketPedidoScreen extends StatelessWidget {
  final Map<String, dynamic> data;

  const TicketPedidoScreen({super.key, required this.data});

  String _fmt(num? precio) {
    if (precio == null) return '\$0';
    return '\$${precio.toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  // ── Generación del PDF (mismo patrón que el panel de reportes)
  Future<void> _descargarPdf(BuildContext context) async {
    final usuario = context.read<AuthProvider>().usuario;
    final payload =
        data['data'] is Map ? data['data'] as Map<String, dynamic> : data;

    final numTicket  = payload['num_ticket']  ?? payload['numTicket']  ?? '—';
    final idPedido   = payload['id_pedido']   ?? payload['idPedido']   ?? '—';
    final detalles   = payload['detalles']    as List<dynamic>? ?? [];
    final total      = payload['total']       ?? payload['precio_total'] ?? 0;
    final materiales = payload['materiales']  as List<dynamic>? ?? [];
    final tipoProd   = payload['tipo_producto'] ?? '';
    final tamanio    = payload['tamanio']       ?? '';
    final esPersonalizado = (tipoProd as String).isNotEmpty;

    final pdf = pw.Document();

    pdf.addPage(pw.Page(
      pageFormat: PdfPageFormat.a4,
      margin: const pw.EdgeInsets.all(28),
      build: (ctx) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          // ── Encabezado
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('Gurama Online',
                  style: pw.TextStyle(
                      fontSize: 20,
                      fontWeight: pw.FontWeight.bold,
                      fontStyle: pw.FontStyle.italic,
                      color: PdfColor.fromHex('#c45a77'))),
              pw.Container(
                padding:
                    const pw.EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex('#f3e4e9'),
                  borderRadius: pw.BorderRadius.circular(10),
                ),
                child: pw.Text('# $numTicket',
                    style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColor.fromHex('#7a235f'))),
              ),
            ],
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            'Pedido #$idPedido — Generado el '
            '${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
            style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600),
          ),
          pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
          pw.SizedBox(height: 8),

          // ── Cliente
          pw.Text('Cliente',
              style: pw.TextStyle(
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#7a235f'),
                  fontSize: 12)),
          pw.SizedBox(height: 6),
          _pdfFila('Nombre',
              '${usuario?.nom1 ?? ''} ${usuario?.ape1 ?? ''}'.trim()),
          _pdfFila('Documento', usuario?.idUsuario ?? '—'),
          _pdfFila('Correo', usuario?.correo ?? '—'),
          _pdfFila('Teléfono', usuario?.telefono ?? '—'),

          pw.SizedBox(height: 12),
          pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
          pw.SizedBox(height: 8),

          // ── Productos (pedido estándar)
          if (!esPersonalizado && detalles.isNotEmpty) ...[
            pw.Text('Productos',
                style: pw.TextStyle(
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColor.fromHex('#7a235f'),
                    fontSize: 12)),
            pw.SizedBox(height: 8),
            pw.Table(
              border: pw.TableBorder.all(
                  color: PdfColor.fromHex('#d4a9c2'), width: 0.5),
              columnWidths: {
                0: const pw.FlexColumnWidth(3),
                1: const pw.FlexColumnWidth(1),
              },
              children: [
                pw.TableRow(
                  decoration:
                      pw.BoxDecoration(color: PdfColor.fromHex('#c45a77')),
                  children: ['Producto', 'Cantidad']
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
                ...detalles.asMap().entries.map((e) {
                  final d = e.value;
                  return pw.TableRow(
                    decoration: pw.BoxDecoration(
                        color: e.key % 2 == 0
                            ? PdfColors.white
                            : PdfColor.fromHex('#fdf0f4')),
                    children: [
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(6),
                        child: pw.Text('${d['producto'] ?? '—'}',
                            style: const pw.TextStyle(fontSize: 10)),
                      ),
                      pw.Padding(
                        padding: const pw.EdgeInsets.all(6),
                        child: pw.Text('x${d['cantidad'] ?? 0}',
                            style: const pw.TextStyle(fontSize: 10)),
                      ),
                    ],
                  );
                }),
              ],
            ),
            pw.SizedBox(height: 14),
            pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
            pw.SizedBox(height: 8),
          ],

          // ── Materiales (pedido personalizado)
          if (esPersonalizado) ...[
            pw.Text('Detalles del pedido',
                style: pw.TextStyle(
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColor.fromHex('#7a235f'),
                    fontSize: 12)),
            pw.SizedBox(height: 6),
            if ((tipoProd as String).isNotEmpty) _pdfFila('Tipo', tipoProd),
            if ((tamanio as String).isNotEmpty) _pdfFila('Tamaño', tamanio),
            if (materiales.isNotEmpty) ...[
              pw.SizedBox(height: 10),
              pw.Text('Materiales',
                  style: pw.TextStyle(
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColor.fromHex('#7a235f'),
                      fontSize: 12)),
              pw.SizedBox(height: 8),
              pw.Table(
                border: pw.TableBorder.all(
                    color: PdfColor.fromHex('#d4a9c2'), width: 0.5),
                columnWidths: {
                  0: const pw.FlexColumnWidth(3),
                  1: const pw.FlexColumnWidth(1),
                },
                children: [
                  pw.TableRow(
                    decoration:
                        pw.BoxDecoration(color: PdfColor.fromHex('#c45a77')),
                    children: ['Material', 'Subtotal']
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
                  ...materiales.asMap().entries.map((e) {
                    final m = e.value;
                    return pw.TableRow(
                      decoration: pw.BoxDecoration(
                          color: e.key % 2 == 0
                              ? PdfColors.white
                              : PdfColor.fromHex('#fdf0f4')),
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text(
                              '${m['nombre'] ?? '—'} x${m['cantidad']} ${m['unidad'] ?? ''}',
                              style: const pw.TextStyle(fontSize: 10)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(6),
                          child: pw.Text(
                              m['subtotal'] != null
                                  ? _fmt(m['subtotal'] as num)
                                  : '—',
                              style: const pw.TextStyle(fontSize: 10)),
                        ),
                      ],
                    );
                  }),
                ],
              ),
            ],
            pw.SizedBox(height: 14),
            pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
            pw.SizedBox(height: 8),
          ],

          // ── Total
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('Total estimado',
                  style: pw.TextStyle(
                      fontSize: 14,
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColor.fromHex('#7a235f'))),
              pw.Text(
                total is num ? _fmt(total) : total.toString(),
                style: pw.TextStyle(
                    fontSize: 16,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColor.fromHex('#c45a77')),
              ),
            ],
          ),
          pw.SizedBox(height: 16),

          // ── Nota de pago
          pw.Container(
            padding: const pw.EdgeInsets.all(10),
            decoration: pw.BoxDecoration(
              color: PdfColor.fromHex('#f3e4e9'),
              borderRadius: pw.BorderRadius.circular(8),
            ),
            child: pw.Text(
              'El método de pago y los detalles finales serán confirmados por un trabajador.',
              style: pw.TextStyle(
                  fontSize: 9, color: PdfColor.fromHex('#5a3d54')),
            ),
          ),

          pw.SizedBox(height: 24),
          pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
          pw.Center(
            child: pw.Text('Gracias por tu pedido — Gurama Online',
                style: const pw.TextStyle(
                    fontSize: 9, color: PdfColors.grey500)),
          ),
        ],
      ),
    ));

    await Printing.layoutPdf(onLayout: (_) async => pdf.save());
  }

  pw.Widget _pdfFila(String label, String valor) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 4),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label,
              style: const pw.TextStyle(
                  fontSize: 10, color: PdfColors.grey700)),
          pw.Text(valor.isEmpty ? '—' : valor,
              style: pw.TextStyle(
                  fontSize: 10,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#7a235f'))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.read<AuthProvider>().usuario;

    // El backend devuelve { success, data: { id_pedido, num_ticket, ... } }
    // o puede venir directamente el objeto data ya extraído
    final payload = data['data'] is Map ? data['data'] as Map<String, dynamic> : data;

    final numTicket  = payload['num_ticket']  ?? payload['numTicket']  ?? '—';
    final idPedido   = payload['id_pedido']   ?? payload['idPedido']   ?? '—';
    final detalles   = payload['detalles']    as List<dynamic>? ?? [];
    final total      = payload['total']       ?? payload['precio_total'] ?? 0;

    // Materiales para pedidos personalizados
    final materiales = payload['materiales']  as List<dynamic>? ?? [];
    final tipoProd   = payload['tipo_producto'] ?? '';
    final tamanio    = payload['tamanio']       ?? '';
    final esPersonalizado = tipoProd.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.fondo,
      appBar: AppBar(
        backgroundColor: AppColors.blanco,
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        centerTitle: true,
        title: Image.asset(
          'lib/Assest/Logo_GO.jpeg',
          height: 40,
          errorBuilder: (_, __, ___) => const Text(
            'Gurama Online',
            style: TextStyle(
                color: AppColors.secundario,
                fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: AppColors.grisBorde),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 8),

            // ── Ícono de éxito
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                gradient: AppColors.gradientePrimario,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primario.withOpacity(0.35),
                    blurRadius: 16, offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(Icons.check_rounded,
                  color: Colors.white, size: 38),
            ),
            const SizedBox(height: 14),
            const Text('¡Pedido creado exitosamente!',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 20, fontWeight: FontWeight.bold,
                    color: AppColors.secundario)),
            const SizedBox(height: 6),
            const Text(
              'El pago se confirma contra entrega.\nUn trabajador revisará tu pedido pronto.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textoSecundario,
                  fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 24),

            // ── Ticket card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.fondoTarjeta,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primario.withOpacity(0.08),
                    blurRadius: 12),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Encabezado ticket
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Gurama Online',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold,
                              color: AppColors.primario,
                              fontStyle: FontStyle.italic)),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.primario.withOpacity(0.10),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text('# $numTicket',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.secundario)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Pedido #$idPedido',
                      style: const TextStyle(
                          color: AppColors.textoClaro, fontSize: 12)),

                  const Divider(height: 28, color: AppColors.grisBorde),

                  // ── Datos del cliente
                  _seccion('Cliente'),
                  _fila('Nombre',
                      '${usuario?.nom1 ?? ''} ${usuario?.ape1 ?? ''}'.trim()),
                  _fila('Documento', usuario?.idUsuario ?? '—'),
                  _fila('Correo', usuario?.correo ?? '—'),
                  _fila('Teléfono', usuario?.telefono ?? '—'),

                  const Divider(height: 28, color: AppColors.grisBorde),

                  // ── Productos (pedido estándar)
                  if (!esPersonalizado && detalles.isNotEmpty) ...[
                    _seccion('Productos'),
                    ...detalles.map((d) {
                      final nombre   = d['producto']?.toString()   ?? '—';
                      final cantidad = d['cantidad']               ?? 0;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(nombre,
                                  style: const TextStyle(
                                      color: AppColors.texto, fontSize: 13)),
                            ),
                            Text('x$cantidad',
                                style: const TextStyle(
                                    color: AppColors.textoSecundario,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                      );
                    }),
                    const Divider(height: 28, color: AppColors.grisBorde),
                  ],

                  // ── Materiales (pedido personalizado)
                  if (esPersonalizado) ...[
                    _seccion('Detalles del pedido'),
                    if (tipoProd.isNotEmpty) _fila('Tipo', tipoProd),
                    if (tamanio.isNotEmpty)  _fila('Tamaño', tamanio),
                    if (materiales.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      _seccion('Materiales'),
                      ...materiales.map((m) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${m['nombre'] ?? '—'} x${m['cantidad']} ${m['unidad'] ?? ''}',
                                style: const TextStyle(
                                    color: AppColors.texto, fontSize: 13)),
                            ),
                            if (m['subtotal'] != null)
                              Text(_fmt(m['subtotal'] as num),
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textoSecundario,
                                      fontSize: 13)),
                          ],
                        ),
                      )),
                    ],
                    const Divider(height: 28, color: AppColors.grisBorde),
                  ],

                  // ── Total
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total estimado',
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.bold,
                              color: AppColors.secundario)),
                      Text(
                        total is num ? _fmt(total) : total.toString(),
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold,
                            color: AppColors.primario),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Nota de pago
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primario.withOpacity(0.07),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.info_outline_rounded,
                            color: AppColors.primario, size: 18),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'El método de pago y los detalles finales serán confirmados por un trabajador.',
                            style: TextStyle(
                                color: AppColors.textoSecundario,
                                fontSize: 12, height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // ── Botón descargar PDF
            DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.primario, width: 1.5),
              ),
              child: ElevatedButton.icon(
                onPressed: () => _descargarPdf(context),
                icon: const Icon(Icons.picture_as_pdf_outlined,
                    color: AppColors.primario),
                label: const Text('Descargar PDF',
                    style: TextStyle(
                        fontSize: 15, fontWeight: FontWeight.bold,
                        color: AppColors.primario)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // ── Botón volver al inicio
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: AppColors.gradientePrimario,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primario.withOpacity(0.35),
                    blurRadius: 12, offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pushNamedAndRemoveUntil(
                    context, '/cliente', (route) => false),
                icon: const Icon(Icons.home_rounded, color: Colors.white),
                label: const Text('Volver al inicio',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold,
                        color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _seccion(String titulo) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(titulo,
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.secundario, fontSize: 13)),
      );

  Widget _fila(String label, String valor) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style: const TextStyle(
                    color: AppColors.textoClaro, fontSize: 13)),
            Flexible(
              child: Text(valor.isEmpty ? '—' : valor,
                  textAlign: TextAlign.right,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textoSecundario, fontSize: 13)),
            ),
          ],
      ),
  );
}