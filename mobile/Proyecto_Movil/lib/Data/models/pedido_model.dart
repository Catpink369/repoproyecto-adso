import 'usuario_model.dart';

class PedidoModel {
  final int idPedido;
  final DateTime fecha;
  final String estado;
  final String idUsuario;
  final String idTipo;
  final UsuarioModel? usuario;
  final List<DetallePedidoModel> detalles;
  final TicketCompraModel? ticketCompra;
  final List<PedidoPersonalizadoModel>? pedidoPersonalizado;

  PedidoModel({
    required this.idPedido,
    required this.fecha,
    required this.estado,
    required this.idUsuario,
    required this.idTipo,
    this.usuario,
    required this.detalles,
    this.ticketCompra,
    this.pedidoPersonalizado,
  });

  bool get esPersonalizado => idTipo == 'P_P';

  double get total {
    if (ticketCompra != null) return ticketCompra!.totalTicket;
    if (pedidoPersonalizado != null && pedidoPersonalizado!.isNotEmpty) {
      return pedidoPersonalizado!.fold(0, (sum, p) => sum + p.precioTotal);
    }
    return detalles.fold(0, (sum, d) => sum + (d.cantidad * d.precioUnitario));
  }

  factory PedidoModel.fromJson(Map<String, dynamic> json) {
    return PedidoModel(
      idPedido: json['id_pedido'] ?? 0,
      fecha:    json['fecha'] != null ? DateTime.parse(json['fecha']) : DateTime.now(),
      estado:   json['estado'] ?? '',
      idUsuario: json['id_usuario'] ?? '',
      idTipo:   json['id_tipo'] ?? '',
      usuario:  json['usuario'] != null ? UsuarioModel.fromJson(json['usuario']) : null,
      detalles: (json['detalles_pedido'] as List?)?.map((d) => DetallePedidoModel.fromJson(d)).toList() ?? [],
      ticketCompra: json['ticket_compra'] != null ? TicketCompraModel.fromJson(json['ticket_compra']) : null,
      pedidoPersonalizado: (json['pedido_personalizado'] as List?)?.map((p) => PedidoPersonalizadoModel.fromJson(p)).toList(),
    );
  }
}

class DetallePedidoModel {
  final int idDetalles;
  final String descripDetalles;
  final int cantidad;
  final int idProducto;
  final String? nomProducto;
  final double precioUnitario;

  DetallePedidoModel({
    required this.idDetalles,
    required this.descripDetalles,
    required this.cantidad,
    required this.idProducto,
    this.nomProducto,
    required this.precioUnitario,
  });

  factory DetallePedidoModel.fromJson(Map<String, dynamic> json) {
    return DetallePedidoModel(
      idDetalles:      json['id_detalles'] ?? 0,
      descripDetalles: json['descrip_detalles'] ?? '',
      cantidad:         json['cantidad'] ?? 0,
      idProducto:      json['id_producto'] ?? 0,
      nomProducto:     json['producto']?['nom_producto'],
      precioUnitario:  (json['producto']?['precio_unitario'] != null) ? double.parse(json['producto']['precio_unitario'].toString()) : 0.0,
    );
  }
}

class TicketCompraModel {
  final int idTicketC;
  final int numTicket;
  final DateTime fechaEmision;
  final double subTotal;
  final double totalTicket;
  final String? nomMetodoPago;
  final String? nomEstadoPago;

  TicketCompraModel({
    required this.idTicketC,
    required this.numTicket,
    required this.fechaEmision,
    required this.subTotal,
    required this.totalTicket,
    this.nomMetodoPago,
    this.nomEstadoPago,
  });

  factory TicketCompraModel.fromJson(Map<String, dynamic> json) {
    return TicketCompraModel(
      idTicketC:    json['id_ticket_c'] ?? 0,
      numTicket:    json['num_ticket'] ?? 0,
      fechaEmision: json['fecha_emision'] != null ? DateTime.parse(json['fecha_emision']) : DateTime.now(),
      subTotal:     (json['sub_total'] != null) ? double.parse(json['sub_total'].toString()) : 0.0,
      totalTicket:  (json['total_ticket'] != null) ? double.parse(json['total_ticket'].toString()) : 0.0,
      nomMetodoPago: json['metodo_pago']?['nom_metodo'],
      nomEstadoPago: json['estado_pago']?['nom_metodo'],
    );
  }
}

class PedidoPersonalizadoModel {
  final int idPedPersonal;
  final String tipoProducto;
  final String tamanio;
  final double precioTotal;

  PedidoPersonalizadoModel({
    required this.idPedPersonal,
    required this.tipoProducto,
    required this.tamanio,
    required this.precioTotal,
  });

  factory PedidoPersonalizadoModel.fromJson(Map<String, dynamic> json) {
    return PedidoPersonalizadoModel(
      idPedPersonal: json['id_ped_personal'] ?? 0,
      tipoProducto:  json['tipo_producto'] ?? '',
      tamanio:       json['tamanio'] ?? '',
      precioTotal:   (json['precio_total'] != null) ? double.parse(json['precio_total'].toString()) : 0.0,
    );
  }
}
