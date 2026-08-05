import { Controller, Get, Query, UseInterceptors, UploadedFile, HttpCode,  NotFoundException, ConflictException, BadRequestException, UnauthorizedException, ForbiddenException, InternalServerErrorException, HttpStatus } from '@nestjs/common'; 
import { CategoriasService } from './categorias.service';
import { ApiBearerAuth, ApiSecurity, ApiOperation, ApiResponse} from '@nestjs/swagger';


@ApiBearerAuth('JWT') 
@ApiSecurity('x-api-key')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get() 
  @ApiOperation({ summary: 'Obtener todas las categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias obtenida con exito.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 500, description: 'Error interno al consultar la base de datos.' })

  findAll(@Query() query: any) { 
    console.log('controller - todas las categorias:', JSON.stringify(query)); 
    try {
      return this.categoriasService.findAll(query);
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener categoria');
    }
  }

  // GET /categorias/clasificaciones
  @Get('clasificaciones')
  @ApiOperation({ summary: 'Obtener todas las categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias obtenida con exito.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 500, description: 'Error interno al consultar la base de datos.' })

  findAllClasificaciones(@Query() query: any) {
    console.log('controller - todas las clasificaciones:', JSON.stringify(query)); 
    try {
      return this.categoriasService.findAllClasificaciones(query);
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException 
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error interno al obtener clasificacion');
    }
  }
}