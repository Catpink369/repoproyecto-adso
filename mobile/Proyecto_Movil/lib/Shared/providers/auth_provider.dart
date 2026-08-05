import 'package:flutter/material.dart';
import '../../Data/models/usuario_model.dart';
import '../constants/app_constants.dart';
import '../services/secure_storage_service.dart';
import '../../Shared/services/fcm_service.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  UsuarioModel? _usuario;

  String? get token => _token;
  UsuarioModel? get usuario => _usuario;
  bool get isLoggedIn => _token != null && _usuario != null;

  /// Carga token Y usuario al iniciar la app.
  /// Retorna true si había sesión guardada completa.
  Future<bool> loadTokenFromStorage() async {
    _token   = await SecureStorageService.getToken();
    final json = await SecureStorageService.getUsuario();

    if (_token != null && json != null) {
      _usuario = UsuarioModel.fromJson(json);
      notifyListeners();
      return true; // sesión completa
    }

    // Token sin usuario (inconsistencia) = limpiar
    await SecureStorageService.clearAll();
    _token   = null;
    _usuario = null;
    return false;
  }

  /// Guarda token en memoria y en almacenamiento seguro
  Future<void> setToken(String token) async {
    _token = token;
    await SecureStorageService.saveToken(token);
    notifyListeners();
  }

  /// Guarda usuario en memoria y en almacenamiento seguro
  void setUsuario(Map<String, dynamic> json) {
    _usuario = UsuarioModel.fromJson(json);
    SecureStorageService.saveUsuario(json); 
    notifyListeners();
  }

  /// Cierra sesión: borra todo
  Future<void> logout() async {
    await FcmService.desuscribirTodos(); 
    _token = null;
    _usuario = null;
    await SecureStorageService.clearAll();
    notifyListeners();
  }

  // Headers para peticiones POST
  Map<String, String> get postHeaders => {
    'Content-Type': 'application/json',
    'x-api-key': AppConstants.apiKey,
    if (_token != null) 'Authorization': 'Bearer $_token',
  };
  // Headers para peticiones GET (sin content-type)
  Map<String, String> get getHeaders => {
    'x-api-key': AppConstants.apiKey,
    if (_token != null) 'Authorization': 'Bearer $_token',
  };
}