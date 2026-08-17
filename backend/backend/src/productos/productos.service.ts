import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  // --------------------------------------------------------
  // MÉTODO AUXILIAR PARA OBTENER TAMAÑO (Evita fallos por Unicode / 'ñ')
  // --------------------------------------------------------
  private _obtenerTamaño(dto: any): string | null {
    if (!dto) return null;
    const key = Object.keys(dto).find((k) => k.startsWith('tama'));
    return key && dto[key] !== undefined && dto[key] !== null ? dto[key] : null;
  }

  // --------------------------------------------------------
  // OBTENER TODOS LOS PRODUCTOS ACTIVOS
  // --------------------------------------------------------
  async findAll(query: any) {
    const productos = await this.prisma.producto.findMany({
      where: { estado: true },
      include: {
        categoria: { select: { nombre_c: true } },
        clasificacion: { select: { nombre_clas: true } },
      },
    });

    return productos.map((p) => this._aplanarProducto(p));
  }

  // --------------------------------------------------------
  // OBTENER UN PRODUCTO POR ID
  // --------------------------------------------------------
  async findOne(id: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id_producto: id, estado: true },
      include: {
        categoria: { select: { nombre_c: true } },
        clasificacion: { select: { nombre_clas: true } },
      },
    });

    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado`);
    return this._aplanarProducto(producto);
  }

  // --------------------------------------------------------
  // Aplana nombre_c y nombre_clas al nivel raíz del producto
  // --------------------------------------------------------
  private _aplanarProducto(p: any) {
    return {
      ...p,
      nombre_c: p.categoria?.nombre_c ?? null,
      nombre_clas: p.clasificacion?.nombre_clas ?? null,
      tamaño: p.tama_o ?? null, // Expone 'tamaño' estándar para React
    };
  }

  // --------------------------------------------------------
  // CREAR PRODUCTO
  // --------------------------------------------------------
  async create(dto: CreateProductoDto) {
    console.log('service - crear producto:', JSON.stringify(dto));

    const valorTamaño = this._obtenerTamaño(dto);

    return this.prisma.producto.create({
      data: {
        nom_producto: dto.nom_producto,
        precio_unitario: dto.precio_unitario,
        stock_actual: dto.stock_actual,
        stock_minimo: dto.stock_minimo,
        ultima_actualiz: new Date(),
        color: dto.color ?? null,
        talla: dto.talla ?? null,
        tama_o: valorTamaño,
        descripcion: dto.descripcion,
        id_categoria: dto.id_categoria,
        id_clasificacion: dto.id_clasificacion ?? 1,
        ruta_imagen: dto.ruta_imagen ?? null,
        estado: dto.estado ?? true,
      },
    });
  }

  // --------------------------------------------------------
  // ACTUALIZAR PRODUCTO
  // --------------------------------------------------------
  async update(id: number, dto: UpdateProductoDto) {
    console.log('service - actualizar producto:', { id, dto });

    // Verifica que el producto existe, lanza 404 si no
    await this.findOne(id);

    const data: any = {};

    if (dto.nom_producto !== undefined)     data.nom_producto = dto.nom_producto;
    if (dto.precio_unitario !== undefined)  data.precio_unitario = dto.precio_unitario;
    if (dto.stock_minimo !== undefined)     data.stock_minimo = dto.stock_minimo;
    if (dto.color !== undefined)            data.color = dto.color;
    if (dto.talla !== undefined)            data.talla = dto.talla;
    if (dto.descripcion !== undefined)      data.descripcion = dto.descripcion;
    if (dto.id_categoria !== undefined)     data.id_categoria = dto.id_categoria;
    if (dto.id_clasificacion !== undefined) data.id_clasificacion = dto.id_clasificacion;
    if (dto.ruta_imagen !== undefined)      data.ruta_imagen = dto.ruta_imagen;
    if (dto.estado !== undefined)           data.estado = dto.estado;

    const valorTamaño = this._obtenerTamaño(dto);
    if (valorTamaño !== null && valorTamaño !== undefined) {
      data.tama_o = valorTamaño;
    }

    // Siempre actualizamos la fecha
    data.ultima_actualiz = new Date();

    const actualizado = await this.prisma.producto.update({
      where: { id_producto: id },
      data,
    });

    return {
      statusCode: 200,
      message: `Producto ${id} actualizado exitosamente`,
      data: actualizado,
    };
  }

  // --------------------------------------------------------
  // ELIMINAR (estado = false)
  // --------------------------------------------------------
  async remove(id: number) {
    console.log('service - eliminar producto:', JSON.stringify({ id }));
    await this.findOne(id);

    await this.prisma.producto.update({
      where: { id_producto: id },
      data: {
        estado: false,
        ultima_actualiz: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: `Producto ${id} eliminado exitosamente`,
    };
  }

  // --------------------------------------------------------
  // VERIFICAR SI UN PRODUCTO EXISTE Y TIENE STOCK
  // --------------------------------------------------------
  async checkProducto(id: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id_producto: id, estado: true },
      select: {
        id_producto: true,
        nom_producto: true,
        stock_actual: true,
        precio_unitario: true,
      },
    });

    if (!producto) return { found: false, message: 'Producto no encontrado' };
    return { found: true, product: producto };
  }

  // --------------------------------------------------------
  // ACTUALIZAR IMAGEN DE PRODUCTO
  // --------------------------------------------------------
  async actualizarImagen(id: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    await this.findOne(id); // verifica que existe, lanza 404 si no

    const ruta_imagen = `/uploads/productos/${file.filename}`;

    await this.prisma.producto.update({
      where: { id_producto: id },
      data: {
        ruta_imagen,
        ultima_actualiz: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: 'Imagen actualizada exitosamente',
      ruta_imagen,
    };
  }
}