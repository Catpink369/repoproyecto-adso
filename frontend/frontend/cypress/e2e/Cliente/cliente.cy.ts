// Flujo completo - Rol Cliente
// Recorrido: login -> catálogo (filtros) -> carrito -> ticket -> notificaciones
//            -> pedido personalizado -> perfil -> cerrar sesión

export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

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
    cy.get('.contenedor-productos > div').eq(0).contains('button', 'Agregar al carrito').click();
    cy.get('.contenedor-productos > div').eq(1).contains('button', 'Agregar al carrito').click();

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
    cy.get('.notif-wrapper').click();
    cy.contains('Pedido realizado con éxito').should('be.visible');
  });

  it('Paso 7: personaliza una sábana (color, tamaño, diseño, fundas) y genera el ticket', () => {
    cy.intercept('GET', '**/pedidos-personalizados/materiales/**').as('getMateriales');
    cy.visit(`${FRONT_URL}/p_sabanas`);
    cy.location('pathname', { timeout: 10000 }).should('include', '/p_sabanas');
    cy.wait('@getMateriales');

    cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click(); 
    cy.get('.lista-telas .tela-item', { timeout: 12000 }).first().click(); 


    cy.contains('label', 'Incluir sobresábana')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.contains('.radio-card', 'Dos fundas').click();

    cy.get('.btn-confirmar-ped').should('not.be.disabled').click();

  });

  it('Paso 8: revisa la notificación del pedido personalizado', () => {
    irAInicioCliente();
    cy.get('.notif-wrapper').click();
    cy.contains('Pedido realizado con éxito').should('be.visible');
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