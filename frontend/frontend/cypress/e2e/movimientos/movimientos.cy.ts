// RF3.1 a RF3.4
// RF-009.1 (historial) / RF-009.2 (reporte general) - Gestion de historial y reportes
const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

// Epica 3
describe('RF-003.1 - ', () => {
    beforeEach(() => {
    });
});

describe('RF-003.2 - ', () => {
    beforeEach(() => {
    });
});

describe('RF-003.3 - ', () => {
    beforeEach(() => {
    });
});

describe('RF-003.4 - ', () => {
    beforeEach(() => {
    });
});

// Epica 9
describe('RF-009.1 - Consultar historial de movimientos', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/movimientos`);
    });

    it('CP-001: se despliega el historial con tipo, cantidad, fecha y usuario', () => {
        cy.get('table.tabla tbody tr').should('have.length.at.least', 1);
        cy.get('table.tabla thead').within(() => {
        cy.contains('Tipo').should('be.visible');
        cy.contains('Cantidad').should('be.visible');
        cy.contains('Fecha y Hora').should('be.visible');
        cy.contains('Usuario').should('be.visible');
        });
    });

    it('CP-002: el filtro "Entradas" solo debe mostrar movimientos de tipo entrada', () => {
        cy.contains('.btn-filtro-mov', 'Entradas').click();
        cy.get('.badge-entrada').should('have.length.at.least', 1);
        cy.get('.badge-salida').should('not.exist');
    });

    it('el filtro "Salidas" solo debe mostrar movimientos de tipo salida', () => {
        cy.contains('.btn-filtro-mov', 'Salidas').click();
        cy.get('.badge-salida').should('have.length.at.least', 1);
        cy.get('.badge-entrada').should('not.exist');
    });

    it('CP-003: la búsqueda por producto/usuario sin coincidencias debe mostrar el mensaje correspondiente', () => {
        cy.get('.movimientos-buscar').type('producto_que_no_existe_xyz123');
        cy.get('.tabla-vacia-mensaje').should(
        'contain.text',
        'No se encontraron movimientos con los filtros seleccionados',
        );
    });
});

describe('RF-009.1 - Registrar entrada de stock (soporte para historial)', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/entradas`);
    });

    it('permite buscar un producto por ID y registrar una entrada', () => {
        cy.get('#id_producto').type('1{enter}');
        cy.contains('Producto encontrado', { timeout: 5000 }).should('be.visible');
        cy.get('#cantidad_m').type('5');
        cy.contains('Sumar al Stock').click();
        cy.contains('Stock actualizado exitosamente').should('be.visible');
    });
});

describe('RF-009.2 - Generar reporte general', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit(`${FRONT_URL}/panel_control`);
    });

    it('CP-004: genera el reporte con las estadísticas correctas del periodo', () => {
        cy.get('input[name="desde"]').type('2026-01-01');
        cy.get('input[name="hasta"]').type('2026-12-31');
        cy.contains('Generar reporte').click();
        cy.get('[data-testid="total-entradas"]').should('be.visible');
    });

    it('CP-005: debe mostrar un error si "Desde" es posterior a "Hasta"', () => {
        cy.get('input[name="desde"]').type('2026-08-10');
        cy.get('input[name="hasta"]').type('2026-08-01');
        cy.contains('Generar reporte').click();
        cy.contains(/Desde.*posterior.*Hasta/i).should('be.visible');
    });
});

export {};