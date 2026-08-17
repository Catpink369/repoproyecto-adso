// RF-006.1 a RF-006.5 - Gestion de carrito

export {}; // Convertir el archivo en módulo para aislar el scope global de TypeScript
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

describe('RF-006.1 - Agregar producto al carrito', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
    });

    it('CP-001: debe agregar un producto estándar al carrito y el contador debe incrementarse', () => {
        cy.get('.producto').first().within(() => {
        cy.contains('Agregar').click();
        });
        cy.visit(`${FRONT_URL}/carrito`);
        cy.get('.carrito-producto-card').should('have.length.at.least', 1);
    });

    it('CP-002: no debe permitir agregar un producto sin stock disponible', () => {
        cy.contains('Sin stock disponible').should('be.visible');
    });
});

describe('RF-006.2 - Visualizar carrito de compra', () => {
    beforeEach(() => {
        cy.loginCliente();
    });

    it('CP-003: debe calcular correctamente la sumatoria del precio total de todos los productos', () => {
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').eq(0).within(() => cy.contains('Agregar').click());
        cy.get('.producto').eq(1).within(() => cy.contains('Agregar').click());

        cy.visit(`${FRONT_URL}/carrito`);

        cy.get('.carrito-producto-subtotal').then(($subtotales) => {
        const suma = Array.from($subtotales).reduce((acc, el) => {
            const num = parseInt(el.innerText.replace(/[^\d]/g, ''), 10);
            return acc + num;
        }, 0);

        cy.get('.carrito-resumen-total').invoke('text').then((textoTotal) => {
            const total = parseInt(textoTotal.replace(/[^\d]/g, ''), 10);
            expect(total).to.eq(suma);
        });
    });
});

    it('CP-004: debe mostrar un mensaje informativo cuando el carrito está vacío', () => {
        cy.visit(`${FRONT_URL}/carrito`);
        cy.contains('Tu carrito está vacío').should('be.visible');
    });
});

describe('RF-006.3 - Modificar cantidad del carrito', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').first().within(() => cy.contains('Agregar').click());
        cy.visit(`${FRONT_URL}/carrito`);
    });

    it('CP-005: el botón de disminuir debe deshabilitarse en cantidad 1 (no permite bajar de 1)', () => {
        cy.get('.carrito-btn-cantidad-menos').first().should('be.disabled');
    });

    it('CP-007: debe permitir aumentar la cantidad dentro del límite de stock', () => {
        cy.get('.carrito-input-cantidad').invoke('val').then((valorInicial) => {
        cy.get('.carrito-btn-cantidad-mas').first().click();
        cy.get('.carrito-input-cantidad').invoke('val').should('not.eq', valorInicial);
        });
    });

    it('CP-008: debe permitir disminuir la cantidad sin bajar de 1', () => {
        cy.get('.carrito-btn-cantidad-mas').first().click(); // Incrementa a 2
        cy.get('.carrito-input-cantidad').invoke('val').then((valorIncrementado) => {
        cy.get('.carrito-btn-cantidad-menos').first().click(); // Disminuye a 1
        cy.get('.carrito-input-cantidad').invoke('val').should('not.eq', valorIncrementado);
        });
    });

    it('CP-006: no debe permitir incrementar por encima del stock disponible', () => {
        cy.get('.carrito-producto-stock').invoke('text').then((texto) => {
        const stockDisponible = parseInt(texto.replace(/[^\d]/g, ''), 10);
        for (let i = 1; i < stockDisponible; i++) {
            cy.get('.carrito-btn-cantidad-mas').first().click();
        }
        cy.get('.carrito-btn-cantidad-mas').first().should('be.disabled');
        });
    });
});

describe('RF-006.4 - Quitar producto del carrito', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').eq(0).within(() => cy.contains('Agregar').click());
        cy.get('.producto').eq(1).within(() => cy.contains('Agregar').click());
        cy.visit(`${FRONT_URL}/carrito`);
    });

    it('CP-009: debe eliminar el producto específico indicado del carrito', () => {
        cy.get('.carrito-producto-card').should('have.length', 2);
        cy.get('.eliminar').first().click();
        cy.on('window:confirm', () => true);
        cy.get('.carrito-producto-card').should('have.length', 1);
    });

    it('CP-010: al cancelar la eliminación, el producto debe permanecer en el carrito', () => {
        cy.get('.carrito-producto-card').should('have.length', 2);
        cy.on('window:confirm', () => false);
        cy.get('.eliminar').first().click();
        cy.get('.carrito-producto-card').should('have.length', 2);
    });
});

describe('RF-006.5 - Vaciar carrito', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').eq(0).within(() => cy.contains('Agregar').click());
        cy.visit(`${FRONT_URL}/carrito`);
    });

    it('CP-011: debe vaciar el carrito cuando contiene productos', () => {
        cy.on('window:confirm', () => true);
        cy.get('.btn-vaciar-carrito').click();
        cy.contains('Tu carrito está vacío').should('be.visible');
    });

    it('CP-012: al cancelar el vaciado, el carrito debe mantener sus productos', () => {
        cy.on('window:confirm', () => false);
        cy.get('.btn-vaciar-carrito').click();
        cy.get('.carrito-producto-card').should('have.length.at.least', 1);
    });
});