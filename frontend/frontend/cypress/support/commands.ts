/// <reference types="cypress" />
// ***********************************************

declare global {
    namespace Cypress {
        interface Chainable {
        loginAdmin(): Chainable<void>;
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

//Iniciar sesion como trabajador

Cypress.Commands.add('loginAdmin', () => {
        cy.session('admin-session', () => {
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

// registrar y logear cliente para pruebas
Cypress.Commands.add('loginCliente', () => {
    const sufijo = Date.now();
    const idUsuario = `CY${sufijo}`;
    const correo = `cliente.cy.${sufijo}@test.com`;
    const contrasena = 'Test1234';

    return cy
        .request({
        method: 'POST',
        url: `${API_URL}/usuarios`,
        headers: { 'x-api-key': API_KEY },
        body: {
            id_usuario: idUsuario,
            nom_1: 'Cliente',
            ape_1: 'Cypress',
            correo,
            telefono: '3001234567',
            contrasena,
            t_doc: 'CC',
            id_rol_usuario: '2',
        },
        })
        .then(() => {
        cy.session(idUsuario, () => {
            cy.visit(`${FRONT_URL}/login`);
            cy.get('#correo').type(correo);
            cy.get('#contrasena').type(contrasena);
            cy.get('button[type="submit"]').click();
            cy.url().should('include', '/cliente');
        });
        cy.visit(`${FRONT_URL}/cliente`);
        return { idUsuario, correo };
    });
});

export {};