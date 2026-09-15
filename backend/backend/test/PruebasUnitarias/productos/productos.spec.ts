
// productos.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ConflictException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CloudinaryService } from '../../../../../backend/backend/src/cloudinary/cloudinary.service';
import { ProductosService } from '../../../../../backend/backend/src/productos/productos.service';
import { ProductosController } from '../../../../../backend/backend/src/productos/productos.controller';
import { PrismaService } from '../../../../../backend/backend/src/prisma/prisma.service';
import { Roles } from '../../../../../backend/backend/src/auth/enums/roles.enum';
import { CreateProductoDto } from '../../../../../backend/backend/src/productos/dto/create-producto.dto';
import { UpdateProductoDto } from '../../../../../backend/backend/src/productos/dto/update-producto.dto';
import { RolesGuard } from '../../../../../backend/backend/src/auth/guards/roles.guard';

describe('RF-002 - Gestión de Productos', () => {
  let service: ProductosService;
  let controller: ProductosController;
  let prismaMock: any;
  let cloudinaryMock: any;
  let rolesGuard: RolesGuard;

  beforeEach(async () => {
    jest.clearAllMocks();

    prismaMock = {
      producto: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      detalles_pedido: {
        findFirst: jest.fn(),
      },
    };

    cloudinaryMock = {
    subirImagen: jest.fn().mockResolvedValue('https://res.cloudinary.com/fake/imagen.jpg'),
  };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CloudinaryService, useValue: cloudinaryMock },
      ],
      controllers: [ProductosController],
    }).compile();

    service = module.get(ProductosService);
    controller = module.get(ProductosController);
    rolesGuard = new RolesGuard(new Reflector());
  });

  // Construye un ExecutionContext falso apuntando al método real del controller,
  // para que RolesGuard pueda leer los metadatos de @Roles() con el Reflector real.
  function contextoFalso(user: any, handler: Function): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user, url: '/productos' }) }),
      getHandler: () => handler,
      getClass: () => ProductosController,
    } as unknown as ExecutionContext;
  }

  // RF-002.1
  describe('RF-002.1 - Crear producto', () => {
    it('CP-001: debe crear un nuevo producto completando todos los campos obligatorios de forma exitosa', async () => {
      const dto = {
        nom_producto: faker.commerce.productName(),
        precio_unitario: 25000,
        stock_actual: 10,
        stock_minimo: 2,
        descripcion: faker.commerce.productDescription(),
        id_categoria: 1,
      };

      // No existe otro producto con el mismo nombre
      prismaMock.producto.findFirst.mockResolvedValue(null);
      prismaMock.producto.create.mockResolvedValue({
        id_producto: faker.number.int({ min: 1, max: 999 }),
        ...dto,
        estado: true,
      });

      const resultado = await service.create(dto as any);

      expect(resultado.nom_producto).toBe(dto.nom_producto);
      expect(resultado.estado).toBe(true);
      expect(prismaMock.producto.create).toHaveBeenCalledTimes(1);
    });

    it('CP-002: debe rechazar la creación si ya existe un producto activo con el mismo nombre', async () => {
      const dto = {
        nom_producto: faker.commerce.productName(),
        precio_unitario: 25000,
        stock_actual: 10,
        stock_minimo: 2,
        descripcion: faker.commerce.productDescription(),
        id_categoria: 1,
      };

      // create() valida duplicados con un findFirst ANTES de llamar a prisma.producto.create()
      prismaMock.producto.findFirst.mockResolvedValue({
        id_producto: faker.number.int({ min: 1, max: 999 }),
        nom_producto: dto.nom_producto,
        estado: true,
      });

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
      expect(prismaMock.producto.create).not.toHaveBeenCalled();
    });

    it('CP-003: debe rechazar el registro dejando campos obligatorios vacíos (nombre, descripción)', async () => {
      const dtoIncompleto = plainToInstance(CreateProductoDto, {
        nom_producto: '',
        precio_unitario: 25000,
        stock_actual: 10,
        stock_minimo: 2,
        descripcion: '',
        id_categoria: 1,
      });

      const errores = await validate(dtoIncompleto);

      expect(errores.length).toBeGreaterThan(0);
      expect(errores.some((e) => e.property === 'nom_producto')).toBe(true);
      expect(errores.some((e) => e.property === 'descripcion')).toBe(true);
    });

    it('CP-004: debe rechazar valores numéricos inválidos (precio negativo, stock menor a cero)', async () => {
      const dtoInvalido = plainToInstance(CreateProductoDto, {
        nom_producto: faker.commerce.productName(),
        precio_unitario: -1000,
        stock_actual: -5,
        stock_minimo: -1,
        descripcion: faker.commerce.productDescription(),
        id_categoria: 1,
      });

      const errores = await validate(dtoInvalido);

      expect(errores.length).toBeGreaterThan(0);
      expect(errores.some((e) => e.property === 'precio_unitario')).toBe(true);
      expect(errores.some((e) => e.property === 'stock_actual')).toBe(true);
    });

    it('CP-005: debe actualizar la URL de la imagen de un producto exitosamente', async () => {
      const idProducto = faker.number.int({ min: 1, max: 999 });
      const urlImagen = 'https://res.cloudinary.com/demo/image/upload/v1234/productos/imagen.png';

      prismaMock.producto.findFirst.mockResolvedValue({
        id_producto: idProducto,
        estado: true,
        categoria: { nombre_c: 'Ropa' },
        clasificacion: { nombre_clas: 'General' },
      });
      prismaMock.producto.update.mockResolvedValue({});

      const resultado = await service.actualizarImagen(idProducto, urlImagen);

      expect(resultado.ruta_imagen).toBe(urlImagen);
      expect(resultado.statusCode).toBe(200);
      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id_producto: idProducto },
        data: expect.objectContaining({ ruta_imagen: urlImagen }),
      });
    });

    // CP-006: pendiente para pruebas e2e — el filtro de tipo/peso de archivo vive en
    // la configuración de multer (fileFilter) dentro del controller, no en el service.

    it('CP-007: debe impedir que una cuenta sin permisos (Cliente) cree un producto', () => {
      const usuarioCliente = { id_usuario: faker.string.numeric(10), id_rol_usuario: '2' };
      const contexto = contextoFalso(usuarioCliente, controller.create);

      const permitido = rolesGuard.canActivate(contexto);

      expect(permitido).toBe(false);
    });
  });

  // RF-002.2
  describe('RF-002.2 - Visualizar catálogo', () => {
    it('CP-008: debe visualizar la lista completa de productos activos del catálogo', async () => {
      const productosEnBD = [
        {
          id_producto: 1,
          nom_producto: faker.commerce.productName(),
          estado: true,
          categoria: { nombre_c: 'Ropa' },
          clasificacion: { nombre_clas: 'General' },
        },
        {
          id_producto: 2,
          nom_producto: faker.commerce.productName(),
          estado: true,
          categoria: { nombre_c: 'Accesorios' },
          clasificacion: { nombre_clas: 'Premium' },
        },
      ];

      prismaMock.producto.findMany.mockResolvedValue(productosEnBD);

      const resultado = await service.findAll({});

      expect(resultado).toHaveLength(2);
      expect(resultado[0].nombre_c).toBe('Ropa');
      expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { estado: true } }),
      );
    });

    it('CP-009: debe traducir page/limit en skip/take al consultar el catálogo paginado', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.findAll({ page: 2, limit: 5 });

      expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });

    it('CP-009b: sin page/limit no debe aplicar skip/take (mantiene el comportamiento actual del frontend)', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.findAll({});

      const argumentos = prismaMock.producto.findMany.mock.calls[0][0];
      expect(argumentos.skip).toBeUndefined();
      expect(argumentos.take).toBeUndefined();
    });
  });

  // RF-002.3 — Buscar y filtrar productos
  describe('RF-002.3 - Buscar y filtrar productos', () => {
    it('CP-010: debe armar el filtro de búsqueda por nombre (contains) al recibir "search"', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'bufanda' });

      expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ nom_producto: { contains: 'bufanda' } }),
        }),
      );
    });

    it('CP-011: debe filtrar por id_categoria cuando se recibe en el query', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.findAll({ id_categoria: 3 });

      expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_categoria: 3 }),
        }),
      );
    });

    it('CP-012: debe filtrar por id_clasificacion cuando se recibe en el query', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.findAll({ id_clasificacion: 2 });

      expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_clasificacion: 2 }),
        }),
      );
    });

    it('CP-013: debe combinar search, id_categoria e id_clasificacion en un solo where cuando se envían juntos', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]);

      await service.findAll({ search: 'amigurumi', id_categoria: 3, id_clasificacion: 2 });

      expect(prismaMock.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            nom_producto: { contains: 'amigurumi' },
            id_categoria: 3,
            id_clasificacion: 2,
          }),
        }),
      );
    });

    it('CP-014: una búsqueda vacía o con caracteres especiales no debe romper el service (no lanza excepción)', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]);

      await expect(service.findAll({ search: '' })).resolves.toEqual([]);
      await expect(
        service.findAll({ search: '%^&*()"; DROP TABLE producto;--' }),
      ).resolves.toEqual([]);
    });
  });

  // RF-002.4
  describe('RF-002.4 - Editar producto', () => {
    it('CP-015: debe actualizar exitosamente los datos básicos de un producto (nombre, descripción, precio) desde un rol autorizado (Administrador/Trabajador)', async () => {
      const idProducto = faker.number.int({ min: 1, max: 999 });

      const dtoActualizacion = {
        nom_producto: faker.commerce.productName(),
        descripcion: faker.commerce.productDescription(),
        precio_unitario: 35000,
      };

      // 1ra llamada a findFirst: la usa findOne() para confirmar que el producto existe
      // 2da llamada a findFirst: valida que el nuevo nombre no pertenezca a OTRO producto
      prismaMock.producto.findFirst
        .mockResolvedValueOnce({
          id_producto: idProducto,
          nom_producto: 'Nombre anterior',
          descripcion: 'Descripción anterior',
          precio_unitario: 20000,
          estado: true,
          categoria: { nombre_c: 'Ropa' },
          clasificacion: { nombre_clas: 'General' },
        })
        .mockResolvedValueOnce(null); // no hay otro producto con ese nombre

      prismaMock.producto.update.mockResolvedValue({
        id_producto: idProducto,
        ...dtoActualizacion,
        estado: true,
      });

      const resultado = await service.update(idProducto, dtoActualizacion as any);

      expect(resultado.statusCode).toBe(200);
      expect(resultado.message).toBe(`Producto ${idProducto} actualizado exitosamente`);
      expect(resultado.data.nom_producto).toBe(dtoActualizacion.nom_producto);
      expect(resultado.data.descripcion).toBe(dtoActualizacion.descripcion);
      expect(resultado.data.precio_unitario).toBe(dtoActualizacion.precio_unitario);

      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id_producto: idProducto },
        data: expect.objectContaining({
          nom_producto: dtoActualizacion.nom_producto,
          descripcion: dtoActualizacion.descripcion,
          precio_unitario: dtoActualizacion.precio_unitario,
          ultima_actualiz: expect.any(Date),
        }),
      });
    });

    it('CP-015b: debe permitir la edición a cuentas con rol Administrador o Trabajador', () => {
      const usuarioAdmin = { id_usuario: faker.string.numeric(10), id_rol_usuario: Roles.ADMIN };           // '1'
      const usuarioTrabajador = { id_usuario: faker.string.numeric(10), id_rol_usuario: Roles.TRABAJADOR }; // '3'

      const contextoAdmin = contextoFalso(usuarioAdmin, controller.update);
      const contextoTrabajador = contextoFalso(usuarioTrabajador, controller.update);

      expect(rolesGuard.canActivate(contextoAdmin)).toBe(true);
      expect(rolesGuard.canActivate(contextoTrabajador)).toBe(true);
    });
    it('CP-016: debe rechazar la edición con precio o stock mínimo no numéricos o negativos', async () => {
      const dtoInvalido = plainToInstance(UpdateProductoDto, {
        precio_unitario: -500,
        stock_minimo: -2,
      });

      const errores = await validate(dtoInvalido);

      expect(errores.length).toBeGreaterThan(0);
      expect(errores.some((e) => e.property === 'precio_unitario')).toBe(true);
      expect(errores.some((e) => e.property === 'stock_minimo')).toBe(true);
    });

    it('CP-017: debe impedir que una cuenta sin permisos (Cliente) modifique un producto', () => {
      const usuarioCliente = { id_usuario: faker.string.numeric(10), id_rol_usuario: '2' };
      const contexto = contextoFalso(usuarioCliente, controller.update);

      const permitido = rolesGuard.canActivate(contexto);

      expect(permitido).toBe(false);
    });
  });

  // RF-002.5
  describe('RF-002.5 - Eliminar producto', () => {
    it('CP-018: debe desactivar el producto exitosamente (eliminación lógica)', async () => {
      const idProducto = faker.number.int({ min: 1, max: 999 });

      prismaMock.producto.findFirst.mockResolvedValue({
        id_producto: idProducto,
        estado: true,
        categoria: { nombre_c: 'Ropa' },
        clasificacion: { nombre_clas: 'General' },
      });
      // Sin pedidos asociados: remove() puede continuar hasta el update
      prismaMock.detalles_pedido.findFirst.mockResolvedValue(null);
      prismaMock.producto.update.mockResolvedValue({});

      const resultado = await service.remove(idProducto);

      expect(resultado.message).toBe(`Producto ${idProducto} eliminado exitosamente`);
      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id_producto: idProducto },
        data: expect.objectContaining({ estado: false }),
      });
    });

    it('CP-019: debe rechazar la eliminación de un producto con pedidos asociados', async () => {
      const idProducto = faker.number.int({ min: 1, max: 999 });

      prismaMock.producto.findFirst.mockResolvedValue({
        id_producto: idProducto,
        estado: true,
        categoria: { nombre_c: 'Ropa' },
        clasificacion: { nombre_clas: 'General' },
      });
      // Hay un detalle de pedido asociado a este producto
      prismaMock.detalles_pedido.findFirst.mockResolvedValue({ id_detalles: 1, id_producto: idProducto });

      await expect(service.remove(idProducto)).rejects.toThrow(ConflictException);
      // El service nunca debe llegar a actualizar el producto en este camino
      expect(prismaMock.producto.update).not.toHaveBeenCalled();
    });

    // CP-020: omitido — es una interacción de UI (cancelar), se valida en frontend.

    it('CP-021: debe impedir que una cuenta sin permisos (Cliente) elimine un producto', () => {
      const usuarioCliente = { id_usuario: faker.string.numeric(10), id_rol_usuario: '2' };
      const contexto = contextoFalso(usuarioCliente, controller.remove);

      const permitido = rolesGuard.canActivate(contexto);

      expect(permitido).toBe(false);
    });
  });
});