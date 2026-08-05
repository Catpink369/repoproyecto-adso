import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../Data/models/usuario_model.dart';
import '../../Data/models/pedido_model.dart';
import '../../Shared/providers/pedido_provider.dart';
import '../../Shared/widgets/Custom_AppBar.dart';
import '../../Shared/widgets/AdminSidebar.dart'; 
import '../../Shared/constants/app_colors.dart';


class PedidosRealizadosScreen extends StatefulWidget {
  final UsuarioModel usuario;
  const PedidosRealizadosScreen({super.key, required this.usuario});

  @override
  State<PedidosRealizadosScreen> createState() => _PedidosRealizadosScreenState();
}

class _PedidosRealizadosScreenState extends State<PedidosRealizadosScreen> {
  String _busqueda = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PedidoProvider>().cargarPedidos();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'Pedidos Realizados'),
      drawer: AdminSidebar(usuario: widget.usuario),
      backgroundColor: AppColors.fondo,
      body: Column(
        children: [
          _buildBuscador(),
          Expanded(child: _buildLista()),
        ],
      ),
    );
  }

  Widget _buildBuscador() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: TextField(
        onChanged: (v) => setState(() => _busqueda = v),
        decoration: InputDecoration(
          hintText: 'Buscar por # de pedido o cliente...',
          prefixIcon: const Icon(Icons.search),
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
        ),
      ),
    );
  }

  Widget _buildLista() {
    return Consumer<PedidoProvider>(
      builder: (context, provider, _) {
        if (provider.cargando) return const Center(child: CircularProgressIndicator());

        final lista = provider.pedidos.where((p) {
          final nombreCliente = p.usuario?.nombreCompleto.toLowerCase() ?? '';
          return p.idPedido.toString().contains(_busqueda) || nombreCliente.contains(_busqueda.toLowerCase());
        }).toList();

        if (lista.isEmpty) return const Center(child: Text('No hay pedidos registrados'));

        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: lista.length,
          itemBuilder: (context, i) => _PedidoCard(pedido: lista[i], adminId: widget.usuario.idUsuario),
        );
      },
    );
  }
}

class _PedidoCard extends StatefulWidget {
  final PedidoModel pedido;
  final String adminId;
  const _PedidoCard({required this.pedido, required this.adminId});

  @override
  State<_PedidoCard> createState() => _PedidoCardState();
}

class _PedidoCardState extends State<_PedidoCard> {
  bool _expandido = false;
  PedidoModel? _detalle;
  bool _cargandoDetalle = false;

  void _toggleExpander() async {
    setState(() => _expandido = !_expandido);
    if (_expandido && _detalle == null) {
      setState(() => _cargandoDetalle = true);
      final d = await context.read<PedidoProvider>().obtenerDetalle(widget.pedido.idPedido);
      setState(() {
        _detalle = d;
        _cargandoDetalle = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.pedido;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          ListTile(
            onTap: _toggleExpander,
            title: Row(
              children: [
                Text('#${p.idPedido}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(width: 10),
                _estadoBadge(p.estado),
              ],
            ),
            subtitle: Text(
              '${p.usuario?.nombreCompleto ?? "N/A"}\n${p.fecha.day}/${p.fecha.month}/${p.fecha.year}',
              style: const TextStyle(fontSize: 13),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('\$${p.total.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primario, fontSize: 16)),
                Icon(_expandido ? Icons.expand_less : Icons.expand_more, color: Colors.grey),
              ],
            ),
          ),
          if (_expandido) ...[
            const Divider(height: 1),
            if (_cargandoDetalle)
              const Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())
            else if (_detalle == null)
              const Padding(padding: EdgeInsets.all(20), child: Text('Error al cargar detalle'))
            else
              _buildDetalle(_detalle!),
            _buildAcciones(),
          ]
        ],
      ),
    );
  }

  Widget _estadoBadge(String estado) {
    Color color;
    switch (estado) {
      case 'Pendiente':      color = Colors.orange; break;
      case 'Pagado':         color = Colors.blue; break;
      case 'En preparación': color = Colors.purple; break;
      case 'Entregado':      color = Colors.green; break;
      case 'Finalizado':     color = AppColors.primario; break;
      default:               color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: color)),
      child: Text(estado, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildDetalle(PedidoModel d) {
    return Container(
      padding: const EdgeInsets.all(16),
      width: double.infinity,
      color: Colors.grey[50],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(d.esPersonalizado ? 'DETALLES PERSONALIZACIÓN' : 'PRODUCTOS', 
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 8),
          if (d.esPersonalizado) ...[
            ...d.pedidoPersonalizado?.map((pp) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text('• ${pp.tipoProducto} (${pp.tamanio})', style: const TextStyle(fontSize: 14)),
            )).toList() ?? [const Text('No hay detalles')],
          ] else ...[
            ...d.detalles.map((det) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('• ${det.nomProducto} x${det.cantidad}', style: const TextStyle(fontSize: 14)),
                  Text('\$${(det.precioUnitario * det.cantidad).toStringAsFixed(0)}'),
                ],
              ),
            )).toList(),
          ],
          const SizedBox(height: 10),
          const Divider(),
          Text('Método de Pago: ${d.ticketCompra?.nomMetodoPago ?? "Por definir"}', style: const TextStyle(fontWeight: FontWeight.bold)),
          Text('Estado de Pago: ${d.ticketCompra?.nomEstadoPago ?? "Pendiente"}'),
        ],
      ),
    );
  }

  Widget _buildAcciones() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          ElevatedButton.icon(
            onPressed: _cambiarEstado,
            icon: const Icon(Icons.edit_note, size: 18),
            label: const Text('Estado'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primario, foregroundColor: Colors.white),
          ),
          ElevatedButton.icon(
            onPressed: _cambiarPago,
            icon: const Icon(Icons.payment, size: 18),
            label: const Text('Pago'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }

  void _cambiarEstado() async {
    // ── 'En preparación' agregado entre Pagado y Entregado
    final estados = ['Pendiente', 'Pagado', 'En preparación', 'Entregado', 'Finalizado'];

    final nuevo = await showDialog<String>(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Cambiar Estado'),
        children: estados.map((e) {
          Color color;
          switch (e) {
            case 'Pendiente':      color = Colors.orange; break;
            case 'Pagado':         color = Colors.blue; break;
            case 'En preparación': color = Colors.purple; break;
            case 'Entregado':      color = Colors.green; break;
            case 'Finalizado':     color = AppColors.primario; break;
            default:               color = Colors.grey;
          }
          return SimpleDialogOption(
            onPressed: () => Navigator.pop(context, e),
            child: Row(
              children: [
                Container(
                  width: 10, height: 10,
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                Text(e),
              ],
            ),
          );
        }).toList(),
      ),
    );

    if (nuevo != null) {
      await context.read<PedidoProvider>().actualizarEstado(widget.pedido.idPedido, nuevo);
    }
  }

  void _cambiarPago() async {
    final metodos = ['Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'DaviPlata', 'Por_definir'];
    final nuevo = await showDialog<String>(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Seleccionar Método de Pago'),
        children: metodos.map((m) => SimpleDialogOption(onPressed: () => Navigator.pop(context, m), child: Text(m))).toList(),
      ),
    );

    if (nuevo != null) {
      await context.read<PedidoProvider>().actualizarMetodoPago(widget.pedido, nuevo, widget.adminId);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pago actualizado y movimientos generados')));
    }
  }
}