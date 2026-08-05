import 'dart:io';
import 'dart:async';
import 'package:fpdart/fpdart.dart';
import '../errors/failures.dart';
import '../network/network_info.dart';

/// Envuelve CUALQUIER llamada async y la convierte en [Either<Failure, T>].
///
/// Orden de captura:
///   Sin internet                  → [ConnectionFailure]
///    [SocketException]             → [ConnectionFailure]
///   3. [TimeoutException]            → [ConnectionFailure]
///   4. [FormatException]             → [ServerFailure] (JSON inválido)
///   5. [HttpException]               → [ServerFailure]
///   6. Cualquier otra [Exception]    → [ServerFailure]
///   7. Cualquier [Error] de Dart     → [ServerFailure]

Future<Either<Failure, T>> safeCall<T>(
  Future<T> Function() call, {
  NetworkInfo? networkInfo,
}) async {
  // 1. Verificar conectividad antes de intentar la llamada
  if (networkInfo != null && !await networkInfo.isConnected) {
    return left(const ConnectionFailure('Sin conexión a internet'));
  }

  try {
    final result = await call();
    return right(result);
  } on SocketException {
    return left(const ConnectionFailure('Sin conexión a internet'));
  } on TimeoutException {
    return left(const ConnectionFailure(
      'La solicitud tardó demasiado. Verifica tu conexión.',
    ));
  } on FormatException catch (e) {
    return left(ServerFailure(
      'Respuesta inválida del servidor: ${e.message}',
    ));
  } on HttpException catch (e) {
    return left(ServerFailure('Error de red: ${e.message}'));
  } on Exception catch (e) {
    return left(ServerFailure('Error inesperado: ${e.toString()}'));
  } catch (e) {
    // Captura incluso Errors de Dart (nunca se muestra pantalla roja)
    return left(ServerFailure('Error crítico: ${e.toString()}'));
  }
}
