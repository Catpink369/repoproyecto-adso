// RF-007 completo: 7.1 Registrar pedido, 7.2 Consultar/ver estado, 7.3 Cancelar/anular
Cypress.on('uncaught:exception', () => false);

const API_URL = Cypress.env('API_URL') || 'http://localhost:3000';

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
        cy.contains('button', /Generar Ticket|Confirmar pedido/i).should('not.exist');
    });

    it('CP-004: un usuario sin sesión iniciada no puede registrar un pedido (acceso directo por URL)', () => {
        cy.clearCookies();
        cy.window().then((win) => {
            win.localStorage.clear();
            win.sessionStorage.clear();
        });

        cy.visit('/ticket-compra');
        cy.url().should('include', '/login');
    });
});

describe('RF-007.2 - Consultar/ver estado de pedido', () => {
    it('CP-005: el cliente ve una notificación nueva cuando cambia el estado de su pedido', () => {
        cy.loginCliente();

        // Header_c.jsx hace dos llamadas distintas:
        //  - /notificaciones/usuario/:id/count  -> al montar (badge del contador)
        //  - /notificaciones/usuario/:id        -> solo al hacer clic en la campanita
        // El intercept viejo esperaba la 2da justo después de cy.visit(), pero
        // esa petición todavía no se dispara hasta que se hace clic en
        // .notif-wrapper — por eso el wait hacía timeout ("No request ever occurred").
        cy.intercept('GET', '**/notificaciones/usuario/*/count', {
            statusCode: 200,
            body: { count: 1 },
        }).as('getContador');

        cy.intercept('GET', '**/notificaciones/usuario/*', {
            statusCode: 200,
            body: [{
                id_notificacion: 501,
                tipo: 'pedido_estado',
                titulo: 'Actualización de tu pedido',
                mensaje: 'Tu pedido #123 cambió de estado a "En preparación"',
                leida: false,
                fecha: new Date().toISOString(),
            }],
        }).as('getNotificaciones');

        cy.visit('/cliente');
        cy.wait('@getContador');

        // cliente.jsx muestra una ventana emergente de ofertas al montar
        // (mostrarVentana -> true en un useEffect), con display:flex que
        // tapa toda la pantalla y bloquea el clic en .notif-wrapper. Hay
        // que cerrarla primero con el botón .cerrar.
        cy.get('.ventana .cerrar').click();

        cy.get('.notif-wrapper').click();
        cy.wait('@getNotificaciones');
        cy.contains(/cambió de estado|en preparación/i).should('be.visible');
    });

    it.skip('CP-006: el cliente recibe el correo de notificación cuando cambia el estado de su pedido — requiere bandeja de correo real', () => {});

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
        cy.intercept('GET', `${API_URL}/pedidos*`, {
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


export {};