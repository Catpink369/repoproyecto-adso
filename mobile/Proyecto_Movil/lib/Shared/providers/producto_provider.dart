import 'package:flutter/material.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import '../../core/errors/failures.dart';
import '../../core/network/network_info.dart';
import '../../Features/productos/data/repositories/producto_repository_impl.dart';
import '../../Features/productos/domain/repositories/producto_repository.dart';
import '../../Data/models/producto_model.dart';

class ProductoProvider extends ChangeNotifier {
  final ProductoRepository _repository; 

  ProductoProvider({ProductoRepository? repository})
      : _repository = repository ??
            ProductoRepositoryImpl(
              networkInfo: NetworkInfoImpl(InternetConnection()),
            );

  List<ProductoModel> _productos = [];
  bool _cargando = false;
  Failure? _error;

  List<ProductoModel> get productos => _productos;
  bool get cargando => _cargando;

  /// Mensaje de error listo para mostrar en UI.
  /// Se mantiene como String? para no romper los widgets existentes
  /// que ya consumen `provider.error`.
  String? get error => _error?.message;

  Future<void> cargarProductos() async {
    _cargando = true;
    _error = null;
    notifyListeners();

    final result = await _repository.obtenerProductos();

    result.match(
      (failure) => _error = failure,
      (lista) => _productos = lista,
    );

    _cargando = false;
    notifyListeners();
  }

  // ── Estos dos métodos no hacen red, así que se quedan igual:
  // son estado local puro, no le corresponden al repositorio.

  void agregarProducto(Map<String, dynamic> json) {
    _productos.insert(0, ProductoModel.fromJson(json));
    notifyListeners();
  }

  void limpiarError() {
    _error = null;
    notifyListeners();
  }
}