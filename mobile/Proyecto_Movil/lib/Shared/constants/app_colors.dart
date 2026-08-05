import 'package:flutter/material.dart';

/// Paleta de colores oficial de Gurama Online
class AppColors {
  AppColors._();

  // ── Primarios
  static const Color primario       = Color(0xFFC45A77); // rosa mauve principal
  static const Color primarioOscuro = Color(0xFF9B497D); // mauve profundo
  static const Color secundario     = Color(0xFFb4788b); // vino/ciruela
  static const Color acento         = Color(0xFFE8829B); // rosa claro acento
  static const Color suave          = Color(0xFFd4a9c2); // rosa claro

  // ── Fondos
  static const Color fondo          = Color(0xFFFAEDF4); // rosado muy suave
  static const Color fondoTarjeta   = Color(0xFFFFFFFF); // blanco puro
  static const Color fondoInput     = Color(0xFFFFF5F8); // blanco con toque rosado

  // ── Textos
  static const Color texto          = Color(0xFF5A3D54); // ciruela oscuro legible
  static const Color textoSecundario= Color(0xFF8A6A80); // gris rosado
  static const Color textoClaro     = Color(0xFFB099A8); // placeholder / hint

  // ── Neutros
  static const Color blanco         = Color(0xFFFFFFFF);
  static const Color negro          = Color(0xFF1A1A1A);
  static const Color grisClaro      = Color(0xFFF0E6EC);
  static const Color grisBorde      = Color(0xFFE0C8D6);

  // ── Estados
  static const Color exito          = Color(0xFF4CAF50);
  static const Color error          = Color(0xFFE53935);
  static const Color advertencia    = Color(0xFFFB8C00);

  // ── Sombra estándar de tarjeta
  static List<BoxShadow> get sombra => [
    BoxShadow(
      color: const Color(0xFF9B497D).withOpacity(0.12),
      blurRadius: 20,
      spreadRadius: 0,
      offset: const Offset(0, 6),
    ),
  ];

  // ── Gradiente del header / hero
  static const LinearGradient gradientePrimario = LinearGradient(
    colors: [Color(0xFFb4788b), Color(0xFFC45A77)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}