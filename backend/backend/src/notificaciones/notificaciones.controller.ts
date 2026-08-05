import { Controller, Get, Post, Query, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpCode,  NotFoundException, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException, InternalServerErrorException, HttpStatus, ParseIntPipe,DefaultValuePipe} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { ApiBearerAuth, ApiSecurity, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth('JWT') 
@ApiSecurity('x-api-key')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  // GET /notificaciones
  @Get()
  @ApiOperation({ summary: 'Obtener todas las notificaciones' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones obtenida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })

  findAll(@Query() query: any) {
    console.log('controller - todas las notificaciones:', JSON.stringify(query));
    try {
      return this.notificacionesService.findAll(query);
    } catch (error: any ) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener las notificaciones');
    }
  }

  // GET /notificaciones/count
  @Get('count')
  @ApiOperation({ summary: 'Contar notificaciones'})
  @ApiResponse({ status: 200, description: 'Conteo generado con exito.'})
  @ApiResponse({ status: 500, description: 'Error interno al procesar datos' })

  count(@Query() query: any) {
    console.log('controller - contar notificaciones:', JSON.stringify(query));
    try {
      return this.notificacionesService.count(query);
    }  catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al contar notificaciones');
    }
  }

  // GET /notificaciones/stock-bajo
  @Get('stock-bajo')
  @ApiOperation({ summary: 'Notificaciones de stock bajo' })
  @ApiResponse({ status: 200, description: 'Notificaciones de stock bajo obtenidas exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })

  stockBajo(@Query() query: any) {
    console.log('controller - notificaciones de stock bajo:', JSON.stringify(query));
    try {
      return this.notificacionesService.stockBajo(query);
    }catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener notificaciones de stock bajo');
    }
  }

  // GET /notificaciones/agotados
  @Get('agotados')
  @ApiOperation({ summary: 'Notificaciones de productos agotados' })
  @ApiResponse({ status: 200, description: 'Notificaciones de productos agotados obtenidas exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })

  agotados(@Query() query: any) {
    console.log('controller - notificaciones de productos agotados:', JSON.stringify(query));
    try {
      return this.notificacionesService.agotados(query);
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener notificaciones de productos agotados');
    }
  }

  // GET /notificaciones/pedidos-recientes?dias=7
  @Get('pedidos-recientes') 
  @ApiOperation({ summary: 'Notificaciones de pedidos recientes' })
  @ApiResponse({ status: 200, description: 'Notificaciones de pedidos recientes obtenidas exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })

  pedidosRecientes(@Query('dias', new DefaultValuePipe(7), ParseIntPipe) dias: number,) {
    console.log(`controller - notificaciones de pedidos recientes | días: ${dias}`);
    try {
      return this.notificacionesService.pedidosRecientes(dias);
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener notificaciones de pedidos recientes');
    }
  }

  // GET /notificaciones/estadisticas
  @Get('estadisticas')
  @ApiOperation({ summary: 'Estadísticas de notificaciones' })
  @ApiResponse({ status: 200, description: 'Estadísticas de notificaciones obtenidas exitosamente.' })
  @ApiResponse({ status: 500, description: 'Error interno al obtener los datos.' })
  estadisticas(@Query() query: any) {
    console.log('controller - estadísticas:', JSON.stringify(query));
    try {
      return this.notificacionesService.estadisticas(query);
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener estadísticas de notificaciones');
    }
  }
  // ── Endpoints para notificaciones persistidas (tabla notificacion) ──────────

  // GET /notificaciones/usuario/:id
  @Get('usuario/:id')
  notificacionesPorUsuario(@Param('id') id: string) {
    return this.notificacionesService.notificacionesPorUsuario(id);
  }

  // GET /notificaciones/usuario/:id/count
  @Get('usuario/:id/count')
  async contarNoLeidas(@Param('id') id: string) {
    const count = await this.notificacionesService.contarNoLeidas(id);
    return { count };
  }

  // PATCH /notificaciones/:id/leer?usuario=:id_usuario
  @Patch(':id/leer')
  @HttpCode(HttpStatus.OK)
  marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @Query('usuario') id_usuario: string,
  ) {
    return this.notificacionesService.marcarLeida(id, id_usuario);
  }

  // PATCH /notificaciones/usuario/:id/leer-todas
  @Patch('usuario/:id/leer-todas')
  @HttpCode(HttpStatus.OK)
  marcarTodasLeidas(@Param('id') id: string) {
    return this.notificacionesService.marcarTodasLeidas(id);
  }
} 