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

// Iniciar sesion como admin
Cypress.Commands.add('loginAdmin', () => {
        cy.session('admin-session', () => {
        cy.visit(`${FRONT_URL}/login`);
        cy.get('#correo').type('valruiz@gmail.com');
        cy.get('#contrasena').type('vale123');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/admin-code');

        cy.get('#codigo').type('12345');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/panel_control');
    });
        cy.visit(`${FRONT_URL}/panel_control`);
});

Cypress.Commands.add('loginTrabajador', () => {
        cy.session('trabajador-session', () => {
        cy.visit(`${FRONT_URL}/login`);
        cy.get('#correo').type('***@gmail.com');
        cy.get('#contrasena').type('***');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/admin-code');

        cy.get('#codigo').type('****');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/panel_control');
    });
        cy.visit(`${FRONT_URL}/panel_control`);
});

//logear cliente para pruebas
Cypress.Commands.add('loginCliente', () => {
    cy.session('admin-session', () => {
        cy.visit(`${FRONT_URL}/login`);
        cy.get('#correo').type('catpink369@gmail.com');
        cy.get('#contrasena').type('123456');
        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/cliente');
    });
        cy.visit(`${FRONT_URL}/cliente`);
});

export {};