import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@Injectable()
export class MovimientosService {
  constructor(private prisma: PrismaService) {}

  // -------------------------------------------------------
  // OBTENER TODOS LOS MOVIMIENTOS CON INFO COMPLETA
  // -------------------------------------------------------
  async findAll(query: any) {
    console.log('service - todos los movimientos:', JSON.stringify(query));

    return this.prisma.$queryRaw<any[]>`
      SELECT 
        m.id_movimiento,
        m.Cantidad_m,
        m.fecha_m,
        m.observaciones,
        CASE m.id_m 
          WHEN 'M-E' THEN 'entrada'
          WHEN 'M-S' THEN 'salida'
        END AS tipo,
        m.id_m,
        tm.nom_movimiento AS tipo_movimiento,
        p.nom_producto,
        p.ruta_imagen,
        u.id_usuario,
        CONCAT(u.nom_1, ' ', u.ape_1) AS nombre_usuario,
        r.nombre_rol,
        CASE 
          WHEN m.observaciones LIKE '%Pedido #%' THEN 'Venta Online'
          WHEN m.observaciones LIKE '%Realizado por:%' THEN 'Manual (Admin)'
          ELSE 'Manual'
        END AS origen_movimiento
      FROM movimiento m
      JOIN tipo_movimiento tm ON m.id_m = tm.id_m
      JOIN producto p ON m.id_producto = p.id_producto
      JOIN usuario u ON m.id_usuario = u.id_usuario
      JOIN rol_usuario r ON u.id_rol_usuario = r.id_rol_usuario
      ORDER BY m.fecha_m DESC
    `;
  }

  // -------------------------------------------------------
  // OBTENER MOVIMIENTO POR ID
  // -------------------------------------------------------
  async findOne(id: number) {
    console.log('service - movimiento por ID:', id);
    return this.prisma.movimiento.findFirst({
      where: { id_movimiento: id },
      include: {
        producto: { select: { nom_producto: true, ruta_imagen: true } },
        usuario: { select: { nom_1: true, ape_1: true } },
        tipo_movimiento: true,
      },
    });
  }

  // -------------------------------------------------------
  // OBTENER MOVIMIENTOS POR TIPO (M_E o M_S)
  // -------------------------------------------------------
  async findByTipo(tipo: string) {
    console.log('service - movimientos por tipo:', tipo);
    return this.prisma.movimiento.findMany({
      where: { id_m: tipo as any },
      orderBy: { fecha_m: 'desc' },
      include: {
        producto: { select: { nom_producto: true, ruta_imagen: true } },
        usuario: { select: { nom_1: true, ape_1: true } },
      },
    });
  }

