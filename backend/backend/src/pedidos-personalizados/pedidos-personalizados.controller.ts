import { Controller, Get, Post, Query, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpCode,  NotFoundException, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException, InternalServerErrorException, HttpStatus, ParseIntPipe, UnprocessableEntityException} from '@nestjs/common';
import { PedidosPersonalizadosService } from './pedidos-personalizados.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiBearerAuth, ApiSecurity, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { EnableCors } from '../auth/decorators/cors.decorator';

@ApiBearerAuth('JWT') 
@ApiSecurity('x-api-key')
@Controller('pedidos-personalizados')
//@EnableCors()


export class PedidosPersonalizadosController {
    constructor(private readonly service: PedidosPersonalizadosService) {}
    
    // GET /pedidos-personalizados/materiales
    @Public()
    @Get('materiales')
    @ApiOperation({ summary: 'Obtener todos los materiales disponibles' })
    @ApiResponse({ status: 200, description: 'Lista de materiales obtenida exitosamente.' })
    @ApiResponse({ status: 500, description: 'Error al consultar materiales.' })

    async getMateriales(@Query() query: any) {
        try {
            return await this.service.getMateriales(query);
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener materiales');
        } 
    }

    // GET /pedidos-personalizados/materiales/:tipo
    @Public()
    @Get('materiales/:tipo')
    @ApiOperation({ summary: 'Obtener materiales por tipo' })
    @ApiResponse({ status: 200, description: 'Materiales obtenidos exitosamente.' })
    @ApiResponse({ status: 500, description: 'Error al consultar materiales por tipo.' })

    async getMaterialesPorTipo(@Param('tipo') tipo: string) {
        try {
            return await this.service.getMaterialesPorTipo(tipo);
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener materiales por tipo');
        }
    }

    // GET /pedidos-personalizados/materiales/:id/colores
    @Public()
    @Get('materiales/:id/colores')
    async getColores(@Param('id') id: string) {
    try {
        return await this.service.getColoresMaterial(+id);
    } catch (error) {
        throw new InternalServerErrorException('Error al obtener colores');
    }
    }

    // GET /pedidos-personalizados/materiales/:id/disenos
    @Public()
    @Get('materiales/:id/disenos')
    async getDisenos(@Param('id') id: string) {
    try {
        return await this.service.getDisenosMaterial(+id);
    } catch (error) {
        throw new InternalServerErrorException('Error al obtener diseños');
    }
    }
    // POST /pedidos-personalizados/materiales
    @Post('materiales')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo material' })
    @ApiResponse({ status: 201, description: 'Material creado exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos de material inválidos.' })
    @ApiResponse({ status: 409, description: 'Conflicto: Ya existe un material con ese nombre.' })
    @ApiResponse({ status: 500, description: 'Error al crear material.' })

    async crearMaterial(@Body() dto: {
        nombre: string;
        tipo: string;
        unidad: string;
        precio_unitario: number;
        stock_actual: number;
        stock_minimo: number;
    }) {
        try {
            return await this.service.crearMaterial(dto);
        } catch (error: any) {
            if (error.code === '23505' || error.code === 11000) {
                throw new ConflictException('Ya existe un material con ese nombre');
            }

            if (
                error instanceof BadRequestException 
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Error al crear material');
        }
    }

    // PATCH /pedidos-personalizados/materiales/:id
    @Patch('materiales/:id')
    @ApiOperation({ summary: 'Actualizar un material existente' })
    @ApiResponse({ status: 200, description: 'Material actualizado exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos de material inválidos.' })
    @ApiResponse({ status: 404, description: 'Material no encontrado.' })
    @ApiResponse({ status: 409, description: 'Conflicto: Ya existe un material con ese nombre.' })
    @ApiResponse({ status: 500, description: 'Error al actualizar material.' })

    async actualizarMaterial(
        @Param('id') id: string,
        @Body() dto: {
            nombre?: string;
            tipo?: string;
            unidad?: string;
            precio_unitario?: number;
            stock_actual?: number;
            stock_minimo?: number;
        }
    ) {
        try {
            const materialActualizado = await this.service.actualizarMaterial(+id, dto);

            if (!materialActualizado) {
                throw new NotFoundException('Material no encontrado');
            }
            return materialActualizado;
        } catch (error: any) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            if (error.code === '23505' || error.code === 11000) {
                throw new ConflictException('Ya existe un material con ese nombre');
            }
            throw new InternalServerErrorException('Error al actualizar material');
        }
    }

