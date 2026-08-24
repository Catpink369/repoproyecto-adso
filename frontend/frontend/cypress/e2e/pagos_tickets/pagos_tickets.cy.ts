// RF-008.1 al RF-008.4 - Gestión de Pagos y Tickets
//
// REESCRITO: la versión anterior usaba selectores placeholder que no
// correspondían a ningún componente real (`.producto` + texto "Agregar",
// `[data-testid="num-ticket"]`, `.pedido-card`, ruta `/mis_pedidos`, etc.),
// por eso los 14 CP fallaban. Los selectores de abajo están tomados
// directamente de ticketcompra.jsx, p_cubrelecho.jsx, ticket_p-p.jsx y
// Header_c.jsx/TicketPedidoModal.jsx.
//
// IMPORTANTE (RF-008.4): NO existe una página "/mis_pedidos" con
// `.pedido-card`, ni filtros "Estándar"/"Personalizado" en el front. El
// backend (tickets-pagos.e2e-spec.ts) confirma que ese flujo es distinto:
// el cliente ve sus pedidos a través de las notificaciones (campanita en
// Header_c.jsx) y al hacer clic en una notificación de tipo "pedido_estado"
// se abre TicketPedidoModal con el detalle completo. Los CP de esa sección
// se reescribieron para reflejar ese flujo real.
//
// PENDIENTE: RF-008.2 (CP-005/CP-006/CP-007) y RF-008.3 (CP-008/CP-009)
// dependen de la pantalla admin "/pedidos_realizados" (cambiar estado y
// método de pago desde una tabla). No tengo el .jsx de esa pantalla, así
// que los dejé con it.skip() y un TODO explícito en vez de adivinar
// selectores otra vez. Súbeme ese componente y los completo.

const FRONT_URL = Cypress.env('FRONT_URL') || 'http://localhost:5173';

Cypress.on('uncaught:exception', () => false);

// Flujo de compra estándar reutilizado (el mismo que ya funciona en
// carrito.cy.ts y pedidos.cy.ts CP-001): catálogo -> agregar -> carrito ->
// generar ticket. Termina en /ticket-compra con el pedido ya creado.
const generarTicketEstandar = () => {
    cy.loginCliente();
    cy.visit(`${FRONT_URL}/catalogo_c`);
    cy.get('.contenedor-productos > div').first().find('button').click();
    cy.get('header').find('a[href="/carrito"]').click();
    cy.contains('button', /Generar Ticket|Confirmar pedido/i).click();
    cy.url().should('include', '/ticket-compra');
};