  // -------------------------------------------------------
  // CREAR MOVIMIENTO + ACTUALIZAR STOCK DEL PRODUCTO
  // -------------------------------------------------------
  // IMPORTANTE: antes este método solo creaba el registro en
  // `movimiento` y nunca tocaba `producto.stock_actual`. Eso
  // causaba que el stock quedara desincronizado (incluso negativo)
  // respecto al historial de movimientos.
  //
  // Ahora todo corre dentro de una transacción: si la actualización
  // de stock falla (ej. producto no existe), el movimiento tampoco
  // se crea — no queremos un movimiento "huérfano" sin su efecto
  // correspondiente en el inventario.
  async create(dto: CreateMovimientoDto) {
    console.log('service - crear movimiento:', JSON.stringify(dto));

    const idProducto = Number(dto.id_producto);
    const idMovimiento = dto.id_m === 'M-E' ? 'M_E' : 'M_S';

    // M_E (entrada) suma al stock, M_S (salida) resta.
    const signo = idMovimiento === 'M_E' ? 1 : -1;
    const delta = signo * dto.Cantidad_m;

    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id_producto: idProducto },
      });

      if (!producto) {
        throw new NotFoundException(
          `No se puede registrar el movimiento: el producto con ID ${idProducto} no existe.`,
        );
      }

      // Evita que una salida deje el stock en negativo por una
      // condición de carrera (ej. doble tap del botón "Sumar/Restar").
      if (idMovimiento === 'M_S' && producto.stock_actual + delta < 0) {
        throw new BadRequestException(
          `No hay suficiente stock de "${producto.nom_producto}" para registrar esta salida. ` +
          `Stock actual: ${producto.stock_actual}, cantidad solicitada: ${dto.Cantidad_m}.`,
        );
      }

      const movimiento = await tx.movimiento.create({
        data: {
          Cantidad_m: dto.Cantidad_m,
          fecha_m: new Date(),
          observaciones: dto.observaciones ?? null,
          id_m: idMovimiento as any,
          id_producto: idProducto,
          id_usuario: String(dto.id_usuario),
          id_material: null,
        },
      });

      const productoActualizado = await tx.producto.update({
        where: { id_producto: idProducto },
        data: {
          stock_actual: { increment: delta },
          ultima_actualiz: new Date(),
        },
      });

      return {
        movimiento,
        stock_actual: productoActualizado.stock_actual,
      };
    });
  }

  // -------------------------------------------------------
  // ACTUALIZAR MOVIMIENTO
  // -------------------------------------------------------
  async update(id: number, dto: UpdateMovimientoDto) {
    console.log('service - actualizar movimiento:', { id, dto });
    return this.prisma.movimiento.update({
      where: { id_movimiento: id },
      data: {
        Cantidad_m: dto.Cantidad_m,
        observaciones: dto.observaciones,
      },
    });
  }

  // -------------------------------------------------------
  // ELIMINAR MOVIMIENTO
  // -------------------------------------------------------
  async remove(id: number) {
    console.log('service - eliminar movimiento:', id);
    return this.prisma.movimiento.delete({
      where: { id_movimiento: id },
    });
  }

  // -------------------------------------------------------
  // RESUMEN GENERAL (total entradas y salidas)
  // -------------------------------------------------------
  async resumenGeneral(desde?: string, hasta?: string) {
    const conditions: string[] = [];
    if (desde) conditions.push(`fecha_m >= '${desde}'`);
    if (hasta) conditions.push(`fecha_m <= DATE_ADD('${hasta}', INTERVAL 1 DAY)`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const results = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        SUM(CASE WHEN id_m = 'M-E' THEN Cantidad_m ELSE 0 END) as totalEntradas,
        SUM(CASE WHEN id_m = 'M-S' THEN Cantidad_m ELSE 0 END) as totalSalidas
      FROM movimiento ${where}
    `);
    return results[0] || { totalEntradas: 0, totalSalidas: 0 };
  }

  // -------------------------------------------------------
  // MOVIMIENTOS POR DÍA
  // -------------------------------------------------------
  async porDia(desde?: string, hasta?: string) {
    const conditions: string[] = [];
    if (desde) conditions.push(`fecha_m >= '${desde}'`);
    if (hasta) conditions.push(`fecha_m <= DATE_ADD('${hasta}', INTERVAL 1 DAY)`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        DATE_FORMAT(fecha_m, '%Y-%m-%d') as fecha,
        SUM(CASE WHEN id_m = 'M-E' THEN Cantidad_m ELSE 0 END) as entradas,
        SUM(CASE WHEN id_m = 'M-S' THEN Cantidad_m ELSE 0 END) as salidas
      FROM movimiento ${where}
      GROUP BY DATE_FORMAT(fecha_m, '%Y-%m-%d')
      ORDER BY fecha
    `);
  }

  // -------------------------------------------------------
  // MOVIMIENTOS POR TIPO (gráfico circular)
  // -------------------------------------------------------
  async porTipo(desde?: string, hasta?: string) {
    const conditions: string[] = [];
    if (desde) conditions.push(`fecha_m >= '${desde}'`);
    if (hasta) conditions.push(`fecha_m <= DATE_ADD('${hasta}', INTERVAL 1 DAY)`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        CASE WHEN id_m = 'M-E' THEN 'Entrada' WHEN id_m = 'M-S' THEN 'Salida' END as tipo,
        COUNT(*) as cantidad,
        SUM(Cantidad_m) as total_unidades
      FROM movimiento ${where}
      GROUP BY id_m
    `);
  }

  // -------------------------------------------------------
  // TOP PRODUCTOS MÁS MOVIDOS
  // -------------------------------------------------------
  async topProductos(desde?: string, hasta?: string, limit = 10) {
    const conditions: string[] = ['p.estado = 1'];
    if (desde) conditions.push(`m.fecha_m >= '${desde}'`);
    if (hasta) conditions.push(`m.fecha_m <= DATE_ADD('${hasta}', INTERVAL 1 DAY)`);
    const where = `WHERE ${conditions.join(' AND ')}`;

    return this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        p.id_producto,
        p.nom_producto as producto,
        p.stock_actual,
        p.stock_minimo,
        COUNT(m.id_movimiento) as total_movimientos,
        SUM(CASE WHEN m.id_m = 'M-E' THEN m.Cantidad_m ELSE 0 END) as entradas,
        SUM(CASE WHEN m.id_m = 'M-S' THEN m.Cantidad_m ELSE 0 END) as salidas
      FROM producto p
      LEFT JOIN movimiento m ON p.id_producto = m.id_producto
      ${where}
      GROUP BY p.id_producto, p.nom_producto, p.stock_actual, p.stock_minimo
      ORDER BY total_movimientos DESC
      LIMIT ${limit}
    `);
  }

  // -------------------------------------------------------
  // RESUMEN MENSUAL (últimos 12 meses)
  // -------------------------------------------------------
  async resumenMensual() {
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT 
        DATE_FORMAT(fecha_m, '%Y-%m') as mes,
        DATE_FORMAT(fecha_m, '%b %Y') as mes_nombre,
        SUM(CASE WHEN id_m = 'M-E' THEN Cantidad_m ELSE 0 END) as entradas,
        SUM(CASE WHEN id_m = 'M-S' THEN Cantidad_m ELSE 0 END) as salidas
      FROM movimiento
      WHERE fecha_m >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha_m, '%Y-%m')
      ORDER BY mes
    `;
    return results.map((r) => ({
      mes: r.mes_nombre,
      entradas: r.entradas,
      salidas: r.salidas,
    }));
  }
}