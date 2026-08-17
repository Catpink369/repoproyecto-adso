import {

  Controller, Get, Post, Query, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpCode,

  NotFoundException, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException,

  InternalServerErrorException, HttpStatus, ParseIntPipe, DefaultValuePipe,

} from '@nestjs/common';

import { MovimientosService } from './movimientos.service';

import { CreateMovimientoDto } from './dto/create-movimiento.dto';

import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

import { CreateMovimientoMaterialDto } from './dto/create-movimiento-material.dto';

import { ApiBearerAuth, ApiSecurity, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { EnableCors } from '../auth/decorators/cors.decorator';



// Pipe reutilizable para el parámetro :id — reemplaza el mensaje genérico de

// ParseIntPipe ("Validation failed (numeric string is expected)") por uno

// que dice exactamente qué se esperaba y qué se recibió.

const parseIdPipe = new ParseIntPipe({

  exceptionFactory: () =>

    new BadRequestException('El ID del movimiento debe ser un número entero válido (ej. /movimientos/12).'),

});



@ApiBearerAuth('JWT')

@ApiSecurity('x-api-key')

@Controller('movimientos')

//@EnableCors()





export class MovimientosController {

  constructor(private readonly movimientosService: MovimientosService) {}



  // GET /movimientos

  @Get()

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener lista de moviminetos'})

  @ApiResponse({ status: 200, description: 'Lista de moviminetos obtenida exitosamente.'})

  @ApiResponse({ status: 401, description: 'No autorizado - Token faltante.'})

  @ApiResponse({ status: 403, description: 'Prohibido - No tienes permisos necesarios.' })

  @ApiResponse({ status: 500, description: 'Error interno al consultar la lista de movimientos.'})



  async findAll(@Query() query: any) {

    try {

      return await this.movimientosService.findAll(query);

    } catch (error: any) {

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException(

        `Error interno al obtener la lista de movimientos: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // GET /movimientos/resumen-general?desde=&hasta=

  @Get('resumen-general')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener resumen general'})

  @ApiResponse({ status: 200, description: 'Resumen general obtenido exitosamente.'})

  @ApiResponse({ status: 400, description: 'Datos invalidos.'})

  @ApiResponse({ status: 403, description: 'No tienes los permisos necesarios.'})

  @ApiResponse({ status: 500, description: 'Error interno al obtener el resumen general.'})



  async resumenGeneral(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {

    try {

      return await this.movimientosService.resumenGeneral(desde, hasta);

    } catch (error: any) {

      if (error instanceof BadRequestException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al obtener el resumen general: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // GET /movimientos/por-dia?desde=&hasta=

  @Get('por-dia')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener movimientos por día.'})

  @ApiResponse({ status: 200, description: 'Movimientos por día obtenidos exitosamente.'})

  @ApiResponse({ status: 400, description: 'Datos invalidos.'})

  @ApiResponse({ status: 500, description: 'Error interno al obtener los movimientos por día. '})



  async porDia(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {

    try {

      return await this.movimientosService.porDia(desde, hasta);

    } catch (error: any) {

      if (error instanceof BadRequestException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al obtener los movimientos por día: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // GET /movimientos/por-tipo?desde=&hasta=

  @Get('por-tipo')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener movimientos por tipo.'})

  @ApiResponse({ status: 200, description: 'Movimientos por tipo obtenidos exitosamente.'})

  @ApiResponse({ status: 400, description: 'Datos invalidos.'})

  @ApiResponse({ status: 500, description: 'Error interno al obtener movimientos por tipo.'})



  async porTipo(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {

    try {

      return await this.movimientosService.porTipo(desde, hasta);

    } catch (error: any) {

      if (error instanceof BadRequestException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al obtener los movimientos por tipo: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // GET /movimientos/top-productos?desde=&hasta=&limit=

  @Get('top-productos')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener TOP productos mas vendidos.'})

  @ApiResponse({ status: 200, description: 'TOP productos mas vendidos obtenidos exitosamente.'})

  @ApiResponse({ status: 400, description: 'Datos invalidos.'})

  @ApiResponse({ status: 500, description: 'Error interno al obtener el TOP productos mas vendidos.'})



  async topProductos(

    @Query('desde') desde?: string,

    @Query('hasta') hasta?: string,

    @Query('limit') limit?: string,

  ) {

    try {

      const parsedLimit = limit ? parseInt(limit, 10) : 10;



      if (limit && isNaN(parsedLimit)) {

        throw new BadRequestException(

          `El parámetro "limit" debe ser un número entero válido. Se recibió: "${limit}".`,

        );

      }

      return await this.movimientosService.topProductos(desde, hasta, limit ? parsedLimit : 10);

    } catch (error: any) {

      if (error instanceof BadRequestException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al obtener el TOP productos mas vendidos: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // GET /movimientos/resumen-mensual

  @Get('resumen-mensual')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener resumen mensual.'})

  @ApiResponse({ status: 200, description: 'Resumen mensual obtenido exitosamente.'})

  @ApiResponse({ status: 403, description: 'Prihibido - No tienes permisos necesarios.'})

  @ApiResponse({ status: 500, description: 'Error interno al obtener el resumen mensual.'})



  async resumenMensual() {

    try {

      const resumen = await this.movimientosService.resumenMensual();



      if (!resumen) {

        throw new NotFoundException('No se encontraron movimientos para generar el resumen mensual.');

      }

      return resumen;

    } catch (error: any) {

      if (error instanceof NotFoundException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al obtener el resumen mensual: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // ==========================================================

  // MOVIMIENTOS DE MATERIAL (fusionado aquí — mismo controller

  // que movimientos de producto). Van ANTES de las rutas

  // dinámicas ('tipo/:tipo', ':id') a propósito: si quedaran

  // después, '/movimientos/material' matchearía primero contra

  // ':id' (ParseIntPipe fallaría con "material" no es un

  // número) en vez de contra esta ruta literal.

  // ==========================================================



  // GET /movimientos/material?desde=&hasta=

  @Get('material')

  @ApiOperation({ summary: 'Obtener historial de movimientos de material' })

  @ApiResponse({ status: 200, description: 'Historial de movimientos de material obtenido exitosamente.' })

  @ApiResponse({ status: 400, description: 'Rango de fechas inválido.' })

  @ApiResponse({ status: 500, description: 'Error interno al consultar los movimientos de material.' })

  async findAllMaterial(@Query() query: any) {

    try {

      return await this.movimientosService.findAllMaterial(query);

    } catch (error: any) {

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException(

        `Error interno al obtener el historial de movimientos de material: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // POST /movimientos/material

  @Post('material')

  @HttpCode(HttpStatus.CREATED)

  @ApiOperation({ summary: 'Registrar un movimiento (entrada/salida) de material.' })

  @ApiResponse({ status: 201, description: 'Movimiento de material registrado exitosamente y stock actualizado.' })

  @ApiResponse({ status: 400, description: 'Datos inválidos, o stock insuficiente para la salida solicitada.' })

  @ApiResponse({ status: 404, description: 'El material asociado al movimiento no existe.' })

  @ApiResponse({ status: 500, description: 'Error interno al registrar el nuevo movimiento de material.' })

  async createMaterial(@Body() dto: CreateMovimientoMaterialDto) {

    try {

      return await this.movimientosService.createMaterial(dto);

    } catch (error: any) {

      if (error instanceof BadRequestException || error instanceof NotFoundException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al registrar el nuevo movimiento de material: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // GET /movimientos/tipo/:tipo

  @Get('tipo/:tipo')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener movimientos por tipo.'})

  @ApiResponse({ status: 200, description: 'Movimientos por tipo obtenidos exitosamente.'})

  @ApiResponse({ status: 400, description: 'Datos invalidos.'})

  @ApiResponse({ status: 404, description: 'No se encontraron movimientos para el tipo especificado.'})

  @ApiResponse({ status: 500, description: 'Error interno al obtener los movimientos por tipo.'})



  async findByTipo(@Param('tipo') tipo: string) {

    try {

      const movimientos = await this.movimientosService.findByTipo(tipo);



      if (!movimientos || movimientos.length === 0) {

        throw new NotFoundException(

          `No se encontraron movimientos para el tipo "${tipo}". Verifica que sea "M-E" (entrada) o "M-S" (salida).`,

        );

      }

      return movimientos;

    } catch (error: any) {

      // FIX: antes este catch solo relanzaba NotFoundException; cualquier

      // BadRequestException lanzada por el servicio (ej. tipo inválido)

      // caía siempre en el InternalServerErrorException genérico de abajo,

      // devolviendo un 500 en vez de un 400 con el motivo real.

      if (error instanceof NotFoundException || error instanceof BadRequestException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al obtener los movimientos por tipo: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // GET /movimientos/:id

  @Get(':id')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Obtener movimiento por ID.'})

  @ApiResponse({ status: 200, description: 'Movimiento obtenido exitosamente.'})

  @ApiResponse({ status: 400, description: 'ID invalido.'})

  @ApiResponse({ status: 404, description: 'No se encontró un movimiento con el ID especificado.'})

  @ApiResponse({ status: 500, description: 'Error interno al obtener el movimiento por ID.'})



  async findOne(@Param('id', parseIdPipe) id: number) {

    try {

      const movimiento = await this.movimientosService.findOne(id);



      if (!movimiento) {

        throw new NotFoundException(`No se encontró un movimiento con el ID: ${id}`);

      }

      return movimiento;

    } catch (error: any ) {

      if (error instanceof NotFoundException || error instanceof BadRequestException) {

        throw error;

      }

      throw new InternalServerErrorException(

        `Error interno al obtener el movimiento por ID: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // POST /movimientos

/*  @Post()

  create(@Body() createMovimientoDto: CreateMovimientoDto) {

    return this.movimientosService.create(createMovimientoDto);

  }*/

  @Post() 

  @HttpCode(HttpStatus.CREATED)

  @ApiOperation({ summary: 'Registrar un nuevo movimiento.' })

  @ApiResponse({ status: 201, description: 'Movimiento registrado exitosamente y stock actualizado.' })

  @ApiResponse({ status: 400, description: 'Datos invalidos (ver mensaje de detalle por campo).' })

  @ApiResponse({ status: 404, description: 'El producto asociado al movimiento no existe.' })

  @ApiResponse({ status: 500, description: 'Error interno al registrar el nuevo movimiento.' })



  async create(@Body() createMovimientoDto: CreateMovimientoDto) {

    try {

      return await this.movimientosService.create(createMovimientoDto);

    } catch (error: any) {

      if (error instanceof BadRequestException) {

        throw error;

      }

      if (error instanceof NotFoundException) {

        throw error;

      }

      if (error.code === '23503') {

        throw new NotFoundException('No se puede crear el movimiento: El producto no existe.');

      }

      throw new InternalServerErrorException(

        `Error interno al registrar el nuevo movimiento: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  } 



  // PATCH /movimientos/:id

  @Patch(':id')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Actualizar un movimiento existente.' })

  @ApiResponse({ status: 200, description: 'Movimiento actualizado exitosamente.' })

  @ApiResponse({ status: 400, description: 'Datos invalidos (ver mensaje de detalle por campo).' })

  @ApiResponse({ status: 403, description: 'Prohibido - No tienes permisos suficientes.' })

  @ApiResponse({ status: 404, description: 'No se encontró un movimiento.' })

  @ApiResponse({ status: 500, description: 'Error interno al actualizar el movimiento.' })



  async update(@Param('id', parseIdPipe) id: number, @Body() updateMovimientoDto: UpdateMovimientoDto) {

    try {

      const movimientosActualizado = await this.movimientosService.update(id, updateMovimientoDto);



      if (!movimientosActualizado) {

        throw new NotFoundException(`No se encontró un movimiento con el ID: ${id}`);

      }

      return movimientosActualizado;

    } catch (error: any) {

      if (error instanceof NotFoundException || error instanceof BadRequestException) {

        throw error;

      }

      if (error.code === 'P2025') {

        throw new NotFoundException(`No se encontró un movimiento con el ID: ${id}`);

      }

      throw new InternalServerErrorException(

        `Error interno al actualizar el movimiento: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }



  // DELETE /movimientos/:id

  @Delete(':id')

  @HttpCode(HttpStatus.OK)

  @ApiOperation({ summary: 'Eliminar un movimiento por ID.' })

  @ApiResponse({ status: 200, description: 'Movimiento eliminado exitosamente.' })

  @ApiResponse({ status: 400, description: 'ID invalido.' })

  @ApiResponse({ status: 403, description: 'Prohibido - No tienes permisos suficientes.' })

  @ApiResponse({ status: 404, description: 'No se encontró un movimiento con el ID especificado.' })

  @ApiResponse({ status: 500, description: 'Error interno al eliminar el movimiento.' })

  async remove(@Param('id', parseIdPipe) id: number) {

    try {

      const resultado = await this.movimientosService.remove(id);



      if (!resultado) {

        throw new NotFoundException(`No se encontró un movimiento con el ID: ${id}`);

      }

      return {

        message: 'Movimiento eliminado exitosamente.',

        id: id,

      };

    } catch (error: any) {

      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {

        throw error;

      }

      if (error.code === '23503') {

        throw new ConflictException('No se puede eliminar el movimiento: Existen registros relacionados que dependen de este movimiento.');

      }

      if (error.code === 'P2025') {

        throw new NotFoundException(`No se encontró un movimiento con el ID: ${id}`);

      }

      throw new InternalServerErrorException(

        `Error interno al eliminar el movimiento: ${error?.message ?? 'error desconocido'}.`,

      );

    }

  }

}