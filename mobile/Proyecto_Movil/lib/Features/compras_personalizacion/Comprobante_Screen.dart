import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

import '../../Shared/providers/comprobante_provider.dart';
import '../../Shared/providers/carrito_provider.dart';
import '../../Data/models/producto_model.dart';
import '../../Shared/constants/app_constants.dart';

class ComprobanteScreen extends StatelessWidget {
  const ComprobanteScreen({super.key});

  String _fmt(double precio) =>
      '\$${precio.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';

  // ── Generación del PDF (mismo patrón que el panel de reportes)
  Future<void> _descargarPdf(dynamic ticket) async {
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
              pw.Text('proyecto_movil',
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
                child: pw.Text('# ${ticket.numTicket}',
                    style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColor.fromHex('#b4788b'))),
              ),
            ],
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            'Comprobante de Pedido — Generado el '
            '${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
            style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey600),
          ),
          pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
          pw.SizedBox(height: 8),

          // ── Cliente
          pw.Text('Cliente',
              style: pw.TextStyle(
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#b4788b'),
                  fontSize: 12)),
          pw.SizedBox(height: 6),
          _pdfFila('Nombre', ticket.cliente),
          _pdfFila('Correo', ticket.correo),
          _pdfFila('Teléfono', ticket.telefono),
          _pdfFila('Método de pago', ticket.metodoPago),

          pw.SizedBox(height: 12),
          pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
          pw.SizedBox(height: 8),

          // ── Detalles del pedido
          pw.Text('Detalles del pedido',
              style: pw.TextStyle(
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#b4788b'),
                  fontSize: 12)),
          pw.SizedBox(height: 6),
          _pdfFila('Pedido', '# ${ticket.idPedido}'),
          _pdfFila('Fecha', ticket.fechaEmision),
          _pdfFila('Estado', ticket.estado),

          pw.SizedBox(height: 12),
          pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
          pw.SizedBox(height: 8),

          // ── Productos
          pw.Text('Productos',
              style: pw.TextStyle(
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#b4788b'),
                  fontSize: 12)),
          pw.SizedBox(height: 8),
          pw.Table(
            border:
                pw.TableBorder.all(color: PdfColor.fromHex('#d4a9c2'), width: 0.5),
            columnWidths: {
              0: const pw.FlexColumnWidth(3),
              1: const pw.FlexColumnWidth(1),
            },
            children: [
              pw.TableRow(
                decoration:
                    pw.BoxDecoration(color: PdfColor.fromHex('#c45a77')),
                children: ['Producto', 'Precio']
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
              ...ticket.productos.asMap().entries.map((e) {
                final ProductoModel p = e.value;
                return pw.TableRow(
                  decoration: pw.BoxDecoration(
                      color: e.key % 2 == 0
                          ? PdfColors.white
                          : PdfColor.fromHex('#fdf0f4')),
                  children: [
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(6),
                      child: pw.Text(p.nomProducto,
                          style: const pw.TextStyle(fontSize: 10)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(6),
                      child: pw.Text(p.precioFormateado,
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

          // ── Totales
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('Subtotal', style: const pw.TextStyle(fontSize: 11)),
              pw.Text(_fmt(ticket.subtotal),
                  style: const pw.TextStyle(fontSize: 11)),
            ],
          ),
          pw.SizedBox(height: 6),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('Total',
                  style: pw.TextStyle(
                      fontSize: 14,
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColor.fromHex('#b4788b'))),
              pw.Text(_fmt(ticket.total),
                  style: pw.TextStyle(
                      fontSize: 16,
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColor.fromHex('#c45a77'))),
            ],
          ),

          if (ticket.nota.isNotEmpty) ...[
            pw.SizedBox(height: 12),
            pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
            pw.SizedBox(height: 8),
            pw.Text('Nota del pedido',
                style: pw.TextStyle(
                    fontSize: 10,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColor.fromHex('#5a3d54'))),
            pw.SizedBox(height: 4),
            pw.Text(ticket.nota,
                style: const pw.TextStyle(fontSize: 10)),
          ],

          pw.SizedBox(height: 16),
          pw.Container(
            padding: const pw.EdgeInsets.all(10),
            decoration: pw.BoxDecoration(
              color: PdfColor.fromHex('#f3e4e9'),
              borderRadius: pw.BorderRadius.circular(8),
            ),
            child: pw.Text('Pago contra entrega',
                style: pw.TextStyle(
                    fontSize: 10,
                    fontWeight: pw.FontWeight.bold,
                    color: PdfColor.fromHex('#5a3d54'))),
          ),

          pw.SizedBox(height: 24),
          pw.Divider(color: PdfColor.fromHex('#d4a9c2')),
          pw.Center(
            child: pw.Text('Gracias por tu compra — Gurama Online',
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
          pw.Text(valor,
              style: pw.TextStyle(
                  fontSize: 10,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromHex('#b4788b'))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ticket = context.watch<ComprobanteProvider>().ticket;

    return Scaffold(
      backgroundColor: const Color(0xFFf3e4e9),
      appBar: AppBar(
        title: const Text('Comprobante de Pedido',
            style:
                TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: const Color(0xFFb4788b),
        automaticallyImplyLeading: false,
      ),
      body: ticket == null
          ? const Center(
              child: Text('No hay ticket disponible',
                  style: TextStyle(color: Color(0xFF5a3d54), fontSize: 16)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Icon(Icons.check_circle,
                      color: Color(0xFFb4788b), size: 80),
                  const SizedBox(height: 10),
                  const Text('¡Pedido realizado con éxito!',
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFb4788b))),
                  const SizedBox(height: 5),
                  const Text('El pago se realiza contra entrega.',
                      style: TextStyle(color: Color(0xFF5a3d54)),
                      textAlign: TextAlign.center),
                  const SizedBox(height: 25),

                  // Ticket
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 10)
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('proyecto_movil',
                                style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFc45a77),
                                    fontStyle: FontStyle.italic)),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                  color: const Color(0xFFf3e4e9),
                                  borderRadius: BorderRadius.circular(10)),
                              child: Text('# ${ticket.numTicket}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFFb4788b))),
                            ),
                          ],
                        ),
                        const Divider(height: 25, color: Color(0xFFd4a9c2)),
                        const Text('Cliente',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFb4788b))),
                        const SizedBox(height: 8),
                        _Fila('Nombre', ticket.cliente),
                        _Fila('Correo', ticket.correo),
                        _Fila('Teléfono', ticket.telefono),
                        _Fila('Método de pago', ticket.metodoPago),
                        const Divider(height: 25, color: Color(0xFFd4a9c2)),
                        const Text('Detalles del pedido',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFb4788b))),
                        const SizedBox(height: 8),
                        _Fila('Pedido', '# ${ticket.idPedido}'),
                        _Fila('Fecha', ticket.fechaEmision),
                        _Fila('Estado', ticket.estado),
                        const Divider(height: 25, color: Color(0xFFd4a9c2)),
                        const Text('Productos',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFb4788b))),
                        const SizedBox(height: 8),
                        ...ticket.productos.map((p) => _FilaProducto(p)),
                        const Divider(height: 25, color: Color(0xFFd4a9c2)),
                        _FilaTotal('Subtotal', ticket.subtotal, negrita: false),
                        const SizedBox(height: 6),
                        _FilaTotal('Total', ticket.total, negrita: true),
                        if (ticket.nota.isNotEmpty) ...[
                          const Divider(height: 25, color: Color(0xFFd4a9c2)),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.note_outlined,
                                  color: Color(0xFFc45a77), size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    const Text('Nota del pedido',
                                        style: TextStyle(
                                            fontSize: 11,
                                            color: Color(0xFF5a3d54))),
                                    Text(ticket.nota,
                                        style: const TextStyle(
                                            fontSize: 13,
                                            color: Color(0xFF5a3d54))),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                              color: const Color(0xFFf3e4e9),
                              borderRadius: BorderRadius.circular(10)),
                          child: const Row(
                            children: [
                              Icon(Icons.local_shipping_outlined,
                                  color: Color(0xFFc45a77), size: 18),
                              SizedBox(width: 8),
                              Text('Pago contra entrega',
                                  style: TextStyle(
                                      color: Color(0xFF5a3d54),
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // ── Botón Descargar PDF (Mismo diseño elegante con borde)
                  DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFc45a77), width: 1.5),
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () => _descargarPdf(ticket),
                      icon: const Icon(Icons.picture_as_pdf_outlined,
                          color: Color(0xFFc45a77)),
                      label: const Text('Descargar PDF',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFc45a77))),
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

                  // ── Botón Volver al inicio (Mismo diseño con degradado y sombra)
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFc45a77), Color(0xFFb4788b)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFc45a77).withOpacity(0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () {
                        context.read<ComprobanteProvider>().limpiarTicket();
                        context.read<CarritoProvider>().vaciar();
                        Navigator.pushNamedAndRemoveUntil(
                            context, '/cliente', (route) => false);
                      },
                      icon: const Icon(Icons.home_rounded, color: Colors.white),
                      label: const Text('Volver al inicio',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
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
}

class _Fila extends StatelessWidget {
  final String label;
  final String valor;
  const _Fila(this.label, this.valor);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: Color(0xFF5a3d54), fontSize: 13)),
          Flexible(
            child: Text(valor,
                style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFb4788b),
                    fontSize: 13),
                textAlign: TextAlign.right),
          ),
        ],
      ),
    );
  }
}

