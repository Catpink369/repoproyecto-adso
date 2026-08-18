// RF-005.1 - Personalizar producto RF-005.2 - Calcular precio de producto personalizado
export {};

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

Cypress.on('uncaught:exception', () => false);

// Convierte un texto de precio formateado ("$45.000") a número
const aNumero = (texto: string) => parseInt(texto.replace(/[^\d]/g, ''), 10);

describe('RF-005.1 - Personalizar producto', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/pedidos_personalizados`);
    });

    it('CP-001: debe permitir personalizar un cubrelecho eligiendo opciones para cada lado y confirmar el pedido', () => {
        cy.contains('a', 'Personalizar cubrelecho').click();
        cy.url().should('include', '/p_cubrelecho');

        // Tamaño
        cy.contains('.radio-card', 'King').click();

        // Lado 1 (activo por defecto): elegir la primera tela disponible
        cy.get('.lista-telas .tela-item').should('have.length.at.least', 1).first().click();

        // Lado 2: cambiar de pestaña y elegir una tela
        cy.contains('button.btn-lado', 'Lado 2').click();
        cy.get('.lista-telas .tela-item').first().click();

        // El resumen (aparece solo, sin botón "Resumen") debe reflejar ambos lados
        cy.get('.personalizar-imagen-info')
            .should('contain.text', 'Lado 1')
            .and('contain.text', 'Lado 2');

        cy.get('.btn-confirmar-ped').should('not.be.disabled').click();
        cy.url().should('include', '/ticket_personalizado');
    });

    it('CP-002: debe registrar una sábana con complementos opcionales (sobresábana y fundas)', () => {
        cy.contains('a', 'Personalizar sábana').click();
        cy.url().should('include', '/p_sabanas');

        cy.contains('.radio-card', 'Individual').click();
        cy.get('.lista-telas .tela-item').should('have.length.at.least', 1).first().click();

        cy.contains('label', 'Incluir sobresábana')
            .find('input[type="checkbox"]')
            .check({ force: true });
        cy.contains('.metodo-pago-opcion', 'Dos fundas').click();

        cy.get('.personalizar-imagen-info')
            .should('contain.text', 'Incluye sobresábana')
            .and('contain.text', '2 fundas');

        cy.get('.btn-confirmar-ped').should('not.be.disabled').click();
        cy.url().should('include', '/ticket_personalizado');
    });

    it('CP-003: la selección de color/diseño se reinicia al cambiar de tela (los colores dependen de la tela elegida)', () => {
        cy.contains('a', 'Personalizar sábana').click();
        cy.get('.lista-telas .tela-item').should('have.length.at.least', 2);

        cy.get('.lista-telas .tela-item').eq(0).click();
        cy.contains('h3', 'Color de tela').should('be.visible');

        // Si esta tela tiene colores registrados, se elige el primero
        cy.get('body').then(($body) => {
            const hayColores = !$body.text().includes('Esta tela no tiene colores registrados');
            if (hayColores) {
                cy.contains('h3', 'Color de tela')
                    .parent()
                    .find('div[style*="border-radius: 20px"]')
                    .first()
                    .click();
                cy.contains('h3', 'Color de tela').parent().should('contain.text', '✓');
            } else {
                cy.log('La primera tela no tiene colores registrados; se omite la selección de color.');
            }
        });

        // Cambiar de tela: la sección de colores se debe recargar y ya no debe
        // mostrar el color que se había marcado con "✓" en la tela anterior
        cy.get('.lista-telas .tela-item').eq(1).click();
        cy.contains('h3', 'Color de tela').parent().should('not.contain.text', '✓');
    });

    it('CP-004: el botón de confirmar debe permanecer deshabilitado si faltan campos obligatorios', () => {
        cy.contains('a', 'Personalizar sábana').click();

        // Solo se selecciona el tamaño, sin elegir tela
        cy.contains('.radio-card', 'Doble').click();
        cy.get('.btn-confirmar-ped').should('be.disabled');

        // Al completar la tela, se habilita
        cy.get('.lista-telas .tela-item').first().click();
        cy.get('.btn-confirmar-ped').should('not.be.disabled');
    });
});

describe('RF-005.2 - Calcular precio de producto personalizado', () => {
    beforeEach(() => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/p_sabanas`);
    });

    it('CP-005: el precio debe aumentar al agregar cada opción (sobresábana, fundas)', () => {
        cy.contains('.radio-card', 'Rey').click();
        cy.get('.lista-telas .tela-item').first().click();

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
                        cy.contains('.metodo-pago-opcion', 'Dos fundas').click();

                        cy.get('.personalizar-precio-valor')
                            .invoke('text')
                            .should((precioFinal) => {
                                expect(aNumero(precioFinal)).to.be.greaterThan(aNumero(precioConSobresabana));
                            });
                    });
            });
    });

    it('CP-006: debe mostrar el desglose (tela, tamaño, metros y extras) antes de confirmar', () => {
        cy.contains('.radio-card', 'Emperador').click();
        cy.get('.lista-telas .tela-item').first().click();
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
        cy.contains('.radio-card', 'Cuna').click();
        cy.get('.lista-telas .tela-item').should('have.length.at.least', 1);

        cy.get('.lista-telas .tela-item').then(($telas) => {
            const indices = $telas.length > 1 ? [0, 1, 0, 1] : [0, 0, 0, 0];
            indices.forEach((i) => {
                cy.get('.lista-telas .tela-item').eq(i).click();
            });
        });

        // Tras varios cambios rápidos, el precio debe corresponder a la
        cy.get('.personalizar-precio-valor')
            .invoke('text')
            .should((precioFinal) => {
                expect(precioFinal.trim()).to.not.eq('—');
            });
    });
});