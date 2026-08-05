class ProductoModel {
  final int idProducto;
  final String nomProducto;
  final double precioUnitario;
  final int stockActual;
  final int stockMinimo;
  final String? descripcion;
  final String? rutaImagen;
  final bool estado;
  final int idCategoria;
  final int? idClasificacion;
  final String? color;
  final String? talla;
  final String? tamano;
  final String? ultimaActualiz;

  final String? nombreClas;

  final String? nombreCategoriaJson;

  String get precioFormateado => '\$${precioUnitario.toStringAsFixed(2)}';

  bool get disponible => estado && stockActual > 0;

  String? get nombreCategoria => nombreCategoriaJson;
  String? get nombreClasificacion => nombreClas;

  String? get tamanio => tamano;

  ProductoModel({
    required this.idProducto,
    required this.nomProducto,
    required this.precioUnitario,
    required this.stockActual,
    required this.stockMinimo,
    this.descripcion,
    this.rutaImagen,
    required this.estado,
    required this.idCategoria,
    this.idClasificacion,
    this.color,
    this.talla,
    this.tamano,
    this.ultimaActualiz,
    this.nombreClas,
    this.nombreCategoriaJson,
  });

  factory ProductoModel.fromJson(Map<String, dynamic> json) {
    return ProductoModel(
      idProducto:      json['id_producto'] ?? 0,
      nomProducto:     json['nom_producto'] ?? '',
      precioUnitario:  double.tryParse('${json['precio_unitario']}') ?? 0.0,
      stockActual:     json['stock_actual'] ?? 0,
      stockMinimo:     json['stock_minimo'] ?? 0,
      descripcion:     json['descripcion'],
      rutaImagen:      json['ruta_imagen'],
      estado:          json['estado'] == true || json['estado'] == 'true' || json['estado'] == 1,
      idCategoria:     json['id_categoria'] ?? 0,
      idClasificacion: json['id_clasificacion'],
      color:           json['color'],
      talla:           json['talla'],
      tamano:          json['tamaño'],
      ultimaActualiz:  json['ultima_actualiz'],
      nombreClas:          json['nombre_clas'],
      nombreCategoriaJson: json['nombre_c'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id_producto':      idProducto,
    'nom_producto':     nomProducto,
    'precio_unitario':  precioUnitario,
    'stock_actual':     stockActual,
    'stock_minimo':     stockMinimo,
    'descripcion':      descripcion,
    'ruta_imagen':      rutaImagen,
    'estado':           estado,
    'id_categoria':     idCategoria,
    'id_clasificacion': idClasificacion,
    'color':            color,
    'talla':            talla,
    'tamaño':           tamano,
    'nombre_clas':      nombreClas,
    'nombre_c':         nombreCategoriaJson,
  };
}