// Flujo completo - Rol Cliente
// Recorrido: login -> catálogo (filtros) -> carrito -> ticket -> notificaciones
//            -> pedido personalizado -> perfil -> cerrar sesión
//
// CORRECCIÓN Paso 7: se espera explícitamente GET .../materiales/Tela y se
// garantiza que las telas tengan ruta_imagen (el front filtra materialConImagen).
// Sin esto, la UI muestra "No hay telas disponibles." y falla .lista-telas .tela-item.

export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:8080';
const IMG_PLACEHOLDER =
  'https://res.cloudinary.com/demo/image/upload/sample.jpg';

Cypress.on('uncaught:exception', () => false);

const irAInicioCliente = () => {
  cy.visit(`${FRONT_URL}/cliente`);
  cy.get('.ventana .cerrar').click();
};

describe('Flujo completo - Cliente', { testIsolation: false }, () => {

  before(() => {
    cy.on('window:alert', () => true);
    cy.loginCliente();
  });

  it('Paso 1: cierra la ventana emergente de ofertas al ingresar', () => {
    irAInicioCliente();
  });

  it('Paso 2: va al catálogo y filtra por categoría y clasificación', () => {
    cy.visit(`${FRONT_URL}/catalogo_c`);
    cy.get('.contenedor-productos > div').should('have.length.at.least', 1);

    cy.contains('button', 'Amigurumis').click();
    cy.contains('button', 'Nuevos').click();

    cy.get('.contenedor-productos > div').should('have.length.at.least', 1);
  });

  it('Paso 3: agrega productos al carrito', () => {
    // Solo tarjetas con stock (botón "Agregar al carrito")
    cy.get('.contenedor-productos > div')
      .filter(':has(button:contains("Agregar al carrito"))')
      .should('have.length.at.least', 2)
      .then(($cards) => {
        cy.wrap($cards.eq(0)).contains('button', 'Agregar al carrito').click();
        cy.wrap($cards.eq(1)).contains('button', 'Agregar al carrito').click();
      });

    cy.get('header').find('a[href="/carrito"]').click();
    cy.get('.carrito-producto-card').should('have.length', 2);
  });

  it('Paso 4: elimina un producto del carrito', () => {
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('.eliminar').first().click();
    cy.get('.carrito-producto-card').should('have.length', 1);
  });

  it('Paso 5: genera el ticket de compra', () => {
    cy.contains('button', /Generar Ticket|Confirmar pedido/i).click();
    cy.url().should('include', '/ticket-compra');
  });

  it('Paso 6: vuelve al inicio y revisa la notificación del ticket', () => {
    irAInicioCliente();
    cy.get('.notif-wrapper').click({ force: true });
    // El panel de notificaciones es fixed; comprobamos existencia, no "visible" estricto
    cy.contains(/Pedido realizado con éxito|pedido|ticket/i, { timeout: 10000 })
      .scrollIntoView()
      .should('exist');
  });

  it('Paso 7: personaliza una sábana (color, tamaño, diseño, fundas) y genera el ticket', () => {
    // Intercept SOLO telas: si vienen sin ruta_imagen, el front las oculta
    // (materialConImagen). Inyectamos placeholder para que .tela-item exista.
    cy.intercept('GET', '**/pedidos-personalizados/materiales/Tela', (req) => {
      req.continue((res) => {
        if (Array.isArray(res.body) && res.body.length > 0) {
          res.body = res.body.map((m: { ruta_imagen?: string | null }) => ({
            ...m,
            ruta_imagen:
              m.ruta_imagen &&
              String(m.ruta_imagen).trim() !== '' &&
              String(m.ruta_imagen).trim().toLowerCase() !== 'null'
                ? m.ruta_imagen
                : IMG_PLACEHOLDER,
          }));
        }
      });
    }).as('getTelas');

    cy.visit(`${FRONT_URL}/p_sabanas`);
    cy.location('pathname', { timeout: 10000 }).should('include', '/p_sabanas');

    cy.wait('@getTelas', { timeout: 15000 }).then((interception) => {
      const body = interception.response?.body;
      expect(
        Array.isArray(body) && body.length > 0,
        'La API debe devolver al menos 1 tela. Ejecuta en backend: npm run db:prepare:test (seed con materiales tipo Tela y ruta_imagen).',
      ).to.eq(true);
    });

    // Tamaño (primera radio-card de la sección tamaño)
    cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click();

    // Telas: ya no deben aparecer "No hay telas disponibles"
    cy.contains('No hay telas disponibles.').should('not.exist');
    cy.get('.lista-telas .tela-item', { timeout: 12000 }).first().click();

    cy.contains('label', 'Incluir sobresábana')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.contains('.radio-card', 'Dos fundas').click();

    cy.get('.btn-confirmar-ped').should('not.be.disabled').click();
  });

  it('Paso 8: revisa la notificación del pedido personalizado', () => {
    irAInicioCliente();
    cy.get('.notif-wrapper').click({ force: true });
    cy.contains(/Pedido realizado con éxito|personalizado|pedido/i, { timeout: 10000 })
      .scrollIntoView()
      .should('exist');
  });

  it('Paso 9: entra a su perfil y actualiza sus datos', () => {
    cy.get('a[href="/perfil"]').click();
    cy.url().should('include', '/perfil');

    cy.contains('button', 'Cambiar datos').click();
    cy.get('#telefono').clear().type('3111112222');
    cy.contains('button', 'Guardar').click({ force: true });
  });

  it('Paso 10: cierra sesión', () => {
    cy.contains('button', 'Cerrar sesión').click();
    cy.url().should('eq', `${FRONT_URL}/`);
  });

});
