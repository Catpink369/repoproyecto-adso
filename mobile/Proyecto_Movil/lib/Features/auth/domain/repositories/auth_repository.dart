import 'package:fpdart/fpdart.dart';
import '../../../../core/errors/failures.dart';

/// Contrato del repositorio de autenticación.
/// Toda operación retorna Either<Failure, T> — nunca lanza excepciones.
abstract class AuthRepository {
  /// Realiza el login y retorna los datos del usuario o un Failure.
  Future<Either<Failure, Map<String, dynamic>>> login({
    required String correo,
    required String contrasena,
  });

  /// Verifica el código de administrador enviado por correo.
  /// Retorna los datos del usuario (token + user) o un Failure.
  Future<Either<Failure, Map<String, dynamic>>> verifyCode({
    required String idUsuario,
    required String codigo,
  });
}