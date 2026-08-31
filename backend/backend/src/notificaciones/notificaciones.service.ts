import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FcmPushService } from './fcm-push.service';

@Injectable()
export class NotificacionesService {
  constructor(
    private prisma: PrismaService,
    private fcmPush: FcmPushService,
  ) {}

  // -------------------------------------------------------
  // TODAS LAS NOTIFICACIONES ACTIVAS
  // -------------------------------------------------------
  async findAll(query: any) {
    console.log('controller - todas las notificaciones:', JSON.stringify(query));

    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    // Pedidos recientes. Las notificaciones de stock bajo/agotados NO salen
    // de aquí (bajaban vía producto.findMany antes, pero ese resultado nunca
    // se usaba: _getStockBajo()/_getAgotados() más abajo ya las traen por
    // SQL crudo). Esas dos llamadas muertas también rompían los tests
    // unitarios, porque su `where` usaba `this.prisma.producto.fields
    // .stock_minimo` — una referencia de campo a campo que solo existe en un
    // PrismaClient real, no en el mock de las pruebas.
    const pedidos = await this.prisma.pedido.findMany({
      where: { fecha: { gte: hace7Dias } },
      orderBy: { fecha: 'desc' },
      take: 100,
      include: { ticket_compra: true } as any,
    });

    // Obtener usuarios de los pedidos
    const idUsuarios = [...new Set(pedidos.map((p) => p.id_usuario))];
    const usuarios = await this.prisma.usuario.findMany({
      where: { id_usuario: { in: idUsuarios } },
    });
    const usuarioMap = Object.fromEntries(usuarios.map((u) => [u.id_usuario, u]));

    const notifStockBajo = await this._getStockBajo();
    const notifAgotados = await this._getAgotados();

    const notifPedidos = pedidos.map((p) => {
      const usuario = usuarioMap[p.id_usuario];
      const nombre = usuario ? `${usuario.nom_1} ${usuario.ape_1}` : p.id_usuario;
      const ticket = (p as any).ticket_compra?.[0];
      const tipo_pedido = p.id_tipo === 'P_P' ? 'Personalizado' : 'Estándar';

      return {
        tipo: 'pedido',
        id_notificacion: `pedido-${p.id_pedido}`,
        id_producto: p.id_pedido,
        nom_producto: nombre,
        stock_actual: null,
        stock_minimo: null,
        fecha: p.fecha,
        mensaje: 'Se agregó nuevo pedido',
        detalles: `Id_pedido: ${ticket?.num_ticket ?? p.id_pedido} - Cliente: ${nombre} - ${tipo_pedido}`,
        ruta_destino: '/pedidos_realizados',
        clase_boton: 'pedido',
      };
    });

    return [...notifStockBajo, ...notifAgotados, ...notifPedidos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 100);
  }

  // -------------------------------------------------------
  // CONTAR NOTIFICACIONES
  // -------------------------------------------------------
  async count(query : any) {
    console.log('controller - contar notificaciones:', JSON.stringify(query));
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const [alertas_stock_bajo, alertas_agotados, nuevos_pedidos] = await Promise.all([
      this._contarStockBajo(),
      this.prisma.producto.count({ where: { estado: true, stock_actual: 0 } }),
      this.prisma.pedido.count({ where: { fecha: { gte: hace7Dias } } }),
    ]);

    return {
      alertas_stock_bajo,
      alertas_agotados,
      nuevos_pedidos,
      total_notificaciones: alertas_stock_bajo + alertas_agotados + nuevos_pedidos,
    };
  }

  // -------------------------------------------------------
  // STOCK BAJO
  // -------------------------------------------------------
  async stockBajo(query : any) {
    console.log('controller - notificaciones de stock bajo:', JSON.stringify(query));
    return this._getStockBajo();
  }

  // -------------------------------------------------------
  // AGOTADOS
  // -------------------------------------------------------
  async agotados(query : any) {
    console.log('controller - notificaciones de productos agotados:', JSON.stringify(query));
    return this._getAgotados();
  }

