import 'package:flutter/material.dart';

enum SnackBarType { success, error, warning, info }

/// Helper para mostrar SnackBars flotantes y elegantes en toda la app.
///
/// Uso rápido:
/// ```dart
/// AppSnackBar.error(context, 'Sin conexión a internet');
/// AppSnackBar.success(context, '¡Bienvenido!');
/// AppSnackBar.warning(context, 'Campos incompletos');
/// AppSnackBar.info(context, 'Cargando datos...');
/// ```
class AppSnackBar {
  AppSnackBar._();

  static void show(
    BuildContext context, {
    required String message,
    SnackBarType type = SnackBarType.info,
    Duration duration = const Duration(seconds: 3),
  }) {
    if (!context.mounted) return;
    final cfg = _SnackConfig._from(type);

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: cfg.color,
          duration: duration,
          content: Row(
            children: [
              Icon(cfg.icon, color: Colors.white, size: 22),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }

  /// ✅ Operación exitosa
  static void success(BuildContext context, String message) =>
      show(context, message: message, type: SnackBarType.success);

  /// ❌ Error (servidor, conexión, validación)
  static void error(BuildContext context, String message) =>
      show(context, message: message, type: SnackBarType.error);

  /// ⚠️ Advertencia
  static void warning(BuildContext context, String message) =>
      show(context, message: message, type: SnackBarType.warning);

  /// ℹ️ Información general
  static void info(BuildContext context, String message) =>
      show(context, message: message, type: SnackBarType.info);
}

class _SnackConfig {
  final Color color;
  final IconData icon;
  const _SnackConfig(this.color, this.icon);

  static _SnackConfig _from(SnackBarType type) {
    switch (type) {
      case SnackBarType.success:
        return const _SnackConfig(Color(0xFF2E7D32), Icons.check_circle_outline_rounded);
      case SnackBarType.error:
        return const _SnackConfig(Color(0xFFC62828), Icons.error_outline_rounded);
      case SnackBarType.warning:
        return const _SnackConfig(Color(0xFFE65100), Icons.warning_amber_rounded);
      case SnackBarType.info:
        return const _SnackConfig(Color(0xFF1565C0), Icons.info_outline_rounded);
    }
  }
}
