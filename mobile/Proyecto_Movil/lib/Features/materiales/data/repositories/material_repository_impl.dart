import 'dart:convert';
import 'dart:io';
import 'package:fpdart/fpdart.dart';
import 'package:http/http.dart' as http;
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../../../core/utils/error_handler.dart';
import '../../../../Shared/constants/app_constants.dart';
import '../../../../Shared/services/api_service.dart';
import '../../../../Data/models/material_model.dart';
import '../../domain/repositories/material_repository.dart';

class MaterialRepositoryImpl implements MaterialRepository {
  final NetworkInfo networkInfo;

  MaterialRepositoryImpl({required this.networkInfo});

  @override
  Future<Either<Failure, List<MaterialModel>>> obtenerMateriales() async {
    final result = await safeCall<http.Response>(
      () => ApiService.get(AppConstants.obtenerMateriales),
      networkInfo: networkInfo,
    );

    return result.flatMap(
      (response) => _parseLista(response, errorFallback: 'Error al cargar materiales'),
    );
  }

  @override
  Future<Either<Failure, MaterialModel>> crearMaterial(
    Map<String, dynamic> data,
  ) async {
    final result = await safeCall<http.Response>(
      () => ApiService.post(AppConstants.crearMaterial, data),
      networkInfo: networkInfo,
    );

    return result.flatMap(
      (response) => _parseUnico(
        response,
        codigoExito: 201,
        errorFallback: 'Error al crear el material',
      ),
    );
  }

  @override
  Future<Either<Failure, void>> actualizarMaterial(
    int id,
    Map<String, dynamic> data,
  ) async {
    final url = '${AppConstants.actualizarMaterial}/$id';
    final result = await safeCall<http.Response>(
      () => ApiService.patch(url, data),
      networkInfo: networkInfo,
    );

    return result.flatMap((response) {
      if (response.statusCode == 200) return right(null);
      return left(ServerFailure(
        _extraerMensaje(response.body, 'Error al actualizar el material'),
      ));
    });
  }

  @override
  Future<Either<Failure, void>> subirImagenMaterial(
    int idMaterial,
    File imagen,
  ) async {
    final url = '${AppConstants.subirImagenMaterial}/$idMaterial/imagen';
    final result = await safeCall<http.StreamedResponse>(
      () => ApiService.postMultipart(url, imagen, fileField: 'imagen'),
      networkInfo: networkInfo,
    );

    return result.flatMap((response) {
      if (response.statusCode == 200 || response.statusCode == 201) {
        return right(null);
      }
      return left(const ServerFailure('Error al subir la imagen del material'));
    });
  }

  // ── Helpers privados de parseo ──────────────────────────────────────────

  Either<Failure, List<MaterialModel>> _parseLista(
    http.Response response, {
    required String errorFallback,
  }) {
    if (response.statusCode != 200) {
      return left(ServerFailure(_extraerMensaje(response.body, errorFallback)));
    }
    try {
      final List data = jsonDecode(response.body);
      return right(data.map((e) => MaterialModel.fromJson(e)).toList());
    } on FormatException {
      return left(const ServerFailure('Respuesta inválida del servidor'));
    }
  }

  Either<Failure, MaterialModel> _parseUnico(
    http.Response response, {
    required int codigoExito,
    required String errorFallback,
  }) {
    if (response.statusCode != codigoExito) {
      return left(ServerFailure(_extraerMensaje(response.body, errorFallback)));
    }
    try {
      return right(MaterialModel.fromJson(jsonDecode(response.body)));
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