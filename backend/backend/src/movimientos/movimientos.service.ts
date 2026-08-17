import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { Prisma } from '@prisma/client';

import { CreateMovimientoDto } from './dto/create-movimiento.dto';

import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

import { CreateMovimientoMaterialDto } from './dto/create-movimiento-material.dto';

import { normalizarTipoMovimiento, aTipoMovimientoPrisma } from './tipo-movimiento.util';



@Injectable()

export class MovimientosService {

  constructor(private prisma: PrismaService) {}



  // -------------------------------------------------------

  // VALIDA QUE "DESDE" NO SEA POSTERIOR A "HASTA"

  // -------------------------------------------------------

  private validarRangoFechas(desde?: string, hasta?: string) {

    if (!desde || !hasta) return;

    const fechaDesde = new Date(desde);

    const fechaHasta = new Date(hasta);

    if (isNaN(fechaDesde.getTime())) {

      throw new BadRequestException(`La fecha "Desde" (${desde}) no tiene un formato válido.`);

    }

    if (isNaN(fechaHasta.getTime())) {

      throw new BadRequestException(`La fecha "Hasta" (${hasta}) no tiene un formato válido.`);

    }

    if (fechaDesde > fechaHasta) {

      throw new BadRequestException(

        `La fecha "Desde" (${desde}) no puede ser posterior a la fecha "Hasta" (${hasta}).`,

      );

    }

  }



  private construirFiltroFecha(campo: string, desde?: string, hasta?: string): Prisma.Sql {

    const condiciones: Prisma.Sql[] = [];

    if (desde) condiciones.push(Prisma.sql`${Prisma.raw(campo)} >= ${desde}`);

    if (hasta) condiciones.push(Prisma.sql`${Prisma.raw(campo)} <= DATE_ADD(${hasta}, INTERVAL 1 DAY)`);

    return condiciones.length ? Prisma.sql`WHERE ${Prisma.join(condiciones, ' AND ')}` : Prisma.empty;

  }



  // -------------------------------------------------------

  // OBTENER TODOS LOS MOVIMIENTOS CON INFO COMPLETA

  // -------------------------------------------------------

