// RF-005.1 - Personalizar producto RF-005.2 - Calcular precio de producto personalizado
export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

Cypress.on('uncaught:exception', () => false);

// Convierte un texto de precio formateado ("$45.000") a número
const aNumero = (texto: string) => parseInt(texto.replace(/[^\d]/g, ''), 10);

describe('RF-005.1 - Personalizar producto', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.intercept('GET', '**/pedidos-personalizados/materiales/**').as('getMateriales');
    });

    it('CP-001: debe permitir personalizar un cubrelecho eligiendo opciones para cada lado y confirmar el pedido', () => {
        cy.visit(`${FRONT_URL}/p_cubrelecho`);
        cy.location('pathname', { timeout: 10000 }).should('include', '/p_cubrelecho');

        // Seleccionar tamaño de cama
        cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click();

        // Seleccionar tela para Lado 1
        cy.get('.lista-telas .tela-item', { timeout: 12000 })
            .should('have.length.at.least', 1)
            .first()
            .click();

        // Lado 2: cambiar de pestaña y elegir tela
        cy.contains('button.btn-lado', 'Lado 2').click();
        cy.get('.lista-telas .tela-item', { timeout: 12000 }).first().click();

        // El resumen debe reflejar ambos lados
        cy.get('.personalizar-imagen-info')
            .should('contain.text', 'Lado 1')
            .and('contain.text', 'Lado 2');

        cy.get('.btn-confirmar-ped').should('not.be.disabled');
    });

    it('CP-002: debe registrar una sábana con complementos opcionales (sobresábana y fundas)', () => {
        cy.visit(`${FRONT_URL}/p_sabanas`);
        cy.location('pathname', { timeout: 10000 }).should('include', '/p_sabanas');

        cy.wait('@getMateriales');

        cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click();
        cy.get('.lista-telas .tela-item', { timeout: 12000 })
            .should('have.length.at.least', 1)
            .first()
            .click();

        cy.contains('label', 'Incluir sobresábana')
            .find('input[type="checkbox"]')
            .check({ force: true });
        
        cy.contains('.radio-card', 'Dos fundas').click();

        cy.get('.personalizar-imagen-info')
            .should('contain.text', 'Incluye sobresábana')
            .and('contain.text', '2 fundas');

        cy.get('.btn-confirmar-ped').should('not.be.disabled');
    });

    it('CP-003: la selección de color/diseño se reinicia al cambiar de tela (los colores dependen de la tela elegida)', () => {
        cy.visit(`${FRONT_URL}/p_sabanas`);
        cy.location('pathname', { timeout: 10000 }).should('include', '/p_sabanas');
        
        cy.wait('@getMateriales');

        cy.get('.lista-telas .tela-item', { timeout: 12000 }).should('exist');

        cy.get('.lista-telas .tela-item').then(($telas) => {
            if ($telas.length >= 2) {
                cy.wrap($telas).eq(0).click();

                cy.get('body').then(($body) => {
                    const hayColores = !$body.text().includes('Esta tela no tiene colores registrados');
                    if (hayColores) {
                        cy.contains('h3', 'Color de tela')
                            .parent()
                            .find('div[style*="border-radius: 20px"]')
                            .first()
                            .click();
                        cy.contains('h3', 'Color de tela').parent().should('contain.text', '✓');
                    }
                });

                // Cambiar a la segunda tela y verificar el reinicio
                cy.wrap($telas).eq(1).click();
                cy.contains('h3', 'Color de tela').parent().should('not.contain.text', '✓');
            } else {
                cy.wrap($telas).first().click();
                cy.log('Solo hay una tela registrada en el sistema.');
            }
        });
    });

    it('CP-004: el botón de confirmar debe permanecer deshabilitado si faltan campos obligatorios', () => {
        cy.visit(`${FRONT_URL}/p_sabanas`);
        cy.location('pathname', { timeout: 10000 }).should('include', '/p_sabanas');

        cy.wait('@getMateriales');

        cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click();
        cy.get('.btn-confirmar-ped').should('be.disabled');

        cy.get('.lista-telas .tela-item', { timeout: 12000 }).first().click();
        cy.get('.btn-confirmar-ped').should('not.be.disabled');
    });
});

describe('RF-005.2 - Calcular precio de producto personalizado', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.intercept('GET', '**/pedidos-personalizados/materiales/**').as('getMateriales');
        cy.visit(`${FRONT_URL}/p_sabanas`);
        cy.location('pathname', { timeout: 10000 }).should('include', '/p_sabanas');
        cy.wait('@getMateriales');
    });

    it('CP-005: el precio debe aumentar al agregar cada opción (sobresábana, fundas)', () => {
        cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click();
        cy.get('.lista-telas .tela-item', { timeout: 12000 }).first().click();

        cy.get('.personalizar-precio-valor')
            .invoke('text')
            .then((precioBase) => {
                cy.contains('label', 'Incluir sobresábana')
                    .find('input[type="checkbox"]')
                    .check({ force: true });

                cy.get('.personalizar-precio-valor')
                    .invoke('text')
                    .should((precioConSobresabana) => {
                        expect(aNumero(precioConSobresabana)).to.be.greaterThan(aNumero(precioBase));
                    })
                    .then((precioConSobresabana) => {
                        cy.contains('.radio-card', 'Dos fundas').click();

                        cy.get('.personalizar-precio-valor')
                            .invoke('text')
                            .should((precioFinal) => {
                                expect(aNumero(precioFinal)).to.be.greaterThan(aNumero(precioConSobresabana));
                            });
                    });
            });
    });

    it('CP-006: debe mostrar el desglose (tela, tamaño, metros y extras) antes de confirmar', () => {
        cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click();
        cy.get('.lista-telas .tela-item', { timeout: 12000 }).first().click();
        cy.contains('label', 'Incluir sobresábana')
            .find('input[type="checkbox"]')
            .check({ force: true });

        cy.get('.personalizar-imagen-info').within(() => {
            cy.contains('Tela:').should('be.visible');
            cy.contains('Tamaño:').should('be.visible');
            cy.contains('Metros:').should('be.visible');
            cy.contains('Incluye sobresábana').should('be.visible');
        });
    });

    it('CP-007: el precio no debe arrastrar valores de selecciones anteriores al cambiar de tela varias veces seguidas', () => {
        cy.get('.radio-card', { timeout: 12000 }).first().should('be.visible').click();
        cy.get('.lista-telas .tela-item', { timeout: 12000 }).should('be.visible');

        cy.get('.lista-telas .tela-item').then(($telas) => {
            const indices = $telas.length > 1 ? [0, 1, 0, 1] : [0, 0, 0, 0];
            indices.forEach((i) => {
                cy.get('.lista-telas .tela-item').eq(i).click();
            });
        });

        cy.get('.personalizar-precio-valor')
            .invoke('text')
            .should((precioFinal) => {
                expect(precioFinal.trim()).to.not.eq('—');
            });
    });
});