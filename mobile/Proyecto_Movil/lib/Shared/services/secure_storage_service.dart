import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
// Servicio para manejar almacenamiento seguro de token y usuario
class SecureStorageService {
    static const _storage = FlutterSecureStorage(
        aOptions: AndroidOptions(encryptedSharedPreferences: true),
    );
    // Claves para almacenamiento seguro
    static const _keyToken   = 'auth_token';
    static const _keyUsuario = 'auth_usuario'; 

    // ── Token
    static Future<void> saveToken(String token) =>
        _storage.write(key: _keyToken, value: token);

    static Future<String?> getToken() =>
        _storage.read(key: _keyToken);

    static Future<void> deleteToken() =>
        _storage.delete(key: _keyToken);

    // ── Usuario (guardado como JSON)
    static Future<void> saveUsuario(Map<String, dynamic> json) =>
        _storage.write(key: _keyUsuario, value: jsonEncode(json));

    static Future<Map<String, dynamic>?> getUsuario() async {
        final raw = await _storage.read(key: _keyUsuario);
        if (raw == null) return null;
        return jsonDecode(raw) as Map<String, dynamic>;
    }
    static Future<void> deleteUsuario() =>
        _storage.delete(key: _keyUsuario);

    // ── Limpiar todo (logout)
    static Future<void> clearAll() => _storage.deleteAll();
}