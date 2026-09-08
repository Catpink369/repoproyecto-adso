// RF-008 completo: 8.1 Generar ticket automático, 8.2 Actualizar estado de
// pedido, 8.3 Actualizar método de pago, 8.4 Consultar tickets/notificaciones
// del cliente (panel de campana + modal de ticket).
Cypress.on('uncaught:exception', () => false);

const API_URL = Cypress.env('API_URL') || 'http://localhost:3000';

/** Cierra la ventana emergente de ofertas de /cliente si está visible. */
function cerrarVentanaOfertas() {
    cy.get('body').then(($body) => {
        if ($body.find('.ventana .cerrar').length) {
            cy.get('.ventana .cerrar').click({ force: true });
        }
    });
}

/** Agrega el primer producto con stock disponible al carrito. */
function agregarProductoConStock() {
    cy.visit('/catalogo_c');
    cy.get('.contenedor-productos > div', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.contains('.contenedor-productos > div button', /Agregar al carrito/i)
        .first()
        .click({ force: true });
}

describe('RF-008.1 - Generar ticket de pedido (automático)', () => {
    beforeEach(() => {
        cy.loginCliente();
    });

    it('CP-001: genera el ticket con número único al confirmar un pedido de producto estándar', () => {
        agregarProductoConStock();
        cy.get('header').find('a[href="/carrito"]').click();
        cy.contains('button', /Generar Ticket de Pedido/i).click();

        cy.url().should('include', '/ticket-compra');
        cy.get('.ticket-info-value', { timeout: 10000 }).first().invoke('text').should('match', /\d+/);
    });

    it('CP-002: genera el ticket detallando las opciones de un pedido personalizado', () => {
        cy.visit('/p_cubrelecho');

        cy.contains('.radio-card', 'Doble').click();
        cy.get('.lista-telas .tela-item', { timeout: 12000 }).first().click();

        // Esperar a que carguen colores/diseños del Lado 1 y seleccionarlos si existen
        cy.get('body', { timeout: 8000 }).should(($body) => {
            const cargando = $body.text().includes('Cargando colores');
            expect(cargando).to.eq(false);
        });

        cy.get('body').then(($body) => {
            if ($body.find('h3:contains("Color — Lado 1")').length) {
                const sinColores = $body.text().includes('Esta tela no tiene colores registrados');
                if (!sinColores) {
                    cy.contains('h3', 'Color — Lado 1')
                        .parent()
                        .find('div[style*="cursor: pointer"]')
                        .first()
                        .click({ force: true });
                }
            }
        });

        cy.get('body').then(($body) => {
            if ($body.find('h3:contains("Diseño — Lado 1")').length) {
                cy.contains('h3', 'Diseño — Lado 1')
                    .parent()
                    .find('.tela-item')
                    .first()
                    .click({ force: true });
            }
        });

        cy.contains('.btn-lado', 'Lado 2', { timeout: 8000 }).should('not.be.disabled').click();
        cy.get('.lista-telas .tela-item').first().click();

        // Completar color/diseño de Lado 2 si aplica
        cy.get('body').then(($body) => {
            if ($body.find('h3:contains("Color — Lado 2")').length) {
                const sinColores = $body.text().includes('Esta tela no tiene colores registrados');
                if (!sinColores) {
                    cy.contains('h3', 'Color — Lado 2')
                        .parent()
                        .find('div[style*="cursor: pointer"]')
                        .first()
                        .click({ force: true });
                }
            }
        });
        cy.get('body').then(($body) => {
            if ($body.find('h3:contains("Diseño — Lado 2")').length) {
                cy.contains('h3', 'Diseño — Lado 2')
                    .parent()
                    .find('.tela-item')
                    .first()
                    .click({ force: true });
            }
        });

        cy.get('.btn-confirmar-ped').should('not.be.disabled').click();

        cy.url().should('include', '/ticket_personalizado');
        cy.contains(/Ticket de Compra #/i).should('be.visible');
        cy.contains('Desglose de Materiales').should('be.visible');
    });

    it('CP-003: el ticket se crea con estado de pedido "Pendiente" (pedido estándar)', () => {
        agregarProductoConStock();
        cy.get('header').find('a[href="/carrito"]').click();
        cy.contains('button', /Generar Ticket de Pedido/i).click();

        cy.get('.ticket-estado-badge', { timeout: 10000 }).should('contain.text', 'Pendiente');
        cy.get('.ticket-pago-valor').should('contain.text', 'Por definir');
    });

    it('CP-004: no deben existir tickets duplicados con el mismo número', () => {
        cy.loginAdmin();
        cy.visit('/pedidos_realizados');
        cy.get('.pedido-ticket', { timeout: 10000 }).then(($tickets) => {
            const numeros = Array.from($tickets)
                .map((el) => {
                    const m = el.innerText.match(/(\d+)/);
                    return m ? m[1] : '';
                })
                .filter((n) => n.length > 0);
            expect(numeros.length).to.be.greaterThan(0);
            const conteo: Record<string, number> = {};
            numeros.forEach((n) => { conteo[n] = (conteo[n] || 0) + 1; });
            // Un ticket puede verse hasta 2 veces (pedido + detalle); >2 es bug
            Object.entries(conteo).forEach(([num, c]) => {
                expect(c, `ticket ${num} repetido ${c} veces`).to.be.at.most(2);
            });
        });
    });
});

describe('RF-008.2 - Actualizar estado de pedido', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit('/pedidos_realizados');
    });

    it('CP-005: el administrador/trabajador puede cambiar manualmente el estado del pedido', () => {
        cy.contains('tr', 'Pendiente').first().within(() => {
            cy.contains('button', 'Editar Estado').click();
            cy.get('select.pedido-estado-select').select('En preparación');
            cy.contains('button', '✓ Guardar').click();
        });
        cy.contains('tr', 'En preparación', { timeout: 10000 }).should('exist');
    });

    const PESTANA_POR_ESTADO = {
        Entregado: 'Finalizados',
        Finalizado: 'Finalizados',
        Anulado: 'Anulados',
    };

    ['Entregado', 'Finalizado', 'Anulado'].forEach((estado) => {
        it(`CP-006: bloquea el cambio de estado si el pedido ya está "${estado}"`, () => {
            cy.intercept('GET', /\/pedidos$/, {
                statusCode: 200,
                body: [{
                    id_pedido: 9001,
                    estado,
                    fecha: new Date().toISOString(),
                    usuario: { nom_1: 'Cliente', ape_1: 'Prueba', telefono: '3000000000' },
                    detalles_pedido: [],
                    ticket_compra: { num_ticket: 999999, metodo_pago: { nom_metodo: 'Efectivo' } },
                }]
            }).as('getPedidos');
            cy.intercept('GET', /\/pedidos-personalizados$/, { statusCode: 200, body: [] }).as('getPedidosPersonalizados');

            cy.visit('/pedidos_realizados');
            cy.wait(['@getPedidos', '@getPedidosPersonalizados']);

            cy.contains('button', PESTANA_POR_ESTADO[estado]).click();

            cy.contains('tr', estado).within(() => {
                cy.contains('button', 'Editar Estado').should('not.exist');
                cy.contains(/sin más acciones/i).should('be.visible');
            });
        });
    });

    it.skip('CP-007: ya cubierta — ver RF-008.4 CP-011 (frontend) y tickets-pagos.e2e-spec.ts CP-007 (backend)', () => {});
});

