// RF-007.1 al RF-007.3 - Gestión de Pedidos
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

describe('RF-007.1 - Registrar pedido', () => {

    it('CP-001: el cliente confirma un pedido con stock suficiente', () => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').first().within(() => cy.contains('Agregar').click());

        cy.get('img[alt="icono carrito"]').click();
        cy.url().should('include', '/carrito');

        cy.contains('Generar Ticket de pedido').click();
        cy.contains('Pendiente').should('be.visible'); // TODO: confirmar selector/texto real del ticket
        cy.contains('Imprimir/Guardar PDF').should('be.visible').click();
        cy.contains('Volver al inicio').click();
        cy.url().should('eq', `${FRONT_URL}/`);
    });

    it('CP-002: el sistema rechaza el pedido si un producto se queda sin stock antes de confirmar', () => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').first().within(() => cy.contains('Agregar').click());
        cy.get('img[alt="icono carrito"]').click();

        // TODO: forzar stock a 0 vía API (como hace loginCliente) antes de confirmar
        // cy.request({ method: 'PATCH', url: `${API_URL}/productos/:id`, headers: {...}, body: { stock_actual: 0 } });

        cy.contains('Generar Ticket de pedido').click();
        cy.contains(/sin stock|no tiene stock suficiente/i).should('be.visible');
    });

    it('CP-003: no debe permitir confirmar un pedido con el carrito vacío', () => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/carrito`);
        cy.contains('Tu carrito está vacío, agrega productos antes de continuar').should('be.visible');
        // TODO: si además hay un botón "Generar Ticket", validar que esté disabled
    });

    // CP-004 (usuario sin sesión no puede registrar pedido) ya está cubierto por
    // jwt-auth.guard.spec.ts en el backend — no requiere duplicarse acá en e2e,
    // salvo que quieran validar además el redirect visual al /login.
});

describe('RF-007.2 - Consultar/ver estado de pedido', () => {
    // CP-005 (notificación in-app) y CP-006 (correo) ya están en notificaciones.spec.ts
    // (backend). La parte visible de CP-005 ya se valida en notificaciones.cy.ts (RF-009.3).

    it('CP-007: el admin/trabajador consulta el listado de todos los pedidos con su estado', () => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/pedidos_realizados`); // TODO: confirmar ruta real
        cy.get('table.tabla tbody tr').should('have.length.at.least', 1);
        cy.get('table.tabla thead').within(() => {
            cy.contains('Estado').should('be.visible');
        });
    });

    it('CP-008: el sistema deniega a un cliente el acceso al pedido de otro cliente', () => {
        cy.loginCliente();
        // TODO: reemplazar por un id_pedido real que NO pertenezca a este cliente
        cy.visit(`${FRONT_URL}/pedido/9999`, { failOnStatusCode: false });
        cy.contains(/no autorizado/i).should('be.visible');
    });
});

describe('RF-007.3 - Cancelar/anular pedido', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/pedidos_realizados`);
    });

    it('CP-009: el admin anula un pedido en estado "Pendiente"', () => {
        // TODO: confirmar selector para ubicar una fila con estado "Pendiente"
        cy.contains('tr', 'Pendiente').within(() => {
            cy.contains('Anular pedido').click();
        });
        cy.on('window:confirm', () => true);
        cy.contains('tr', 'Anulado').should('exist');
    });

    it('CP-010: no debe permitir anular un pedido ya entregado/completado', () => {
        cy.contains('tr', 'Entregado').within(() => {
            cy.contains('Anular pedido').should('not.exist'); // o .should('be.disabled')
        });
    });
});

export {};