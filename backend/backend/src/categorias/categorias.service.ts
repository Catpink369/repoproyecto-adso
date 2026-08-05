import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  findAll(query: any) {// se escribe el queri del controller para que se ejecute la lógica de negocio en el servicio y se retorne la respuesta al cliente
    console.log('Servise - todas las categorias', JSON.stringify(query));//se imprime el objeto query en la consola para verificar su contenido
    return this.prisma.categoria.findMany({
      select: {
        id_categoria: true,
        nombre_c: true,
      },
    });
  }

  findAllClasificaciones(query: any) {
    console.log('Service - todas las clasificaciones', JSON.stringify(query));
    return this.prisma.clasificacion.findMany({
      select: {
        id_clasificacion: true,
        nombre_clas: true,
      },
    });
  }
}