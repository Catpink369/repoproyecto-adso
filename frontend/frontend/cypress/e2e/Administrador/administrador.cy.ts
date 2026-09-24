// Flujo completo - Rol Administrador
// Recorrido: login -> Reportes -> Notificaciones -> Productos (crear/editar)
//            -> Movimientos (entrada/salida sobre el mismo producto) -> Productos (eliminar)
//            -> Usuarios (ver Clientes/Trabajadores/Administradores, desactivar,
//               crear trabajador, cambiar rol, reactivar, revertir rol)
//            -> Pedidos realizados (detalle, estado, pago, anular) -> Perfil -> Cerrar sesión

export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

Cypress.on('uncaught:exception', () => false);

describe('Flujo completo - Administrador', { testIsolation: false }, () => {

  // --- Datos para el flujo de Productos/Movimientos ---
  const idUnico = Date.now().toString().slice(-6);
  const nombreProducto = `Producto Admin ${idUnico}`;
  const nombreProductoEditado = `Producto Admin Editado ${idUnico}`;
  let idProductoCreado: number | undefined;

  // --- Datos para el flujo de Usuarios ---
  const documentoTrabajador = `9${idUnico}`;
  const nombreTrabajador = 'Trabajador';
  // Solo letras: el DTO rechaza números/símbolos en apellidos (Matches)
  const apellidoTrabajador = 'PruebaCypress';
  const correoTrabajador = `trabajador.prueba.${idUnico}@example.com`;

  // Trabajador fijo de prueba (Harry), usado solo para el toggle de activar/desactivar.
  // Debe existir en el entorno de pruebas y estar Activo antes de correr el flujo.
  const idTrabajadorPrueba = '123412332'; // Harry

  // --- Datos para el flujo de Pedidos (variables compartidas entre Pasos 18-20) ---
  let idPedidoEstadoUsado: string;
  let idPedidoPagoUsado: string;

  before(() => {
    cy.on('window:alert', () => true);
    cy.on('window:confirm', () => true);
    cy.loginAdmin();
    cy.url().should('include', '/panel_control');
  });

  it('Paso 1: navega a Reportes', () => {
    cy.contains('.opcion', 'Reportes').click();
    cy.get('.reporte-imprimible', { timeout: 10000 }).should('be.visible');
  });

  it('Paso 2: navega a Notificaciones', () => {
    cy.contains('.opcion', 'Notificaciones').click();
    cy.get('table.tabla tbody tr', { timeout: 10000 }).should('have.length.at.least', 0);
  });

  // --- Productos ---

  it('Paso 3: registra un nuevo producto', () => {
    cy.intercept('POST', '**/productos').as('crearProducto');

    cy.visit(`${FRONT_URL}/panel_control`);
    cy.contains('Productos').click();
    cy.contains('Registrar nuevo Producto').click();

    cy.get('input[placeholder="Nombre completo del producto"]').type(nombreProducto);
    cy.get('input[placeholder="Precio al que se venderá"]').type('25000');
    cy.get('input[placeholder="Cantidad inicial en inventario"]').type('50');
    cy.contains('label', 'Categoría').parent().find('select').select(1);
    cy.contains('label', 'Clasificación').parent().find('select').select(1);
    cy.get('textarea[placeholder="Detalles completos del producto..."]').type('Producto creado en flujo de Administrador');

    cy.contains('button', 'Registrar Nuevo Producto').click({ force: true });
    cy.wait('@crearProducto').then(({ response }) => {
      idProductoCreado = response?.body?.id_producto;
    });

    cy.url({ timeout: 6000 }).should('include', '/productos');
    cy.contains(nombreProducto).should('be.visible');
  });

  it('Paso 4: edita el producto recién creado', () => {
    cy.contains('tr', nombreProducto).within(() => {
      cy.get('button, a').contains(/editar|modificar/i).click({ force: true });
    });

    cy.contains('label, div, p, span', 'Nombre del Producto').parent().find('input').clear().type(nombreProductoEditado);
    cy.contains('button', 'Guardar Cambios').click();
    cy.contains(nombreProductoEditado).should('be.visible');
  });

  // --- Movimientos (mismo producto) ---

  it('Paso 5: registra una entrada de stock para el producto creado', () => {
    cy.visit(`${FRONT_URL}/entradas`);
    expect(idProductoCreado, 'idProductoCreado debe existir').to.exist;

    cy.get('#id_producto').type(`${idProductoCreado}{enter}`);
    cy.contains(`Producto encontrado: ${nombreProductoEditado}`, { timeout: 8000 }).should('be.visible');

    cy.get('#cantidad_m').type('10');
    cy.contains('button', 'Sumar al Stock').click();

    cy.contains('¡Stock actualizado exitosamente!', { timeout: 8000 }).should('be.visible');
    cy.url({ timeout: 6000 }).should('include', '/productos');
  });

  it('Paso 6: registra una salida (venta manual) para el producto creado', () => {
    cy.visit(`${FRONT_URL}/salidas`);
    expect(idProductoCreado, 'idProductoCreado debe existir').to.exist;

    cy.get('#id_producto').type(`${idProductoCreado}{enter}`);
    cy.contains(`Producto encontrado: ${nombreProductoEditado}`, { timeout: 8000 }).should('be.visible');

    cy.get('#cantidad').type('5');
    cy.get('#nombre_cliente').type('Cliente de Prueba');
    cy.get('#telefono_cliente').type('3001234567');

    cy.contains('button', 'Vista Previa').click();
    cy.contains('Confirmación de Venta').should('be.visible');

    cy.contains('button', 'Confirmar Venta').click();
    cy.contains('¡Venta registrada exitosamente!', { timeout: 8000 }).should('be.visible');
    cy.url({ timeout: 8000 }).should('include', '/productos');
  });

  // --- Productos (cierre) ---

  it('Paso 7: elimina el producto usado en el flujo', () => {
    cy.visit(`${FRONT_URL}/productos`);

    cy.contains('tr', nombreProductoEditado).within(() => {
      cy.get('button, a').contains(/eliminar|desactivar|borrar/i).click({ force: true });
    });
  });

  // --- Usuarios (exclusivo de Administrador) ---

  it('Paso 8: navega al módulo de Usuarios', () => {
    cy.get('nav.menu a').contains('Usuarios').click();
    cy.url().should('include', '/usuarios');
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
  });

  it('Paso 9: visualiza la pestaña Clientes (por defecto)', () => {
    cy.contains('button', 'Clientes').click();
    cy.get('table tbody tr').should('exist');
  });

  it('Paso 10: visualiza la pestaña Trabajadores', () => {
    cy.contains('button', 'Trabajadores').click();
    cy.get('table tbody tr').should('exist');
  });

  it('Paso 11: visualiza la pestaña Administradores', () => {
    cy.contains('button', 'Administradores').click();
    cy.get('table tbody tr').should('exist');
  });

    it('Paso 12: desactiva un usuario (Trabajador)', () => {
    cy.intercept('PATCH', '**/usuarios/**/estado').as('cambiarEstado');
    cy.contains('button', 'Trabajadores').click();
    cy.get('input[placeholder*="Buscar"]').clear().type(idTrabajadorPrueba);
    cy.contains('tr', idTrabajadorPrueba, { timeout: 10000 }).should('be.visible');

    // Re-query la fila en cada acción (evita "detached from DOM" tras re-render)
    cy.contains('tr', idTrabajadorPrueba).then(($tr) => {
      const text = $tr.text();
      if (text.includes('Activar')) {
        // Ya inactivo: activar primero
        cy.contains('tr', idTrabajadorPrueba).contains('button', 'Activar').click();
        cy.wait('@cambiarEstado').its('response.statusCode').should('eq', 200);
      }
    });

    cy.contains('tr', idTrabajadorPrueba).contains('button', 'Desactivar').click();
    cy.wait('@cambiarEstado').its('response.statusCode').should('eq', 200);
    cy.contains('tr', idTrabajadorPrueba).should('contain', 'Inactivo');
  });

it('Paso 13: crea un nuevo trabajador', () => {
    cy.intercept('POST', '**/usuarios').as('crearUsuario');

    cy.contains('button', 'Registrar Usuario').click();

    cy.get('div[style*="position: fixed"]').within(() => {
      cy.get('input[name="id_usuario"]').clear().type(documentoTrabajador);
      cy.get('input[name="nom_1"]').clear().type(nombreTrabajador);
      cy.get('input[name="ape_1"]').clear().type(apellidoTrabajador);
      cy.get('input[name="correo"]').clear().type(correoTrabajador);
      cy.get('input[name="telefono"]').clear().type('3009876543');
      cy.get('input[name="contrasena"]').clear().type('Prueba123');
      cy.contains('button', 'Registrar').click();
    });

    cy.wait('@crearUsuario').then((interception) => {
      const status = interception.response?.statusCode;
      const body = interception.response?.body;
      expect(status, `body=${JSON.stringify(body)}`).to.be.oneOf([200, 201]);
    });

    cy.get('body').then(($body) => {
      if ($body.find('div[style*="position: fixed"]').length) {
        cy.contains('div[style*="position: fixed"] button', /Cancelar|Cerrar/i).click({ force: true });
      }
    });
    cy.get('div[style*="position: fixed"]', { timeout: 8000 }).should('not.exist');

    cy.contains('button', 'Trabajadores').click();
    cy.get('input[placeholder*="Buscar"]').clear().type(documentoTrabajador);
    cy.contains(`ID: ${documentoTrabajador}`, { timeout: 10000 }).should('be.visible');
  });

  it('Paso 14: cambia el rol del trabajador creado a Administrador', () => {
    cy.intercept('PATCH', '**/usuarios/*').as('editarUsuario');
    cy.contains('button', 'Trabajadores').click();
    cy.get('input[placeholder*="Buscar"]').clear().type(documentoTrabajador);

    cy.contains('tr', documentoTrabajador).within(() => {
      cy.contains('button', 'Editar').click();
    });

    // No usar cy.get('body') dentro de .within del modal (rompe el scope)
    cy.get('div[style*="position: fixed"]').should('be.visible');
    cy.get('div[style*="position: fixed"] select[name="id_rol_usuario"]').select('1');
    cy.get('div[style*="position: fixed"] input[name="codigo"]').then(($cod) => {
      if ($cod.length && String($cod.val() || '').trim() === '') {
        cy.wrap($cod).clear().type('998877');
      }
    });
    cy.get('div[style*="position: fixed"]').contains('button', 'Guardar Cambios').click();

    cy.wait('@editarUsuario').then((interception) => {
      const status = interception.response?.statusCode;
      const body = interception.response?.body;
      expect(status, `body=${JSON.stringify(body)}`).to.eq(200);
    });
    cy.get('div[style*="position: fixed"]', { timeout: 8000 }).should('not.exist');

    cy.contains('button', 'Administradores').click();
    cy.get('input[placeholder*="Buscar"]').clear().type(documentoTrabajador);
    cy.contains(`ID: ${documentoTrabajador}`, { timeout: 10000 }).should('be.visible');
  });

  it('Paso 15: reactiva el usuario desactivado en el Paso 12', () => {
    // Cerrar modal residual si quedó abierto
    cy.get('body').then(($body) => {
      if ($body.find('div[style*="position: fixed"]').length) {
        cy.contains('div[style*="position: fixed"] button', /Cancelar|Cerrar/i).click({ force: true });
      }
    });
    cy.get('div[style*="position: fixed"]', { timeout: 5000 }).should('not.exist');

    cy.intercept('PATCH', '**/usuarios/**/estado').as('cambiarEstado');
    cy.contains('button', 'Trabajadores').click({ force: true });
    cy.get('input[placeholder*="Buscar"]').clear().type(idTrabajadorPrueba);

    cy.contains('tr', idTrabajadorPrueba).within(() => {
      cy.get('button').then(($btns) => {
        const texts = [...$btns].map((b) => b.textContent || '');
        if (texts.some((t) => t.includes('Activar'))) {
          cy.contains('button', 'Activar').click();
          cy.wait('@cambiarEstado').its('response.statusCode').should('eq', 200);
        }
      });
    });
  });

  it('Paso 16: revierte el rol del trabajador ascendido de vuelta a Trabajador', () => {
    cy.get('body').then(($body) => {
      if ($body.find('div[style*="position: fixed"]').length) {
        cy.contains('div[style*="position: fixed"] button', /Cancelar|Cerrar/i).click({ force: true });
      }
    });

    cy.intercept('PATCH', '**/usuarios/*').as('editarUsuario');
    cy.contains('button', 'Administradores').click({ force: true });
    cy.get('input[placeholder*="Buscar"]').clear().type(documentoTrabajador);

    cy.contains('tr', documentoTrabajador).within(() => {
      cy.contains('button', 'Editar').click();
    });

    cy.get('div[style*="position: fixed"]').within(() => {
      cy.get('select[name="id_rol_usuario"]').select('3'); // 3 = Trabajador
      cy.contains('button', 'Guardar Cambios').click();
    });

    cy.wait('@editarUsuario').then((interception) => {
      const status = interception.response?.statusCode;
      const body = interception.response?.body;
      expect(status, `body=${JSON.stringify(body)}`).to.eq(200);
    });
    cy.get('div[style*="position: fixed"]', { timeout: 8000 }).should('not.exist');

    cy.contains('button', 'Trabajadores').click();
    cy.get('input[placeholder*="Buscar"]').clear().type(documentoTrabajador);
    cy.contains(`ID: ${documentoTrabajador}`, { timeout: 10000 }).should('be.visible');
  });

  // --- Pedidos realizados ---

  it('Paso 17: ve el detalle de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 4);

    cy.get('table tbody tr').eq(0).within(() => {
      cy.contains('button', 'Ver Detalles').click();
    });
    cy.get('.detalle-pedido-container').should('be.visible');
  });

  it('Paso 18: cambia el estado de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 10000 })
      .should('have.length.at.least', 1);

    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida = [...$filas].find((fila) => {
        const tieneBoton = fila.querySelector('button:not([disabled])')?.textContent?.includes('Editar Estado');
        return tieneBoton;
      }) || $filas[0];
      cy.wrap(filaValida).as('filaEstado');
    });

    cy.get('@filaEstado').find('.pedido-id').invoke('text').then((texto) => {
      idPedidoEstadoUsado = texto.trim();
    });

    cy.get('@filaEstado').contains('button', 'Editar Estado').click();

    cy.get('@filaEstado')
      .find('select.pedido-estado-select', { timeout: 8000 })
      .should('be.visible')
      .select('En preparación');

    cy.on('window:confirm', () => true);
    cy.get('@filaEstado').contains('button', '✓ Guardar').click();

    cy.get('@filaEstado')
      .contains('En preparación', { timeout: 10000 })
      .should('be.visible');
  });

  it('Paso 19: cambia el método de pago de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 10000 })
      .should('have.length.at.least', 1);

    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida = [...$filas].find((fila) => {
        const texto = fila.textContent || '';
        const tieneBoton = fila.querySelector('button:not([disabled])')?.textContent?.includes('Editar Pago');
        const noEsLaAnterior = idPedidoEstadoUsado ? !texto.includes(idPedidoEstadoUsado) : true;
        return tieneBoton && noEsLaAnterior;
      }) || $filas[0];
      cy.wrap(filaValida).as('filaPago');
    });

    cy.get('@filaPago').find('.pedido-id').invoke('text').then((texto) => {
      idPedidoPagoUsado = texto.trim();
    });

    cy.get('@filaPago').contains('button', 'Editar Pago').click();

    cy.get('@filaPago')
      .find('select.pedido-estado-select', { timeout: 8000 })
      .should('be.visible')
      .select('Transferencia');

    cy.get('@filaPago').contains('button', '✓ Confirmar').click();

    cy.get('@filaPago')
      .contains('Transferencia', { timeout: 10000 })
      .should('be.visible');
  });

  it('Paso 20: anula un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 10000 })
      .should('have.length.at.least', 1);

    cy.intercept('PATCH', '**/pedidos/**').as('anularPedido');
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida = [...$filas].find((fila) => {
        const idTexto = fila.querySelector('.pedido-id')?.textContent?.trim();
        const tieneBotonAnular = [...fila.querySelectorAll('button')].some(
          (btn) => btn.textContent?.includes('Anular') && !btn.disabled
        );
        const esDiferenteID = idTexto !== idPedidoEstadoUsado && idTexto !== idPedidoPagoUsado;
        return tieneBotonAnular && esDiferenteID;
      }) || $filas[0];
      cy.wrap(filaValida).as('filaAnular');
    });

    cy.get('@filaAnular').contains('button', 'Anular').click();
    cy.wait('@anularPedido').its('response.statusCode').should('eq', 200);
  });

  // --- Cierre ---

  it('Paso 21: va a su perfil', () => {
    cy.get('a[href="/perfil_admin"]').click();
    cy.url().should('include', '/perfil_admin');
  });

  it('Paso 22: cierra sesión', () => {
    cy.contains('button', 'Cerrar sesión').click();
  });

});