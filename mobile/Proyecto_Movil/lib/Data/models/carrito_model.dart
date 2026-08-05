import 'package:proyecto_movil/Data/models/producto_model.dart';

class CarritoItemModel {
    final ProductoModel producto;
    int cantidad;

    CarritoItemModel({required this.producto, this.cantidad = 1});

    double get subtotal => producto.precioUnitario * cantidad;

    String get subtotalFormateado => '\$${subtotal.toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
}