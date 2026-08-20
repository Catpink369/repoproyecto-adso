// 7.1 a 7.3
// Evita que Cypress aborte la suite por errores no capturados del frontend
Cypress.on('uncaught:exception', () => false);

describe('RF-007.1 - Registrar pedido', () => {
    beforeEach(() => {
        cy.loginCliente();
    });

    it('CP-001: el cliente confirma un pedido con stock suficiente desde el carrito', () => {
        cy.visit('/catalogo_c');
        cy.get('.contenedor-productos > div').first().find('button').click();
        cy.get('header').find('a[href="/carrito"]').click();
        cy.contains('button', /Generar Ticket|Confirmar pedido/i).click();
        cy.url().should('include', '/ticket-compra');
    });

    it('CP-002: el sistema rechaza el pedido si un producto se queda sin stock antes de confirmar', () => {
        cy.intercept('POST', '**/pedidos/crear', {
            statusCode: 400,
            body: { message: 'El producto no tiene stock suficiente' }
        }).as('crearPedidoSinStock');

        cy.visit('/catalogo_c');
        cy.get('.contenedor-productos > div').first().find('button').click();
        cy.get('header').find('a[href="/carrito"]').click();
        cy.contains('button', /Generar Ticket|Confirmar pedido/i).click();
        
        cy.wait('@crearPedidoSinStock');
        cy.contains(/sin stock|no tiene stock suficiente/i).should('be.visible');
    });

    it('CP-003: no debe permitir confirmar un pedido con el carrito vacío', () => {
        cy.window().then((win) => {
            win.localStorage.removeItem('carrito');
        });

        cy.visit('/carrito');
        cy.contains(/carrito.*vacío|tu carrito está vacío|no hay productos/i).should('be.visible');
        
        // CORREGIDO: Se eliminó .click() para validar únicamente que el botón NO exista en el DOM
        cy.contains('button', /Generar Ticket|Confirmar pedido/i).should('not.exist');
    });
});

describe('RF-007.2 - Consultar/ver estado de pedido', () => {
    it('CP-007: el admin/trabajador consulta el listado de todos los pedidos con su estado', () => {
        cy.loginAdmin();
        cy.visit('/pedidos_realizados');
        cy.get('table, main, section, .panel-control', { timeout: 10000 }).should('be.visible');
    });

    it('CP-008: el sistema deniega a un cliente el acceso a detalles no autorizados de otros usuarios', () => {
        cy.loginCliente();
        cy.visit('/pedidos_realizados', { failOnStatusCode: false });
        cy.url().should('not.include', '/pedidos_realizados');
    });
});

describe('RF-007.3 - Cancelar/anular pedido', () => {
    beforeEach(() => {
        cy.loginAdmin();
    });

    it('CP-009: el admin anula un pedido en estado "Pendiente"', () => {
        cy.visit('/pedidos_realizados');
        cy.contains('button', /anular|cancelar/i).first().click();
        cy.contains(/anulado|cancelado/i).should('be.visible');
    });

    it('CP-010: no debe permitir anular un pedido ya entregado o finalizado', () => {
        // CORREGIDO: Interceptamos la API para inyectar un pedido Entregado simulado
        cy.intercept('GET', '**/pedidos*', {
            statusCode: 200,
            body: [
                { id: 101, estado: 'Entregado', cliente: 'Cliente Prueba', total: 15000 },
                { id: 102, estado: 'Pendiente', cliente: 'Cliente Prueba', total: 20000 }
            ]
        }).as('getPedidosEntregados');

        cy.visit('/pedidos_realizados');
        cy.wait('@getPedidosEntregados');

        cy.contains(/entregado|finalizado|completado/i)
            .parents('tr, div')
            .first()
            .within(() => {
                cy.contains('button', /anular|cancelar/i).should('not.exist');
            });
    });
});