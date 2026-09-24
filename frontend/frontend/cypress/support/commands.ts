/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginAdmin(): Chainable<void>;
      loginTrabajador(): Chainable<void>;
      loginCliente(): Chainable<{ idUsuario: string; correo: string }>;
    }
  }
}

const FRONT_URL = () => Cypress.env('FRONT_URL') || 'http://localhost:8080';

function loginForm(email: string, password: string) {
  cy.visit(`${FRONT_URL()}/login`);
  cy.get('#correo').clear().type(email, { log: false });
  cy.get('#contrasena').clear().type(password, { log: false });
  cy.get('button[type="submit"]').click();
}

// Admin
Cypress.Commands.add('loginAdmin', () => {
  cy.session(
    'admin-session',
    () => {
      loginForm(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
      cy.url({ timeout: 15000 }).should('include', '/admin-code');
      cy.get('#codigo').should('be.visible').clear().type(Cypress.env('adminCode'));
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 15000 }).should('include', '/panel_control');
    },
    { cacheAcrossSpecs: true },
  );
  cy.visit(`${FRONT_URL()}/panel_control`);
});

// Trabajador (Harry 123412332 / harry@gmail.com)
Cypress.Commands.add('loginTrabajador', () => {
  cy.session(
    'trabajador-session',
    () => {
      loginForm(Cypress.env('trabajadorEmail'), Cypress.env('trabajadorPassword'));
      cy.url({ timeout: 15000 }).should('include', '/admin-code');
      cy.get('#codigo').should('be.visible').clear().type(Cypress.env('trabajadorCode'));
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 15000 }).should('include', '/panel_control');
    },
    { cacheAcrossSpecs: true },
  );
  cy.visit(`${FRONT_URL()}/panel_control`);
});

// Cliente
Cypress.Commands.add('loginCliente', () => {
  cy.session(
    'cliente-session',
    () => {
      loginForm(Cypress.env('clienteEmail'), Cypress.env('clientePassword'));
      cy.url({ timeout: 15000 }).should('include', '/cliente');
    },
    { cacheAcrossSpecs: true },
  );
  cy.visit(`${FRONT_URL()}/cliente`);
});

export {};
