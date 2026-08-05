import 'package:flutter/material.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import '../../core/errors/failures.dart';
import '../../core/network/network_info.dart';
import '../../Features/pedidos/data/repositories/pedido_repository_impl.dart';
import '../../Features/pedidos/domain/repositories/pedido_repository.dart';
import '../../Data/models/pedido_model.dart';

class PedidoProvider extends ChangeNotifier {
  final PedidoRepository _repository;

  PedidoProvider({PedidoRepository? repository})
      : _repository = repository ??
            PedidoRepositoryImpl(
              networkInfo: NetworkInfoImpl(InternetConnection()),
            );

  List<PedidoModel> _pedidos = [];
  bool _cargando = false;
  Failure? _error;

  List<PedidoModel> get pedidos => _pedidos;
  bool get cargando => _cargando;

  /// Mensaje de error listo para mostrar en UI.
  /// Se mantiene como String? para no romper los widgets existentes
  /// que ya consumen `provider.error`.
  String? get error => _error?.message;

  Future<void> cargarPedidos() async {
    _cargando = true;
    _error = null;
    notifyListeners();

    final result = await _repository.obtenerPedidos();

    result.match(
      (failure) => _error = failure,
      (lista) => _pedidos = lista,
    );

    _cargando = false;
    notifyListeners();
  }

  Future<PedidoModel?> obtenerDetalle(int idPedido) async {
    final result = await _repository.obtenerDetalle(idPedido);

    return result.match(
      (failure) => null,
      (pedido) => pedido,
    );
  }

  Future<bool> actualizarEstado(int idPedido, String nuevoEstado) async {
    final result = await _repository.actualizarPedido(
      idPedido,
      {'estado': nuevoEstado},
    );

    final exito = await result.match(
      (failure) async {
        _error = failure;
        notifyListeners();
        return false;
      },
      (_) async {
        await cargarPedidos();
        return true;
      },
    );

    return exito;
  }

  Future<bool> actualizarMetodoPago(
    PedidoModel pedido,
    String nuevoMetodo,
    String userId,
  ) async {
    final result = await _repository.actualizarPedido(
      pedido.idPedido,
      {'metodo_pago': nuevoMetodo},
    );

    final exito = await result.match(
      (failure) async {
        _error = failure;
        notifyListeners();
        return false;
      },
      (_) async {
        // Regla de negocio: si el método ya no es "por definir" y el
        // pedido NO es personalizado, registramos salidas de inventario
        // por cada item del pedido. Esto vive aquí (provider), no en
        // el repositorio, porque es lógica de negocio, no acceso a datos.
        if (nuevoMetodo != 'Por_definir' && !pedido.esPersonalizado) {
          await _registrarSalidasInventario(pedido, nuevoMetodo, userId);
        }
        await cargarPedidos();
        return true;
      },
    );

    return exito;
  }

  /// Registra una salida de inventario por cada item del pedido.
  /// Si algún movimiento falla, se ignora silencioso (mismo
  /// comportamiento que la versión anterior) para no bloquear el
  /// flujo de pago ya confirmado.
  Future<void> _registrarSalidasInventario(
    PedidoModel pedido,
    String nuevoMetodo,
    String userId,
  ) async {
    final detalleResult = await _repository.obtenerDetalle(pedido.idPedido);

    final detalleCompleto = detalleResult.match(
      (failure) => null,
      (detalle) => detalle,
    );

    if (detalleCompleto == null) return;

    for (final item in detalleCompleto.detalles) {
      await _repository.crearMovimiento({
        'Cantidad_m': item.cantidad,
        'observaciones':
            'PEDIDO #${pedido.idPedido} - Pago registrado ($nuevoMetodo)',
        'id_m': 'M_S',
        'id_producto': item.idProducto,
        'id_usuario': userId,
      });
    }
  }
}