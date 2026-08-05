import 'package:flutter/painting.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CacheService {
  static const String _lastClearKey = 'last_cache_clear';
  static const int _diasLimite = 7;

  /// Llama esto en main.dart al iniciar la app.
  /// Limpia automáticamente la caché de disco + RAM cada [_diasLimite] días.
  static Future<void> limpiarCacheSiEsNecesario() async {
    final prefs = await SharedPreferences.getInstance();
    final lastClear = prefs.getInt(_lastClearKey);
    final ahora = DateTime.now().millisecondsSinceEpoch;

    if (lastClear == null) {
      await prefs.setInt(_lastClearKey, ahora);
      return;
    }

    final diasTranscurridos = (ahora - lastClear) / (1000 * 60 * 60 * 24);

    if (diasTranscurridos >= _diasLimite) {
      await _limpiarTodo(prefs, ahora);
    }
  }

  /// Limpia manualmente toda la caché de disco y RAM.
  static Future<void> limpiarCacheManual() async {
    final prefs = await SharedPreferences.getInstance();
    await _limpiarTodo(prefs, DateTime.now().millisecondsSinceEpoch);
  }

  // ─── Privado ────────────────────────────────────────────────
  static Future<void> _limpiarTodo(SharedPreferences prefs, int timestamp) async {
    // 1. Caché de DISCO — borra los archivos físicos de todas las imágenes
    await DefaultCacheManager().emptyCache();

    // 2. Caché de RAM — borra las imágenes en memoria
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();

    // 3. Guardar la fecha del último borrado
    await prefs.setInt(_lastClearKey, timestamp);
  }
}