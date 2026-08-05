import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header_c.jsx';
import Footer from '../../components/Footer.jsx';
import '../../components/css/styles.css';

const TicketPersonalizado = () => {
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        const data = sessionStorage.getItem('ticketPersonalizado');
        console.log("DATA RAW:", data);
        if (data) {
            const parsed = JSON.parse(data);
            console.log("DATA PARSED:", parsed);
            setTicket(parsed);
        }
    }, []);

    const formatPrice = (price) =>
        Number(price)?.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    // ─── Impresión: ventana nueva con HTML+CSS autosuficiente ─────────────────
    const handlePrint = () => {
        if (!ticket) return;

        const fecha = new Date().toLocaleString('es-CO', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Ticket Personalizado TKT-${ticket.num_ticket}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:"Segoe UI",Arial,sans-serif; background:#f8f4f6; display:flex; justify-content:center; padding:30px 20px; }
    .ticket { width:100%; max-width:580px; background:white; border-radius:18px; overflow:hidden; box-shadow:0 4px 20px rgba(180,100,140,.15); }
    .t-header { background:linear-gradient(135deg,#c45a77,#a94563); padding:28px 32px; text-align:center; }
    .t-header h1 { color:white; font-size:22px; font-weight:800; margin-bottom:5px; }
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
    .t-tipo-row { font-size:14px; color:#5a3d54; margin-bottom:12px; }
    .t-tipo-row strong { color:#4b004b; }
    .t-producto { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; padding:10px 12px; background:#fdf8fb; border-radius:8px; border:1px solid #f0d8e5; margin-bottom:7px; }
    .t-prod-nombre { font-weight:600; color:#5a3d54; font-size:14px; margin-bottom:2px; }
    .t-prod-cant   { font-size:12px; color:#888; }
    .t-prod-total  { font-weight:700; color:#c45a77; font-size:15px; white-space:nowrap; }
    .t-totales { background:#fdf8fb; border-radius:10px; padding:14px 16px; border:1.5px solid #f0d8e5; margin-bottom:18px; }
    .t-total { display:flex; justify-content:space-between; font-size:19px; font-weight:800; color:#4b004b; }
    .t-pago { background:#fff5f9; border:1.5px solid #f0c8da; border-left:4px solid #c45a77; border-radius:8px; padding:12px 16px; margin-bottom:18px; }
    .t-pago-row { display:flex; justify-content:space-between; font-size:13px; color:#5a3d54; margin-bottom:6px; }
    .t-pago-valor { font-weight:700; color:#c45a77; }
    .t-nota { font-size:12px; color:#9a7a8a; line-height:1.5; }
    .t-estado { text-align:center; margin-bottom:18px; }
    .t-estado-badge { display:inline-block; padding:7px 18px; background:#fef3c7; color:#92400e; border-radius:20px; font-size:13px; font-weight:700; }
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
      <h1>¡Pedido Personalizado Generado!</h1>
      <p>Tu pedido ha sido registrado. Te contactaremos pronto.</p>
    </div>
    <div class="t-body">

      <div class="t-info-box">
        <div class="t-info-grid">
          <div>
            <div class="t-label">Nº Ticket</div>
            <div class="t-value">TKT-${ticket.num_ticket}</div>
          </div>
          <div class="t-info-right">
            <div class="t-label">Nº Pedido</div>
            <div class="t-value">#${ticket.id_pedido}</div>
          </div>
        </div>
        <div class="t-divider">
          <div class="t-label">Fecha</div>
          <div class="t-date">${fecha}</div>
        </div>
      </div>

      <div class="t-section">
        <div class="t-section-title">Cliente</div>
        <div class="t-nombre">${ticket.usuario?.nombre || 'N/A'}</div>
        <div class="t-info-line">ID: ${ticket.usuario?.id_usuario || 'N/A'}</div>
        <div class="t-info-line">Correo: ${ticket.usuario?.correo || 'N/A'}</div>
        <div class="t-info-line">Teléfono: ${ticket.usuario?.telefono || 'N/A'}</div>
      </div>

      <div class="t-section">
        <div class="t-section-title">Detalles del Pedido</div>
        <div class="t-tipo-row">
          <strong>Tipo:</strong> ${ticket.tipo || 'N/A'} &mdash; <strong>Tamaño:</strong> ${ticket.tamanio || 'N/A'}
        </div>
        ${(ticket.materiales || []).map(mat => `
          <div class="t-producto">
            <div>
              <div class="t-prod-nombre">${mat.nombre}</div>
              <div class="t-prod-cant">${mat.cantidad} ${mat.unidad}</div>
            </div>
            <div class="t-prod-total">${Number(mat.subtotal).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</div>
          </div>
        `).join('')}
      </div>

      <div class="t-totales">
        <div class="t-total">
          <span>Total estimado</span>
          <span>${Number(ticket.precio_total).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div class="t-pago">
        <div class="t-pago-row">
          <span>Pago:</span>
          <span class="t-pago-valor">Presencial en tienda</span>
        </div>
        <div class="t-nota">
          Tu pedido está en estado <strong>Pendiente</strong>.
          El administrador lo revisará y te notificará cuando esté listo para recoger.
        </div>
      </div>

      <div class="t-estado">
        <span class="t-estado-badge">Estado: Pendiente</span>
      </div>

      <div class="t-footer">
        <div class="t-footer-g">¡Gracias por tu pedido personalizado!</div>
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

    // ─── Sin datos ────────────────────────────────────────────────────────────
    if (!ticket) return (
        <>
            <Header />
            <main style={{ textAlign: 'center', padding: '60px' }}>
                <h2>No hay información de pedido</h2>
                <button className="ticket-btn-volver" onClick={() => navigate('/pedidos_personalizados')}>
                    Volver
                </button>
            </main>
            <Footer />
        </>
    );

    // ─── Ticket en pantalla ───────────────────────────────────────────────────
    return (
        <div className="ticket-page">
            <Header />
            <main className="ticket-main">

                <div className="ticket-container">
                    <div className="ticket-header">
                        <h1 className="ticket-header-title">¡Pedido Personalizado Generado!</h1>
                        <p className="ticket-header-subtitle">Tu pedido ha sido registrado. Te contactaremos pronto.</p>
                    </div>

                    <div className="ticket-body">

                        <div className="ticket-info-box">
                            <div className="ticket-info-grid">
                                <div>
                                    <p className="ticket-info-label">Nº Ticket</p>
                                    <p className="ticket-info-value">TKT-{ticket.num_ticket}</p>
                                </div>
                                <div className="ticket-info-right">
                                    <p className="ticket-info-label">Nº Pedido</p>
                                    <p className="ticket-info-value">#{ticket.id_pedido}</p>
                                </div>
                            </div>
                            <div className="ticket-info-divider">
                                <p className="ticket-info-label">Fecha</p>
                                <p className="ticket-info-date">
                                    {new Date().toLocaleString('es-CO', {
                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="ticket-section">
                            <h3 className="ticket-section-title">Cliente</h3>
                            <p className="ticket-cliente-nombre">{ticket.usuario.nombre}</p>
                            <p className="ticket-cliente-info">ID: {ticket.usuario.id_usuario}</p>
                            <p className="ticket-cliente-info">Correo: {ticket.usuario.correo}</p>
                            <p className="ticket-cliente-info">Teléfono: {ticket.usuario.telefono}</p>
                        </div>

                        <div className="ticket-section">
                            <h3 className="ticket-section-title">Detalles del Pedido</h3>
                            <p style={{ marginBottom: '8px' }}>
                                <strong>Tipo:</strong> {ticket.tipo} &mdash; <strong>Tamaño:</strong> {ticket.tamanio}
                            </p>
                            <div className="ticket-productos-lista">
                                {ticket.materiales?.map((mat, i) => (
                                    <div key={i} className="ticket-producto-item">
                                        <div className="ticket-producto-info">
                                            <p className="ticket-producto-nombre">{mat.nombre}</p>
                                            <p className="ticket-producto-cantidad">{mat.cantidad} {mat.unidad}</p>
                                        </div>
                                        <p className="ticket-producto-total">{formatPrice(mat.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ticket-totales">
                            <div className="ticket-total">
                                <span>Total estimado</span>
                                <span>{formatPrice(ticket.precio_total)}</span>
                            </div>
                        </div>

                        <div className="ticket-pago-box">
                            <div className="ticket-pago-metodo">
                                <span>Pago:</span>
                                <span className="ticket-pago-valor">Presencial en tienda</span>
                            </div>
                            <p className="ticket-nota-pago">
                                Tu pedido está en estado <strong>Pendiente</strong>.
                                El administrador lo revisará y te notificará cuando esté listo para recoger.
                            </p>
                        </div>

                        <div className="ticket-estado-container">
                            <span className="ticket-estado-badge">Estado: Pendiente</span>
                        </div>

                        <div className="ticket-footer">
                            <p className="ticket-footer-gracias">¡Gracias por tu pedido personalizado!</p>
                            <p className="ticket-footer-empresa">Gurama Online — Productos Artesanales</p>
                        </div>

                    </div>
                </div>

                <div className="ticket-acciones">
                    <button onClick={handlePrint} className="ticket-btn-descargar">
                        Imprimir / Guardar PDF
                    </button>
                    <button onClick={() => navigate('/cliente')} className="ticket-btn-inicio">
                        Volver al Inicio
                    </button>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default TicketPersonalizado;