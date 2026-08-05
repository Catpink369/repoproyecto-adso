import 'dart:io';
import 'package:flutter/material.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import '../../core/errors/failures.dart';
import '../../core/network/network_info.dart';
import '../../Features/materiales/data/repositories/material_repository_impl.dart';
import '../../Features/materiales/domain/repositories/material_repository.dart';
import '../../Data/models/material_model.dart';

class MaterialProvider extends ChangeNotifier {
  final MaterialRepository _repository;

  MaterialProvider({MaterialRepository? repository})
      : _repository = repository ??
            MaterialRepositoryImpl(
              networkInfo: NetworkInfoImpl(InternetConnection()),
            );

  List<MaterialModel> _materiales = [];
  bool _cargando = false;
  Failure? _error;

  List<MaterialModel> get materiales => _materiales;
  bool get cargando => _cargando;

  /// Mensaje de error listo para mostrar en UI.
  /// Se mantiene como String? para no romper los widgets existentes
  /// que ya consumen `provider.error`.
  String? get error => _error?.message;

  Future<void> cargarMateriales() async {
    _cargando = true;
    _error = null;
    notifyListeners();

    final result = await _repository.obtenerMateriales();

    result.match(
      (failure) => _error = failure,
      (lista) => _materiales = lista,
    );

    _cargando = false;
    notifyListeners();
  }

  Future<bool> crearMaterial(Map<String, dynamic> data, File? imagen) async {
    _cargando = true;
    _error = null;
    notifyListeners();

    final result = await _repository.crearMaterial(data);

    final exito = await result.match(
      (failure) async {
        _error = failure;
        return false;
      },
      (nuevoMaterial) async {
        if (imagen != null) {
          // No bloqueamos la creación si la imagen falla; el material
          // ya existe. El error de imagen se ignora silenciosamente
          // por ahora (mismo comportamiento que la versión anterior).
          await _repository.subirImagenMaterial(nuevoMaterial.idMaterial, imagen);
        }
        await cargarMateriales();
        return true;
      },
    );

    _cargando = false;
    notifyListeners();
    return exito;
  }

  Future<bool> actualizarMaterial(
    int id,
    Map<String, dynamic> data,
    File? imagen,
  ) async {
    _cargando = true;
    _error = null;
    notifyListeners();

    final result = await _repository.actualizarMaterial(id, data);

    final exito = await result.match(
      (failure) async {
        _error = failure;
        return false;
      },
      (_) async {
        if (imagen != null) {
          await _repository.subirImagenMaterial(id, imagen);
        }
        await cargarMateriales();
        return true;
      },
    );

    _cargando = false;
    notifyListeners();
    return exito;
  }
}