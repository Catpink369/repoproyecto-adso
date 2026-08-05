import 'dart:convert';
import 'package:fpdart/fpdart.dart';
import 'package:http/http.dart' as http;
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../../../core/utils/error_handler.dart';
import '../../../../Shared/constants/app_constants.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final NetworkInfo networkInfo;

  AuthRepositoryImpl({required this.networkInfo});

  // ── Headers compartidos para todas las llamadas de auth ──────────────────
  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'x-api-key': AppConstants.apiKey,
      };

  @override
  Future<Either<Failure, Map<String, dynamic>>> login({
    required String correo,
    required String contrasena,
  }) async {
    final result = await safeCall<http.Response>(
      () => http
          .post(
            Uri.parse(AppConstants.login),
            headers: _headers,
            body: jsonEncode({
              'correo': correo,
              'contrasena': contrasena,
            }),
          )
          .timeout(const Duration(seconds: 15)),
      networkInfo: networkInfo,
    );

    return result.flatMap((response) => _parseResponse(response));
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> verifyCode({
    required String idUsuario,
    required String codigo,
  }) async {
    final result = await safeCall<http.Response>(
      () => http
          .post(
            Uri.parse(AppConstants.verifyCode),
            headers: _headers,
            body: jsonEncode({
              'id_usuario': idUsuario,
              'codigo': codigo,
            }),
          )
          .timeout(const Duration(seconds: 15)),
      networkInfo: networkInfo,
    );

    return result.flatMap((response) => _parseResponse(
          response,
          errorFallback: 'Código incorrecto. Inténtalo de nuevo.',
        ));
  }

  // ── Helper privado: parsea la respuesta HTTP en Either ───────────────────
  Either<Failure, Map<String, dynamic>> _parseResponse(
    http.Response response, {
    String errorFallback = 'Correo o contraseña incorrectos',
  }) {
    try {
      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 || response.statusCode == 201) {
        return right(data);
      }

      final msg = data['message']?.toString() ?? errorFallback;
      return left(ServerFailure(msg));
    } on FormatException {
      return left(const ServerFailure('Respuesta inválida del servidor'));
    }
  }
}