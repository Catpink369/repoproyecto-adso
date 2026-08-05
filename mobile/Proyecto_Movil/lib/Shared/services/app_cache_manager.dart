import 'package:flutter_cache_manager/flutter_cache_manager.dart';

/// CacheManager personalizado para CachedNetworkImage.
///
/// Configura:
/// - Máximo 150 imágenes en disco
/// - Las imágenes se consideran "viejas" y reemplazables a los 7 días
///
/// Uso en CachedNetworkImage:
/// ```dart
/// CachedNetworkImage(
///   imageUrl: url,
///   cacheManager: AppCacheManager.instance,
/// )
/// ```
class AppCacheManager {
  static const String _key = 'gurama_image_cache';

  static final CacheManager instance = CacheManager(
    Config(
      _key,
      // Tiempo máximo antes de que una imagen sea elegible para reemplazarse
      stalePeriod: const Duration(days: 7),
      // Límite de imágenes almacenadas en disco (~150 imágenes)
      maxNrOfCacheObjects: 150,
      // Repositorio de archivos en disco (default — no necesitas cambiarlo)
      repo: JsonCacheInfoRepository(databaseName: _key),
      fileService: HttpFileService(),
    ),
  );
}
