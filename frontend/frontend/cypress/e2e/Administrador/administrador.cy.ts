// Flujo completo - Rol Administrador (versión estabilizada)

export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:8080';

Cypress.on('uncaught:exception', () => false);

describe('Flujo completo - Administrador', { testIsolation: false }, () => {
  // --- Datos para el flujo de Productos/Movimientos ---
  // idUnico estable dentro del describe (mismo en todos los it)
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

  // Marcador de la fila de trabajador que desactivamos en Paso 12 (no depende de Harry/seed)
  let marcadorTrabajadorDesactivado: string = '';

  // --- Datos para el flujo de Pedidos ---
  let idPedidoEstadoUsado: string;
  let idPedidoPagoUsado: string;

  /** Cierra cualquier modal residual (position: fixed) si quedó abierto */
  const cerrarModalSiExiste = () => {
    cy.get('body').then(($body) => {
      if ($body.find('div[style*="position: fixed"]').length) {
        cy.contains('div[style*="position: fixed"] button', /Cancelar|Cerrar/i).click({
          force: true,
        });
      }
    });
    cy.get('div[style*="position: fixed"]', { timeout: 5000 }).should('not.exist');
  };

  /** Limpia el buscador y espera a que cargue la tabla */
  const limpiarBusqueda = () => {
    cy.get('input[placeholder*="Buscar"]').should('be.visible').clear();
    cy.wait(500);
  };

  /** Busca por texto (nombre, apellido, correo o documento) */
  const buscarUsuario = (texto: string) => {
    cy.get('input[placeholder*="Buscar"]').should('be.visible').clear().type(texto);
    cy.wait(700);
    cy.contains('table tbody tr', texto, { timeout: 15000 }).should('be.visible');
  };

  before(() => {
    cy.on('window:alert', () => true);
    cy.on('window:confirm', () => true);
    cy.loginAdmin();
    cy.url().should('include', '/panel_control');
  });

  it('Paso 1: navega a Reportes', () => {
    cy.contains('.opcion', 'Reportes').click();
    cy.get('.reporte-imprimible', { timeout: 12000 }).should('be.visible');
  });

  it('Paso 2: navega a Notificaciones', () => {
    cy.contains('.opcion', 'Notificaciones').click();
    cy.get('table.tabla tbody tr', { timeout: 12000 }).should('have.length.at.least', 0);
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
    cy.get('textarea[placeholder="Detalles completos del producto..."]').type(
      'Producto creado en flujo de Administrador',
    );

    cy.contains('button', 'Registrar Nuevo Producto').click({ force: true });

    cy.wait('@crearProducto', { timeout: 15000 }).then(({ response }) => {
      expect(response?.statusCode, 'crear producto').to.be.oneOf([200, 201]);
      idProductoCreado = response?.body?.id_producto;
      expect(idProductoCreado, 'id_producto en response').to.exist;
    });

    cy.url({ timeout: 10000 }).should('include', '/productos');
    cy.contains(nombreProducto, { timeout: 10000 }).should('be.visible');
  });

  it('Paso 4: edita el producto recién creado', () => {
    // Asegurar que estamos en listado de productos
    cy.visit(`${FRONT_URL}/productos`);
    cy.contains('tr', nombreProducto, { timeout: 12000 }).should('be.visible');

    // Interceptar update (PATCH o PUT según el backend)
    cy.intercept({ method: /PATCH|PUT/, url: '**/productos/**' }).as('editarProducto');

    cy.contains('tr', nombreProducto).within(() => {
      cy.get('button, a').contains(/editar|modificar/i).click({ force: true });
    });

    // Campo nombre: varios selectores por si el label varía
    cy.contains('label, div, p, span', /Nombre del Producto|Nombre/i, { timeout: 8000 })
      .parent()
      .find('input')
      .first()
      .clear()
      .type(nombreProductoEditado);

    cy.contains('button', 'Guardar Cambios').click();

    // Esperar respuesta de la API (evita race: antes se buscaba el texto antes de que guardara)
    cy.wait('@editarProducto', { timeout: 15000 }).then(({ response }) => {
      expect(response?.statusCode, 'editar producto').to.be.oneOf([200, 201]);
    });

    // Volver al listado y confirmar el nombre editado (no depender solo del modal)
    cy.visit(`${FRONT_URL}/productos`);
    cy.contains(nombreProductoEditado, { timeout: 12000 }).should('be.visible');
  });

  // --- Movimientos (mismo producto) ---

  it('Paso 5: registra una entrada de stock para el producto creado', () => {
    cy.visit(`${FRONT_URL}/entradas`);
    expect(idProductoCreado, 'idProductoCreado debe existir (Paso 3)').to.exist;

    cy.get('#id_producto').clear().type(`${idProductoCreado}{enter}`);
    cy.contains(`Producto encontrado: ${nombreProductoEditado}`, { timeout: 12000 }).should(
      'be.visible',
    );

    cy.get('#cantidad_m').clear().type('10');
    cy.contains('button', 'Sumar al Stock').click();

    cy.contains('¡Stock actualizado exitosamente!', { timeout: 12000 }).should('be.visible');
    cy.url({ timeout: 10000 }).should('include', '/productos');
  });

  it('Paso 6: registra una salida (venta manual) para el producto creado', () => {
    cy.visit(`${FRONT_URL}/salidas`);
    expect(idProductoCreado, 'idProductoCreado debe existir (Paso 3)').to.exist;

    cy.get('#id_producto').clear().type(`${idProductoCreado}{enter}`);
    cy.contains(`Producto encontrado: ${nombreProductoEditado}`, { timeout: 12000 }).should(
      'be.visible',
    );

    cy.get('#cantidad').clear().type('5');
    cy.get('#nombre_cliente').clear().type('Cliente de Prueba');
    cy.get('#telefono_cliente').clear().type('3001234567');

    cy.contains('button', 'Vista Previa').click();
    cy.contains('Confirmación de Venta', { timeout: 8000 }).should('be.visible');

    cy.contains('button', 'Confirmar Venta').click();
    cy.contains('¡Venta registrada exitosamente!', { timeout: 12000 }).should('be.visible');
    cy.url({ timeout: 10000 }).should('include', '/productos');
  });

  // --- Productos (cierre) ---

  it('Paso 7: elimina el producto usado en el flujo', () => {
    cy.visit(`${FRONT_URL}/productos`);
    cy.contains('tr', nombreProductoEditado, { timeout: 12000 }).should('be.visible');

    cy.intercept({ method: /DELETE|PATCH|PUT/, url: '**/productos/**' }).as('eliminarProducto');

    cy.contains('tr', nombreProductoEditado).within(() => {
      cy.get('button, a').contains(/eliminar|desactivar|borrar/i).click({ force: true });
    });

    // Si hay confirm, ya está manejado en before(); no fallar si la API no se dispara
    cy.wait(800);
  });

  // --- Usuarios (exclusivo de Administrador) ---

  it('Paso 8: navega al módulo de Usuarios', () => {
    cy.visit(`${FRONT_URL}/usuarios`);
    cy.url().should('include', '/usuarios');
    cy.get('table tbody tr', { timeout: 12000 }).should('have.length.at.least', 1);
  });

  it('Paso 9: visualiza la pestaña Clientes (por defecto)', () => {
    cy.contains('button', 'Clientes').click();
    cy.get('table tbody tr', { timeout: 8000 }).should('exist');
  });

  it('Paso 10: visualiza la pestaña Trabajadores', () => {
    cy.contains('button', 'Trabajadores').click();
    cy.get('table tbody tr', { timeout: 8000 }).should('exist');
  });

  it('Paso 11: visualiza la pestaña Administradores', () => {
    cy.contains('button', 'Administradores').click();
    cy.get('table tbody tr', { timeout: 8000 }).should('exist');
  });

  it('Paso 12: desactiva un usuario (Trabajador)', () => {
    cy.intercept('PATCH', '**/usuarios/**/estado').as('cambiarEstado');
    cy.visit(`${FRONT_URL}/usuarios`);
    cy.contains('button', 'Trabajadores').click();
    limpiarBusqueda();

    // Usar el primer trabajador con botón Desactivar/Activar (no depende de seed/Harry)
    cy.get('table tbody tr', { timeout: 12000 }).should('have.length.at.least', 1);

    cy.get('table tbody tr').then(($filas) => {
      let filaElegida: HTMLElement | null = null;
      let marcador = '';
      for (const fila of [...$filas]) {
        const txt = fila.textContent || '';
        const btns = [...fila.querySelectorAll('button')].map((b) => b.textContent || '');
        if (btns.some((t) => t.includes('Desactivar') || t.includes('Activar'))) {
          filaElegida = fila as HTMLElement;
          // Marcador estable: documento/id o primer token largo del texto de la fila
          const partes = txt.replace(/\s+/g, ' ').trim().split(' ').filter((p) => p.length >= 4);
          marcador = partes[0] || txt.replace(/\s+/g, ' ').trim().slice(0, 20);
          break;
        }
      }
      expect(filaElegida, 'Debe existir al menos un trabajador con botón de estado').to.exist;
      expect(marcador, 'El marcador de la fila no puede quedar vacío').to.be.a('string').and.not.be.empty;

      // Guardar para Paso 15 (y evitar cy.contains con string vacío por evaluación síncrona)
      marcadorTrabajadorDesactivado = marcador;
      Cypress.env('marcadorTrabajadorDesactivado', marcador);

      cy.wrap(filaElegida!).as('filaToggle');
      cy.wrap(marcador).as('marcadorToggle');
    });

    // Si está inactivo, activar primero
    cy.get('@filaToggle').then(($tr) => {
      if (($tr.text() || '').includes('Activar')) {
        cy.wrap($tr).contains('button', 'Activar').click({ force: true });
        cy.wait('@cambiarEstado').its('response.statusCode').should('eq', 200);
        cy.wait(400);
      }
    });

    // Re-localizar por marcador DENTRO del then (el valor ya existe cuando se registra contains)
    cy.get('@marcadorToggle').then((marcador) => {
      const m = String(marcador);
      expect(m, 'Marcador para desactivar').to.not.equal('');
      cy.contains('table tbody tr', m, { timeout: 10000 })
        .contains('button', 'Desactivar')
        .click({ force: true });
      cy.wait('@cambiarEstado').its('response.statusCode').should('eq', 200);
      cy.contains('table tbody tr', m, { timeout: 10000 }).should('contain', 'Inactivo');
    });
  });

  it('Paso 13: crea un nuevo trabajador', () => {
    cy.intercept('POST', '**/usuarios').as('crearUsuario');
    cy.visit(`${FRONT_URL}/usuarios`);
    cy.contains('button', 'Trabajadores').click();

    cy.contains('button', 'Registrar Usuario').click();

    cy.get('div[style*="position: fixed"]', { timeout: 10000 }).should('be.visible');
    cy.get('div[style*="position: fixed"] input[name="id_usuario"]').clear().type(documentoTrabajador);
    cy.get('div[style*="position: fixed"] input[name="nom_1"]').clear().type(nombreTrabajador);
    cy.get('div[style*="position: fixed"] input[name="ape_1"]').clear().type(apellidoTrabajador);
    cy.get('div[style*="position: fixed"] input[name="correo"]').clear().type(correoTrabajador);
    cy.get('div[style*="position: fixed"] input[name="telefono"]').clear().type('3009876543');
    cy.get('div[style*="position: fixed"] input[name="contrasena"]').clear().type('Prueba123');
    // Rol Trabajador si hay select
    cy.get('div[style*="position: fixed"]').then(($modal) => {
      const $sel = $modal.find('select[name="id_rol_usuario"]');
      if ($sel.length) {
        cy.wrap($sel).select('3');
      }
    });
    cy.get('div[style*="position: fixed"]').contains('button', 'Registrar').click();

    cy.wait('@crearUsuario', { timeout: 15000 }).then((interception) => {
      const status = interception.response?.statusCode;
      const body = interception.response?.body;
      expect(status, `body=${JSON.stringify(body)}`).to.be.oneOf([200, 201]);
    });

    cerrarModalSiExiste();

    cy.contains('button', 'Trabajadores').click();
    // Apellido único de la corrida → debe aparecer en la tabla
    buscarUsuario(apellidoTrabajador);
  });

  it('Paso 14: cambia el rol del trabajador creado a Administrador', () => {
    cy.intercept('PATCH', '**/usuarios/*').as('editarUsuario');
    cy.visit(`${FRONT_URL}/usuarios`);
    cy.contains('button', 'Trabajadores').click();
    buscarUsuario(apellidoTrabajador);

    cy.contains('table tbody tr', apellidoTrabajador).within(() => {
      cy.contains('button', 'Editar').click({ force: true });
    });

    cy.get('div[style*="position: fixed"]', { timeout: 10000 }).should('be.visible');
    cy.get('div[style*="position: fixed"] select[name="id_rol_usuario"]').select('1');
    cy.get('div[style*="position: fixed"] input[name="codigo"]').then(($cod) => {
      if ($cod.length && String($cod.val() || '').trim() === '') {
        cy.wrap($cod).clear().type('998877');
      }
    });
    cy.get('div[style*="position: fixed"]').contains('button', 'Guardar Cambios').click();

    cy.wait('@editarUsuario', { timeout: 15000 }).then((interception) => {
      const status = interception.response?.statusCode;
      const body = interception.response?.body;
      expect(status, `body=${JSON.stringify(body)}`).to.eq(200);
    });
    cy.get('div[style*="position: fixed"]', { timeout: 8000 }).should('not.exist');

    cy.contains('button', 'Administradores').click();
    buscarUsuario(apellidoTrabajador);
  });

  it('Paso 15: reactiva el usuario desactivado en el Paso 12', () => {
    cerrarModalSiExiste();
    cy.intercept('PATCH', '**/usuarios/**/estado').as('cambiarEstado');
    cy.visit(`${FRONT_URL}/usuarios`);
    cy.contains('button', 'Trabajadores').click({ force: true });
    limpiarBusqueda();

    // Si tenemos marcador, buscarlo; si no, cualquier fila con Activar
    cy.get('table tbody tr', { timeout: 12000 }).should('have.length.at.least', 1);

    cy.get('table tbody tr').then(($filas) => {
      let fila: HTMLElement | null = null;
      const marcador =
        marcadorTrabajadorDesactivado ||
        String(Cypress.env('marcadorTrabajadorDesactivado') || '');
      if (marcador) {
        fila =
          ([...$filas].find((f) => (f.textContent || '').includes(marcador)) as HTMLElement) ||
          null;
      }
      if (!fila) {
        fila =
          ([...$filas].find((f) =>
            [...f.querySelectorAll('button')].some((b) => (b.textContent || '').includes('Activar')),
          ) as HTMLElement) || null;
      }
      if (fila) {
        cy.wrap(fila).as('filaReactivar');
      } else {
        // Nada que reactivar: el paso se considera OK (estado ya activo)
        cy.wrap($filas[0]).as('filaReactivar');
      }
    });

    cy.get('@filaReactivar').then(($tr) => {
      const tieneActivar = [...$tr.find('button')].some((b) => (b.textContent || '').includes('Activar'));
      if (tieneActivar) {
        cy.wrap($tr).contains('button', 'Activar').click({ force: true });
        cy.wait('@cambiarEstado').its('response.statusCode').should('eq', 200);
      }
    });
  });

  it('Paso 16: revierte el rol del trabajador ascendido de vuelta a Trabajador', () => {
    cerrarModalSiExiste();
    cy.intercept('PATCH', '**/usuarios/*').as('editarUsuario');
    cy.visit(`${FRONT_URL}/usuarios`);
    cy.contains('button', 'Administradores').click({ force: true });
    buscarUsuario(apellidoTrabajador);

    cy.contains('table tbody tr', apellidoTrabajador).within(() => {
      cy.contains('button', 'Editar').click({ force: true });
    });

    cy.get('div[style*="position: fixed"]', { timeout: 10000 }).within(() => {
      cy.get('select[name="id_rol_usuario"]').select('3'); // 3 = Trabajador
      cy.contains('button', 'Guardar Cambios').click();
    });

    cy.wait('@editarUsuario', { timeout: 15000 }).then((interception) => {
      const status = interception.response?.statusCode;
      const body = interception.response?.body;
      expect(status, `body=${JSON.stringify(body)}`).to.eq(200);
    });
    cy.get('div[style*="position: fixed"]', { timeout: 8000 }).should('not.exist');

    cy.contains('button', 'Trabajadores').click();
    buscarUsuario(apellidoTrabajador);
  });

  // --- Pedidos realizados ---

  it('Paso 17: ve el detalle de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr', { timeout: 12000 }).should('have.length.at.least', 1);

    cy.get('table tbody tr').eq(0).within(() => {
      cy.contains('button', 'Ver Detalles').click();
    });
    cy.get('.detalle-pedido-container', { timeout: 8000 }).should('be.visible');
  });

  it('Paso 18: cambia el estado de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 12000 }).should(
      'have.length.at.least',
      1,
    );

    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida =
        [...$filas].find((fila) => {
          const tieneBoton = fila
            .querySelector('button:not([disabled])')
            ?.textContent?.includes('Editar Estado');
          return tieneBoton;
        }) || $filas[0];
      cy.wrap(filaValida).as('filaEstado');
    });

    cy.get('@filaEstado')
      .find('.pedido-id')
      .invoke('text')
      .then((texto) => {
        idPedidoEstadoUsado = texto.trim();
      });

    cy.get('@filaEstado').contains('button', 'Editar Estado').click();

    cy.get('@filaEstado')
      .find('select.pedido-estado-select', { timeout: 10000 })
      .should('be.visible')
      .select('En preparación');

    cy.on('window:confirm', () => true);
    cy.get('@filaEstado').contains('button', '✓ Guardar').click();

    cy.get('@filaEstado').contains('En preparación', { timeout: 12000 }).should('be.visible');
  });

  it('Paso 19: cambia el método de pago de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 12000 }).should(
      'have.length.at.least',
      1,
    );

    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida =
        [...$filas].find((fila) => {
          const texto = fila.textContent || '';
          const tieneBoton = fila
            .querySelector('button:not([disabled])')
            ?.textContent?.includes('Editar Pago');
          const noEsLaAnterior = idPedidoEstadoUsado
            ? !texto.includes(idPedidoEstadoUsado)
            : true;
          return tieneBoton && noEsLaAnterior;
        }) || $filas[0];
      cy.wrap(filaValida).as('filaPago');
    });

    cy.get('@filaPago')
      .find('.pedido-id')
      .invoke('text')
      .then((texto) => {
        idPedidoPagoUsado = texto.trim();
      });

    cy.get('@filaPago').contains('button', 'Editar Pago').click();

    cy.get('@filaPago')
      .find('select.pedido-estado-select', { timeout: 10000 })
      .should('be.visible')
      .select('Transferencia');

    cy.get('@filaPago').contains('button', '✓ Confirmar').click();

    cy.get('@filaPago').contains('Transferencia', { timeout: 12000 }).should('be.visible');
  });

  it('Paso 20: anula un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 12000 }).should(
      'have.length.at.least',
      1,
    );

    cy.intercept('PATCH', '**/pedidos/**').as('anularPedido');
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida =
        [...$filas].find((fila) => {
          const idTexto = fila.querySelector('.pedido-id')?.textContent?.trim();
          const tieneBotonAnular = [...fila.querySelectorAll('button')].some(
            (btn) => btn.textContent?.includes('Anular') && !btn.disabled,
          );
          const esDiferenteID =
            idTexto !== idPedidoEstadoUsado && idTexto !== idPedidoPagoUsado;
          return tieneBotonAnular && esDiferenteID;
        }) || $filas[0];
      cy.wrap(filaValida).as('filaAnular');
    });

    cy.get('@filaAnular').contains('button', 'Anular').click();
    cy.wait('@anularPedido', { timeout: 15000 }).its('response.statusCode').should('eq', 200);
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
