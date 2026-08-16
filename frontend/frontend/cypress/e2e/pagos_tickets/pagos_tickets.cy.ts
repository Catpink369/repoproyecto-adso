// RF-008.1 al RF-008.4 - Gestión de Pagos y Tickets
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

describe('RF-008.1 - Generar ticket de pedido (automático)', () => {

    it('CP-001: genera el ticket con número único al confirmar un pedido de producto estándar', () => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').first().within(() => cy.contains('Agregar').click());
        cy.get('img[alt="icono carrito"]').click();
        cy.contains('Generar Ticket de pedido').click();

        cy.get('[data-testid="num-ticket"]').invoke('text').should('match', /\d+/); // TODO: confirmar selector
    });

    it('CP-002: genera el ticket detallando las opciones de un pedido personalizado', () => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/p_cubrelecho`);
        cy.get('[data-testid="tela-lado-1"]').first().click();
        cy.get('[data-testid="tela-lado-2"]').first().click();
        cy.contains(/confirmar/i).click();

        cy.get('[data-testid="ticket-detalle-personalizacion"]').should('be.visible'); // TODO: ajustar
    });

    it('CP-003: el ticket se crea con estado de pedido y de pago "Pendiente" por defecto', () => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/catalogo_c`);
        cy.get('.producto').first().within(() => cy.contains('Agregar').click());
        cy.get('img[alt="icono carrito"]').click();
        cy.contains('Generar Ticket de pedido').click();

        cy.contains('Pendiente').should('be.visible'); // estado del pedido
        cy.contains('Pendiente').should('be.visible'); // estado del pago -- TODO: distinguir selector de cada uno
    });

    it('CP-004: no deben existir tickets duplicados con el mismo número', () => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/pedidos_realizados`);
        cy.get('[data-testid="num-ticket"]').then(($tickets) => {
            const numeros = Array.from($tickets).map((el) => el.innerText.trim());
            const unicos = new Set(numeros);
            expect(unicos.size).to.eq(numeros.length);
        });
    });
});

describe('RF-008.2 - Actualizar estado de pedido', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/pedidos_realizados`);
    });

    it('CP-005: el administrador/trabajador puede cambiar manualmente el estado del pedido', () => {
        cy.contains('tr', 'Pendiente').within(() => cy.contains('Editar Estado').click());
        cy.contains('En preparación').click(); // TODO: confirmar UI real del selector de estado
        cy.contains('Confirmar').click();
        cy.contains('tr', 'En preparación').should('exist');
    });

    ['Entregado', 'Finalizado', 'Anulado'].forEach((estado) => {
        it(`CP-006: bloquea el cambio de estado si el pedido ya está "${estado}"`, () => {
            cy.contains('tr', estado).within(() => cy.contains('Editar Estado').click());
            cy.contains('Confirmar').click();
            cy.contains('Error al actualizar el estado').should('be.visible');
            cy.contains('tr', estado).should('exist'); // el estado no cambió
        });
    });

    // CP-007 (notificación push al cliente) ya está cubierta en notificaciones.spec.ts
    // (backend). Si quieren validar la parte visible, iría en notificaciones.cy.ts.
});

describe('RF-008.3 - Actualizar método de pago', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/pedidos_personalizados_realizados`); // TODO: confirmar ruta real
    });

    it('CP-008: actualiza el método de pago y el estado de pago a "Pagado"', () => {
        cy.get('tr').first().within(() => cy.contains('Editar Pago').click());
        cy.contains('Nequi').click(); // opciones: Efectivo, Tarjeta, Transferencia, Nequi, DaviPlata
        cy.contains('Confirmar').click();

        cy.contains('tr', 'Nequi').should('exist');
        cy.contains('tr', 'Pagado').should('exist');
    });

    it('CP-009: muestra "Por definir" cuando no hay método de pago asignado', () => {
        cy.contains('tr', 'Por definir').should('exist'); // TODO: confirmar texto real en UI (backend usa "Por_definir")
    });
});

describe('RF-008.4 - Consultar tickets y pedidos realizados', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/mis_pedidos`); // TODO: confirmar ruta real
    });

    it('CP-010: muestra el historial completo de pedidos del usuario', () => {
        cy.get('.pedido-card').should('have.length.at.least', 1);
    });

    it('CP-011: el filtro "Estándar" oculta los pedidos personalizados', () => {
        cy.contains('Estándar').click();
        cy.get('.pedido-card.personalizado').should('not.exist');
    });

    it('CP-012: el filtro "Personalizado" oculta los pedidos estándar', () => {
        cy.contains('Personalizado').click();
        cy.get('.pedido-card.estandar').should('not.exist');
    });

    it('CP-013: abre el detalle completo de un pedido de la lista', () => {
        cy.get('.pedido-card').first().click();
        cy.get('[data-testid="pedido-detalle"]').should('be.visible');
    });
});

export {};