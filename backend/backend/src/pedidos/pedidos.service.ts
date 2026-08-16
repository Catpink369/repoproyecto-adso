import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { FcmPushService } from '../notificaciones/fcm-push.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private fcmPush: FcmPushService,
    private notificacionesService: NotificacionesService, // <-- nuevo
  ) {}

  // -------------------------------------------------------
  // Cuántas veces reintentar la creación si el número de
  // ticket (aleatorio) choca con uno existente (ticket_compra.num_ticket UNIQUE).
  // -------------------------------------------------------
  private readonly MAX_INTENTOS_TICKET = 5;

  private generarNumTicket(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  // Prisma normaliza los errores de BD a códigos propios (P2002 = unicidad,
  // P2003 = FK). '23505' es el SQLSTATE crudo de Postgres y nunca aparece
  // aquí porque la BD real es MySQL — por eso los catches antiguos con
  // '23505' jamás se disparaban.
  private esColisionUnica(error: any, campo?: string): boolean {
    if (error?.code !== 'P2002') return false;
    if (!campo) return true;
    const target = error?.meta?.target;
    return Array.isArray(target) ? target.includes(campo) : String(target ?? '').includes(campo);
  }

  // -------------------------------------------------------
  // CREAR PEDIDO COMPLETO CON TICKET (transacción)
  // -------------------------------------------------------
  async create(dto: CreatePedidoDto) {
    console.log('controller - Crear pedido:', JSON.stringify(dto));
    const { items, id_usuario, metodo_pago, subtotal, total } = dto;

    if (!items || items.length === 0 || !id_usuario || !metodo_pago) {
      throw new BadRequestException('Faltan datos obligatorios (items, id_usuario, metodo_pago)');
    }

    // ── Guard: detectar productos duplicados en el mismo pedido
    // Evita que un doble-envío desde el cliente descuente el stock dos veces
    const idProductosVistos = new Set<number>();
    for (const item of items) {
      if (idProductosVistos.has(item.id_producto)) {
        throw new BadRequestException(
          `El producto ${item.id_producto} está duplicado en el pedido. No se procesó nada.`,
        );
      }
      idProductosVistos.add(item.id_producto);
    }

    let resultado: {
      id_pedido: number;
      num_ticket: number;
      id_ticket: number;
      productos_procesados: number;
      detalles: { producto: string; cantidad: number; stock_restante: number }[];
    } | undefined;

    for (let intento = 1; intento <= this.MAX_INTENTOS_TICKET; intento++) {
      try {
        resultado = await this.prisma.$transaction(async (tx) => {
          const pedido = await tx.pedido.create({
            data: {
              fecha: new Date(),
              estado: 'Pendiente',
              id_usuario,
              id_tipo: 'P_E', // Prisma sanea el guion de la BD ('P-E') a guion bajo en el enum generado
            },
          });

          const resultados: { producto: string; cantidad: number; stock_restante: number }[] = [];

          for (const item of items) {
            const { id_producto, cantidad, precio } = item;

            const producto = await tx.producto.findFirst({
              where: { id_producto, estado: true },
            });

            if (!producto) {
              throw new NotFoundException(`Producto ${id_producto} no encontrado`);
            }

            if (producto.stock_actual < cantidad) {
              throw new BadRequestException(
                `Stock insuficiente para "${producto.nom_producto}". Disponible: ${producto.stock_actual}, Solicitado: ${cantidad}`,
              );
            }

            // Guard extra: nunca permitir stock negativo
            const nuevoStock = producto.stock_actual - cantidad;
            if (nuevoStock < 0) {
              throw new BadRequestException(
                `La operación dejaría el stock de "${producto.nom_producto}" en negativo. Operación cancelada.`,
              );
            }

            await tx.producto.update({
              where: { id_producto },
              data: {
                stock_actual: nuevoStock, // valor absoluto, nunca negativo
                ultima_actualiz: new Date(),
              },
            });

            await tx.detalles_pedido.create({
              data: {
                descrip_detalles: `${producto.nom_producto} - $${precio}`,
                cantidad,
                id_pedido: pedido.id_pedido,
                id_producto,
              },
            });

            await tx.movimiento.create({
              data: {
                Cantidad_m: cantidad,
                fecha_m: new Date(),
                observaciones: `Venta Online - Pedido #${pedido.id_pedido}`,
                id_m: 'M_S', // Prisma sanea el guion de la BD ('M-S') a guion bajo en el enum generado
                id_producto,
                id_usuario,
              },
            });

            resultados.push({
              producto: producto.nom_producto,
              cantidad,
              stock_restante: nuevoStock,
            });
          }

          const num_ticket = this.generarNumTicket();

          const ticket = await tx.ticket_compra.create({
            data: {
              num_ticket,
              fecha_emision: new Date(),
              sub_total: subtotal,
              total_ticket: total,
              id_pedido: pedido.id_pedido,
              id_estado: 'E_pt', // Prisma sanea el guion de la BD ('E-pt') a guion bajo en el enum generado
              id_met_pago: 'Mtd_PD', // el pedido siempre nace "Por definir" (RN-002 RF-008)
            },
          });

          return {
            id_pedido: pedido.id_pedido,
            num_ticket,
            id_ticket: ticket.id_ticket_c,
            productos_procesados: resultados.length,
            detalles: resultados,
          };
        });

        break; // transacción exitosa, salir del loop de reintentos
      } catch (error: any) {
        // Choque de num_ticket (colisión aleatoria de 6 dígitos): reintentar
        // con un nuevo número. Cualquier otro error se relanza tal cual,
        // sin dejar el pedido en un estado inconsistente (RNF-009).
        if (this.esColisionUnica(error, 'num_ticket') && intento < this.MAX_INTENTOS_TICKET) {
          continue;
        }
        throw error;
      }
    }

    if (!resultado) {
      throw new BadRequestException('No se pudo generar un número de ticket único. Intenta nuevamente.');
    }

    // ── Notificar a admins DESPUÉS de que la transacción cerró exitosamente
    await this.fcmPush.notificarAdmins(
      'Nuevo pedido recibido',
      `Pedido #${resultado.num_ticket} - ${resultado.productos_procesados} producto(s)`,
      { id_pedido: String(resultado.id_pedido), pantalla: '/pedidos_realizados' },
    );

    return {
      success: true,
      message: 'Pedido creado con éxito',
      data: resultado,
    };
  }

  // -------------------------------------------------------
  // OBTENER PEDIDOS DE UN USUARIO
  // -------------------------------------------------------
  async findByUsuario(id_usuario: string, tipo?: 'estandar' | 'personalizado') {
    console.log('service - pedidos por usuario:', JSON.stringify({ id_usuario, tipo }));

    const idTipoFiltro = tipo === 'estandar' ? 'P_E' : tipo === 'personalizado' ? 'P_P' : undefined;

    return this.prisma.pedido.findMany({
      where: { id_usuario, ...(idTipoFiltro && { id_tipo: idTipoFiltro }) },
      orderBy: { fecha: 'desc' },
      include: {
        ticket_compra: {
          include: {
            estado_pago: true,
            metodo_pago: true,
          },
        },
        detalles_pedido: {
          include: {
            producto: {
              select: {
                nom_producto: true,
                precio_unitario: true,
                ruta_imagen: true,
              },
            },
          },
        },
        pedido_personalizado: true,
      },
    });
  }

  // -------------------------------------------------------
  // OBTENER TODOS LOS PEDIDOS (ADMIN)
  // -------------------------------------------------------
  async findAll(query: any) {
    console.log('service - todos los pedidos:', JSON.stringify(query));
    return this.prisma.pedido.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          select: {
            nom_1: true,
            ape_1: true,
            telefono: true,
            correo: true,
          },
        },
        ticket_compra: {
          include: {
            estado_pago: true,
            metodo_pago: true,
          },
        },
        detalles_pedido: {
          include: {
            producto: {
              select: {
                nom_producto: true,
                precio_unitario: true,
              },
            },
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // DETALLE COMPLETO DE UN PEDIDO
  // -------------------------------------------------------
  async findOne(id_pedido: number) {
    console.log('service - detalle de pedido:', JSON.stringify({ id_pedido }));
    const pedido = await this.prisma.pedido.findFirst({
      where: { id_pedido },
      include: {
        usuario: {
          select: {
            nom_1: true,
            ape_1: true,
            correo: true,
            telefono: true,
          },
        },
        ticket_compra: {
          include: {
            estado_pago: true,
            metodo_pago: true,
          },
        },
        detalles_pedido: {
          include: {
            producto: {
              select: {
                nom_producto: true,
                precio_unitario: true,
                ruta_imagen: true,
              },
            },
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${id_pedido} no encontrado`);
    }

    return pedido;
  }

  // -------------------------------------------------------
  // ACTUALIZAR ESTADO / MÉTODO DE PAGO DE UN PEDIDO
  // -------------------------------------------------------

  // Estados finales: una vez alcanzados, el pedido no se puede volver a
  // modificar (ni cambiar de estado ni anular). RF-007.3 / CP-010.
  private readonly ESTADOS_INMUTABLES = ['Entregado', 'Finalizado', 'Anulado'];

  // Flujo secuencial válido (RF-008.2 RN-002 / FA-01). Solo se permite
  // avanzar UN paso a la vez, en este orden. "Anulado" es un flujo aparte
  // (RF-007.3) y se permite desde cualquier estado no inmutable.
  private readonly FLUJO_ESTADOS = ['Pendiente', 'Pagado', 'En preparación', 'Entregado', 'Finalizado'];

  private validarTransicionEstado(estadoActual: string, estadoNuevo: string) {
    if (estadoNuevo === 'Anulado') return; // gestionado de forma independiente (RF-007.3)

    const idxNuevo = this.FLUJO_ESTADOS.indexOf(estadoNuevo);
    if (idxNuevo === -1) {
      throw new BadRequestException(`El estado "${estadoNuevo}" no es válido.`);
    }

    const idxActual = this.FLUJO_ESTADOS.indexOf(estadoActual);
    if (idxActual === -1 || idxNuevo !== idxActual + 1) {
      throw new BadRequestException(
        `Transición no permitida: no se puede pasar de "${estadoActual}" a "${estadoNuevo}". ` +
          `El flujo válido es ${this.FLUJO_ESTADOS.join(' → ')}.`,
      );
    }
  }

  async update(id_pedido: number, dto: UpdatePedidoDto) {
    const pedido = await this.findOne(id_pedido);

    // Bloquea el cambio de método sobre pedidos ya finalizados
    if ((dto.estado || dto.metodo_pago) && this.ESTADOS_INMUTABLES.includes(pedido.estado)) {
      throw new BadRequestException(
        `No se puede modificar un pedido que ya está en estado "${pedido.estado}".`,
      );
    }

    // Valida que la transición de estado siga el flujo permitido (RF-008.2)
    if (dto.estado) {
      this.validarTransicionEstado(pedido.estado, dto.estado);
    }

    const metodoPagoMap: Record<string, string> = {
      'Efectivo':      'Mtd_EF',
      'Nequi':         'Mtd_NQ',
      'DaviPlata':     'Mtd_DP',
      'Daviplata':     'Mtd_DP',
      'Tarjeta':       'Mtd_TJ',
      'Transferencia': 'Mtd_TJ',
      'Por_definir':   'Mtd_PD',
    };

    const pedidoActualizado = await this.prisma.pedido.update({
      where: { id_pedido },
      data: {
        ...(dto.estado && { estado: dto.estado }),
      },
    });

    if (dto.metodo_pago) {
      const idMetPago = metodoPagoMap[dto.metodo_pago] ?? 'Mtd_PD';
      const idEstadoPago = dto.metodo_pago === 'Por_definir' ? 'E_pt' : 'E_pd';
      await this.prisma.ticket_compra.updateMany({
        where: { id_pedido },
        data: { id_met_pago: idMetPago as any, id_estado: idEstadoPago as any },
      });
    }

    // ── Notificar al cliente si cambió el estado
    if (dto.estado) {
      await this.notificacionesService.notificarCambioEstadoPedido({
        id_pedido: pedidoActualizado.id_pedido,
        id_usuario: pedido.id_usuario,
        estado: dto.estado,
      });
    }

    return pedidoActualizado;
  }

  // -------------------------------------------------------
  // ELIMINAR PEDIDO
  // -------------------------------------------------------
  async remove(id_pedido: number) {
    console.log('service - eliminar pedido:', JSON.stringify({ id_pedido }));
    await this.findOne(id_pedido);

    return this.prisma.pedido.delete({
      where: { id_pedido },
    });
  }
}