/// Helper interno: convierte cualquier valor numérico (int, double o String)
/// a int de forma segura.
int _parseInt(dynamic v) => v is int ? v : int.tryParse(v?.toString() ?? '0') ?? 0;

// ─────────────────────────────────────────────────────────────
// ResumenGeneralModel  →  GET /movimientos/resumen-general
// ─────────────────────────────────────────────────────────────
class ResumenGeneralModel {
  final int totalEntradas;
  final int totalSalidas;
  final int balanceNeto;

  ResumenGeneralModel({
    required this.totalEntradas,
    required this.totalSalidas,
    required this.balanceNeto,
  });

  factory ResumenGeneralModel.fromJson(Map<String, dynamic> json) {
    final entradas = _parseInt(json['totalEntradas']);
    final salidas  = _parseInt(json['totalSalidas']);
    return ResumenGeneralModel(
      totalEntradas: entradas,
      totalSalidas:  salidas,
      balanceNeto:   entradas - salidas,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// TopProductoModel  →  GET /movimientos/top-productos
// ─────────────────────────────────────────────────────────────
class TopProductoModel {
  final String producto;
  final int stockActual;
  final int stockMinimo;

  TopProductoModel({
    required this.producto,
    required this.stockActual,
    required this.stockMinimo,
  });

  bool get tieneStockBajo => stockActual < stockMinimo;

  factory TopProductoModel.fromJson(Map<String, dynamic> json) {
    return TopProductoModel(
      producto:    json['producto']?.toString() ?? '',
      stockActual: _parseInt(json['stock_actual']),
      stockMinimo: _parseInt(json['stock_minimo']),
    );
  }
}