import { Controller, Get, Post, Query, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpCode,  NotFoundException, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException, InternalServerErrorException, HttpStatus, ParseIntPipe, UnprocessableEntityException } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ApiBearerAuth, ApiSecurity, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/enums/roles.enum';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';

@ApiBearerAuth('JWT') 
@ApiSecurity('x-api-key')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // POST /productos
  @Post()
  @Roles(RolesEnum.ADMIN, RolesEnum.TRABAJADOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos del producto inválidos.' })
  @ApiResponse({ status: 409, description: 'Ya existe un producto con este codigo o nombre.' })

  async create(@Body() dto: CreateProductoDto) {
    try {
      return await this.productosService.create(dto);
    } catch (error: any) {
      if (error.code === '23505' || error.code === 'P2002') throw new ConflictException('El producto ya existe.');
      throw new InternalServerErrorException('Error al crear el producto.');
    }
  }

  // GET /productos
  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener una lista de productos' })
  @ApiResponse({ status: 200, description: 'Catalogo de productos obtenida exitosamente.' })

  async findAll(@Query() query: any) {
    try {
      return await this.productosService.findAll(query);
    } catch (error: any) {
      throw new InternalServerErrorException('Error al obtener el catalogo de productos.');
    }
  }

  // GET /productos/check/:id 
  @Get('check/:id')
  @ApiOperation({ summary: 'Verificar si un producto existe' })
  @ApiResponse({ status: 200, description: 'Producto existe.' })
  @ApiResponse({ status: 400, description: 'ID del producto inválido.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error al verificar el producto.' })

  async checkProducto(@Param('id') id: string) {
    try {
      const existe = await this.productosService.checkProducto(+id);

      if (!existe) {
        throw new NotFoundException('Producto no encontrado.');
      }
      return existe;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al verificar el producto.');
    }
  }

  // GET /productos/:id
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto obtenido exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID del producto inválido.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error al obtener el producto.' })

  async findOne(@Param('id') id: string) {
    try {
      const producto = await this.productosService.findOne(+id);

      if (!producto) {
        throw new NotFoundException('Producto no encontrado.');
      }
      return producto;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el producto.');
    }
  }

  // PATCH /productos/:id
  @Patch(':id')
  @Roles(RolesEnum.ADMIN, RolesEnum.TRABAJADOR)
  @ApiOperation({ summary: 'Actualizar un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID del producto o datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @ApiResponse({ status: 409, description: 'Ya existe un producto con este codigo o nombre.' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el producto.' })

  async update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    try {
      const productoActualizado = await this.productosService.update(+id, dto);

      if (!productoActualizado) {
        throw new NotFoundException('Producto no encontrado.');
      }
      return productoActualizado;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === '23505' || error.code === 'P2002') {
        throw new ConflictException('Ya existe un producto con este codigo o nombre.');
      }
      throw new InternalServerErrorException('Error al actualizar el producto.'); 
    }
  }

  // DELETE /productos/:id
  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Eliminar producto del sistema' })
  @ApiResponse({ status: 200, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es un número válido.' })
  @ApiResponse({ status: 403, description: 'Prohibido - Solo el Administrador puede borrar productos.' })
  @ApiResponse({ status: 404, description: 'El producto que intentas eliminar no existe.' })
  @ApiResponse({ status: 409, description: 'Conflicto - No se puede eliminar porque el producto tiene historial de ventas.' })
  @ApiResponse({ status: 500, description: 'Error interno al intentar eliminar el producto.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const resultado = await this.productosService.remove(id);

      if (!resultado) {
        throw new NotFoundException(`No se encontró el producto con ID ${id} para eliminar`);
      }

      return {
        message: `Producto con ID ${id} eliminado correctamente`,
        id: id
      };
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error.code === '23503') {
        throw new ConflictException(
          'No se puede eliminar el producto porque está asociado a pedidos existentes. Considera desactivarlo en su lugar.'
        );
      }

      throw new InternalServerErrorException('Ocurrió un error inesperado al eliminar el producto');
    }
  }

  // POST /productos/:id/imagen
  @Post(':id/imagen')
  @UseInterceptors(FileInterceptor('imagen_producto', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/productos';
        mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        // Generamos un nombre único para evitar sobreescritura
        const nombreUnico = `${req.params.id}-${Date.now()}${extname(file.originalname)}`;
        cb(null, nombreUnico);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Formato de archivo no permitido. Use jpg, jpeg, png o webp'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: 'Subir o actualizar la imagen de un producto' })
  @ApiResponse({ status: 200, description: 'Imagen actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'Archivo inválido o el campo "imagen_producto" no fue encontrado.' })
  @ApiResponse({ status: 404, description: 'El producto no existe.' })
  @ApiResponse({ status: 500, description: 'Error interno al procesar o guardar la imagen.' })
  async subirImagen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar una imagen válida en el campo "imagen_producto"');
    }

    try {
      const productoActualizado = await this.productosService.actualizarImagen(id, file);

      if (!productoActualizado) {
        throw new NotFoundException(`No se encontró el producto con ID ${id} para asociar la imagen`);
      }

      return productoActualizado;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al intentar actualizar la imagen en la base de datos');
    }
  }
}