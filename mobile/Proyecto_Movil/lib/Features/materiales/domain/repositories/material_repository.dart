import 'dart:io';
import 'package:fpdart/fpdart.dart';
import '../../../../core/errors/failures.dart';
import '../../../../Data/models/material_model.dart';

/// Contrato del repositorio de materiales.
/// Toda operación retorna Either<Failure, T> — nunca lanza excepciones.
abstract class MaterialRepository {
  /// Obtiene el listado completo de materiales.
  Future<Either<Failure, List<MaterialModel>>> obtenerMateriales();

  /// Crea un material nuevo. No incluye la subida de imagen
  /// (ver [subirImagenMaterial]) para mantener responsabilidades separadas.
  Future<Either<Failure, MaterialModel>> crearMaterial(
    Map<String, dynamic> data,
  );

  /// Actualiza los datos de un material existente.
  Future<Either<Failure, void>> actualizarMaterial(
    int id,
    Map<String, dynamic> data,
  );

  /// Sube/reemplaza la imagen de un material ya creado.
  Future<Either<Failure, void>> subirImagenMaterial(
    int idMaterial,
    File imagen,
  );
}