import 'package:flutter/material.dart';

class Footer extends StatelessWidget {
    const Footer({super.key});

    @override
    Widget build(BuildContext context) {
        return Container(
        width: double.infinity,
        color: const Color(0xFFF7F7F7),
        padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
        child: Column(
            children: [
            const Divider(color: Color(0xFFD4A9C2), thickness: 1.5),
            const SizedBox(height: 16),
            const Text(
                "Síguenos en nuestras redes sociales",
                style: TextStyle(
                color: Color(0xFFb4788b),
                fontWeight: FontWeight.bold,
                fontSize: 15,
                ),
            ),
            const SizedBox(height: 12),
            Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                _RedSocial(
                    icono: Icons.camera_alt_outlined,
                    label: "Instagram",
                    onTap: () {},
                ),
                const SizedBox(width: 24),
                _RedSocial(
                    icono: Icons.music_note,
                    label: "TikTok",
                    onTap: () {},
                ),
                ],
            ),
            const SizedBox(height: 20),
            const Text(
                "© Gurama 2025",
                style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            ],
        ),
        );
    }
    }

    class _RedSocial extends StatelessWidget {
    final IconData icono;
    final String label;
    final VoidCallback onTap;

    const _RedSocial({
        required this.icono,
        required this.label,
        required this.onTap,
    });

    @override
    Widget build(BuildContext context) {
        return GestureDetector(
        onTap: onTap,
        child: Column(
            children: [
            Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                color: const Color(0xFFF0D8E8),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFD4A9C2)),
                ),
                child: Icon(icono, color: const Color(0xFFb4788b), size: 22),
            ),
            const SizedBox(height: 4),
            Text(label,
                style: const TextStyle(
                    fontSize: 12, color: Color(0xFF5A3D54))),
            ],
        ),
        );
    }
}