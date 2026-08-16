// RF-009.3 - Consultar notificaciones(historial de pedidos del cliente) - Gestion de historial y reportes
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

describe('RF-009.3 - Notificaciones del cliente (campana en Header_c)', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/cliente`);
    });

    it('CP-011: sin notificaciones pendientes, el panel debe mostrar el mensaje de bandeja vacía', () => {
        cy.get('.notif-wrapper').click();
        cy.get('.notif-panel').should('be.visible');
        cy.contains('No tienes notificaciones por ahora.').should('be.visible');
    });

    it('el badge de no leídas no debe mostrarse cuando el contador es 0', () => {
        cy.get('.notif-badge').should('not.exist');
    });

    it('el panel debe cerrarse al hacer clic afuera', () => {
        cy.get('.notif-wrapper').click();
        cy.get('.notif-panel').should('be.visible');
        cy.get('body').click(0, 0);
        cy.get('.notif-panel').should('not.exist');
    });
});

describe('RF-009.3 - Notificaciones / alertas del admin', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/panel_control`);
    });

    it('CP-008: se despliegan las alertas de stock bajo y nuevos pedidos', () => {
        cy.get('[data-testid="alerta-item"]').should('have.length.at.least', 1);
    });

    it('CP-009: el filtro de stock bajo oculta las alertas de pedidos nuevos', () => {
        cy.contains('Stock bajo').click();
        cy.get('[data-testid="alerta-item"]').each(($el) => {
        cy.wrap($el).should('have.class', 'alerta-stock-bajo');
        });
    });

    it('CP-010: al hacer clic en una alerta de stock bajo, redirige a /movimientos', () => {
        cy.get('[data-testid="alerta-item"]').first().click();
        cy.url().should('include', '/movimientos');
    });
});

export {};