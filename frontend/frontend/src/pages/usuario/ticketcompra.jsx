import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/logica_carrito.jsx';
import Header from '../../components/Header_c.jsx';
import Footer from '../../components/Footer.jsx';
import '../../components/css/styles.css';
import { apiPost } from '../../context/api.js';
import { secureStorage } from '../../utils/storage';

// ─── Estilos inline del ticket (independientes del CSS externo) ───────────────
const S = {
    page: { fontFamily: '"Segoe UI", Arial, sans-serif', maxWidth: 620, margin: '0 auto', background: 'white', color: '#333' },
    header: { background: 'linear-gradient(135deg,#c45a77,#a94563)', padding: '30px 36px', textAlign: 'center', borderRadius: '18px 18px 0 0' },
    headerTitle: { color: 'white', fontSize: 28, fontWeight: 800, margin: '0 0 6px' },
    headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, margin: 0 },
    body: { padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 },
    infoBox: { background: 'linear-gradient(135deg,#fff5f9,#ffeef5)', border: '1.5px solid #f0c8da', borderRadius: 12, padding: '18px 20px' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 12 },
    infoLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9a7a8a', marginBottom: 4 },
    infoValue: { fontSize: 18, fontWeight: 800, color: '#c45a77', margin: 0 },
    infoRight: { textAlign: 'right' },
    divider: { paddingTop: 12, borderTop: '1px solid #f0d0e0' },
    infoDate: { fontSize: 15, fontWeight: 600, color: '#5a3d54', margin: 0 },
    section: { borderBottom: '1px solid #f5e8ef', paddingBottom: 18 },
    sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9a7a8a', marginBottom: 12 },
    clienteNombre: { fontSize: 17, fontWeight: 700, color: '#4b004b', margin: '0 0 6px' },
    clienteInfo: { fontSize: 14, color: '#666', margin: '0 0 4px' },
    productoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#fdf8fb', borderRadius: 10, border: '1px solid #f0d8e5', marginBottom: 8 },
    productoNombre: { fontWeight: 600, color: '#5a3d54', fontSize: 15, margin: '0 0 3px' },
    productoCantidad: { fontSize: 13, color: '#888', margin: 0 },
    productoTotal: { fontWeight: 700, color: '#c45a77', fontSize: 16, flexShrink: 0, margin: 0 },
    totales: { background: '#fdf8fb', borderRadius: 12, padding: '16px 18px', border: '1.5px solid #f0d8e5' },
    subtotalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666', paddingBottom: 8, borderBottom: '1px solid #f0d0e0', marginBottom: 8 },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: '#4b004b' },
    pagoBox: { background: 'linear-gradient(135deg,#fff5f9,#ffeef5)', border: '1.5px solid #f0c8da', borderLeft: '4px solid #c45a77', borderRadius: 10, padding: '14px 18px' },
    pagoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#5a3d54', marginBottom: 8 },
    pagoValor: { fontWeight: 700, color: '#c45a77' },
    pagaNota: { fontSize: 13, color: '#9a7a8a', lineHeight: 1.5, margin: 0 },
    estadoContainer: { textAlign: 'center' },
    estadoBadge: { display: 'inline-block', padding: '8px 20px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontSize: 14, fontWeight: 700 },
    footer: { textAlign: 'center', paddingTop: 6 },
    footerGracias: { fontSize: 17, fontWeight: 700, color: '#c45a77', margin: '0 0 4px' },
    footerEmpresa: { fontSize: 13, color: '#9a7a8a', margin: 0 },
};