  // -------------------------------------------------------
  // PEDIDOS RECIENTES
  // -------------------------------------------------------
async pedidosRecientes(dias = 7) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);

    const pedidos = await this.prisma.pedido.findMany({
      where: { fecha: { gte: fecha } },
      orderBy: { fecha: 'desc' },
    });

    const idUsuarios = [...new Set(pedidos.map((p) => p.id_usuario))];
    const usuarios = await this.prisma.usuario.findMany({
      where: { id_usuario: { in: idUsuarios } },
    });
    const usuarioMap = Object.fromEntries(usuarios.map((u) => [u.id_usuario, u]));

    const idPedidos = pedidos.map((p) => p.id_pedido);
    const tickets = await this.prisma.ticket_compra.findMany({
      where: { id_pedido: { in: idPedidos } },
    });
    const ticketMap = Object.fromEntries(tickets.map((t) => [t.id_pedido, t]));

    const detalles = await this.prisma.detalles_pedido.findMany({
      where: { id_pedido: { in: idPedidos } },
    });
    const detalleCount = detalles.reduce((acc, d) => {
      acc[d.id_pedido] = (acc[d.id_pedido] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const resultado = pedidos.map((p) => {
      const u = usuarioMap[p.id_usuario];
      const t = ticketMap[p.id_pedido];
      return {
        id_pedido: p.id_pedido,
        fecha: p.fecha,
        estado: p.estado,
        id_tipo: p.id_tipo,
        cliente: u ? `${u.nom_1} ${u.ape_1}` : p.id_usuario,
        telefono: u?.telefono ?? null,
        correo: u?.correo ?? null,
        num_ticket: t?.num_ticket ?? null,
        total_ticket: t?.total_ticket ?? null,
        total_productos: detalleCount[p.id_pedido] ?? 0,
      };
    });
    console.log(`service - pedidos recientes | días: ${dias} | encontrados: ${resultado.length}`);
    return resultado;
  }

  // -------------------------------------------------------
  // ESTADÍSTICAS
  // -------------------------------------------------------
  async estadisticas(query :  any) {
    console.log('controller - estadísticas:', JSON.stringify(query));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const [productos_agotados, productos_stock_bajo, pedidos_hoy, pedidos_semana, pedidos_pendientes] =
      await Promise.all([
        this.prisma.producto.count({ where: { estado: true, stock_actual: 0 } }),
        this._contarStockBajo(),
        this.prisma.pedido.count({ where: { fecha: { gte: hoy } } }),
        this.prisma.pedido.count({ where: { fecha: { gte: hace7Dias } } }),
        this.prisma.pedido.count({ where: { estado: 'Pendiente' } }),
      ]);

    return { productos_agotados, productos_stock_bajo, pedidos_hoy, pedidos_semana, pedidos_pendientes };
  }

  // -------------------------------------------------------
  // HELPERS PRIVADOS
  // -------------------------------------------------------
  // Cuenta productos con stock bajo vía SQL crudo (equivalente a
  // `stock_actual <= stock_minimo AND stock_actual > 0`) en lugar de la
  // referencia campo-a-campo de Prisma Client (`fields.stock_minimo`), que
  // requiere un PrismaClient real y no funciona contra los mocks de test.
  private async _contarStockBajo(): Promise<number> {
    const filas = await this.prisma.$queryRaw<{ total: bigint | number }[]>`
      SELECT COUNT(*) as total
      FROM producto
      WHERE estado = 1 AND stock_actual <= stock_minimo AND stock_actual > 0
    `;
    return Number(filas?.[0]?.total ?? 0);
  }

  private async _getStockBajo() {
    const productos = await this.prisma.$queryRaw<any[]>`
      SELECT p.id_producto, p.nom_producto, p.stock_actual, p.stock_minimo,
          p.ultima_actualiz, c.nombre_c as categoria, p.ruta_imagen
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.estado = 1 AND p.stock_actual <= p.stock_minimo AND p.stock_actual > 0
      ORDER BY p.stock_actual ASC
    `;
    return productos.map((p) => ({
      tipo: 'stock-bajo',
      id_notificacion: `stock-bajo-${p.id_producto}`,
      id_producto: p.id_producto,
      nom_producto: p.nom_producto,
      stock_actual: p.stock_actual,
      stock_minimo: p.stock_minimo,
      fecha: p.ultima_actualiz,
      mensaje: 'Alerta de bajo stock',
      detalles: `${p.nom_producto} - Últimas ${p.stock_actual} unidades`,
      ruta_destino: '/movimientos',
      clase_boton: 'stock',
      categoria: p.categoria,
      ruta_imagen: p.ruta_imagen,
    }));
  }

    private async _getAgotados() {
      const productos = await this.prisma.$queryRaw<any[]>`
        SELECT p.id_producto, p.nom_producto, p.stock_actual, p.stock_minimo,
              p.ultima_actualiz, c.nombre_c as categoria, p.ruta_imagen
        FROM producto p
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        WHERE p.estado = 1 AND p.stock_actual = 0
        ORDER BY p.ultima_actualiz DESC
      `;

      return productos.map((p) => ({
        tipo: 'agotado',
        id_notificacion: `agotado-${p.id_producto}`,
        id_producto: p.id_producto,
        nom_producto: p.nom_producto,
        stock_actual: p.stock_actual,
        stock_minimo: p.stock_minimo,
        fecha: p.ultima_actualiz,
        mensaje: 'Producto agotado',
        detalles: `${p.nom_producto} - SIN STOCK DISPONIBLE`,
        ruta_destino: '/movimientos',
        clase_boton: 'agotado',
        categoria: p.categoria,
        ruta_imagen: p.ruta_imagen,
      }));
    }
    // -------------------------------------------------------
  // PERSISTENCIA EN TABLA notificacion (FCM real)
  // -------------------------------------------------------

  /** Crea una notificación para un usuario específico. */
  async crearNotificacion(
    id_usuario: string,
    titulo: string,
    mensaje: string,
    tipo: 'pedido_estado' | 'stock_bajo' | 'pedido_nuevo',
  ) {
    return this.prisma.notificacion.create({
      data: { id_usuario, titulo, mensaje, tipo },
    });
  }

  /** Crea la misma notificación para todos los admins y trabajadores (rol 1 y 3). */
  async crearNotificacionAdmins(
    titulo: string,
    mensaje: string,
    tipo: 'pedido_estado' | 'stock_bajo' | 'pedido_nuevo',
  ) {
    const admins = await this.prisma.usuario.findMany({
      where: { id_rol_usuario: { in: ['1', '3'] }, estado: 1 },
      select: { id_usuario: true },
    });
    if (!admins.length) return;
    await this.prisma.notificacion.createMany({
      data: admins.map((a) => ({ id_usuario: a.id_usuario, titulo, mensaje, tipo })),
    });
  }

  /** Devuelve todas las notificaciones de un usuario, más recientes primero. */
  async notificacionesPorUsuario(id_usuario: string) {
    return this.prisma.notificacion.findMany({
      where: { id_usuario },
      orderBy: { fecha: 'desc' },
    });
  }

  // -------------------------------------------------------
  // NOTIFICACIONES DE CICLO DE VIDA DEL PEDIDO (para el cliente)
  // -------------------------------------------------------

  // Mensaje breve por cada estado del flujo (RF-008.2). "Anulado" y
  // "Pendiente" (estado inicial, ya cubierto por notificarPedidoCreado) no
  // necesitan entrada acá si no se quiere duplicar aviso.
  private readonly MENSAJES_POR_ESTADO: Record<string, string> = {
    'En preparación': 'ya se está preparando',
    'Pagado':         'fue marcado como pagado',
    'Entregado':      'fue entregado',
    'Finalizado':     'fue finalizado',
    'Anulado':        'fue anulado',
  };

  /**
   * Notificación al cliente justo al crear el pedido (RF-00X).
   * Se llama desde PedidosService.create() apenas la transacción cierra.
   */
  async notificarPedidoCreado(id_usuario: string, id_pedido: number) {
    const titulo = 'Pedido realizado con éxito';
    const mensaje =
      `Tu pedido #${id_pedido} fue realizado exitosamente. ` +
      `Te notificaremos cuando se esté preparando.`;

    // tipo 'pedido_estado' para que el Header del cliente lo trate igual que
    // el resto de avisos de pedido: color azul y clic abre el ticket (extrae
    // el "#<id>" del mensaje, ver Header_c.jsx → extraerIdPedido).
    await this.crearNotificacion(id_usuario, titulo, mensaje, 'pedido_estado');

    try {
      await this.fcmPush.notificarUsuario(id_usuario, titulo, mensaje, {
        id_pedido: String(id_pedido),
        pantalla: '/pedidos_realizados',
      });
    } catch (error) {
      console.error(`No se pudo enviar push de confirmación para el pedido #${id_pedido}:`, error);
    }
  }

  /**
   * Notificación al cliente cuando cambia el estado de su pedido.
   * Se llama desde PedidosService.update() cuando dto.estado viene en el body.
   */
  async notificarCambioEstadoPedido(params: {
    id_pedido: number;
    id_usuario: string;
    estado: string;
  }) {
    const { id_pedido, id_usuario, estado } = params;
    const detalle = this.MENSAJES_POR_ESTADO[estado] ?? `cambió de estado a "${estado}"`;

    const titulo = 'Actualización de tu pedido';
    const mensaje = `Tu pedido #${id_pedido} ${detalle}.`;

    await this.crearNotificacion(id_usuario, titulo, mensaje, 'pedido_estado');

    try {
      await this.fcmPush.notificarUsuario(id_usuario, titulo, mensaje, {
        id_pedido: String(id_pedido),
        pantalla: '/pedidos_realizados',
      });
    } catch (error) {
      console.error(`No se pudo enviar push de cambio de estado para el pedido #${id_pedido}:`, error);
    }
  }

  /** Cuenta las no leídas (para el badge). */
  async contarNoLeidas(id_usuario: string): Promise<number> {
    return this.prisma.notificacion.count({
      where: { id_usuario, leida: false },
    });
  }

  /** Marca una notificación como leída (solo si pertenece al usuario). */
  async marcarLeida(id_notificacion: number, id_usuario: string) {
    return this.prisma.notificacion.updateMany({
      where: { id_notificacion, id_usuario },
      data: { leida: true },
    });
  }

  /** Marca todas las notificaciones de un usuario como leídas. */
  async marcarTodasLeidas(id_usuario: string) {
    return this.prisma.notificacion.updateMany({
      where: { id_usuario, leida: false },
      data: { leida: true },
    });
  }
}