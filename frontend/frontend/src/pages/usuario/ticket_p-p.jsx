import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header_c.jsx';
import Footer from '../../components/Footer.jsx';
import '../../components/css/styles.css';

export default function TicketPersonalizado() {
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        const rawData = sessionStorage.getItem('ticketPersonalizado');
        if (!rawData) {
            navigate('/pedidos_personalizados');
            return;
        }
        try {
            const parsed = JSON.parse(rawData);
            setTicket(parsed);
        } catch (e) {
            console.error('Error procesando ticket:', e);
            navigate('/pedidos_personalizados');
        }
    }, [navigate]);

    if (!ticket) return null;

    const formatPrice = (price) =>
        Number(price)?.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const materiales = ticket.materiales || [];

    const handlePrint = () => {
        const fecha = new Date().toLocaleString('es-CO', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const filasMateriales = materiales.map(m => `
            <tr style="border-bottom: 1px solid #f0d0e0;">
                <td style="padding: 8px 0;">
                    <strong>${m.concepto || 'Material'}</strong>
                    <div style="font-size: 12px; color: #666;">${m.nombre || ''}</div>
                </td>
                <td style="font-size: 12px; color: #666;">
                    ${m.color_nombre ? `<div>Color: ${m.color_nombre}</div>` : ''}
                    ${m.diseno_nombre ? `<div>Diseño: ${m.diseno_nombre}</div>` : ''}
                </td>
                <td style="text-align: right;">${m.cantidad || 1} ${m.unidad || 'm'}</td>
                <td style="text-align: right; font-weight: bold; color: #c45a77;">${formatPrice(m.subtotal)}</td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Ticket Personalizado #${ticket.num_ticket || ticket.id_pedido || ''}</title>
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
    table { width:100%; border-collapse:collapse; margin-top:10px; }
    th { text-align:left; font-size:11px; text-transform:uppercase; color:#9a7a8a; padding-bottom:8px; border-bottom:1px solid #f0d0e0; }
    .t-totales { background:#fdf8fb; border-radius:10px; padding:14px 16px; border:1.5px solid #f0d8e5; margin:18px 0; }
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
            <div class="t-value">TKT-${ticket.num_ticket || ticket.id_pedido || ''}</div>
          </div>
          <div class="t-info-right">
            <div class="t-label">Nº Pedido</div>
            <div class="t-value">#${ticket.id_pedido || ''}</div>
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
        <div class="t-info-line">Correo: ${ticket.usuario?.correo || 'N/A'}</div>
        <div class="t-info-line">Teléfono: ${ticket.usuario?.telefono || 'N/A'}</div>
      </div>

      <div class="t-section">
        <div class="t-section-title">Detalles del Pedido</div>
        <div class="t-tipo-row">
          <strong>Producto:</strong> ${ticket.tipo_producto || ticket.tipo || 'N/A'} &mdash; <strong>Tamaño:</strong> ${ticket.tamanio || 'N/A'}
        </div>
        <table>
          <thead>
            <tr>
              <th>Concepto / Material</th>
              <th>Detalle</th>
              <th style="text-align:right;">Cant.</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${filasMateriales}
          </tbody>
        </table>
      </div>

      <div class="t-totales">
        <div class="t-total">
          <span>Total estimado</span>
          <span>${formatPrice(ticket.precio_total)}</span>
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

    return (
        <div className="app-container">
            <Header />
            <main className="personalizar-main" style={{ maxWidth: '600px', margin: '40px auto' }}>
                <div className="cuadro-blanco" style={{ padding: '30px', borderRadius: '12px', border: '1px solid #e8d5e0' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h2 style={{ color: '#da819f', margin: 0 }}>¡Pedido Realizado!</h2>
                        <p style={{ color: '#888', marginTop: '5px' }}>Ticket de Compra #{ticket.num_ticket || ticket.id_pedido}</p>
                    </div>

                    <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '15px 0', margin: '15px 0' }}>
                        <p><strong>Cliente:</strong> {ticket.usuario?.nombre || 'N/A'}</p>
                        <p><strong>Correo:</strong> {ticket.usuario?.correo || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> {ticket.usuario?.telefono || 'N/A'}</p>
                        <p><strong>Producto:</strong> {ticket.tipo_producto || ticket.tipo}</p>
                        <p><strong>Tamaño:</strong> {ticket.tamanio}</p>
                    </div>

                    <h4 style={{ color: '#5a3d54', marginBottom: '10px' }}>Desglose de Materiales</h4>
                    <table style={{ width: '100%', marginBottom: '20px', fontSize: '14px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '8px 0' }}>Concepto / Material</th>
                                <th>Detalle</th>
                                <th style={{ textAlign: 'right' }}>Cant.</th>
                                <th style={{ textAlign: 'right' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materiales.map((m, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #fafafa' }}>
                                    <td style={{ padding: '8px 0' }}>
                                        <strong>{m.concepto || 'Material'}</strong>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{m.nombre}</div>
                                    </td>
                                    <td style={{ fontSize: '12px', color: '#666' }}>
                                        {m.color_nombre && <div>Color: {m.color_nombre}</div>}
                                        {m.diseno_nombre && <div>Diseño: {m.diseno_nombre}</div>}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{m.cantidad} {m.unidad || 'm'}</td>
                                    <td style={{ textAlign: 'right' }}>{formatPrice(m.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#da819f' }}>
                        Total: {formatPrice(ticket.precio_total)}
                    </div>

                    <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={handlePrint} className="btn-confirmar-ped">
                            Imprimir / Guardar PDF
                        </button>
                        <button onClick={() => navigate('/pedidos_personalizados')} className="btn-confirmar-ped" style={{ background: '#6c757d' }}>
                            Volver a Pedidos
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}