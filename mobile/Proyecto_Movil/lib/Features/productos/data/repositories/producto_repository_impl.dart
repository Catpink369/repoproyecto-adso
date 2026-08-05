import 'dart:convert';
import 'package:fpdart/fpdart.dart';
import 'package:http/http.dart' as http;
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../../../core/utils/error_handler.dart';
import '../../../../Shared/constants/app_constants.dart';
import '../../../../Shared/services/api_service.dart';
import '../../../../Data/models/producto_model.dart';
import '../../domain/repositories/producto_repository.dart';

class ProductoRepositoryImpl implements ProductoRepository {
  final NetworkInfo networkInfo;

  ProductoRepositoryImpl({required this.networkInfo});

  @override
  Future<Either<Failure, List<ProductoModel>>> obtenerProductos() async {
    final result = await safeCall<http.Response>(
      () => ApiService.get(AppConstants.obtenerProductos),
      networkInfo: networkInfo,
    );

    return result.flatMap(_parseLista);
  }

  // ── Helpers privados de parseo ──────────────────────────────────────────

  Either<Failure, List<ProductoModel>> _parseLista(http.Response response) {
    if (response.statusCode != 200) {
      return left(ServerFailure(
        _extraerMensaje(response.body, 'Error al cargar productos'),
      ));
    }
    try {
      final List data = jsonDecode(response.body);
      return right(data.map((e) => ProductoModel.fromJson(e)).toList());
    } on FormatException {
      return left(const ServerFailure('Respuesta inválida del servidor'));
    }
  }

  String _extraerMensaje(String body, String fallback) {
    try {
      final data = jsonDecode(body);
      if (data is Map && data['message'] != null) {
        return data['message'] is List
            ? (data['message'] as List).join(', ')
            : data['message'].toString();
      }
    } catch (_) {
      // body no era JSON parseable — usamos el fallback
    }
    return fallback;
  }
}