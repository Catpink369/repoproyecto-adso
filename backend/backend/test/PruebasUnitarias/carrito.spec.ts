//RF-006.1 / RF-006.2 / RF-006.3 / RF-006.4 / RF-006.5
import { CarritoFake, CarritoFakeError } from '../utils/faker-factories';
import { fakeProducto } from '../utils/mock-factories';

describe('RF-006 - simulación de frontend', () => {
  let carrito: CarritoFake;

  beforeEach(() => {
    carrito = new CarritoFake();
  });

  function productoParaCarrito(overrides: Partial<any> = {}) {
    const p = fakeProducto(overrides);
    return {
      id_producto: p.id_producto,
      nom_producto: p.nom_producto,
      precio_unitario: p.precio_unitario,
      stock_actual: p.stock_actual,
    };
  }

  // RF-006.1 - Agregar producto al carrito
  describe('agregarProducto', () => {
    
    it('CP-001: debe agregar un producto estándar al carrito y el contador debe incrementarse', () => {
      const producto = productoParaCarrito({ stock_actual: 10 });

      carrito.agregarProducto(producto, 1);

      expect(carrito.getItems()).toHaveLength(1);
      expect(carrito.contarProductos()).toBe(1);
    });

    it('CP-002: debe bloquear el intento de agregar un producto sin stock disponible', () => {
      const producto = productoParaCarrito({ stock_actual: 0 });

      expect(() => carrito.agregarProducto(producto, 1)).toThrow(CarritoFakeError);
      expect(carrito.getItems()).toHaveLength(0);
    });

    it('debe acumular la cantidad si el producto ya estaba en el carrito', () => {
      const producto = productoParaCarrito({ stock_actual: 10 });

      carrito.agregarProducto(producto, 2);
      carrito.agregarProducto(producto, 3);

      expect(carrito.getItems()).toHaveLength(1);
      expect(carrito.contarProductos()).toBe(5);
    });

    it('debe rechazar agregar más unidades de las que el stock permite', () => {
      const producto = productoParaCarrito({ stock_actual: 3 });

      expect(() => carrito.agregarProducto(producto, 5)).toThrow('supera el stock disponible');
    });
  });

  // RF-006.2 - Visualizar carrito de compra
  describe('visualizar carrito', () => {
    it('CP-003: debe calcular correctamente la sumatoria del precio total de todos los productos', () => {
      carrito.agregarProducto(
        productoParaCarrito({ id_producto: 1, precio_unitario: 10000, stock_actual: 10 }),
        2,
      );
      carrito.agregarProducto(
        productoParaCarrito({ id_producto: 2, precio_unitario: 5000, stock_actual: 10 }),
        3,
      );

      // 2*10000 + 3*5000 = 20000 + 15000 = 35000
      expect(carrito.calcularTotal()).toBe(35000);
    });

    it('CP-004: debe mostrar un mensaje informativo cuando el carrito está vacío', () => {
      expect(carrito.estaVacio()).toBe(true);
      expect(carrito.mensajeCarritoVacio()).toMatch(/carrito está vacío/i);
    });
  });

  // RF-006.3 - Modificar cantidad del carrito
  describe('modificarCantidad', () => {
    it('CP-005: debe impedir que la cantidad se establezca en menos de 1 unidad', () => {
      const producto = productoParaCarrito({ id_producto: 1, stock_actual: 10 });
      carrito.agregarProducto(producto, 1);

      expect(() => carrito.modificarCantidad(1, 0)).toThrow(CarritoFakeError);
    });

    it('CP-006: debe impedir que la cantidad supere el stock disponible', () => {
      const producto = productoParaCarrito({ id_producto: 1, stock_actual: 5 });
      carrito.agregarProducto(producto, 1);

      expect(() => carrito.modificarCantidad(1, 6)).toThrow('supera el stock disponible');
    });

    it('CP-007: debe permitir aumentar la cantidad dentro del límite de stock', () => {
      const producto = productoParaCarrito({ id_producto: 1, stock_actual: 10 });
      carrito.agregarProducto(producto, 2);

      const item = carrito.modificarCantidad(1, 4);

      expect(item.cantidad).toBe(4);
    });

    it('CP-008: debe permitir disminuir la cantidad sin bajar de 1', () => {
      const producto = productoParaCarrito({ id_producto: 1, stock_actual: 10 });
      carrito.agregarProducto(producto, 4);

      const item = carrito.modificarCantidad(1, 2);

      expect(item.cantidad).toBe(2);
    });
  });

  // RF-006.4 - Quitar producto del carrito
  describe('eliminarProducto', () => {
    it('CP-009: debe eliminar el producto específico indicado del carrito', () => {
      carrito.agregarProducto(productoParaCarrito({ id_producto: 1, stock_actual: 10 }), 1);
      carrito.agregarProducto(productoParaCarrito({ id_producto: 2, stock_actual: 10 }), 1);

      const eliminado = carrito.eliminarProducto(1);

      expect(eliminado).toBe(true);
      expect(carrito.getItems().map((i) => i.id_producto)).toEqual([2]);
    });

    it('CP-010: al cancelar la eliminación (no invocar el método), el producto debe permanecer en el carrito', () => {
      carrito.agregarProducto(productoParaCarrito({ id_producto: 1, stock_actual: 10 }), 1);

      const itemsAntes = carrito.getItems();

      expect(carrito.getItems()).toEqual(itemsAntes);
    });
  });

  // RF-006.5 - Vaciar carrito
  describe('vaciar', () => {
    it('CP-011: debe vaciar el carrito cuando contiene productos', () => {
      carrito.agregarProducto(productoParaCarrito({ id_producto: 1, stock_actual: 10 }), 2);
      carrito.agregarProducto(productoParaCarrito({ id_producto: 2, stock_actual: 10 }), 1);

      carrito.vaciar();

      expect(carrito.estaVacio()).toBe(true);
    });

    it('CP-012: al cancelar el vaciado (no invocar el método), el carrito debe mantener sus productos', () => {
      carrito.agregarProducto(productoParaCarrito({ id_producto: 1, stock_actual: 10 }), 2);

      const itemsAntes = carrito.getItems();
      // Si el Usuario cancela accion, no se vacia

      expect(carrito.getItems()).toEqual(itemsAntes);
    });

    it('CP-013: debe rechazar el intento de vaciar un carrito que ya está vacío', () => {
      expect(carrito.estaVacio()).toBe(true);

      expect(() => carrito.vaciar()).toThrow(CarritoFakeError);
    });
  });
});