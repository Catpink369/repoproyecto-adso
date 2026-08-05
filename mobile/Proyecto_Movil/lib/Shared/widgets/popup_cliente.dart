import 'package:flutter/material.dart';
import '../../Shared/services/api_service.dart';

class PopupCliente extends StatelessWidget {
    final VoidCallback onCerrar;
    final VoidCallback onVerOfertas;
    final Map<String, dynamic>? primerProducto;
    final String Function(String?) getImageUrl;

    const PopupCliente({
        super.key,
        required this.onCerrar,
        required this.onVerOfertas,
        required this.getImageUrl,
        this.primerProducto,
    });

    @override
    Widget build(BuildContext context) {
        final imgUrl = getImageUrl(primerProducto?['ruta_imagen']);

        return Container(
        color: Colors.black54,
        child: Center(
            child: Container(
            width: 360,
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
                color: const Color(0xFFF8E2EF),
                borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                // Botón cerrar
                Align(
                    alignment: Alignment.topRight,
                    child: IconButton(
                    onPressed: onCerrar,
                    icon: const Icon(Icons.close, color: Color(0xFFb4788b)),
                    ),
                ),

                const Text(
                    "¡Descubre nuestras mejores ofertas!",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFb4788b),
                    ),
                ),
                const SizedBox(height: 10),
                const Text(
                    "Dale un toque tierno y único a tu mundo con nuestros amigurumis hechos a mano.",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF5A3D54)),
                ),
                const SizedBox(height: 4),
                const Text(
                    "Hasta 30% de descuento en modelos seleccionados.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: Color(0xFFC45A77),
                        fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),

                // Imagen del primer producto real (o fallback al asset)
                ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: imgUrl.isNotEmpty
                        ? Image.network(
                            imgUrl,
                            headers: ApiService.headers,
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Image.asset(
                            'lib/Assest/1.png',
                            height: 180,
                            fit: BoxFit.cover,
                            ),
                        )
                        : Image.asset(
                            'lib/Assest/1.png',
                            height: 180,
                            fit: BoxFit.cover,
                        ),
                ),

                const SizedBox(height: 18),

                ElevatedButton(
                    onPressed: onVerOfertas,
                    style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC45A77),
                    minimumSize: const Size(double.infinity, 46),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30)),
                    ),
                    child: const Text(
                    "Ver ofertas",
                    style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
                ),
                ],
            ),
            ),
        ),
        );
    }
}