  async findAll(query: any) {

    console.log('service - todos los movimientos:', JSON.stringify(query));



    const { desde, hasta } = query ?? {};

    this.validarRangoFechas(desde, hasta);

    const where = this.construirFiltroFecha('m.fecha_m', desde, hasta);



    return this.prisma.$queryRaw<any[]>`

      SELECT 

        m.id_movimiento, m.Cantidad_m, m.fecha_m, m.observaciones,

        CASE m.id_m WHEN 'M-E' THEN 'entrada' WHEN 'M-S' THEN 'salida' END AS tipo,

        m.id_m, tm.nom_movimiento AS tipo_movimiento,

        p.nom_producto, p.ruta_imagen,

        u.id_usuario, CONCAT(u.nom_1, ' ', u.ape_1) AS nombre_usuario, r.nombre_rol,

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

      ${where}

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

    const idMovimiento = aTipoMovimientoPrisma(normalizarTipoMovimiento(tipo));

    return this.prisma.movimiento.findMany({

      where: { id_m: idMovimiento as any },

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

  async create(dto: CreateMovimientoDto) {

    console.log('service - crear movimiento:', JSON.stringify(dto));



    const idProducto = Number(dto.id_producto);

    const idMovimiento = aTipoMovimientoPrisma(normalizarTipoMovimiento(dto.id_m));



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

    this.validarRangoFechas(desde, hasta);

    const where = this.construirFiltroFecha('fecha_m', desde, hasta);

    const results = await this.prisma.$queryRaw<any[]>`

      SELECT 

        SUM(CASE WHEN id_m = 'M-E' THEN Cantidad_m ELSE 0 END) as totalEntradas,

        SUM(CASE WHEN id_m = 'M-S' THEN Cantidad_m ELSE 0 END) as totalSalidas

      FROM movimiento ${where}

    `;

    const fila = results[0] ?? {};

    return { totalEntradas: fila.totalEntradas ?? 0, totalSalidas: fila.totalSalidas ?? 0 };

  }



  // -------------------------------------------------------

  // MOVIMIENTOS POR DÍA

  // -------------------------------------------------------

  async porDia(desde?: string, hasta?: string) {

    this.validarRangoFechas(desde, hasta);

    const where = this.construirFiltroFecha('fecha_m', desde, hasta);

    return this.prisma.$queryRaw<any[]>`

      SELECT 

        DATE_FORMAT(fecha_m, '%Y-%m-%d') as fecha,

        SUM(CASE WHEN id_m = 'M-E' THEN Cantidad_m ELSE 0 END) as entradas,

        SUM(CASE WHEN id_m = 'M-S' THEN Cantidad_m ELSE 0 END) as salidas

      FROM movimiento ${where}

      GROUP BY DATE_FORMAT(fecha_m, '%Y-%m-%d')

      ORDER BY fecha

    `;

  }



  // -------------------------------------------------------

  // MOVIMIENTOS POR TIPO (gráfico circular)

  // -------------------------------------------------------

  async porTipo(desde?: string, hasta?: string) {

    this.validarRangoFechas(desde, hasta);

    const where = this.construirFiltroFecha('fecha_m', desde, hasta);

    return this.prisma.$queryRaw<any[]>`

      SELECT 

        CASE WHEN id_m = 'M-E' THEN 'Entrada' WHEN id_m = 'M-S' THEN 'Salida' END as tipo,

        COUNT(*) as cantidad, SUM(Cantidad_m) as total_unidades

      FROM movimiento ${where}

      GROUP BY id_m

    `;

  }



  // -------------------------------------------------------

  // TOP PRODUCTOS MÁS MOVIDOS

  // -------------------------------------------------------

  async topProductos(desde?: string, hasta?: string, limit = 10) {

    this.validarRangoFechas(desde, hasta);

    const condiciones: Prisma.Sql[] = [Prisma.sql`p.estado = 1`];

    if (desde) condiciones.push(Prisma.sql`m.fecha_m >= ${desde}`);

    if (hasta) condiciones.push(Prisma.sql`m.fecha_m <= DATE_ADD(${hasta}, INTERVAL 1 DAY)`);

    const where = Prisma.sql`WHERE ${Prisma.join(condiciones, ' AND ')}`;



    return this.prisma.$queryRaw<any[]>`

      SELECT 

        p.id_producto, p.nom_producto as producto, p.stock_actual, p.stock_minimo,

        COUNT(m.id_movimiento) as total_movimientos,

        SUM(CASE WHEN m.id_m = 'M-E' THEN m.Cantidad_m ELSE 0 END) as entradas,

        SUM(CASE WHEN m.id_m = 'M-S' THEN m.Cantidad_m ELSE 0 END) as salidas

      FROM producto p

      LEFT JOIN movimiento m ON p.id_producto = m.id_producto

      ${where}

      GROUP BY p.id_producto, p.nom_producto, p.stock_actual, p.stock_minimo

      ORDER BY total_movimientos DESC

      LIMIT ${limit}

    `;

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



  // =========================================================

  // MOVIMIENTOS DE MATERIAL (fusionado aquí desde el módulo

  // movimientos-material — misma clase, mismo controller, para

  // no duplicar módulos por algo tan chico)

  // =========================================================



  // -------------------------------------------------------

  // OBTENER TODOS LOS MOVIMIENTOS DE MATERIAL CON INFO COMPLETA

  // -------------------------------------------------------

  async findAllMaterial(query: any) {

    const { desde, hasta } = query ?? {};

    this.validarRangoFechas(desde, hasta);

    const where = this.construirFiltroFecha('mm.fecha_m', desde, hasta);



    return this.prisma.$queryRaw<any[]>`

      SELECT

        mm.id_movimiento_material, mm.cantidad_m, mm.fecha_m, mm.observaciones,

        CASE mm.id_m WHEN 'M-E' THEN 'entrada' WHEN 'M-S' THEN 'salida' END AS tipo,

        mm.id_m, tm.nom_movimiento AS tipo_movimiento,

        m.id_material, m.nombre AS nom_material, m.tipo AS tipo_material, m.unidad, m.ruta_imagen,

        u.id_usuario, CONCAT(u.nom_1, ' ', u.ape_1) AS nombre_usuario, r.nombre_rol

      FROM movimiento_material mm

      JOIN tipo_movimiento tm ON mm.id_m = tm.id_m

      JOIN material m ON mm.id_material = m.id_material

      JOIN usuario u ON mm.id_usuario = u.id_usuario

      JOIN rol_usuario r ON u.id_rol_usuario = r.id_rol_usuario

      ${where}

      ORDER BY mm.fecha_m DESC

    `;

  }



  // -------------------------------------------------------

  // CREAR MOVIMIENTO DE MATERIAL + ACTUALIZAR STOCK DEL MATERIAL

  // -------------------------------------------------------

  async createMaterial(dto: CreateMovimientoMaterialDto) {

    const idMaterial = Number(dto.id_material);

    const tipo = normalizarTipoMovimiento(dto.id_m); // 'M-E' | 'M-S'

    const signo = tipo === 'M-E' ? 1 : -1;

    const delta = signo * dto.cantidad_m;



    return this.prisma.$transaction(async (tx) => {

      const filas = await tx.$queryRaw<any[]>`

        SELECT id_material, nombre, stock_actual, unidad

        FROM material

        WHERE id_material = ${idMaterial}

        FOR UPDATE

      `;

      const material = filas[0];



      if (!material) {

        throw new NotFoundException(

          `No se puede registrar el movimiento: el material con ID ${idMaterial} no existe.`,

        );

      }



      if (tipo === 'M-S' && Number(material.stock_actual) + delta < 0) {

        throw new BadRequestException(

          `No hay suficiente stock de "${material.nombre}" para registrar esta salida. ` +

          `Stock actual: ${material.stock_actual} ${material.unidad}, cantidad solicitada: ${dto.cantidad_m} ${material.unidad}.`,

        );

      }



      await tx.$executeRaw`

        INSERT INTO movimiento_material (cantidad_m, fecha_m, observaciones, id_m, id_material, id_usuario)

        VALUES (${dto.cantidad_m}, NOW(), ${dto.observaciones ?? null}, ${tipo}, ${idMaterial}, ${String(dto.id_usuario)})

      `;



      await tx.$executeRaw`

        UPDATE material SET stock_actual = stock_actual + ${delta} WHERE id_material = ${idMaterial}

      `;



      const actualizado = await tx.$queryRaw<any[]>`

        SELECT stock_actual FROM material WHERE id_material = ${idMaterial}

      `;



      return {

        mensaje: 'Movimiento de material registrado exitosamente.',

        stock_actual: actualizado[0].stock_actual,

      };

    });

  }

}