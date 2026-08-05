import 'producto_model.dart';

class ComprobanteModel {
    final String numTicket;
    final int idPedido;
    final String fechaEmision;
    final String cliente;
    final String idUsuario;
    final String correo;
    final String telefono;
    final List<ProductoModel> productos;
    final double subtotal;
    final double total;
    final String metodoPago;
    final String estado;
    final String nota;

    ComprobanteModel({
        required this.numTicket,
        required this.idPedido,
        required this.fechaEmision,
        required this.cliente,
        required this.idUsuario,
        required this.correo,
        required this.telefono,
        required this.productos,
        required this.subtotal,
        required this.total,
        required this.metodoPago,
        required this.estado,
        required this.nota,
    });

    /// Construye el modelo combinando la respuesta del backend
    /// con los datos del usuario y los items del carrito
    /// que ya están en memoria en el provider.
    factory ComprobanteModel.fromBackend({
        required Map<String, dynamic> json,
        required String nombreCliente,
        required String idUsuario,
        required String correo,
        required String telefono,
        required List<ProductoModel> productos,
        required double subtotal,
        required double total,
        required String metodoPago,
    }) {
        // El backend devuelve { success, data: { id_pedido, num_ticket, ... } }
        final data = json['data'] is Map
            ? json['data'] as Map<String, dynamic>
            : json;

        return ComprobanteModel(
        numTicket:    (data['num_ticket'] ?? 0).toString(),
        idPedido:     (data['id_pedido']  ?? 0) as int,
        fechaEmision: DateTime.now().toLocal().toString().substring(0, 16),
        cliente:      nombreCliente,
        idUsuario:    idUsuario,
        correo:       correo,
        telefono:     telefono,
        productos:    productos,
        subtotal:     subtotal,
        total:        total,
        metodoPago:   metodoPago,
        estado:       'Pendiente',
        nota:         '',
        );
    }

    /// Mantener fromJson para compatibilidad si en algún momento
    /// el backend devuelve el objeto completo
    factory ComprobanteModel.fromJson(Map<String, dynamic> json) {
        return ComprobanteModel(
        numTicket:    (json['num_ticket']  ?? '').toString(),
        idPedido:     (json['id_pedido']   ?? 0) as int,
        fechaEmision: json['fecha_emision'] ?? '',
        cliente:      json['cliente']      ?? '',
        idUsuario:    json['id_usuario']   ?? '',
        correo:       json['correo']       ?? '',
        telefono:     json['telefono']?.toString() ?? '',
        productos: (json['productos'] as List<dynamic>? ?? [])
            .map((item) => ProductoModel.fromJson(item))
            .toList(),
        subtotal:   (json['subtotal']   ?? 0).toDouble(),
        total:      (json['total']      ?? 0).toDouble(),
        metodoPago: json['metodo_pago'] ?? '',
        estado:     json['estado']      ?? '',
        nota:       json['nota']        ?? '',
        );
    }
}