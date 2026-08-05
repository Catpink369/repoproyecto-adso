import 'package:fpdart/fpdart.dart';
import '../../../../core/errors/failures.dart';
import '../../../../Data/models/producto_model.dart';

/// Contrato del repositorio de productos.
/// Toda operación retorna Either<Failure, T> — nunca lanza excepciones.
abstract class ProductoRepository {
  /// Obtiene el listado completo de productos.
  Future<Either<Failure, List<ProductoModel>>> obtenerProductos();
}