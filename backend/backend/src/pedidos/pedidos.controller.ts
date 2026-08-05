import { Controller, Get, Post, Query, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpCode,  NotFoundException, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException, InternalServerErrorException, HttpStatus, ParseIntPipe} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { ApiBearerAuth, ApiSecurity, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles as RolesDecorator } from '../auth/decorators/roles.decorator';
import { Roles } from '../auth/enums/roles.enum';
import { EnableCors } from '../auth/decorators/cors.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT') 
@ApiSecurity('x-api-key')
@Controller('pedidos')
//@EnableCors()


export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post('crear')
  @RolesDecorator(Roles.ADMIN, Roles.TRABAJADOR, Roles.USUARIO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos (cantidades negativas, IDs inexistentes, campos vacíos).' })
  @ApiResponse({ status: 401, description: 'No autorizado - Falta el token de acceso.' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tienes los roles necesarios.' })
  @ApiResponse({ status: 409, description: 'Conflicto - El número de pedido o transacción ya existe.' })
  @ApiResponse({ status: 500, description: 'Error interno al procesar el pedido en el servidor.' })

  async create(@Body() dto: CreatePedidoDto) {
    console.log('controller - Crear pedido:', JSON.stringify(dto));
    try {
      return await this.pedidosService.create(dto);
    } catch (error: any) {
      // ← AGREGA ESTAS LÍNEAS
      console.error('ERROR COMPLETO:', JSON.stringify({
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack?.split('\n').slice(0, 5),
      }));
      
      if (error.code === '23505' || error.code === 11000) {
        throw new ConflictException('Este numero de pedido ya ha sido registrado.');
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al procesar el pedido.');
    }
  }

  @Get()
  @RolesDecorator(Roles.ADMIN, Roles.TRABAJADOR)
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  @ApiResponse({ status: 200, description: 'Pedidos obtenidos exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida - Parámetros de consulta incorrectos.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token faltante o expirado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tienes los permisos necesarios.' })
  @ApiResponse({ status: 500, description: 'Error interno al obtener los pedidos.' })

  async findAll(@Query() query: any) {
    try {
      return await this.pedidosService.findAll(query);
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener los pedidos.');
    }
  }

  @Get('usuario/:id_usuario')
  @RolesDecorator(Roles.ADMIN, Roles.TRABAJADOR, Roles.USUARIO)
  @ApiOperation({ summary: 'Obtener pedidos por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Pedidos obtenidos exitosamente para el usuario.' })
  @ApiResponse({ status: 400, description: 'ID de usuario inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token faltante o expirado.' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tienes los permisos necesarios.' })
  @ApiResponse({ status: 404, description: 'No se encontraron pedidos para el usuario.' })
  @ApiResponse({ status: 500, description: 'Error interno al obtener los pedidos del usuario.' })

  async findByUsuario(@Param('id_usuario') id_usuario: string) {
    try {
      const pedidos = await this.pedidosService.findByUsuario(id_usuario);

      if (!pedidos) {
        throw new NotFoundException(`No se encontraron pedidos para el usuario con ID ${id_usuario}.`);
      }
      return pedidos;
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener los pedidos del usuario.');
    }
  }

  @Get('detalle/:id_pedido')
  @RolesDecorator(Roles.ADMIN, Roles.TRABAJADOR, Roles.USUARIO)
  @ApiOperation({ summary: 'Obtener detalles de un pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido obtenido exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID de pedido inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Falta el token de acceso.' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tienes los permisos suficientes.' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado por ID.' })
  @ApiResponse({ status: 500, description: 'Error interno al obtener el pedido.' })

  async findOne(@Param('id_pedido', ParseIntPipe) id_pedido: number) {
    try {
      const pedido = await this.pedidosService.findOne(id_pedido);

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado.`);
      }
      return pedido;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener el pedido.');  
    }
  }

  @Patch(':id_pedido')
  @RolesDecorator(Roles.ADMIN, Roles.TRABAJADOR, Roles.USUARIO)
  @ApiOperation({ summary: 'Actualizar un pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID de pedido inválido o datos de actualización incorrectos.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Falta el token de acceso.' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tienes los permisos necesarios.' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado por ID.' })
  @ApiResponse({ status: 500, description: 'Error interno al actualizar el pedido.' })

  async update(@Param('id_pedido', ParseIntPipe) id_pedido: number, @Body() dto: UpdatePedidoDto) {
    try {
      const pedidoActualizado = await this.pedidosService.update(id_pedido, dto);

      if (!pedidoActualizado) {
        throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado para actualizar.`);
      }
      return pedidoActualizado;
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al actualizar el pedido.');
    }
  }

  @Delete(':id_pedido')
  @RolesDecorator(Roles.ADMIN)
  @ApiOperation({ summary: 'Eliminar un pedido (Solo Administradores' })
  @ApiResponse({ status: 200, description: 'Pedido eliminado exitosamente.' })
  @ApiResponse({ status: 400, description: 'ID de pedido inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Falta el token de acceso.' })
  @ApiResponse({ status: 403, description: 'Prohibido - No tienes los permisos necesarios (Solo Administrador permitido).' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado por ID.' })
  @ApiResponse({ status: 409, description: 'Conflicto - No se puede eliminar el pedido debido a dependencias o estado actual.' })
  @ApiResponse({ status: 500, description: 'Error interno al eliminar el pedido.' })

  async remove(@Param('id_pedido', ParseIntPipe) id_pedido: number) {
    try {
      const pedidoEliminado = await this.pedidosService.remove(id_pedido);

      if (!pedidoEliminado) {
        throw new NotFoundException(`Pedido con ID ${id_pedido} no encontrado para eliminar.`);
      }
      return {
        message: `Pedido con ID ${id_pedido} eliminado correctamente.`,
        id: id_pedido,
      };
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException 
      ) {
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException('No se puede eliminar el pedido debido a dependencias o estado actual.');
      }
      throw new InternalServerErrorException('Error interno al eliminar el pedido.');
    }
  }
}