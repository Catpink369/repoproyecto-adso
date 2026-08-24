/// <reference types="cypress" />
// ***********************************************

declare global {
    namespace Cypress {
        interface Chainable {
        loginAdmin(): Chainable<void>;
        loginTrabajador(): Chainable<void>;
        loginCliente(): Chainable<{ idUsuario: string; correo: string }>;
        }
    }
}

const API_URL = Cypress.env('API_URL') || 'http://localhost:3000';
const API_KEY = Cypress.env('API_KEY');
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

// Credenciales leídas desde cypress.env.json (no quemadas en el código)
const ADMIN_EMAIL = Cypress.env('adminEmail');
const ADMIN_PASSWORD = Cypress.env('adminPassword');
const ADMIN_CODE = Cypress.env('adminCode');

const TRABAJADOR_EMAIL = Cypress.env('trabajadorEmail');
const TRABAJADOR_PASSWORD = Cypress.env('trabajadorPassword');
const TRABAJADOR_CODE = Cypress.env('trabajadorCode');

const CLIENTE_EMAIL = Cypress.env('clienteEmail');
const CLIENTE_PASSWORD = Cypress.env('clientePassword');

// Iniciar sesion como admin
Cypress.Commands.add('loginAdmin', () => {
        cy.session('admin-session', () => {
        cy.visit(`${FRONT_URL}/login`, { timeout: 15000 });
        cy.get('#correo', { timeout: 15000 }).type(ADMIN_EMAIL);
        cy.get('#contrasena').type(ADMIN_PASSWORD);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/admin-code');

        cy.get('#codigo').type(ADMIN_CODE);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/panel_control');
    });
        cy.visit(`${FRONT_URL}/panel_control`);
});

Cypress.Commands.add('loginTrabajador', () => {
        cy.session('trabajador-session', () => {
        cy.visit(`${FRONT_URL}/login`, { timeout: 15000 });
        cy.get('#correo', { timeout: 15000 }).type(TRABAJADOR_EMAIL);
        cy.get('#contrasena').type(TRABAJADOR_PASSWORD);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/admin-code');

        cy.get('#codigo').type(TRABAJADOR_CODE);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should('include', '/panel_control');
    });
        cy.visit(`${FRONT_URL}/panel_control`);
});

//logear cliente para pruebas
Cypress.Commands.add('loginCliente', () => {
    cy.session('cliente-session', () => {
        cy.visit(`${FRONT_URL}/login`, { timeout: 15000 });
        cy.get('#correo', { timeout: 15000 }).type(CLIENTE_EMAIL);
        cy.get('#contrasena').type(CLIENTE_PASSWORD);
        cy.get('button[type="submit"]').click();

        cy.url({ timeout: 10000 }).should('include', '/cliente');
    });
        cy.visit(`${FRONT_URL}/cliente`);
});

export {};