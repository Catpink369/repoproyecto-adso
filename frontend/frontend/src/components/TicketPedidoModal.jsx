// Modal de ticket de compra, reutilizado desde el panel de notificaciones
// del cliente (Header_c.jsx). Reusa las mismas clases CSS que ticketcompra.jsx
// (definidas en css/styles.css) para que se vea igual que el ticket que el
// cliente ya recibe justo después de comprar.
import React, { useEffect, useState } from 'react';
import { apiGet } from '../context/api.js';
import './css/styles.css';

const formatPrice = (price) =>
    Number(price ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const formatFecha = (fecha) =>
    fecha
        ? new Date(fecha).toLocaleString('es-CO', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
        })
        : 'N/A';

const TicketPedidoModal = ({ idPedido, onClose }) => {
    const [pedido, setPedido] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!idPedido) return;
        let cancelado = false;

        setCargando(true);
        setError(null);
        setPedido(null);

        apiGet(`/pedidos/detalle/${idPedido}`)
            .then(data => { if (!cancelado) setPedido(data); })
            .catch(err => { if (!cancelado) setError(err?.message || 'No se pudo cargar el ticket de este pedido.'); })
            .finally(() => { if (!cancelado) setCargando(false); });

        return () => { cancelado = true; };
    }, [idPedido]);

    // Cerrar con ESC
    useEffect(() => {
        if (!idPedido) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [idPedido, onClose]);

    if (!idPedido) return null;

    const ticket = pedido?.ticket_compra?.[0];
    const productos = pedido?.detalles_pedido ?? [];

    // ── Imprimir / Guardar PDF: misma técnica que ticketcompra.jsx ──
    // (ventana nueva con HTML+CSS autosuficiente, window.print() + autocierre)
    const handlePrint = () => {
        if (!pedido) return;
        const f = formatPrice;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"/>
    <title>Ticket TKT-${ticket?.num_ticket ?? pedido.id_pedido}</title>
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
        <h1>Ticket de tu pedido</h1>
        <p>Gurama Online — comprobante de compra</p>
        </div>
        <div class="t-body">

        <div class="t-info-box">
            <div class="t-info-grid">
            <div>
                <div class="t-label">Nº Ticket</div>
                <div class="t-value">TKT-${ticket?.num_ticket ?? 'N/A'}</div>
            </div>
            <div class="t-info-right">
                <div class="t-label">Nº Pedido</div>
                <div class="t-value">#${pedido.id_pedido}</div>
            </div>
            </div>
            <div class="t-divider">
            <div class="t-label">Fecha</div>
            <div class="t-date">${formatFecha(pedido.fecha)}</div>
            </div>
        </div>

        <div class="t-section">
            <div class="t-section-title">Cliente</div>
            <div class="t-nombre">${pedido.usuario?.nom_1 ?? ''} ${pedido.usuario?.ape_1 ?? ''}</div>
            <div class="t-info-line">Correo: ${pedido.usuario?.correo ?? 'N/A'}</div>
            <div class="t-info-line">Teléfono: ${pedido.usuario?.telefono ?? 'N/A'}</div>
        </div>

        <div class="t-section">
            <div class="t-section-title">Productos</div>
            ${productos.map(d => `
            <div class="t-producto">
                <div>
                <div class="t-prod-nombre">${d.producto?.nom_producto ?? d.descrip_detalles ?? 'Producto'}</div>
                <div class="t-prod-cant">${d.cantidad} x ${f(d.producto?.precio_unitario ?? 0)}</div>
                </div>
                <div class="t-prod-total">${f((d.producto?.precio_unitario ?? 0) * d.cantidad)}</div>
            </div>
            `).join('')}
        </div>

        <div class="t-totales">
            <div class="t-subtotal"><span>Subtotal</span><span>${f(ticket?.sub_total)}</span></div>
            <div class="t-total"><span>Total</span><span>${f(ticket?.total_ticket)}</span></div>
        </div>

        <div class="t-pago">
            <div class="t-pago-row">
            <span>Método de pago:</span>
            <span class="t-pago-valor">${ticket?.metodo_pago?.nom_metodo ?? 'Por definir'}</span>
            </div>
            <div class="t-nota">Estado del pago: ${ticket?.estado_pago?.nom_estado ?? 'N/A'}</div>
        </div>

        <div class="t-estado">
            <span class="t-estado-badge">Estado: ${pedido.estado}</span>
        </div>

        <div class="t-footer">
            <div class="t-footer-g">¡Gracias por tu compra!</div>
            <div class="t-footer-e">Gurama Online — Productos Artesanales</div>
        </div>

        </div>
    </div>
    <script>
        window.onload = function() {
        window.print();
        window.onafterprint = function() { window.close(); };
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

    return (
        <div
            style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
                padding: '20px', overflowY: 'auto',
            }}
            onClick={onClose}
        >
            <div
                className="ticket-container"
                style={{ maxWidth: 580, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    style={{
                        position: 'absolute', top: 12, right: 16, background: 'rgba(255,255,255,0.25)',
                        border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', lineHeight: 1,
                        width: 32, height: 32, borderRadius: '50%', zIndex: 1,
                    }}
                >×</button>

                <div className="ticket-header">
                    <h1 className="ticket-header-title">Ticket de tu pedido</h1>
                    <p className="ticket-header-subtitle">Gurama Online — comprobante de compra</p>
                </div>

                <div className="ticket-body">
                    {cargando ? (
                        <p style={{ textAlign: 'center', padding: '30px 0', color: '#9a7a8a' }}>Cargando ticket...</p>
                    ) : error ? (
                        <p style={{ textAlign: 'center', padding: '30px 0', color: '#e74c3c' }}>{error}</p>
                    ) : pedido && (
                        <>
                            <div className="ticket-info-box">
                                <div className="ticket-info-grid">
                                    <div>
                                        <p className="ticket-info-label">Nº Ticket</p>
                                        <p className="ticket-info-value">TKT-{ticket?.num_ticket ?? 'N/A'}</p>
                                    </div>
                                    <div className="ticket-info-right">
                                        <p className="ticket-info-label">Nº Pedido</p>
                                        <p className="ticket-info-value">#{pedido.id_pedido}</p>
                                    </div>
                                </div>
                                <div className="ticket-info-divider">
                                    <p className="ticket-info-label">Fecha</p>
                                    <p className="ticket-info-date">{formatFecha(pedido.fecha)}</p>
                                </div>
                            </div>

                            <div className="ticket-section">
                                <h3 className="ticket-section-title">Cliente</h3>
                                <p className="ticket-cliente-nombre">{pedido.usuario?.nom_1} {pedido.usuario?.ape_1}</p>
                                <p className="ticket-cliente-info">Correo: {pedido.usuario?.correo || 'N/A'}</p>
                                <p className="ticket-cliente-info">Teléfono: {pedido.usuario?.telefono || 'N/A'}</p>
                            </div>

                            <div className="ticket-section">
                                <h3 className="ticket-section-title">Productos</h3>
                                <div className="ticket-productos-lista">
                                    {productos.map((d, i) => (
                                        <div key={d.id_detalle ?? i} className="ticket-producto-item">
                                            <div className="ticket-producto-info">
                                                <p className="ticket-producto-nombre">{d.producto?.nom_producto ?? d.descrip_detalles}</p>
                                                <p className="ticket-producto-cantidad">
                                                    {d.cantidad} x {formatPrice(d.producto?.precio_unitario)}
                                                </p>
                                            </div>
                                            <p className="ticket-producto-total">
                                                {formatPrice((d.producto?.precio_unitario ?? 0) * d.cantidad)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="ticket-totales">
                                <div className="ticket-subtotal"><span>Subtotal</span><span>{formatPrice(ticket?.sub_total)}</span></div>
                                <div className="ticket-total"><span>Total</span><span>{formatPrice(ticket?.total_ticket)}</span></div>
                            </div>

                            <div className="ticket-pago-box">
                                <div className="ticket-pago-metodo">
                                    <span>Método de pago:</span>
                                    <span className="ticket-pago-valor">{ticket?.metodo_pago?.nom_metodo ?? 'Por definir'}</span>
                                </div>
                                <p className="ticket-nota-pago">Estado del pago: {ticket?.estado_pago?.nom_estado ?? 'N/A'}</p>
                            </div>

                            <div className="ticket-estado-container">
                                <span className="ticket-estado-badge">Estado: {pedido.estado}</span>
                            </div>

                            <div className="ticket-footer">
                                <p className="ticket-footer-gracias">¡Gracias por tu compra!</p>
                                <p className="ticket-footer-empresa">Gurama Online — Productos Artesanales</p>
                            </div>
                        </>
                    )}
                </div>

                {!cargando && !error && pedido && (
                    <div className="ticket-acciones" style={{ padding: '0 28px 24px' }}>
                        <button onClick={handlePrint} className="ticket-btn-descargar">
                            Imprimir / Guardar PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketPedidoModal;