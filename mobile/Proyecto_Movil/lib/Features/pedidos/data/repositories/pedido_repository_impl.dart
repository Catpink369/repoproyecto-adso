import 'dart:convert';
import 'package:fpdart/fpdart.dart';
import 'package:http/http.dart' as http;
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../../../core/utils/error_handler.dart';
import '../../../../Shared/constants/app_constants.dart';
import '../../../../Shared/services/api_service.dart';
import '../../../../Data/models/pedido_model.dart';
import '../../domain/repositories/pedido_repository.dart';

class PedidoRepositoryImpl implements PedidoRepository {
  final NetworkInfo networkInfo;

  PedidoRepositoryImpl({required this.networkInfo});

  @override
  Future<Either<Failure, List<PedidoModel>>> obtenerPedidos() async {
    final result = await safeCall<http.Response>(
      () => ApiService.get(AppConstants.obtenerPedidos),
      networkInfo: networkInfo,
    );

    return result.flatMap(
      (response) => _parseLista(response, errorFallback: 'Error al cargar pedidos'),
    );
  }

  @override
  Future<Either<Failure, PedidoModel>> obtenerDetalle(int idPedido) async {
    final url = '${AppConstants.detallePedido}/$idPedido';
    final result = await safeCall<http.Response>(
      () => ApiService.get(url),
      networkInfo: networkInfo,
    );

    return result.flatMap(
      (response) => _parseUnico(response, errorFallback: 'Error al obtener el detalle del pedido'),
    );
  }

  @override
  Future<Either<Failure, void>> actualizarPedido(
    int idPedido,
    Map<String, dynamic> data,
  ) async {
    final url = '${AppConstants.actualizarPedido}/$idPedido';
    final result = await safeCall<http.Response>(
      () => ApiService.patch(url, data),
      networkInfo: networkInfo,
    );

    return result.flatMap((response) {
      if (response.statusCode == 200) return right(null);
      return left(ServerFailure(
        _extraerMensaje(response.body, 'Error al actualizar el pedido'),
      ));
    });
  }

  @override
  Future<Either<Failure, void>> crearMovimiento(Map<String, dynamic> data) async {
    final result = await safeCall<http.Response>(
      () => ApiService.post(AppConstants.crearMovimiento, data),
      networkInfo: networkInfo,
    );

    return result.flatMap((response) {
      if (response.statusCode == 200 || response.statusCode == 201) {
        return right(null);
      }
      return left(ServerFailure(
        _extraerMensaje(response.body, 'Error al registrar el movimiento'),
      ));
    });
  }

  // ── Helpers privados de parseo ──────────────────────────────────────────

  Either<Failure, List<PedidoModel>> _parseLista(
    http.Response response, {
    required String errorFallback,
  }) {
    if (response.statusCode != 200) {
      return left(ServerFailure(_extraerMensaje(response.body, errorFallback)));
    }
    try {
      final List data = jsonDecode(response.body);
      return right(data.map((e) => PedidoModel.fromJson(e)).toList());
    } on FormatException {
      return left(const ServerFailure('Respuesta inválida del servidor'));
    }
  }

  Either<Failure, PedidoModel> _parseUnico(
    http.Response response, {
    required String errorFallback,
  }) {
    if (response.statusCode != 200) {
      return left(ServerFailure(_extraerMensaje(response.body, errorFallback)));
    }
    try {
      return right(PedidoModel.fromJson(jsonDecode(response.body)));
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