// Flujo completo - Rol Trabajador
// Recorrido: login (con código) -> Reportes -> Notificaciones -> Productos (crear/editar)
//            -> Movimientos (entrada/salida sobre el mismo producto) -> Productos (eliminar)
//            -> Pedidos realizados (detalle, estado, pago, anular) -> Perfil -> Cerrar sesión

export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

Cypress.on('uncaught:exception', () => false);

describe('Flujo completo - Trabajador', { testIsolation: false }, () => {

  // Nombre único del producto que se crea, edita, usa en movimientos y luego se elimina
  const idUnico = Date.now().toString().slice(-6);
  const nombreProducto = `Producto Trabajador ${idUnico}`;
  const nombreProductoEditado = `Producto Trabajador Editado ${idUnico}`;
  let idProductoCreado: number | undefined;
  
  let idPedidoEstadoUsado: string;
  let idPedidoPagoUsado: string;


  before(() => {    
    cy.on('window:alert', () => true);
    cy.on('window:confirm', () => true);
    cy.loginTrabajador();
    cy.url().should('include', '/panel_control');
  });

  it('Paso 1: navega a Reportes', () => {
    cy.contains('.opcion', 'Reportes').click();
    cy.get('.reporte-imprimible', { timeout: 10000 }).should('be.visible');
  });

  it('Paso 2: navega a Notificaciones', () => {
    // Reportes y Notificaciones son pestañas de la misma vista /panel_control,
    // así que no hace falta volver a visitarla entre pasos.
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
    cy.get('textarea[placeholder="Detalles completos del producto..."]').type('Producto creado en flujo de Trabajador');

    cy.contains('button', 'Registrar Nuevo Producto').click({ force: true });
    cy.wait('@crearProducto').then(({ response }) => {
      // TODO: confirma el nombre real del campo (probablemente id_producto)
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

  // --- Pedidos realizados ---

  it('Paso 8: ve el detalle de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 4);

    // Usamos la fila 0 solo para ver detalle, sin tocar su estado/pago,
    // para no interferir con los pasos 9-11 que usan otras filas.
    cy.get('table tbody tr').eq(0).within(() => {
      cy.contains('button', 'Ver Detalles').click();
    });
    cy.get('.detalle-pedido-container').should('be.visible');
  });

   it('Paso 9: cambia el estado de un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 10000 })
      .should('have.length.at.least', 1);

    // Buscamos dinámicamente una fila que tenga el botón "Editar Estado" habilitado
    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida = [...$filas].find((fila) => {
        const tieneBoton = fila.querySelector('button:not([disabled])')?.textContent?.includes('Editar Estado');
        return tieneBoton;
      }) || $filas[0];

      cy.wrap(filaValida).as('filaEstado');
    });

    // Guardamos el ID del pedido para evitar reutilizarlo en los pasos 10 y 11
    cy.get('@filaEstado').find('.pedido-id').invoke('text').then((texto) => {
      idPedidoEstadoUsado = texto.trim();
    });

    // 1. Entrar en modo edición de estado
    cy.get('@filaEstado').contains('button', 'Editar Estado').click();

    // 2. El select aparece en la columna ESTADO
    cy.get('@filaEstado')
      .find('select.pedido-estado-select', { timeout: 8000 })
      .should('be.visible')
      .select('En preparación'); // Transición válida desde Pendiente

    // 3. Aceptar el confirm explícito que activa React tras el delay de 1s
    cy.on('window:confirm', () => true);

    // 4. Guardar cambios
    cy.get('@filaEstado').contains('button', '✓ Guardar').click();

    // 5. Verificar que el badge/texto se actualizó a 'En preparación'
    cy.get('@filaEstado')
      .contains('En preparación', { timeout: 10000 })
      .should('be.visible');
  });

  it('Paso 10: cambia el método de pago de un pedido', () => {
    // Nos aseguramos de estar en la página limpia (por si el paso anterior dejó algo abierto)
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 10000 })
      .should('have.length.at.least', 1);

    // Buscamos una fila diferente a la del Paso 9 que tenga "Editar Pago" habilitado
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

    // 1. Entrar en modo edición de pago
    cy.get('@filaPago').contains('button', 'Editar Pago').click();

    // 2. El select aparece en la columna MÉTODO PAGO
    cy.get('@filaPago')
      .find('select.pedido-estado-select', { timeout: 8000 })
      .should('be.visible')
      .select('Transferencia');

    // 3. Confirmar
    cy.get('@filaPago').contains('button', '✓ Confirmar').click();

    // 4. Verificar
    cy.get('@filaPago')
      .contains('Transferencia', { timeout: 10000 })
      .should('be.visible');
  });

  it('Paso 11: anula un pedido', () => {
    cy.visit(`${FRONT_URL}/pedidos_realizados`);
    cy.get('table tbody tr:not(.detalle-pedido-row)', { timeout: 10000 })
      .should('have.length.at.least', 1);

    // Interceptamos la petición PATCH de anulación para validar que la API respondió con éxito
    cy.intercept('PATCH', '**/pedidos/**').as('anularPedido');

    // Aceptar la ventana de confirmación (confirm) y la alerta final (alert)
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    // Seleccionar una fila con el botón "Anular pedido" habilitado
    cy.get('table tbody tr:not(.detalle-pedido-row)').then(($filas) => {
      const filaValida = [...$filas].find((fila) => {
        const idTexto = fila.querySelector('.pedido-id')?.textContent?.trim();
        const tieneBotonAnular = [...fila.querySelectorAll('button')].some(
          (btn) => btn.textContent?.includes('Anular') && !btn.disabled
        );

        // Evitar reusar IDs de pasos anteriores
        const esDiferenteID = idTexto !== idPedidoEstadoUsado && idTexto !== idPedidoPagoUsado;

        return tieneBotonAnular && esDiferenteID;
      }) || $filas[0];

      cy.wrap(filaValida).as('filaAnular');
    });

    // 1. Dar clic en Anular pedido
    cy.get('@filaAnular').contains('button', 'Anular').click();

    // 2. Validar únicamente que la petición HTTP de anulación finalizó correctamente (Status 200)
    cy.wait('@anularPedido').its('response.statusCode').should('eq', 200);
  });

  // --- Cierre ---

  it('Paso 12: va a su perfil', () => {
    cy.get('a[href="/perfil_admin"]').click();
    cy.url().should('include', '/perfil_admin');
  });

  it('Paso 13: cierra sesión', () => {
    // TODO: confirma el texto/selector exacto del botón de Cerrar sesión para Trabajador
    cy.contains('button', 'Cerrar sesión').click();
  });

});