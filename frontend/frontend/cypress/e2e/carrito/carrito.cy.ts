// RF-006 - Flujo de carrito de compras, CP-001 al CP-0012

export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

Cypress.on('uncaught:exception', () => false);

const stubConfirm = (retorna: boolean) => {
    cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(retorna);
    });
};

describe('RF-006 - Gestión de carrito', { testIsolation: false }, () => {
    before(() => {
        cy.on('window:alert', () => true); // este sí es seguro dejarlo fijo, nunca se alterna
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.contenedor-productos > div').should('have.length.at.least', 1);
    });

    it('CP-001: debe mostrar la imagen y la información al entrar al detalle de un producto', () => {
        cy.get('.producto').first().click();
        cy.url().should('include', '/producto/');

        cy.get('#producto-imagen')
            .should('be.visible')
            .and(($img) => {
                expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
            });
        cy.get('#producto-nombre').should('be.visible').and('not.be.empty');
        cy.get('#producto-descripcion').should('be.visible');
        cy.get('#producto-precio').should('be.visible').and('contain.text', 'Precio');
    });

    it('CP-002: debe agregar un producto al carrito desde el detalle', () => {
        cy.get('.btn-carrito').should('be.visible').and('not.be.disabled').click();
        cy.contains('button', 'Volver al catálogo').click();
        cy.url().should('include', '/catalogo_c');
    });

    it('CP-003: no debe permitir agregar un producto cuando se agota el stock (botón bloqueado)', () => {
        const agotarStockPrimerProducto = (intentos = 0) => {
            if (intentos > 300) {
                throw new Error('Se superó el límite de intentos intentando agotar el stock');
            }
            cy.get('.contenedor-productos > div')
                .first()
                .find('button')
                .then(($btn) => {
                    if ($btn.is(':disabled')) {
                        cy.wrap($btn).should('be.disabled').and('contain.text', 'Sin stock');
                    } else {
                        cy.wrap($btn).click();
                        agotarStockPrimerProducto(intentos + 1);
                    }
                });
        };
        agotarStockPrimerProducto();
    });

    it('CP-004: debe calcular correctamente la sumatoria del precio total del pedido', () => {
        cy.get('header').find('a[href="/carrito"]').click();
        cy.url().should('include', '/carrito');

        cy.get('.carrito-producto-subtotal').then(($subtotales) => {
            const suma = Array.from($subtotales).reduce((acc, el) => {
                const num = parseInt((el as HTMLElement).innerText.replace(/[^\d]/g, ''), 10);
                return acc + num;
            }, 0);

            cy.get('.carrito-resumen-total')
                .invoke('text')
                .then((textoTotal) => {
                    const total = parseInt(textoTotal.replace(/[^\d]/g, ''), 10);
                    expect(total).to.eq(suma);
                });
        });
    });

    it('CP-005: al cancelar el vaciado, el carrito debe mantener sus productos', () => {
        stubConfirm(false);
        cy.get('.btn-vaciar-carrito').click();
        cy.get('.carrito-producto-card').should('have.length.at.least', 1);
    });

    it('CP-006: debe vaciar el carrito cuando contiene productos y mostrar el estado vacío', () => {
        stubConfirm(true);
        cy.get('.btn-vaciar-carrito').click();

        cy.get('.carrito-vacio-container').should('be.visible');

        cy.get('.carrito-vacio-icono').should('exist');
        cy.contains('h2', 'Tu carrito está vacío').should('be.visible');
        cy.contains('Agrega productos desde nuestro catálogo').should('be.visible');
        cy.contains('button', 'Ir al Catálogo').should('be.visible');
    });

    it('CP-007: debe agregar 2 productos diferentes desde el catálogo', () => {
        cy.contains('button', 'Ir al Catálogo').click();
        cy.url().should('include', '/catalogo_c');

        cy.get('.contenedor-productos > div').eq(0).find('button').click();
        cy.get('.contenedor-productos > div').eq(1).find('button').click();

        cy.get('header').find('a[href="/carrito"]').click();
        cy.get('.carrito-producto-card').should('have.length', 2);
    });

    it('CP-008: el botón de disminuir debe deshabilitarse en cantidad 1', () => {
        cy.get('.carrito-producto-card')
            .first()
            .find('.carrito-cantidad-control button')
            .eq(0)
            .should('be.disabled');
    });

    it('CP-009: debe permitir aumentar la cantidad', () => {
        cy.get('.carrito-producto-card')
            .first()
            .within(() => {
                cy.get('.carrito-input-cantidad')
                    .invoke('val')
                    .then((valorInicial) => {
                        cy.get('.carrito-cantidad-control button').eq(1).click(); // "+"
                        cy.get('.carrito-input-cantidad').should('not.have.value', valorInicial);
                    });
            });
    });

    it('CP-010: debe permitir disminuir la cantidad sin bajar de 1', () => {
        cy.get('.carrito-producto-card')
            .first()
            .within(() => {
                cy.get('.carrito-input-cantidad')
                    .invoke('val')
                    .then((valorAntes) => {
                        cy.get('.carrito-cantidad-control button').eq(0).click(); // "-"
                        cy.get('.carrito-input-cantidad').should('not.have.value', valorAntes);
                    });
            });
    });

    it('CP-011: debe eliminar el producto específico indicado del carrito', () => {
        cy.get('.carrito-producto-card').should('have.length', 2);
        stubConfirm(true);
        cy.get('.eliminar').first().click();
        cy.get('.carrito-producto-card').should('have.length', 1);
    });

    it('CP-012: al cancelar la eliminación, el producto debe permanecer en el carrito', () => {
        stubConfirm(false);
        cy.get('.eliminar').first().click();
        cy.get('.carrito-producto-card').should('have.length', 1);
    });
});