// RF-005.1 y RF-005.2 - Gestion pedidos personalizados
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

describe('RF-005.1 - Acceder a personalización', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/pedidos_personalizados`);
    });

    it('debe mostrar las dos opciones de personalización: sábanas y cubrelechos', () => {
        cy.contains('Personalizar sábana').should('be.visible');
        cy.contains('Personalizar cubrelecho').should('be.visible');
    });

    it('CP-004: el botón de confirmar debe permanecer deshabilitado si faltan campos obligatorios', () => {
        cy.contains('Personalizar sábana').click();
        cy.url().should('include', '/p_sabanas');
        cy.get('button').contains(/confirmar/i).should('be.disabled');
    });
});

describe('RF-005.1 / RF-005.2 - Personalizar cubrelecho de dos lados y calcular precio', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/p_cubrelecho`);
    });

    it('CP-001: debe permitir elegir una tela distinta para cada lado del cubrelecho', () => {
        cy.get('[data-testid="tela-lado-1"]').should('exist');
        cy.get('[data-testid="tela-lado-2"]').should('exist');
    });

    it('CP-005: el precio mostrado debe actualizarse al sumar cada opción elegida', () => {
        cy.get('[data-testid="precio-total"]').invoke('text').then((precioInicial) => {
        cy.get('[data-testid="tela-lado-1"]').first().click();
        cy.get('[data-testid="precio-total"]').invoke('text').should('not.eq', precioInicial);
        });
    });

    it('CP-007: cambiar de opción varias veces antes de confirmar no debe arrastrar precios de selecciones anteriores', () => {
        cy.get('[data-testid="tela-lado-1"]').eq(0).click();
        cy.get('[data-testid="precio-total"]').invoke('text').as('precioOpcionA');
        cy.get('[data-testid="tela-lado-1"]').eq(1).click();
        cy.get('@precioOpcionA').then((precioA) => {
        cy.get('[data-testid="precio-total"]').invoke('text').should('not.eq', precioA);
        });
    });
});

describe('RF-005.1 - Personalizar sábana con complementos opcionales', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/p_sabanas`);
    });

    it('CP-002: debe permitir agregar sobresábana y fundas como complementos opcionales', () => {
        cy.get('[data-testid="extra-sobresabana"]').click();
        cy.get('[data-testid="extra-funda"]').click();
        cy.get('[data-testid="resumen-extras"]').should('contain.text', 'Sobresábana');
    });

    it('CP-006: el resumen antes de confirmar debe mostrar el desglose por cada opción elegida', () => {
        cy.get('[data-testid="tela"]').first().click();
        cy.get('[data-testid="extra-sobresabana"]').click();
        cy.contains('Resumen').click();
        cy.get('[data-testid="desglose-item"]').should('have.length.at.least', 2);
    });
});

export {};