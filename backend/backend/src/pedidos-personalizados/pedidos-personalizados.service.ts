import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreatePedidoPersonalizadoDto } from './dto/create-pedidos-personalizado.dto';
import { CreateMaterialColorDto } from './dto/create-material-color.dto';
import { UpdateMaterialColorDto } from './dto/update-material-color.dto';
import { CreateMaterialDisenoDto } from './dto/create-material-diseno.dto';
import { UpdateMaterialDisenoDto } from './dto/update-material-diseno.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizarTipoMovimiento } from '../movimientos/tipo-movimiento.util';

@Injectable()
export class PedidosPersonalizadosService {
  constructor(private prisma: PrismaService) {}

  // --------------------------------------------------------
  // OBTENER TODOS LOS MATERIALES (search / estado / tipo)
  // --------------------------------------------------------
  async getMateriales(query: any) {
    console.log('service - materiales disponibles:', JSON.stringify(query));

    const where: any = {};

    // estado: por defecto solo activos; false = inactivos; "all" = todos
    if (query?.estado === 'false' || query?.estado === false) {
      where.estado = false;
    } else if (query?.estado === 'all') {
      // sin filtro de estado
    } else {
      where.estado = true;
    }

    if (query?.search && String(query.search).trim() !== '') {
      where.nombre = {
        contains: String(query.search).trim(),
        mode: 'insensitive',
      };
    }

    if (query?.tipo) {
      where.tipo = query.tipo as any;
    }

    return this.prisma.material.findMany({
      where,
      select: {
        id_material: true,
        nombre: true,
        tipo: true,
        unidad: true,
        precio_unitario: true,
        stock_actual: true,
        stock_minimo: true,
        ruta_imagen: true,
        estado: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  // --------------------------------------------------------
  // OBTENER MATERIALES POR TIPO
  // --------------------------------------------------------
  async getMaterialesPorTipo(tipo: string) {
    console.log('service - materiales por tipo:', tipo);
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
  // OBTENER COLORES Y DISEÑOS DE UN MATERIAL
  // --------------------------------------------------------
  async getColoresMaterial(id_material: number) {
    return this.prisma.material_color.findMany({
      where: { id_material, estado: true },
      select: { id_color: true, nombre: true, codigo_hex: true },
    });
  }

  async getDisenosMaterial(id_material: number) {
    return this.prisma.material_diseno.findMany({
      where: { id_material, estado: true },
      select: { id_diseno: true, nombre: true, ruta_imagen: true },
    });
  }

  // --------------------------------------------------------
  // COLORES DE MATERIAL — CRUD
  // --------------------------------------------------------
  async crearColorMaterial(id_material: number, dto: CreateMaterialColorDto) {
    const material = await this.prisma.material.findUnique({ where: { id_material } });
    if (!material) throw new NotFoundException(`Material ${id_material} no encontrado`);

    return this.prisma.material_color.create({
      data: {
        id_material,
        nombre: dto.nombre,
        codigo_hex: dto.codigo_hex,
        estado: true,
      },
    });
  }

  async actualizarColorMaterial(id_color: number, dto: UpdateMaterialColorDto) {
    const color = await this.prisma.material_color.findUnique({ where: { id_color } });
    if (!color) throw new NotFoundException(`Color ${id_color} no encontrado`);

    return this.prisma.material_color.update({
      where: { id_color },
      data: { ...dto },
    });
  }

  // Borrado lógico: un color puede estar referenciado en pedidos históricos.
  async eliminarColorMaterial(id_color: number) {
    const color = await this.prisma.material_color.findUnique({ where: { id_color } });
    if (!color) throw new NotFoundException(`Color ${id_color} no encontrado`);

    return this.prisma.material_color.update({
      where: { id_color },
      data: { estado: false },
    });
  }

  // --------------------------------------------------------
  // DISEÑOS DE MATERIAL — CRUD
  // --------------------------------------------------------
  async crearDisenoMaterial(id_material: number, dto: CreateMaterialDisenoDto) {
    const material = await this.prisma.material.findUnique({ where: { id_material } });
    if (!material) throw new NotFoundException(`Material ${id_material} no encontrado`);

    return this.prisma.material_diseno.create({
      data: {
        id_material,
        nombre: dto.nombre,
        estado: true,
      },
    });
  }

  async actualizarDisenoMaterial(id_diseno: number, dto: UpdateMaterialDisenoDto) {
    const diseno = await this.prisma.material_diseno.findUnique({ where: { id_diseno } });
    if (!diseno) throw new NotFoundException(`Diseño ${id_diseno} no encontrado`);

    return this.prisma.material_diseno.update({
      where: { id_diseno },
      data: { ...dto },
    });
  }

  async actualizarImagenDiseno(id_diseno: number, url_imagen: string) {
    if (!url_imagen) throw new BadRequestException('No se recibió ninguna URL de imagen');

    const diseno = await this.prisma.material_diseno.findUnique({ where: { id_diseno } });
    if (!diseno) throw new NotFoundException(`Diseño ${id_diseno} no encontrado`);

    await this.prisma.material_diseno.update({
      where: { id_diseno },
      data: { ruta_imagen: url_imagen },
    });

    return { statusCode: 200, message: 'Imagen actualizada', ruta_imagen: url_imagen };
  }

  async eliminarDisenoMaterial(id_diseno: number) {
    const diseno = await this.prisma.material_diseno.findUnique({ where: { id_diseno } });
    if (!diseno) throw new NotFoundException(`Diseño ${id_diseno} no encontrado`);

    return this.prisma.material_diseno.update({
      where: { id_diseno },
      data: { estado: false },
    });
  }

  // --------------------------------------------------------
  // CREAR MATERIAL (valida nombre único — RF-004.1)
  // --------------------------------------------------------
  async crearMaterial(dto: CreateMaterialDto) {
    const nombreNormalizado = dto.nombre.trim();

    const existente = await this.prisma.material.findFirst({
      where: {
        nombre: {
          equals: nombreNormalizado,
          mode: 'insensitive',
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un material con el nombre "${nombreNormalizado}".`,
      );
    }

    return this.prisma.material.create({
      data: {
        nombre: nombreNormalizado,
        tipo: dto.tipo as any,
        unidad: dto.unidad as any,
        precio_unitario: dto.precio_unitario,
        stock_actual: dto.stock_actual ?? 0,
        stock_minimo: dto.stock_minimo ?? 5,
        estado: true,
      },
    });
  }

  // --------------------------------------------------------
  // ACTUALIZAR MATERIAL (valida nombre único en otro registro)
  // --------------------------------------------------------
  async actualizarMaterial(id: number, dto: UpdateMaterialDto) {
    const material = await this.prisma.material.findUnique({
      where: { id_material: id },
    });
    if (!material) {
      throw new NotFoundException(`Material ${id} no encontrado`);
    }

    const data: any = { ...dto };

    if (dto.nombre !== undefined && dto.nombre !== null) {
      const nombreNormalizado = String(dto.nombre).trim();

      const otroConMismoNombre = await this.prisma.material.findFirst({
        where: {
          nombre: {
            equals: nombreNormalizado,
            mode: 'insensitive',
          },
          NOT: { id_material: id },
        },
      });

      if (otroConMismoNombre) {
        throw new ConflictException(
          `Ya existe un material con el nombre "${nombreNormalizado}".`,
        );
      }

      data.nombre = nombreNormalizado;
    }

    if (dto.tipo !== undefined) data.tipo = dto.tipo as any;
    if (dto.unidad !== undefined) data.unidad = dto.unidad as any;

    return this.prisma.material.update({
      where: { id_material: id },
      data,
    });
  }

  // --------------------------------------------------------
  // ACTUALIZAR IMAGEN DE MATERIAL
  // --------------------------------------------------------
  async actualizarImagenMaterial(id: number, url_imagen: string) {
    if (!url_imagen) throw new BadRequestException('No se recibió ninguna URL de imagen');

    const material = await this.prisma.material.findUnique({
      where: { id_material: id },
    });
    if (!material) throw new NotFoundException(`Material ${id} no encontrado`);

    await this.prisma.material.update({
      where: { id_material: id },
      data: { ruta_imagen: url_imagen },
    });

    return { statusCode: 200, message: 'Imagen actualizada', ruta_imagen: url_imagen };
  }

  // --------------------------------------------------------
  // DESACTIVAR MATERIAL (baja lógica — RF-004.4)
  // --------------------------------------------------------
  async desactivarMaterial(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id_material: id },
    });

    if (!material) {
      throw new NotFoundException('El material no existe.');
    }
    if (!material.estado) {
      throw new ConflictException('El material ya se encuentra desactivado.');
    }

    const materialDesactivado = await this.prisma.material.update({
      where: { id_material: id },
      data: { estado: false },
    });

    // Auditoría provisional (sin tabla dedicada aún)
    console.log(
      `[AUDITORIA] Material desactivado — id_material: ${id}, nombre: "${material.nombre}", fecha: ${new Date().toISOString()}`,
    );

    return materialDesactivado;
  }

  // --------------------------------------------------------
  // Reintentos por colisión de num_ticket
  // --------------------------------------------------------
  private readonly MAX_INTENTOS_TICKET = 5;

  private generarNumTicket(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private esColisionUnica(error: any, campo?: string): boolean {
    if (error?.code !== 'P2002') return false;
    if (!campo) return true;
    const target = error?.meta?.target;
    return Array.isArray(target)
      ? target.includes(campo)
      : String(target ?? '').includes(campo);
  }

  // --------------------------------------------------------
  // CREAR PEDIDO PERSONALIZADO
  // --------------------------------------------------------
  async crearPedido(dto: CreatePedidoPersonalizadoDto) {
    console.log('service - crear pedido personalizado (entrada):', JSON.stringify(dto));

    if (
      !dto.materiales ||
      dto.materiales.length === 0 ||
      !dto.id_usuario ||
      !dto.tipo_producto ||
      !dto.tamanio
    ) {
      throw new BadRequestException(
        'Faltan datos obligatorios (materiales, id_usuario, tipo_producto, tamanio)',
      );
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: dto.id_usuario },
      select: {
        nom_1: true,
        ape_1: true,
        correo: true,
        telefono: true,
        id_usuario: true,
      },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const clavesVistas = new Set<string>();
    for (const item of dto.materiales) {
      const clave = `${item.id_material}|${item.concepto ?? ''}`;
      if (clavesVistas.has(clave)) {
        throw new BadRequestException(
          item.concepto
            ? `El concepto "${item.concepto}" para el material ${item.id_material} está duplicado en el pedido. No se procesó nada.`
            : `El material ${item.id_material} está duplicado en el pedido. No se procesó nada.`,
        );
      }
      clavesVistas.add(clave);
    }

    for (const item of dto.materiales) {
      const material = await this.prisma.material.findUnique({
        where: { id_material: item.id_material },
      });
      if (!material || !material.estado) {
        throw new NotFoundException(`Material ${item.id_material} no encontrado`);
      }
      if (material.stock_actual < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${material.nombre}. Disponible: ${material.stock_actual}`,
        );
      }
    }

    let precio_total = 0;
    const detalles: {
      id_material: number;
      id_color: number | null;
      id_diseno: number | null;
      concepto: string | null;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
      nombre: string;
      unidad: string;
    }[] = [];

    for (const item of dto.materiales) {
      const material = await this.prisma.material.findUnique({
        where: { id_material: item.id_material },
      });
      const subtotal = Number(material!.precio_unitario) * item.cantidad;
      precio_total += subtotal;
      detalles.push({
        id_material: item.id_material,
        id_color: item.id_color ?? null,
        id_diseno: item.id_diseno ?? null,
        concepto: item.concepto ?? null,
        cantidad: item.cantidad,
        precio_unitario: Number(material!.precio_unitario),
        subtotal,
        nombre: material!.nombre,
        unidad: material!.unidad,
      });
    }

    let result: { pedido: any; pedidoPersonal: any; num_ticket: number } | undefined;

    for (let intento = 1; intento <= this.MAX_INTENTOS_TICKET; intento++) {
      try {
        result = await this.prisma.$transaction(async (tx) => {
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
              tipo_producto: (dto.tipo_producto === 'Sábana'
                ? 'Sabana'
                : dto.tipo_producto) as any,
              tamanio: dto.tamanio,
              precio_total,
              detalles: {
                create: detalles.map(
                  ({ id_material, id_color, id_diseno, concepto, cantidad, subtotal }) => ({
                    id_material,
                    id_color,
                    id_diseno,
                    concepto,
                    cantidad,
                    subtotal,
                  }),
                ),
              },
            },
          });

          const numTicket = this.generarNumTicket();
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
            const materialActual = await tx.material.findUnique({
              where: { id_material: item.id_material },
              select: { stock_actual: true, nombre: true },
            });
            const stockRestante = (materialActual?.stock_actual ?? 0) - item.cantidad;
            if (stockRestante < 0) {
              throw new BadRequestException(
                `La operación dejaría el stock de "${materialActual?.nombre ?? item.id_material}" en negativo. Operación cancelada.`,
              );
            }

            await tx.material.update({
              where: { id_material: item.id_material },
              data: { stock_actual: stockRestante },
            });

            await tx.$executeRaw`
              INSERT INTO movimiento_material
                (cantidad_m, fecha_m, observaciones, id_m, id_material, id_usuario, id_ped_personal)
              VALUES
                (${item.cantidad}, NOW(),
                 ${`Consumido automáticamente por el pedido personalizado #${pedido.id_pedido}.`},
                 ${normalizarTipoMovimiento('M-S')}::tipo_movimiento_id_m,
                 ${item.id_material},
                 ${String(dto.id_usuario)},
                 ${pedidoPersonal.id_ped_personal})
            `;
          }

          return { pedido, pedidoPersonal, num_ticket: numTicket };
        });

        break;
      } catch (error: any) {
        console.error('ERROR crearPedido (pedido personalizado):', error);
        if (this.esColisionUnica(error, 'num_ticket') && intento < this.MAX_INTENTOS_TICKET) {
          continue;
        }
        throw error;
      }
    }

    if (!result) {
      throw new BadRequestException(
        'No se pudo generar un número de ticket único. Intenta nuevamente.',
      );
    }

    console.log('service - crear pedido personalizado:', JSON.stringify(dto));

    const detallesConNombres = await Promise.all(
      detalles.map(async (d) => {
        const color = d.id_color
          ? await this.prisma.material_color.findUnique({
              where: { id_color: d.id_color },
              select: { nombre: true },
            })
          : null;
        const diseno = d.id_diseno
          ? await this.prisma.material_diseno.findUnique({
              where: { id_diseno: d.id_diseno },
              select: { nombre: true },
            })
          : null;
        return {
          ...d,
          color_nombre: color?.nombre ?? null,
          diseno_nombre: diseno?.nombre ?? null,
        };
      }),
    );

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
      materiales: detallesConNombres,
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
              },
            },
            ticket_compra: {
              include: {
                estado_pago: true,
                metodo_pago: true,
              },
            },
          },
        },
        detalles: {
          include: {
            material: {
              select: {
                nombre: true,
                tipo: true,
                unidad: true,
              },
            },
            color: {
              select: {
                nombre: true,
                codigo_hex: true,
              },
            },
            diseno: {
              select: {
                nombre: true,
                ruta_imagen: true,
              },
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
    console.log('service - pedidos de usuario:', id_usuario);
    return this.prisma.pedido_personalizado.findMany({
      where: {
        pedido: { id_usuario },
      },
      include: {
        pedido: { select: { fecha: true, estado: true } },
        detalles: {
          include: {
            material: {
              select: {
                nombre: true,
                tipo: true,
                unidad: true,
                ruta_imagen: true,
              },
            },
            color: { select: { nombre: true, codigo_hex: true } },
            diseno: { select: { nombre: true, ruta_imagen: true } },
          },
        },
      },
    });
  }
}