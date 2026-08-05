import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosPersonalizadosService {
  constructor(private prisma: PrismaService) {}

  // --------------------------------------------------------
  // OBTENER TODOS LOS MATERIALES DISPONIBLES
  // --------------------------------------------------------
  async getMateriales( query : any ) {
    console.log('controller - todos los materiales disponibles:', JSON.stringify(query));
    return this.prisma.material.findMany({
      where: { estado: true },
      select: {
        id_material: true,
        nombre: true,
        tipo: true,
        unidad: true,
        precio_unitario: true,
        stock_actual: true,
        ruta_imagen: true,
      },
    });
  }

  // --------------------------------------------------------
  // OBTENER MATERIALES POR TIPO
  // --------------------------------------------------------
  async getMaterialesPorTipo(tipo: string) {
    console.log('controller - obtener materiales por tipo:', JSON.stringify(tipo));
    return this.prisma.material.findMany({
      where: { estado: true, tipo: tipo as any },
      select: {
        id_material: true,
        nombre: true,
        tipo: true,
        unidad: true,
        precio_unitario: true,
        stock_actual: true,
        ruta_imagen: true,
      },
    });
  }

  // --------------------------------------------------------
  //  OBTENER COLORES Y DISEÑOS DE UN MATERIAL
  // --------------------------------------------------------
    // ── Colores de un material ─────────────────────────────
  async getColoresMaterial(id_material: number) {
    return this.prisma.material_color.findMany({
      where: { id_material, estado: true },
      select: { id_color: true, nombre: true, codigo_hex: true },
    });
  }

  // ── Diseños de un material ─────────────────────────────
  async getDisenosMaterial(id_material: number) {
    return this.prisma.material_diseno.findMany({
      where: { id_material, estado: true },
      select: { id_diseno: true, nombre: true, ruta_imagen: true },
    });
  }
  // --------------------------------------------------------
  // CREAR MATERIAL
  // --------------------------------------------------------
  async crearMaterial(dto: {
      nombre: string;
      tipo: string;
      unidad: string;
      precio_unitario: number;
      stock_actual: number;
      stock_minimo: number;
  }) {
      return this.prisma.material.create({
          data: {
              nombre: dto.nombre,
              tipo: dto.tipo as any,
              unidad: dto.unidad as any,
              precio_unitario: dto.precio_unitario,
              stock_actual: dto.stock_actual,
              stock_minimo: dto.stock_minimo,
              estado: true,
          },
      });
  }

  // --------------------------------------------------------
  // ACTUALIZAR MATERIAL
  // --------------------------------------------------------
  async actualizarMaterial(id: number, dto: {
      nombre?: string;
      tipo?: string;
      unidad?: string;
      precio_unitario?: number;
      stock_actual?: number;
      stock_minimo?: number;
  }) {
      const material = await this.prisma.material.findUnique({
          where: { id_material: id }
      });
      if (!material) throw new NotFoundException(`Material ${id} no encontrado`);

      return this.prisma.material.update({
          where: { id_material: id },
          data: {
              ...dto,
              tipo: dto.tipo as any,
              unidad: dto.unidad as any,
          },
      });
  }

  // --------------------------------------------------------
  // ACTUALIZAR IMAGEN DE MATERIAL
  // --------------------------------------------------------
  async actualizarImagenMaterial(id: number, file: Express.Multer.File) {
      if (!file) throw new BadRequestException('No se recibió ningún archivo');

      const material = await this.prisma.material.findUnique({
          where: { id_material: id }
      });
      if (!material) throw new NotFoundException(`Material ${id} no encontrado`);

      const ruta_imagen = `/uploads/materiales/${file.filename}`;

      await this.prisma.material.update({
          where: { id_material: id },
          data: { ruta_imagen },
      });

      return { statusCode: 200, message: 'Imagen actualizada', ruta_imagen };
  }

  // --------------------------------------------------------
  // CREAR PEDIDO PERSONALIZADO
  // --------------------------------------------------------
  async crearPedido(dto: {
  id_usuario: string;
  tipo_producto: string;
  tamanio: string;
  metodo_pago?: string;
  materiales: { id_material: number; cantidad: number }[];
  }) {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: dto.id_usuario },
      select: { nom_1: true, ape_1: true, correo: true, telefono: true, id_usuario: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // verificar stock de cada material
    for (const item of dto.materiales) {
      const material = await this.prisma.material.findUnique({
        where: { id_material: item.id_material },
      });
      if (!material || !material.estado) {
        throw new NotFoundException(`Material ${item.id_material} no encontrado`);
      }
      if (material.stock_actual < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${material.nombre}. Disponible: ${material.stock_actual}`
        );
      }
    }

    // calcular precio total
    let precio_total = 0;
    const detalles: { id_material: number; cantidad: number; subtotal: number; nombre: string; unidad: string }[] = [];

    for (const item of dto.materiales) {
      const material = await this.prisma.material.findUnique({
        where: { id_material: item.id_material },
      });
      const subtotal = Number(material!.precio_unitario) * item.cantidad;
      precio_total += subtotal;
      detalles.push({
        id_material: item.id_material,
        cantidad: item.cantidad,
        subtotal,
        nombre: material!.nombre,
        unidad: material!.unidad,
      });
    }

    // crear todo en una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({
        data: {
          fecha: new Date(),
          estado: 'Pendiente',
          id_usuario: dto.id_usuario,
          id_tipo: 'P_P',
        },
      });

      const pedidoPersonal = await tx.pedido_personalizado.create({
        data: {
          id_pedido: pedido.id_pedido,
          tipo_producto: (dto.tipo_producto === 'Sábana' ? 'Sabana' : dto.tipo_producto) as any,
          tamanio: dto.tamanio,
          precio_total,
          detalles: {
            create: detalles.map(({ id_material, cantidad, subtotal }) => ({
              id_material, cantidad, subtotal,
            })),
          },
        },
      });

      const numTicket = Math.floor(100000 + Math.random() * 900000);
      await tx.ticket_compra.create({
        data: {
          num_ticket: numTicket,
          fecha_emision: new Date(),
          sub_total: precio_total,
          total_ticket: precio_total,
          id_pedido: pedido.id_pedido,
          id_estado: 'E_pt',
          id_met_pago: (dto.metodo_pago ?? 'Mtd_PD') as any,
        },
      });

      for (const item of detalles) {
        await tx.material.update({
          where: { id_material: item.id_material },
          data: { stock_actual: { decrement: item.cantidad } },
        });
      }

      return { pedido, pedidoPersonal, num_ticket: numTicket };
    });

    console.log('service - crear pedido personalizado:', JSON.stringify(dto));

    return {
      success: true,
      message: 'Pedido personalizado creado exitosamente',
      id_pedido: result.pedido.id_pedido,
      num_ticket: result.num_ticket,
      precio_total,
      usuario: {
        nombre: `${usuario.nom_1} ${usuario.ape_1}`,
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        telefono: usuario.telefono?.toString(),
      },
      tipo_producto: dto.tipo_producto,
      tamanio: dto.tamanio,
      materiales: detalles, // incluye nombre y unidad para mostrar en ticket
    };
  }

  // --------------------------------------------------------
  // OBTENER PEDIDOS PERSONALIZADOS (admin/trabajador)
  // --------------------------------------------------------
  async findAll(query: any) {
    return this.prisma.pedido_personalizado.findMany({
        include: {
            pedido: {
                include: {                    
                    usuario: {
                        select: {
                            nom_1: true,
                            ape_1: true,
                            telefono: true,
                            correo: true,
                        }
                    },
                    ticket_compra: {
                        include: {
                            estado_pago: true,
                            metodo_pago: true,
                        }
                    }
                }
            },
            detalles: {
                include: {
                    material: {
                        select: {
                            nombre: true,
                            tipo: true,
                            unidad: true,
                        }
                    },
                },
            },
        },
    });
  }

  // --------------------------------------------------------
  // OBTENER PEDIDOS DE UN USUARIO
  // --------------------------------------------------------
  async findByUsuario(id_usuario: string) {
    console.log('controller - obtener pedidos de un usuario:', JSON.stringify(id_usuario));
    return this.prisma.pedido_personalizado.findMany({
      where: {
        pedido: { id_usuario },
      },
      include: {
        pedido: { select: { fecha: true, estado: true } },
        detalles: {
          include: {
            material: { select: { nombre: true, tipo: true, unidad: true, ruta_imagen: true } },
          },
        },
      },
    });
  }
}