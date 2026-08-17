// productos.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ConflictException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProductosService } from '../../../../../backend/backend/src/productos/productos.service';
import { ProductosController } from '../../../../../backend/backend/src/productos/productos.controller';
import { PrismaService } from '../../../../../backend/backend/src/prisma/prisma.service';
import { CreateProductoDto } from '../../../../../backend/backend/src/productos/dto/create-producto.dto';
import { UpdateProductoDto } from '.../../../../../backend/backend/src/productos/dto/update-producto.dto';
import { RolesGuard } from '../../../../../backend/backend/src/auth/guards/roles.guard';

describe('RF-002 - Gestión de Productos', () => {
  let service: ProductosService;
  let controller: ProductosController;
  let prismaMock: any;
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: PrismaService, useValue: prismaMock },
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

    it('CP-002: debe rechazar la creación si el código o identificador único ya existe en el inventario', async () => {
      prismaMock.producto.create.mockRejectedValue({ code: '23505' });

      const dto = {
        nom_producto: faker.commerce.productName(),
        precio_unitario: 25000,
        stock_actual: 10,
        stock_minimo: 2,
        descripcion: faker.commerce.productDescription(),
        id_categoria: 1,
      };

      await expect(controller.create(dto as any)).rejects.toThrow(ConflictException);
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

    it('CP-005: debe subir una imagen de producto válida durante la creación y reflejar la ruta correctamente', async () => {
      const idProducto = faker.number.int({ min: 1, max: 999 });
      const archivo = { filename: `${idProducto}-imagen.png` } as Express.Multer.File;

      prismaMock.producto.findFirst.mockResolvedValue({
        id_producto: idProducto,
        estado: true,
        categoria: { nombre_c: 'Ropa' },
        clasificacion: { nombre_clas: 'General' },
      });
      prismaMock.producto.update.mockResolvedValue({});

      const resultado = await service.actualizarImagen(idProducto, archivo);

      expect(resultado.ruta_imagen).toBe(`/uploads/productos/${archivo.filename}`);
      expect(prismaMock.producto.update).toHaveBeenCalledWith({
        where: { id_producto: idProducto },
        data: expect.objectContaining({ ruta_imagen: `/uploads/productos/${archivo.filename}` }),
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

    // CP-009: omitido — se valida en pruebas de frontend.
  });

  // RF-002.3: CP-010 a CP-014 omitidos por decisión — se validan en pruebas de frontend.

  // RF-002.4
  describe('RF-002.4 - Editar producto', () => {
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
      prismaMock.producto.update.mockRejectedValue({ code: '23503' });

      await expect(controller.remove(idProducto)).rejects.toThrow(ConflictException);
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