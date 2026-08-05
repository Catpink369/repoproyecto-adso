import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../Data/models/carrito_model.dart';
import '../../Data/models/comprobante_model.dart';
import '../../Data/models/usuario_model.dart';
import '../constants/app_constants.dart';
import '../services/api_service.dart';

class ComprobanteProvider extends ChangeNotifier {
    ComprobanteModel? _ticket;
    String? _error;
    bool _cargando = false;

    ComprobanteModel? get ticket => _ticket;
    String? get error => _error;
    bool get cargando => _cargando;

    // ── Construye el body del pedido a partir del carrito.
    // Separado de la llamada HTTP para cumplir SRP: esta función
    // solo conoce de cálculo, no de red.
    Map<String, dynamic> _construirBodyPedido({
        required List<CarritoItemModel> items,
        required UsuarioModel usuario,
        required String metodoPago,
    }) {
        final double subtotal = items.fold(
            0,
            (s, i) => s + (i.producto.precioUnitario * i.cantidad),
        );

        final itemsBody = items
            .map((item) => {
                    'id_producto': item.producto.idProducto,
                    'cantidad': item.cantidad,
                    'precio': item.producto.precioUnitario,
                })
            .toList();

        return {
            'id_usuario': usuario.idUsuario,
            'metodo_pago': metodoPago,
            'items': itemsBody,
            'subtotal': subtotal,
            'total': subtotal,
        };
    }

    Future<bool> crearTicket({
        required List<CarritoItemModel> items,
        required UsuarioModel usuario,
        required String metodoPago,
        required String token,
        String nota = '',
    }) async {
        _cargando = true;
        _error = null;
        notifyListeners();

        final double subtotal = items.fold(
            0,
            (s, i) => s + (i.producto.precioUnitario * i.cantidad),
        );

        final body = _construirBodyPedido(
            items: items,
            usuario: usuario,
            metodoPago: metodoPago,
        );

        try {
            // Headers (x-api-key, Content-Type, Authorization) ya
            // los maneja ApiService internamente — no se repiten aquí.
            final response = await ApiService.post(AppConstants.crearPedido, body);

            _cargando = false;

            if (response.statusCode == 200 || response.statusCode == 201) {
                final responseData =
                    jsonDecode(response.body) as Map<String, dynamic>;

                _ticket = ComprobanteModel.fromBackend(
                    json: responseData,
                    nombreCliente: '${usuario.nom1} ${usuario.ape1}'.trim(),
                    idUsuario: usuario.idUsuario,
                    correo: usuario.correo,
                    telefono: usuario.telefono ?? '',
                    productos: items.map((i) => i.producto).toList(),
                    subtotal: subtotal,
                    total: subtotal,
                    metodoPago: metodoPago,
                );

                notifyListeners();
                return true;
            } else {
                final data = jsonDecode(response.body);
                _error = data['message'] is List
                    ? (data['message'] as List).join(', ')
                    : data['message']?.toString() ?? 'Error al crear el pedido';
                notifyListeners();
                return false;
            }
        } catch (e) {
            _cargando = false;
            _error = 'Error de conexión: $e';
            notifyListeners();
            return false;
        }
    }

    void limpiarTicket() {
        _ticket = null;
        _error = null;
        notifyListeners();
    }

    Future<void> copiarAlPortapapeles() async {
        if (_ticket == null) return;
        String fmt(double v) => '\$${v.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';

        final texto = '''
    GURAMA ONLINE - Comprobante de Pedido
    =====================================
    Ticket: #${_ticket!.numTicket}
    Pedido: #${_ticket!.idPedido}
    Fecha:  ${_ticket!.fechaEmision}

    CLIENTE
    -------
    Nombre:   ${_ticket!.cliente}
    Correo:   ${_ticket!.correo}
    Teléfono: ${_ticket!.telefono}

    PRODUCTOS
    ---------
    ${_ticket!.productos.map((p) => '${p.nomProducto} - ${p.precioFormateado}').join('\n')}

    SUBTOTAL: ${fmt(_ticket!.subtotal)}
    TOTAL:    ${fmt(_ticket!.total)}

    Método de pago: ${_ticket!.metodoPago}
    Estado:         ${_ticket!.estado}
    =====================================
    ''';
        await Clipboard.setData(ClipboardData(text: texto));
    }
}