describe('RF-008.3 - Actualizar método de pago', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit('/pedidos_realizados');
    });

    it('CP-008: actualiza el método de pago (el badge pasa de "pendiente" a "pagado")', () => {
        cy.contains('tr', 'Por_definir').first().within(() => {
            cy.get('.pedido-metodo-pago .pedido-estado-badge').should('have.class', 'estado-pendiente');
            cy.contains('button', 'Editar Pago').click();
            cy.get('select.pedido-estado-select').select('Nequi');
            cy.contains('button', '✓ Confirmar').click();
        });

        cy.contains('tr', 'Nequi', { timeout: 10000 }).within(() => {
            cy.get('.pedido-metodo-pago .pedido-estado-badge').should('have.class', 'estado-en-proceso');
        });
    });

    it('CP-009: muestra "Por_definir" cuando no hay método de pago asignado', () => {
        cy.get('.pedido-metodo-pago', { timeout: 10000 }).should('contain.text', 'Por_definir');
    });
});

describe('RF-008.4 - Consultar tickets y pedidos realizados (panel de notificaciones del cliente)', () => {
    beforeEach(() => {
        cy.loginCliente();
    });

    it('CP-010: el cliente solo consulta notificaciones/pedidos de su propia cuenta', () => {
        cy.intercept('GET', `${API_URL}/notificaciones/usuario/*`).as('getNotifsPropias');
        cy.visit('/cliente');
        cerrarVentanaOfertas();
        cy.get('.notif-wrapper').click({ force: true });
        cy.wait('@getNotifsPropias').its('request.url').should('match', /\/notificaciones\/usuario\/\d+$/);
    });

    it('CP-011: al hacer clic en una notificación de pedido se abre el ticket completo de ESE pedido', () => {
        cy.intercept('GET', `${API_URL}/notificaciones/usuario/*`, {
            statusCode: 200,
            body: [{
                id_notificacion: 701,
                tipo: 'pedido_estado',
                titulo: 'Actualización de tu pedido',
                mensaje: 'Tu pedido #555 cambió de estado a "En preparación"',
                leida: false,
                fecha: new Date().toISOString()
            }]
        }).as('getNotifs');
        cy.intercept('GET', `${API_URL}/pedidos/detalle/555`, {
            statusCode: 200,
            body: {
                id_pedido: 555,
                estado: 'En preparación',
                fecha: new Date().toISOString(),
                usuario: { nom_1: 'Cliente', ape_1: 'Prueba', correo: 'cliente@test.com', telefono: '3000000000' },
                detalles_pedido: [{ id_detalle: 1, cantidad: 2, producto: { nom_producto: 'Producto X', precio_unitario: 10000 } }],
                ticket_compra: [{ num_ticket: 123456, sub_total: 20000, total_ticket: 20000, metodo_pago: { nom_metodo: 'Por_definir' }, estado_pago: { nom_estado: 'Pendiente' } }]
            }
        }).as('getDetallePedido');

        cy.visit('/cliente');
        cerrarVentanaOfertas();
        cy.get('.notif-wrapper').click({ force: true });
        cy.wait('@getNotifs');
        cy.contains('.notif-item', 'Actualización de tu pedido').click({ force: true });
        cy.wait('@getDetallePedido');

        // Asegurar que el popup de ofertas no tapa el modal del ticket
        cerrarVentanaOfertas();

        cy.contains('.ticket-info-value', '#555', { timeout: 10000 }).should('exist');
        cy.contains('.ticket-producto-nombre', 'Producto X').should('exist');
        cy.contains('.ticket-estado-badge', 'En preparación').should('exist');
    });

    it.skip('CP-011b: confirmar si el cliente recibe notificaciones de tipo distinto a pedido_estado y qué deberían hacer al pulsarlas', () => {});

    it('CP-012: el cliente puede imprimir/guardar como PDF el ticket abierto desde la notificación', () => {
        cy.intercept('GET', `${API_URL}/notificaciones/usuario/*`, {
            statusCode: 200,
            body: [{
                id_notificacion: 702, tipo: 'pedido_estado', titulo: 'Actualización de tu pedido',
                mensaje: 'Tu pedido #556 cambió de estado a "Pagado"', leida: false, fecha: new Date().toISOString()
            }]
        }).as('getNotifs');
        cy.intercept('GET', `${API_URL}/pedidos/detalle/556`, {
            statusCode: 200,
            body: {
                id_pedido: 556, estado: 'Pagado', fecha: new Date().toISOString(),
                usuario: { nom_1: 'Cliente', ape_1: 'Prueba', correo: 'cliente@test.com', telefono: '3000000000' },
                detalles_pedido: [],
                ticket_compra: [{ num_ticket: 654321, sub_total: 0, total_ticket: 0, metodo_pago: { nom_metodo: 'Nequi' }, estado_pago: { nom_estado: 'Pagado' } }]
            }
        }).as('getDetallePedido');

        cy.visit('/cliente');
        cerrarVentanaOfertas();
        cy.get('.notif-wrapper').click({ force: true });
        cy.wait('@getNotifs');
        cy.contains('.notif-item', 'Actualización de tu pedido').click({ force: true });
        cy.wait('@getDetallePedido');
        cerrarVentanaOfertas();

        cy.window().then((win) => {
            cy.stub(win, 'open').callsFake(() => ({
                document: { write: cy.stub(), close: cy.stub() },
                focus: cy.stub(),
                print: cy.stub(),
                close: cy.stub(),
            })).as('windowOpen');
        });

        cy.contains('button', 'Imprimir / Guardar PDF').click({ force: true });
        cy.get('@windowOpen').should('have.been.calledWith', '', '_blank', 'width=700,height=900,scrollbars=yes');
    });

    it('CP-013: al abrir una notificación no leída, se marca como leída y el contador baja', () => {
        cy.intercept('GET', `${API_URL}/notificaciones/usuario/*/count`, { statusCode: 200, body: { count: 1 } }).as('getContador');
        cy.intercept('GET', `${API_URL}/notificaciones/usuario/*`, {
            statusCode: 200,
            body: [{
                id_notificacion: 703, tipo: 'pedido_estado', titulo: 'Actualización de tu pedido',
                mensaje: 'Tu pedido #557 cambió de estado a "Entregado"', leida: false, fecha: new Date().toISOString()
            }]
        }).as('getNotifs');
        cy.intercept('PATCH', `${API_URL}/notificaciones/703/leer*`, { statusCode: 200, body: {} }).as('marcarLeida');
        cy.intercept('GET', `${API_URL}/pedidos/detalle/557`, {
            statusCode: 200,
            body: {
                id_pedido: 557, estado: 'Entregado', fecha: new Date().toISOString(),
                usuario: { nom_1: 'Cliente', ape_1: 'Prueba', correo: 'cliente@test.com', telefono: '3000000000' },
                detalles_pedido: [], ticket_compra: [{ num_ticket: 111222, sub_total: 0, total_ticket: 0, metodo_pago: {}, estado_pago: {} }]
            }
        }).as('getDetallePedido');

        cy.visit('/cliente');
        cy.wait('@getContador');
        cy.get('.notif-badge').should('contain.text', '1');

        cerrarVentanaOfertas();
        cy.get('.notif-wrapper').click({ force: true });
        cy.wait('@getNotifs');
        cy.get('.notif-item.no-leida').should('have.length', 1);

        cy.contains('.notif-item', 'Actualización de tu pedido').click({ force: true });
        cy.wait(['@marcarLeida', '@getDetallePedido']);

        cy.get('.notif-badge').should('not.exist');
    });
});

export {};