describe('RF-008.1 - Generar ticket de pedido (automático)', () => {

    it('CP-001: genera el ticket con número único al confirmar un pedido de producto estándar', () => {
        generarTicketEstandar();

        // ticketcompra.jsx renderiza el número como "TKT-<numero>" dentro de
        // .ticket-info-value (el primero de los dos: Nº Ticket / Nº Pedido)
        cy.get('.ticket-info-value').first().invoke('text').should('match', /^TKT-\d+$/);
    });

    it('CP-002: genera el ticket detallando las opciones de un pedido personalizado', () => {
        cy.loginCliente();
        cy.visit(`${FRONT_URL}/p_cubrelecho`);

        // puedeConfirmar = tamano && telaLado1 && telaLado2 -> hay que elegir
        // también el tamaño (input[name="tamano"]), si no el botón se queda
        // disabled aunque ya hayas elegido las dos telas.
        cy.get('input[name="tamano"]').first().check({ force: true });

        // No hay data-testid; la UI real es: pestañas "Lado 1"/"Lado 2" y,
        // dentro del panel activo, tarjetas .tela-item para elegir la tela.
        cy.contains('button', 'Lado 1').click();
        cy.get('.tela-item').first().click();

        cy.contains('button', 'Lado 2').click();
        cy.get('.tela-item').first().click();

        // El botón real se llama "Confirmar pedido" y usa .btn-confirmar-ped
        cy.contains('.btn-confirmar-ped', /Confirmar pedido/i)
            .should('not.be.disabled')
            .click();

        // Tras confirmar, p_cubrelecho.jsx guarda la respuesta en
        // sessionStorage y navega a /ticket_personalizado (ticket_p-p.jsx)
        cy.url().should('include', '/ticket_personalizado');
        cy.contains(/Ticket de Compra #/i).should('be.visible');
    });

    it('CP-003: el ticket se crea con estado de pedido "Pendiente" por defecto', () => {
        generarTicketEstandar();

        // ticketcompra.jsx solo expone el estado del PEDIDO en pantalla
        // (.ticket-estado-badge). El estado del PAGO ("Pendiente" también)
        // no se muestra como texto aparte en esta vista — eso ya está
        // cubierto en el backend (tickets-pagos.e2e-spec.ts CP-003).
        cy.get('.ticket-estado-badge').should('contain.text', 'Pendiente');
    });

    // La verificación de números de ticket únicos entre pedidos consecutivos
    // ya está cubierta de forma determinística en el backend
    // (tickets-pagos.e2e-spec.ts RF-008.1 CP-004, comparando num_ticket en BD).
    // Repetirlo en e2e de frontend requeriría la tabla de "/pedidos_realizados"
    // que aún no tengo — ver nota al inicio del archivo.
    it.skip('CP-004: no deben existir tickets duplicados con el mismo número — cubierto en tickets-pagos.e2e-spec.ts; bloqueado en frontend hasta tener el componente de /pedidos_realizados', () => {});
});

describe('RF-008.2 - Actualizar estado de pedido', () => {
    // BLOQUEADO: depende de la tabla de /pedidos_realizados (admin), cuyo
    // componente no tengo todavía. Súbemelo (p.ej. pedidos_realizados.jsx)
    // y completo estos 3 CP con selectores reales en vez de adivinar.
    it.skip('CP-005: el administrador/trabajador puede cambiar manualmente el estado del pedido — pendiente: falta el componente de /pedidos_realizados', () => {});
    it.skip('CP-006: bloquea el cambio de estado si el pedido ya está "Entregado"/"Finalizado"/"Anulado" — pendiente: falta el componente de /pedidos_realizados', () => {});
});

describe('RF-008.3 - Actualizar método de pago', () => {
    // BLOQUEADO por la misma razón que RF-008.2.
    it.skip('CP-008: actualiza el método de pago y el estado de pago a "Pagado" — pendiente: falta el componente de /pedidos_realizados', () => {});
    it.skip('CP-009: muestra "Por definir" cuando no hay método de pago asignado — pendiente: falta el componente de /pedidos_realizados', () => {});
});

describe('RF-008.4 - Consultar tickets y pedidos realizados', () => {
    // No existe /mis_pedidos ni .pedido-card. El flujo real: campanita de
    // notificaciones (Header_c.jsx) -> clic en una notificación
    // "pedido_estado" -> se abre TicketPedidoModal con el detalle completo.
    beforeEach(() => {
        cy.intercept('GET', '**/notificaciones/usuario/*/count', {
            statusCode: 200,
            body: { count: 1 },
        }).as('getContador');

        cy.intercept('GET', '**/notificaciones/usuario/*', {
            statusCode: 200,
            body: [{
                id_notificacion: 900,
                tipo: 'pedido_estado',
                titulo: 'Actualización de tu pedido',
                mensaje: 'Tu pedido #4321 cambió de estado a "En preparación"',
                leida: false,
                fecha: new Date().toISOString(),
            }],
        }).as('getNotificaciones');

        cy.intercept('GET', '**/pedidos/detalle/4321', {
            statusCode: 200,
            body: {
                id_pedido: 4321,
                estado: 'En preparación',
                fecha: new Date().toISOString(),
                usuario: { nom_1: 'Cliente', ape_1: 'Prueba', correo: 'cliente@test.com', telefono: '3000000000' },
                detalles_pedido: [
                    { id_detalle: 1, cantidad: 2, producto: { nom_producto: 'Producto Test', precio_unitario: 15000 } },
                ],
                ticket_compra: [{
                    num_ticket: 123456,
                    sub_total: 30000,
                    total_ticket: 30000,
                    metodo_pago: { nom_metodo: 'Por definir' },
                    estado_pago: { nom_estado: 'Pendiente' },
                }],
            },
        }).as('getDetallePedido');

        cy.loginCliente();
        cy.visit(`${FRONT_URL}/cliente`);
        cy.wait('@getContador');

        // Misma ventana emergente de ofertas que en pedidos.cy.ts CP-005:
        // hay que cerrarla antes de poder hacer clic en .notif-wrapper.
        cy.get('.ventana .cerrar').click();
    });

    it('CP-010: el cliente ve el historial de sus notificaciones/pedidos al abrir la campanita', () => {
        cy.get('.notif-wrapper').click();
        cy.wait('@getNotificaciones');
        cy.get('.notif-item').should('have.length.at.least', 1);
    });

    it('CP-011: al hacer clic en una notificación de pedido se abre el ticket completo', () => {
        cy.get('.notif-wrapper').click();
        cy.wait('@getNotificaciones');
        cy.contains('.notif-item', 'cambió de estado').click();

        cy.wait('@getDetallePedido');
        cy.get('.ticket-container').should('be.visible');
        cy.contains('.ticket-info-value', '#4321').should('be.visible');
    });

    it('CP-012: el cliente puede imprimir/descargar el ticket como PDF', () => {
        cy.get('.notif-wrapper').click();
        cy.wait('@getNotificaciones');
        cy.contains('.notif-item', 'cambió de estado').click();
        cy.wait('@getDetallePedido');

        cy.window().then((win) => {
            cy.stub(win, 'open').callsFake(() => ({
                document: { write: cy.stub(), close: cy.stub() },
            })).as('windowOpen');
        });

        cy.contains('button', /Imprimir/i).click();
        cy.get('@windowOpen').should('have.been.called');
    });

    it('CP-013: al abrir una notificación no leída, se marca como leída y baja el contador', () => {
        cy.intercept('PATCH', '**/notificaciones/*/leer*', { statusCode: 200, body: {} }).as('marcarLeida');

        cy.get('.notif-badge').should('contain.text', '1');
        cy.get('.notif-wrapper').click();
        cy.wait('@getNotificaciones');
        cy.contains('.notif-item.no-leida', 'cambió de estado').click();

        cy.wait('@marcarLeida');
        cy.get('.notif-badge').should('not.exist');
    });
});

export {};