class _FilaProducto extends StatelessWidget {
  final ProductoModel producto;
  const _FilaProducto(this.producto);

  @override
  Widget build(BuildContext context) {
    final imgUrl = producto.rutaImagen != null
        ? '${AppConstants.baseUrl}${producto.rutaImagen}'
        : null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
                color: const Color(0xFFf3e4e9),
                borderRadius: BorderRadius.circular(8)),
            child: imgUrl != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(imgUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(
                            Icons.shopping_bag_outlined,
                            color: Color(0xFFd4a9c2),
                            size: 20)),
                  )
                : const Icon(Icons.shopping_bag_outlined,
                    color: Color(0xFFd4a9c2), size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(producto.nomProducto,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF5a3d54))),
          ),
          Text(producto.precioFormateado,
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFb4788b))),
        ],
      ),
    );
  }
}

class _FilaTotal extends StatelessWidget {
  final String label;
  final double valor;
  final bool negrita;
  const _FilaTotal(this.label, this.valor, {required this.negrita});

  @override
  Widget build(BuildContext context) {
    final precio =
        '\$${valor.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(
                fontSize: negrita ? 16 : 13,
                fontWeight: negrita ? FontWeight.bold : FontWeight.normal,
                color: negrita
                    ? const Color(0xFFb4788b)
                    : const Color(0xFF5a3d54))),
        Text(precio,
            style: TextStyle(
                fontSize: negrita ? 18 : 13,
                fontWeight: negrita ? FontWeight.bold : FontWeight.normal,
                color: negrita
                    ? const Color(0xFFc45a77)
                    : const Color(0xFF5a3d54))),
      ],
    );
  }
}