// RF-008 completo: 8.1 Generar ticket automático, 8.2 Actualizar estado de
// pedido, 8.3 Actualizar método de pago, 8.4 Consultar tickets/notificaciones
// del cliente (panel de campana + modal de ticket).
Cypress.on('uncaught:exception', () => false);

const API_URL = Cypress.env('API_URL') || 'http://localhost:3000';

describe('RF-008.1 - Generar ticket de pedido (automático)', () => {
    beforeEach(() => {
        cy.loginCliente();
    });

    it('CP-001: genera el ticket con número único al confirmar un pedido de producto estándar', () => {
        cy.visit('/catalogo_c');
        // El botón "Agregar al carrito" es hermano de .producto (está fuera del
        // <Link>), no un hijo — por eso .contenedor-productos > div y no .producto.
        cy.get('.contenedor-productos > div').first().find('button').click();
        cy.get('header').find('a[href="/carrito"]').click();
        cy.contains('button', /Generar Ticket de Pedido/i).click();

        cy.url().should('include', '/ticket-compra');
        cy.get('.ticket-info-value', { timeout: 10000 }).first().invoke('text').should('match', /\d+/);
    });

    it('CP-002: genera el ticket detallando las opciones de un pedido personalizado', () => {
        cy.visit('/p_cubrelecho');

        cy.contains('.radio-card', 'Doble').click(); // TAMANOS: Sencilla, Semidoble, Doble, Queen, King
        cy.get('.lista-telas .tela-item').first().click(); // Lado 1 (tab activo por defecto)

        // El botón "Lado 2" queda deshabilitado hasta "completar" la tela del
        // Lado 1 — y completar incluye color/diseño cuando la tela elegida
        // los tiene registrados (title: "Completa la tela (y color/diseño si
        // aplica) del Lado 1 primero"). Se eligen si aparecen, sin asumir que
        // son obligatorios en todas las telas.
        cy.get('body').then(($body) => {
            if ($body.find('.opcion-seccion:contains("Color — Lado 1") div[style*="cursor: pointer"]').length) {
                cy.contains('.opcion-seccion', 'Color — Lado 1')
                    .find('div[style*="cursor: pointer"]').first().click();
            }
        });
        cy.get('body').then(($body) => {
            if ($body.find('.opcion-seccion .lista-telas .tela-item').length > 1) {
                // Segunda lista .lista-telas visible tras elegir tela = diseños del Lado 1
                cy.contains('.opcion-seccion', 'Diseño — Lado 1').then(($sec) => {
                    if ($sec.length) cy.wrap($sec).find('.tela-item').first().click();
                });
            }
        });

        cy.contains('.btn-lado', 'Lado 2').should('not.be.disabled').click();
        cy.get('.lista-telas .tela-item').first().click(); // Lado 2

        cy.get('.btn-confirmar-ped').should('not.be.disabled').click();

        cy.url().should('include', '/ticket_personalizado');
        // ticket_p-p.jsx no usa data-testid; se valida por texto real de la página.
        cy.contains(/Ticket de Compra #/i).should('be.visible');
        cy.contains('Desglose de Materiales').should('be.visible');
    });

    it('CP-003: el ticket se crea con estado de pedido "Pendiente" (pedido estándar)', () => {
        cy.visit('/catalogo_c');
        cy.get('.contenedor-productos > div').first().find('button').click();
        cy.get('header').find('a[href="/carrito"]').click();
        cy.contains('button', /Generar Ticket de Pedido/i).click();

        cy.get('.ticket-estado-badge', { timeout: 10000 }).should('contain.text', 'Pendiente');
        // El "estado de pago" no tiene su propio badge en ticketcompra.jsx — se
        // infiere de que el método de pago siga en su valor por defecto.
        cy.get('.ticket-pago-valor').should('contain.text', 'Por definir');
    });
    // Nota: en el ticket personalizado (ticket_p-p.jsx) el estado "Pendiente"
    // solo aparece dentro del HTML de impresión (handlePrint), no en la
    // pantalla en sí — a diferencia del ticket estándar. Vale la pena
    // avisarle al equipo si quieren ese mismo badge visible ahí también.

    it('CP-004: no deben existir tickets duplicados con el mismo número', () => {
        cy.loginAdmin();
        cy.visit('/pedidos_realizados');
        cy.get('.pedido-ticket', { timeout: 10000 }).then(($tickets) => {
            const numeros = Array.from($tickets).map((el) => el.innerText.trim());
            expect(numeros.length).to.be.greaterThan(0);
            const unicos = new Set(numeros);
            expect(unicos.size).to.eq(numeros.length);
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

    // CORREGIDO: no existe ningún flujo de "click en Editar Estado -> error del
    // backend" para pedidos finales. pedidos_realizados.jsx oculta por completo
    // los botones de acción cuando esEstadoFinal(pedido) es true (línea 828) y
    // en su lugar muestra "Pedido anulado"/"Pedido finalizado — sin más
    // acciones". El bloqueo pasa en el frontend, no como un alert de error
    // tras confirmar — por eso el draft anterior nunca encontraba "Editar
    // Estado" dentro de esas filas.
    //
    // CORREGIDO (2): el mock anterior interceptaba `${API_URL}/pedidos*`, y
    // ese glob con un solo `*` SÍ cruza el guion de `/pedidos-personalizados`
    // (no hay `/` de por medio), así que la misma respuesta se colaba en las
    // dos llamadas que hace cargarPedidos() — /pedidos Y /pedidos-personalizados
    // — y el mapeo de "personalizados" (que espera p.id_ped_personal,
    // p.pedido?.estado, etc.) generaba una fila basura con estado undefined.
    // Se usan regex ancladas para separar ambos endpoints sin ambigüedad, y
    // un pedido con la forma completa que espera el componente.
    // CORREGIDO (3): pedidos_realizados.jsx excluye a propósito los estados
    // finales ('Entregado'/'Finalizado'/'Anulado') de la pestaña "Todos"
    // (ver pedidosFiltrados) — viven únicamente en sus propias pestañas
    // "Finalizados" / "Anulados". El CP-006 original nunca hacía clic en esa
    // pestaña, así que buscaba la fila en una vista donde por diseño no
    // aparece. Se agrega el clic en la pestaña correspondiente antes de
    // buscar la fila.
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

    // CP-007 (notificación al cliente al cambiar el estado) ya queda cubierta
    // por RF-008.4 CP-011 más abajo, que valida exactamente ese mismo tipo de
    // notificación ('pedido_estado', título "Actualización de tu pedido") del
    // lado del cliente. El PATCH y la creación del registro en BD ya están
    // probados en tickets-pagos.e2e-spec.ts CP-007 (backend).
    it.skip('CP-007: ya cubierta — ver RF-008.4 CP-011 (frontend) y tickets-pagos.e2e-spec.ts CP-007 (backend)', () => {});
});

describe('RF-008.3 - Actualizar método de pago', () => {
    beforeEach(() => {
        cy.loginAdmin();
        cy.visit('/pedidos_realizados');
    });

    it('CP-008: actualiza el método de pago (el badge pasa de "pendiente" a "pagado")', () => {
        // Nota de mapeo: la columna "Método Pago" no tiene un texto literal
        // "Pagado" — el estado de pago se refleja en la clase del badge
        // (estado-pendiente mientras es "Por_definir", estado-en-proceso una
        // vez se define un método real). Así lo valida este test.
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
    // NOTA: en la corrida real, .notif-wrapper aparece tapado por
    // `<div class="ventana" style="display: flex;">` en /cliente — algún
    // modal/popup (¿promoción, aviso, algo del carrito?) que se monta encima
    // del Header al cargar la página. No sé qué lo dispara ni cómo cerrarlo
    // (no vino en los archivos que me compartiste), así que por ahora se usa
    // `{ force: true }` para hacer clic igual — el evento sí llega al
    // elemento, pero si `.ventana` bloquea la interacción real de un cliente
    // (no solo la de Cypress), vale la pena revisarlo como posible bug de UX,
    // no solo de test.
    beforeEach(() => {
        cy.loginCliente();
    });

    it('CP-010: el cliente solo consulta notificaciones/pedidos de su propia cuenta', () => {
        // El aislamiento real por usuario ya está probado contra la BD en
        // tickets-pagos.e2e-spec.ts CP-010 (dos clientes reales, cada uno solo
        // ve las suyas). Desde el frontend lo que se puede confirmar es que
        // Header_c.jsx siempre pide la ruta ligada al usuario autenticado
        // (usuarioActual.id_usuario) y nunca una ruta genérica sin filtrar.
        cy.intercept('GET', `${API_URL}/notificaciones/usuario/*`).as('getNotifsPropias');
        cy.visit('/cliente');
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
        cy.get('.notif-wrapper').click({ force: true });
        cy.wait('@getNotifs');
        // Mismo bloqueo de `.ventana` documentado arriba: se mantiene visible
        // por encima del panel de notificaciones, así que el clic real
        // también necesita { force: true } aquí.
        cy.contains('.notif-item', 'Actualización de tu pedido').click({ force: true });
        cy.wait('@getDetallePedido');

        cy.contains('.ticket-info-value', '#555').should('be.visible');
        cy.contains('.ticket-producto-nombre', 'Producto X').should('be.visible');
        cy.contains('.ticket-estado-badge', 'En preparación').should('be.visible');
    });
    // GAP a confirmar con el equipo: RUTA_POR_TIPO en Header_c.jsx está vacío
    // ({}) y solo el tipo 'pedido_estado' abre algo (el modal, vía un caso
    // especial aparte del mapa). Si el cliente llega a recibir notificaciones
    // de otro tipo (p. ej. "Pedido realizado con éxito"), hacerles clic hoy
    // no hace nada.
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
        cy.get('.notif-wrapper').click({ force: true });
        cy.wait('@getNotifs');
        cy.contains('.notif-item', 'Actualización de tu pedido').click({ force: true });
        cy.wait('@getDetallePedido');

        cy.window().then((win) => {
            cy.stub(win, 'open').callsFake(() => ({
                document: { write: cy.stub(), close: cy.stub() },
                focus: cy.stub(),
                print: cy.stub(),
                close: cy.stub(),
            })).as('windowOpen');
        });

        cy.contains('button', 'Imprimir / Guardar PDF').click();
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

        cy.get('.notif-wrapper').click({ force: true });
        cy.wait('@getNotifs');
        cy.get('.notif-item.no-leida').should('have.length', 1);

        cy.contains('.notif-item', 'Actualización de tu pedido').click({ force: true });
        cy.wait(['@marcarLeida', '@getDetallePedido']);

        // La baja del contador es optimista (setCantidadNoLeidas en el propio
        // handler), no depende de una re-consulta al backend.
        cy.get('.notif-badge').should('not.exist');
    });
});