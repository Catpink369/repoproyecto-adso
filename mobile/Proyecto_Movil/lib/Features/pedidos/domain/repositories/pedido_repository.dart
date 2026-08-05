import 'package:fpdart/fpdart.dart';
import '../../../../core/errors/failures.dart';
import '../../../../Data/models/pedido_model.dart';

/// Contrato del repositorio de pedidos.
/// Toda operación retorna Either<Failure, T> — nunca lanza excepciones.
/// No contiene reglas de negocio: cada método es una operación atómica
/// de acceso a datos. La orquestación (ej. "actualizar pago y luego
/// registrar movimientos de inventario") vive en el provider.
abstract class PedidoRepository {
  /// Obtiene el listado completo de pedidos.
  Future<Either<Failure, List<PedidoModel>>> obtenerPedidos();

  /// Obtiene el detalle de un pedido puntual.
  Future<Either<Failure, PedidoModel>> obtenerDetalle(int idPedido);

  /// Actualiza campos puntuales de un pedido (estado, método de pago, etc).
  Future<Either<Failure, void>> actualizarPedido(
    int idPedido,
    Map<String, dynamic> data,
  );

  /// Registra un movimiento de inventario (ej. salida por venta).
  Future<Either<Failure, void>> crearMovimiento(Map<String, dynamic> data);
}