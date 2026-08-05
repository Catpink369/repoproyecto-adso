import '../../Shared/constants/app_constants.dart';

class MaterialModel {
  final int idMaterial;
  final String nombre;
  final String tipo;
  final String unidad;
  final double precioUnitario;
  final int stockActual;
  final int stockMinimo;
  final String? rutaImagen;
  final bool estado;

  MaterialModel({
    required this.idMaterial,
    required this.nombre,
    required this.tipo,
    required this.unidad,
    required this.precioUnitario,
    required this.stockActual,
    required this.stockMinimo,
    this.rutaImagen,
    required this.estado,
  });

  String get imagenUrl => AppConstants.getImageUrl(rutaImagen);

  factory MaterialModel.fromJson(Map<String, dynamic> json) {
    return MaterialModel(
      idMaterial:     json['id_material'] ?? 0,
      nombre:         json['nombre'] ?? '',
      tipo:           json['tipo'] ?? '',
      unidad:         json['unidad'] ?? '',
      precioUnitario: (json['precio_unitario'] != null) ? double.parse(json['precio_unitario'].toString()) : 0.0,
      stockActual:    json['stock_actual'] ?? 0,
      stockMinimo:    json['stock_minimo'] ?? 5,
      rutaImagen:     json['ruta_imagen'],
      estado:         json['estado'] == true || json['estado'] == 1,
    );
  }

  Map<String, dynamic> toJson() => {
    'id_material':     idMaterial,
    'nombre':          nombre,
    'tipo':            tipo,
    'unidad':          unidad,
    'precio_unitario': precioUnitario,
    'stock_actual':    stockActual,
    'stock_minimo':    stockMinimo,
    'ruta_imagen':     rutaImagen,
    'estado':          estado,
  };
}
class ColorMaterialModel {
  final int idColor;
  final String nombre;
  final String? codigoHex;

  ColorMaterialModel({
    required this.idColor,
    required this.nombre,
    this.codigoHex,
  });

  factory ColorMaterialModel.fromJson(Map<String, dynamic> json) {
    return ColorMaterialModel(
      idColor:   json['id_color'] ?? 0,
      nombre:    json['nombre'] ?? '',
      codigoHex: json['codigo_hex'],
    );
  }
}

class DisenoMaterialModel {
  final int idDiseno;
  final String nombre;
  final String? rutaImagen;

  DisenoMaterialModel({
    required this.idDiseno,
    required this.nombre,
    this.rutaImagen,
  });

  factory DisenoMaterialModel.fromJson(Map<String, dynamic> json) {
    return DisenoMaterialModel(
      idDiseno:   json['id_diseno'] ?? 0,
      nombre:     json['nombre'] ?? '',
      rutaImagen: json['ruta_imagen'],
    );
  }
}