    // POST /pedidos-personalizados/materiales/:id/imagen
    @Post('materiales/:id/imagen')
    @UseInterceptors(FileInterceptor('imagen', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const carpeta = './uploads/materiales';
                mkdirSync(carpeta, { recursive: true });
                cb(null, carpeta);
            },
            filename: (req, file, cb) => {
                const nombre = `material-${req.params.id}-${Date.now()}${extname(file.originalname)}`;
                cb(null, nombre);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                return cb(new Error('Solo imagines'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    @ApiOperation({ summary: 'Subir imagen para un material' })
    @ApiResponse({ status: 200, description: 'Imagen subida exitosamente.' })
    @ApiResponse({ status: 400, description: 'Archivo inválido.' })
    @ApiResponse({ status: 404, description: 'Material no encontrado.' })
    @ApiResponse({ status: 500, description: 'Error al subir imagen.' })

    async subirImagenMaterial(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
        throw new BadRequestException('Es necesario subir un archivo de imagen');
    }
        try {
            const materialConImagen = await this.service.actualizarImagenMaterial(+id, file);

            if (!materialConImagen) {
                throw new NotFoundException('Material no encontrado');
            }
            return materialConImagen;
        } catch (error: any) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Error al subir imagen del material');
        }
    }

    // POST /pedidos-personalizados
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo pedido personalizado' })
    @ApiResponse({ status: 201, description: 'Pedido personalizado creado exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos de pedido inválidos.' })
    @ApiResponse({ status: 404, description: 'Material no encontrado.' })
    @ApiResponse({ status: 422, description: 'Stock insuficiente para uno o mas materiales seleccionados.' })
    @ApiResponse({ status: 500, description: 'Error al crear pedido personalizado.' })

    async crearPedido(@Body() dto: {
        id_usuario: string;
        tipo_producto: string;
        tamanio: string;
        metodo_pago: string;
        materiales: { id_material: number; cantidad: number }[];
    }) {
        try {
            return await this.service.crearPedido(dto);
        } catch (error: any) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException 
            ) {
                throw error;
            }
            if (error.message?.includes('Stock') || error.status === 422) {
                throw new UnprocessableEntityException('No hay suficiente stock de los materiales seleccionados.');
            }
            throw new InternalServerErrorException('Error al crear pedido personalizado');
        }
    }

    // GET /pedidos-personalizados (admin y trabajador)
    @Roles('1' as any, '3' as any)
    @Get()
    @ApiOperation({ summary: 'Obtener todos los pedidos personalizados (admin/trabajador)' })
    @ApiResponse({ status: 200, description: 'Lista de pedidos personalizados obtenida exitosamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado - Token no proporcionado.' })
    @ApiResponse({ status: 403, description: 'Prohibido - Permisos insuficiente.' })
    @ApiResponse({ status: 500, description: 'Error al consultar pedidos personalizados.' })

    /*async findAll(@Query() query: any) {
        try {
            return await this.service.findAll(query);
        } catch (error: any ) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error al obtener pedidos personalizados');
        }
    }*/
    // En pedidos-personalizados.controller.ts
    @Get()
    async findAll(@Query() query: any) {
        try {
            return await this.service.findAll(query);
        } catch (error: any) {
            console.error('ERROR findAll personalizados:', error.message, error.stack);  // 👈
            throw new InternalServerErrorException('Error al obtener pedidos personalizados');
        }
    }

    // GET /pedidos-personalizados/usuario/:id
    @Get('usuario/:id_usuario')
    @ApiOperation({ summary: 'Obtener pedidos personalizados de un usuario' })
    @ApiResponse({ status: 200, description: 'Lista de pedidos personalizados del usuario obtenida exitosamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado - Token no proporcionado.' })
    @ApiResponse({ status: 403, description: 'Prohibido - Permisos insuficiente.' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
    @ApiResponse({ status: 500, description: 'Error al consultar pedidos personalizados del usuario.' })

    async findByUsuario(@Param('id_usuario') id_usuario: string) {
        try {
            const pedidos = await this.service.findByUsuario(id_usuario);

            if (!pedidos) {
                throw new NotFoundException('Pedido del usuario no encontrado');
            }
            return pedidos;
        } catch (error: any) {
            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Error al obtener pedidos personalizados del usuario');
        }
    }
}