const TicketCompra = () => {
    const { clearCart } = useCart();
    const navigate = useNavigate();
    const [ticketData, setTicketData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedData  = sessionStorage.getItem('paymentData');
        const yaProcesado = sessionStorage.getItem('pedidoProcesado');
        if (storedData && !yaProcesado) {
            try {
                const data = JSON.parse(storedData);
                sessionStorage.setItem('pedidoProcesado', 'true');
                procesarPedido(data);
            } catch {
                setError('Error al cargar los datos del pedido');
            }
        } else if (!storedData) {
            setError('No hay información de pedido');
        }
    }, []);

    const procesarPedido = async (pedidoData) => {
        setLoading(true);
        setError(null);
        try {
            const datosUsuario = secureStorage.getItem('user', sessionStorage) || secureStorage.getItem('user', localStorage) || {};
            const id_usuario = datosUsuario.id_usuario || 'GUEST';

            if (!pedidoData.cartItems || pedidoData.cartItems.length === 0)
                throw new Error('No hay productos en el pedido');

            const response = await apiPost('/pedidos/crear', {
                items: pedidoData.cartItems.map(item => ({ id_producto: item.id, cantidad: item.cantidad, precio: item.price })),
                id_usuario,
                metodo_pago: pedidoData.metodoPago || 'Mtd_PD',
                subtotal: pedidoData.subtotal,
                total: pedidoData.total,
            });

            if (!response || !response.success)
                throw new Error(response?.message || 'Respuesta inválida del servidor');

            const resData = response.data;
            setTicketData({
                num_ticket:    `TKT-${resData.num_ticket}`,
                id_pedido:     resData.id_pedido,
                fecha_emision: new Date().toLocaleString('es-CO', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                }),
                cliente:    `${datosUsuario.nom_1 || 'Cliente'} ${datosUsuario.ape_1 || ''}`.trim(),
                id_usuario: datosUsuario.id_usuario || 'N/A',
                correo:     datosUsuario.correo    || 'N/A',
                telefono:   datosUsuario.telefono  || 'N/A',
                productos:  pedidoData.cartItems,
                subtotal:   pedidoData.subtotal,
                total:      pedidoData.total,
                metodo_pago: 'Por definir',
                estado:      resData.estado || 'Pendiente',
                nota: 'Puede realizar el pago en la tienda física o coordinar con el administrador.',
            });

            sessionStorage.removeItem('paymentData');
            sessionStorage.removeItem('pedidoProcesado');
            clearCart();
        } catch (err) {
            sessionStorage.removeItem('pedidoProcesado');
            setError(err.message || 'Error al procesar el pedido.');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) =>
        price?.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const handleVolverInicio = () => {
        sessionStorage.removeItem('paymentData');
        sessionStorage.removeItem('pedidoProcesado');
        navigate('/cliente');
    };

    // ─── Impresión: abre ventana nueva con HTML+estilos inline autosuficiente ──
    const handlePrint = () => {
        if (!ticketData) return;

        const f = formatPrice;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Ticket ${ticketData.num_ticket}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:"Segoe UI",Arial,sans-serif; background:#f8f4f6; display:flex; justify-content:center; padding:30px 20px; }
    .ticket { width:100%; max-width:580px; background:white; border-radius:18px; overflow:hidden; box-shadow:0 4px 20px rgba(180,100,140,.15); }
    .t-header { background:linear-gradient(135deg,#c45a77,#a94563); padding:28px 32px; text-align:center; }
    .t-header h1 { color:white; font-size:24px; font-weight:800; margin-bottom:5px; }
    .t-header p  { color:rgba(255,255,255,.85); font-size:14px; }
    .t-body { padding:24px 28px; }
    .t-info-box { background:#fff5f9; border:1.5px solid #f0c8da; border-radius:10px; padding:16px 18px; margin-bottom:18px; }
    .t-info-grid { display:grid; grid-template-columns:1fr 1fr; margin-bottom:10px; }
    .t-info-right { text-align:right; }
    .t-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#9a7a8a; margin-bottom:3px; }
    .t-value { font-size:17px; font-weight:800; color:#c45a77; }
    .t-divider { padding-top:10px; border-top:1px solid #f0d0e0; }
    .t-date  { font-size:14px; font-weight:600; color:#5a3d54; }
    .t-section { margin-bottom:18px; padding-bottom:18px; border-bottom:1px solid #f5e8ef; }
    .t-section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#9a7a8a; margin-bottom:10px; }
    .t-nombre { font-size:16px; font-weight:700; color:#4b004b; margin-bottom:5px; }
    .t-info-line { font-size:13px; color:#666; margin-bottom:3px; }
    .t-producto { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; padding:10px 12px; background:#fdf8fb; border-radius:8px; border:1px solid #f0d8e5; margin-bottom:7px; }
    .t-prod-nombre { font-weight:600; color:#5a3d54; font-size:14px; margin-bottom:2px; }
    .t-prod-cant   { font-size:12px; color:#888; }
    .t-prod-total  { font-weight:700; color:#c45a77; font-size:15px; white-space:nowrap; }
    .t-totales { background:#fdf8fb; border-radius:10px; padding:14px 16px; border:1.5px solid #f0d8e5; margin-bottom:18px; }
    .t-subtotal { display:flex; justify-content:space-between; font-size:13px; color:#666; padding-bottom:7px; border-bottom:1px solid #f0d0e0; margin-bottom:7px; }
    .t-total    { display:flex; justify-content:space-between; font-size:19px; font-weight:800; color:#4b004b; }
    .t-pago { background:#fff5f9; border:1.5px solid #f0c8da; border-left:4px solid #c45a77; border-radius:8px; padding:12px 16px; margin-bottom:18px; }
    .t-pago-row { display:flex; justify-content:space-between; font-size:13px; color:#5a3d54; margin-bottom:6px; }
    .t-pago-valor { font-weight:700; color:#c45a77; }
    .t-nota { font-size:12px; color:#9a7a8a; line-height:1.5; }
    .t-estado { text-align:center; margin-bottom:18px; }
    .t-estado-badge { display:inline-block; padding:7px 18px; background:#d1fae5; color:#065f46; border-radius:20px; font-size:13px; font-weight:700; }
    .t-footer { text-align:center; padding-top:4px; }
    .t-footer-g { font-size:16px; font-weight:700; color:#c45a77; margin-bottom:3px; }
    .t-footer-e { font-size:12px; color:#9a7a8a; }
    @media print {
      body { background:white; padding:0; }
      .ticket { box-shadow:none; border-radius:0; max-width:100%; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="t-header">
      <h1>¡Pedido Generado!</h1>
      <p>Su pedido ha sido registrado correctamente</p>
    </div>
    <div class="t-body">

      <div class="t-info-box">
        <div class="t-info-grid">
          <div>
            <div class="t-label">Nº Ticket</div>
            <div class="t-value">${ticketData.num_ticket}</div>
          </div>
          <div class="t-info-right">
            <div class="t-label">Nº Pedido</div>
            <div class="t-value">#${ticketData.id_pedido}</div>
          </div>
        </div>
        <div class="t-divider">
          <div class="t-label">Fecha y Hora</div>
          <div class="t-date">${ticketData.fecha_emision}</div>
        </div>
      </div>

      <div class="t-section">
        <div class="t-section-title">Información del Cliente</div>
        <div class="t-nombre">${ticketData.cliente}</div>
        <div class="t-info-line">ID: ${ticketData.id_usuario}</div>
        <div class="t-info-line">Correo: ${ticketData.correo}</div>
        <div class="t-info-line">Teléfono: ${ticketData.telefono}</div>
      </div>

      <div class="t-section">
        <div class="t-section-title">Productos</div>
        ${ticketData.productos.map(p => `
          <div class="t-producto">
            <div>
              <div class="t-prod-nombre">${p.name}</div>
              <div class="t-prod-cant">${p.cantidad} x ${f(p.price)}</div>
            </div>
            <div class="t-prod-total">${f(p.price * p.cantidad)}</div>
          </div>
        `).join('')}
      </div>

      <div class="t-totales">
        <div class="t-subtotal"><span>Subtotal</span><span>${f(ticketData.subtotal)}</span></div>
        <div class="t-total"><span>Total</span><span>${f(ticketData.total)}</span></div>
      </div>

      <div class="t-pago">
        <div class="t-pago-row">
          <span>Método de pago:</span>
          <span class="t-pago-valor">${ticketData.metodo_pago}</span>
        </div>
        <div class="t-nota">${ticketData.nota}</div>
      </div>

      <div class="t-estado">
        <span class="t-estado-badge">Estado: ${ticketData.estado}</span>
      </div>

      <div class="t-footer">
        <div class="t-footer-g">¡Gracias por su pedido!</div>
        <div class="t-footer-e">Gurama Online — Productos Artesanales</div>
      </div>

    </div>
  </div>
  <script>
    // Imprime automáticamente al abrir y cierra la ventana al terminar
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
      // Fallback por si onafterprint no se dispara
      setTimeout(function() { window.close(); }, 15000);
    };
  </script>
</body>
</html>`;

        const ventana = window.open('', '_blank', 'width=700,height=900,scrollbars=yes');
        if (!ventana) {
            alert('Por favor permite las ventanas emergentes para imprimir el ticket.');
            return;
        }
        ventana.document.write(html);
        ventana.document.close();
    };

    // ─── Pantallas de estado ──────────────────────────────────────────────────
    if (loading) return (
        <div className="ticket-loading-container">
            <Header />
            <main className="ticket-loading-main">
                <div className="ticket-loading-content">
                    <div className="ticket-spinner"></div>
                    <p className="ticket-loading-text">Generando su ticket de pedido...</p>
                </div>
            </main>
            <Footer />
        </div>
    );

    if (error) return (
        <div className="ticket-error-container">
            <Header />
            <main className="ticket-error-main">
                <div className="ticket-error-content">
                    <h2 className="ticket-error-title">{error}</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        Por favor, intente nuevamente o contacte al administrador.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/carrito')} className="ticket-btn-volver">Volver al Carrito</button>
                        <button onClick={handleVolverInicio} className="ticket-btn-volver">Ir al Inicio</button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );

    if (!ticketData) return (
        <div className="ticket-error-container">
            <Header />
            <main className="ticket-error-main">
                <div className="ticket-error-content">
                    <h2 className="ticket-error-title">No hay información de pedido</h2>
                    <p style={{ marginBottom: '20px' }}>No se encontraron datos. Por favor, vuelva al carrito.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/carrito')} className="ticket-btn-volver">Volver al Carrito</button>
                        <button onClick={handleVolverInicio} className="ticket-btn-volver">Ir al Inicio</button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );

    // ─── Ticket completo ──────────────────────────────────────────────────────
    return (
        <div className="ticket-page">
            <Header />
            <main className="ticket-main">

                {/* Vista del ticket en pantalla (usa las clases CSS normales) */}
                <div className="ticket-container">
                    <div className="ticket-header">
                        <h1 className="ticket-header-title">¡Pedido Generado!</h1>
                        <p className="ticket-header-subtitle">Su pedido ha sido registrado correctamente</p>
                    </div>
                    <div className="ticket-body">

                        <div className="ticket-info-box">
                            <div className="ticket-info-grid">
                                <div>
                                    <p className="ticket-info-label">Nº Ticket</p>
                                    <p className="ticket-info-value">{ticketData.num_ticket}</p>
                                </div>
                                <div className="ticket-info-right">
                                    <p className="ticket-info-label">Nº Pedido</p>
                                    <p className="ticket-info-value">#{ticketData.id_pedido}</p>
                                </div>
                            </div>
                            <div className="ticket-info-divider">
                                <p className="ticket-info-label">Fecha y Hora</p>
                                <p className="ticket-info-date">{ticketData.fecha_emision}</p>
                            </div>
                        </div>

                        <div className="ticket-section">
                            <h3 className="ticket-section-title">Información del Cliente</h3>
                            <p className="ticket-cliente-nombre">{ticketData.cliente}</p>
                            <p className="ticket-cliente-info">ID: {ticketData.id_usuario}</p>
                            <p className="ticket-cliente-info">Correo: {ticketData.correo}</p>
                            <p className="ticket-cliente-info">Teléfono: {ticketData.telefono}</p>
                        </div>

                        <div className="ticket-section">
                            <h3 className="ticket-section-title">Productos</h3>
                            <div className="ticket-productos-lista">
                                {ticketData.productos.map((producto, index) => (
                                    <div key={index} className="ticket-producto-item">
                                        <div className="ticket-producto-info">
                                            <p className="ticket-producto-nombre">{producto.name}</p>
                                            <p className="ticket-producto-cantidad">{producto.cantidad} x {formatPrice(producto.price)}</p>
                                        </div>
                                        <p className="ticket-producto-total">{formatPrice(producto.price * producto.cantidad)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ticket-totales">
                            <div className="ticket-subtotal"><span>Subtotal</span><span>{formatPrice(ticketData.subtotal)}</span></div>
                            <div className="ticket-total"><span>Total</span><span>{formatPrice(ticketData.total)}</span></div>
                        </div>

                        <div className="ticket-pago-box">
                            <div className="ticket-pago-metodo">
                                <span>Método de pago:</span>
                                <span className="ticket-pago-valor">{ticketData.metodo_pago}</span>
                            </div>
                            <p className="ticket-nota-pago">{ticketData.nota}</p>
                        </div>

                        <div className="ticket-estado-container">
                            <span className="ticket-estado-badge">Estado: {ticketData.estado}</span>
                        </div>

                        <div className="ticket-footer">
                            <p className="ticket-footer-gracias">¡Gracias por su pedido!</p>
                            <p className="ticket-footer-empresa">Gurama Online — Productos Artesanales</p>
                        </div>

                    </div>
                </div>

                {/* Botones */}
                <div className="ticket-acciones">
                    <button onClick={handlePrint} className="ticket-btn-descargar">
                        Imprimir / Guardar PDF
                    </button>
                    <button onClick={handleVolverInicio} className="ticket-btn-inicio">
                        Volver al Inicio
                    </button>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default TicketCompra;