import React from "react";
import Sidebar from "../../components/Sidebar_p-a.jsx";
import HeaderPanel from "../../components/HeaderPanel";
import "../../components/css/styles.css";
import { apiGet } from "../../context/api.js";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────
//  SUBCOMPONENTE: HISTORIAL DE VENTAS
// ─────────────────────────────────────────────
function HistorialVentas() {
    const [estadisticas, setEstadisticas] = React.useState({
        totalEntradas: 0,
        totalSalidas: 0,
        productosMasMovidos: [],
        resumenMensual: []
    });
    const [cargando, setCargando] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [rangoFechas, setRangoFechas] = React.useState({
        desde: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        hasta: new Date().toISOString().split('T')[0]
    });

    const fetchEstadisticas = async () => {
        try {
            setCargando(true);
            setError(null);
            const params = new URLSearchParams(rangoFechas).toString();
            const [resumenGeneral, topProductos, resumenMensual] = await Promise.all([
                apiGet(`/movimientos/resumen-general?${params}`),
                apiGet(`/movimientos/top-productos?${params}&limit=10`),
                apiGet(`/movimientos/resumen-mensual`),
            ]);
            setEstadisticas({
                totalEntradas: resumenGeneral.totalEntradas || 0,
                totalSalidas: resumenGeneral.totalSalidas || 0,
                productosMasMovidos: topProductos || [],
                resumenMensual: resumenMensual || []
            });
        } catch {
            setError("Error al cargar las estadísticas. Verifica que el backend esté funcionando.");
        } finally {
            setCargando(false);
        }
    };

    React.useEffect(() => { fetchEstadisticas(); }, [rangoFechas]);

    if (cargando) return <p className="panel-loading">Cargando estadísticas...</p>;
    if (error) return (
        <div className="panel-error">
            <p>{error}</p>
            <button className="btn-registrar" onClick={fetchEstadisticas}>Reintentar</button>
        </div>
    );

    return (
        <div>
            <div className="panel-filtros-fila">
                <div>
                    <label className="filtro-label">Desde:</label>
                    <input type="date" value={rangoFechas.desde}
                        onChange={(e) => setRangoFechas(p => ({ ...p, desde: e.target.value }))}
                        className="filtro-date-input" />
                </div>
                <div>
                    <label className="filtro-label">Hasta:</label>
                    <input type="date" value={rangoFechas.hasta}
                        onChange={(e) => setRangoFechas(p => ({ ...p, hasta: e.target.value }))}
                        className="filtro-date-input" />
                </div>
                <button className="btn-registrar" onClick={fetchEstadisticas}>Actualizar</button>
            </div>

            <div className="panel-stats-grid">
                <div className="panel-stat-card verde">
                    <div className="panel-stat-label">Total Entradas</div>
                    <div className="panel-stat-value">{Number(estadisticas.totalEntradas).toLocaleString()}</div>
                    <div className="panel-stat-sub">unidades recibidas</div>
                </div>
                <div className="panel-stat-card rojo">
                    <div className="panel-stat-label">Total Salidas</div>
                    <div className="panel-stat-value">{Number(estadisticas.totalSalidas).toLocaleString()}</div>
                    <div className="panel-stat-sub">unidades vendidas</div>
                </div>
            </div>

            <div className="panel-chart-box">
                <h3 className="panel-chart-titulo">Resumen Mensual (Último Año)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={estadisticas.resumenMensual}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="entradas" fill="#4caf50" name="Entradas" />
                        <Bar dataKey="salidas" fill="#f44336" name="Salidas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="panel-chart-box">
                <h3 className="panel-chart-titulo">Productos Más Movidos</h3>
                <div className="tabla-scroll">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Total Movimientos</th>
                                <th>Entradas</th>
                                <th>Salidas</th>
                                <th>Stock Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estadisticas.productosMasMovidos.length === 0 ? (
                                <tr><td colSpan="6" className="tabla-vacia-mensaje">No hay datos para mostrar</td></tr>
                            ) : estadisticas.productosMasMovidos.map((prod, i) => (
                                <tr key={prod.id_producto}>
                                    <td>{i + 1}</td>
                                    <td>{prod.producto}</td>
                                    <td><strong>{Number(prod.total_movimientos)}</strong></td>
                                    <td className="celda-entrada">+{Number(prod.entradas) || 0}</td>
                                    <td className="celda-salida">-{Number(prod.salidas) || 0}</td>
                                    <td>
                                        <span className={`stock-badge ${prod.stock_actual <= prod.stock_minimo ? 'stock-bajo' : 'stock-ok'}`}>
                                            {prod.stock_actual}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  SUBCOMPONENTE: NOTIFICACIONES
// ─────────────────────────────────────────────
const NOTIF_FILTROS = [
    { key: 'todas', clase: 'activo-todas', label: 'Todas', tipo: null },
    { key: 'stock-bajo', clase: 'activo-stockbajo', label: 'Stock Bajo', tipo: 'stock-bajo' },
    { key: 'agotado', clase: 'activo-agotado', label: 'Agotados', tipo: 'agotado' },
    { key: 'pedidos', clase: 'activo-pedidos', label: 'Pedidos', tipo: 'pedido' },
];

const BADGE_TIPO = {
    'stock-bajo': { bg: '#fff3cd', color: '#856404', label: 'Stock Bajo' },
    'agotado': { bg: '#f8d7da', color: '#721c24', label: 'Agotado' },
    'pedido': { bg: '#d1ecf1', color: '#0c5460', label: 'Pedido' },
};

function Notificaciones() {
    const [notificaciones, setNotificaciones] = React.useState([]);
    const [estadisticas, setEstadisticas] = React.useState(null);
    const [filtro, setFiltro] = React.useState('todas');
    const [cargando, setCargando] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        cargarNotificaciones();
        cargarEstadisticas();
        const interval = setInterval(cargarNotificaciones, 30000);
        return () => clearInterval(interval);
    }, []);

    const cargarNotificaciones = async () => {
        try {
            setCargando(true);
            const data = await apiGet('/notificaciones');
            setNotificaciones(data);
            setError(null);
        } catch {
            setError("No se pudieron cargar las notificaciones");
        } finally {
            setCargando(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const data = await apiGet('/notificaciones/estadisticas');
            setEstadisticas(data);
        } catch { }
    };

    const getFiltroPorKey = (key) => NOTIF_FILTROS.find(f => f.key === key);
    const filtradas = notificaciones.filter(n => {
        const f = getFiltroPorKey(filtro);
        return filtro === 'todas' || n.tipo === f?.tipo;
    });
    const countPor = (key) => {
        const f = getFiltroPorKey(key);
        return key === 'todas' ? notificaciones.length : notificaciones.filter(n => n.tipo === f?.tipo).length;
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const diffMins = Math.floor((new Date() - date) / 60000);
        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours}h`;
        return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    };

    const getBadge = (tipo) => BADGE_TIPO[tipo] || { bg: '#e2e3e5', color: '#383d41', label: 'Info' };

    return (
        <div>
            {estadisticas && (
                <div className="panel-stats-grid">
                    <div className="panel-stat-card amarillo">
                        <div className="panel-stat-label notif-label-amarillo">Stock Bajo</div>
                        <div className="panel-stat-value notif-valor-amarillo">{estadisticas.productos_stock_bajo}</div>
                    </div>
                    <div className="panel-stat-card rojo-claro">
                        <div className="panel-stat-label notif-label-rojo">Agotados</div>
                        <div className="panel-stat-value notif-valor-rojo">{estadisticas.productos_agotados}</div>
                    </div>
                    <div className="panel-stat-card cyan">
                        <div className="panel-stat-label notif-label-cyan">Pedidos Hoy</div>
                        <div className="panel-stat-value notif-valor-cyan">{estadisticas.pedidos_hoy}</div>
                    </div>
                    <div className="panel-stat-card verde-claro">
                        <div className="panel-stat-label notif-label-verde">Pedidos (7 días)</div>
                        <div className="panel-stat-value notif-valor-verde">{estadisticas.pedidos_semana}</div>
                    </div>
                </div>
            )}

            <div className="notif-filtros-fila">
                {NOTIF_FILTROS.map(({ key, clase, label }) => (
                    <button key={key}
                        className={`btn-notif-filtro ${filtro === key ? clase : ''}`}
                        onClick={() => setFiltro(key)}>
                        {label} ({countPor(key)})
                    </button>
                ))}
                <button className="btn-notif-actualizar" onClick={cargarNotificaciones}>Actualizar</button>
            </div>

            {cargando ? (
                <p className="panel-loading">Cargando notificaciones...</p>
            ) : error ? (
                <p className="panel-error">{error}</p>
            ) : filtradas.length === 0 ? (
                <div className="tabla-vacia-mensaje">
                    No hay notificaciones {filtro !== 'todas' ? `de tipo "${filtro}"` : ''}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>#</th><th>Tipo</th><th>Mensaje</th>
                                <th>Detalles</th><th>Fecha</th><th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtradas.map((notif, i) => {
                                const b = getBadge(notif.tipo);
                                return (
                                    <tr key={notif.id_notificacion}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <span className="notif-tipo-badge"
                                                style={{ backgroundColor: b.bg, color: b.color }}>
                                                {b.label}
                                            </span>
                                        </td>
                                        <td><strong>{notif.mensaje}</strong></td>
                                        <td>
                                            <div>{notif.detalles}</div>
                                            {notif.stock_actual != null && (
                                                <small className={notif.stock_actual === 0 ? 'texto-sin-stock' : 'texto-stock-bajo'}>
                                                    {notif.stock_actual === 0
                                                        ? 'SIN STOCK'
                                                        : `Stock: ${notif.stock_actual} (Mín: ${notif.stock_minimo})`}
                                                </small>
                                            )}
                                        </td>
                                        <td><small className="mov-usuario-id">{formatearFecha(notif.fecha)}</small></td>
                                        <td>
                                            <Link to={notif.ruta_destino}>
                                                <button className={`btn-filtro-mov ${notif.tipo === 'pedido' ? 'todos activo' : 'entradas activo'}`}>
                                                    {notif.tipo === 'pedido' ? 'Ir a pedidos' : 'Ir a movimientos'}
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
//  SUBCOMPONENTE: REPORTES
// ─────────────────────────────────────────────
const TARJETAS_CLIENTES = ['oro', 'plata', 'bronce'];

const handlePrint = () => {
    // Abre una ventana nueva solo con el contenido del reporte
    const contenido = document.querySelector('.reporte-imprimible');
    if (!contenido) return;

    const ventana = window.open('', '_blank', 'width=900,height=700');
    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>Reporte — Gurama Online</title>
            <style>
                /* Reset básico */
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', sans-serif; font-size: 13px; color: #2d1f27; padding: 24px; }
                h3 { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: #a0405f; }

                /* Stats grid */
                .panel-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
                .panel-stat-card  { border-radius: 10px; padding: 14px 18px; }
                .panel-stat-card.verde      { background: #edf7ed; border: 1px solid #c8e6c9; }
                .panel-stat-card.rojo       { background: #fdecea; border: 1px solid #ffcdd2; }
                .panel-stat-card.azul       { background: #e8f4fd; border: 1px solid #b3d9f8; }
                .panel-stat-card.rosa       { background: #fdf0f4; border: 1px solid #f0d0db; }
                .panel-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; color: #7a5060; }
                .panel-stat-value { font-size: 26px; font-weight: 800; color: #2d1f27; }
                .panel-stat-value-sm { font-size: 18px; }
                .panel-stat-sub   { font-size: 11px; color: #6b7280; margin-top: 2px; }

                /* Chart box */
                .panel-chart-box  { background: #fff; border: 1px solid #e8d5dc; border-radius: 10px; padding: 18px; margin-bottom: 18px; page-break-inside: avoid; }
                .panel-chart-box.alerta { border-color: #f9a8a8; background: #fff8f8; }
                .panel-chart-titulo { font-size: 14px; font-weight: 700; color: #a0405f; margin-bottom: 14px; }
                .panel-chart-titulo.danger { color: #c62828; }

                /* Top clientes */
                .panel-top-clientes-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
                .panel-cliente-card  { border-radius: 10px; padding: 16px; text-align: center; }
                .panel-cliente-card.oro    { background: linear-gradient(135deg,#fffde7,#fff9c4); border: 2px solid #f9a825; }
                .panel-cliente-card.plata  { background: linear-gradient(135deg,#f5f5f5,#eeeeee); border: 2px solid #bdbdbd; }
                .panel-cliente-card.bronce { background: linear-gradient(135deg,#fbe9e7,#ffccbc); border: 2px solid #e64a19; }
                .panel-cliente-puesto  { font-size: 22px; font-weight: 900; }
                .panel-cliente-nombre  { font-weight: 700; margin: 4px 0; }
                .panel-cliente-telefono{ font-size: 12px; color: #666; }
                .panel-cliente-monto   { font-size: 16px; font-weight: 800; color: #a0405f; margin-top: 6px; }
                .panel-cliente-pedidos { font-size: 12px; color: #888; }
 
                /* Tabla */
                table  { width: 100%; border-collapse: collapse; font-size: 12px; }
                thead  { background: #c45c7e; color: #fff; }
                th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #f0e6ea; }
                .celda-right       { text-align: right; }
                .celda-center      { text-align: center; }
                .celda-bold        { font-weight: 700; }
                .celda-gris        { color: #6b7280; }
                .celda-gris-oscuro { color: #374151; }
                .celda-total-verde { color: #2e7d32; font-weight: 800; }
                .celda-id-pedido   { font-weight: 700; color: #a0405f; }
                tfoot td           { background: #fdf0f4; }
 
                /* Badges */
                .stock-badge   { padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
                .stock-bajo    { background: #fdecea; color: #c62828; }
                .badge-urgente { background: #c62828; color: #fff; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
                .pedido-estado-inline  { padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; }
                .pedido-estado-pagado  { background: #edf7ed; color: #2e7d32; }
                .pedido-estado-pendiente { background: #fff3cd; color: #856404; }
                .pedido-estado-otro    { background: #e8f4fd; color: #1565c0; }
 
                /* Gráficos — recharts no imprime bien, los ocultamos */
                .panel-graficos-grid { display: none; }
 
                /* Footer */
                .panel-reporte-footer { margin-top: 20px; text-align: center; font-size: 11px; color: #9e8a92; border-top: 1px solid #e8d5dc; padding-top: 12px; }
 
                @media print {
                    body { padding: 10px; }
                    .panel-chart-box { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <h2 style="margin-bottom:16px;color:#a0405f;font-size:18px;"> Reporte — Gurama Online</h2>
            ${contenido.innerHTML}
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
        ventana.print();
        ventana.close();
    }, 500); // espera a que cargue antes de imprimir
};

function Reportes() {
    const [loading, setLoading] = React.useState(false);
    const [fechaDesde, setFechaDesde] = React.useState('');
    const [fechaHasta, setFechaHasta] = React.useState('');
    const [resumenGeneral, setResumenGeneral] = React.useState(null);
    const [ventasPorMetodoPago, setVentasPorMetodoPago] = React.useState([]);
    const [topClientes, setTopClientes] = React.useState([]);
    const [productosStockBajo, setProductosStockBajo] = React.useState([]);
    const [ingresosPorPedido, setIngresosPorPedido] = React.useState([]);
    const [resumenMensual, setResumenMensual] = React.useState([]);
    const [ventasPorOrigen, setVentasPorOrigen] = React.useState([]);

    React.useEffect(() => {
        const hoy = new Date();
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        setFechaHasta(hoy.toISOString().split('T')[0]);
        setFechaDesde(haceUnMes.toISOString().split('T')[0]);
    }, []);

    React.useEffect(() => {
        if (fechaDesde && fechaHasta) cargarDatos();
    }, [fechaDesde, fechaHasta]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const params = `desde=${fechaDesde}&hasta=${fechaHasta}`;
            const [resumenRes, topProdRes, mensualRes, movimientosRes] = await Promise.all([
                apiGet(`/movimientos/resumen-general?${params}`),
                apiGet(`/movimientos/top-productos?${params}&limit=10`),
                apiGet(`/movimientos/resumen-mensual`),
                apiGet(`/movimientos?${params}&limit=1000`),
            ]);

            setResumenGeneral(resumenRes);
            setResumenMensual(mensualRes);
            setProductosStockBajo((topProdRes || [])
                .filter(p => p.stock_actual < p.stock_minimo || p.stock_actual < 5)
                .sort((a, b) => a.stock_actual - b.stock_actual).slice(0, 5));

            const origen = { online: 0, manual: 0, admin: 0 };
            (movimientosRes || []).forEach(mov => {
                if (mov.id_m === 'M-S') {
                    const obs = mov.observaciones || '';
                    if (obs.includes('Pedido #') || obs.includes('Venta Online')) origen.online++;
                    else if (obs.includes('Realizado por:')) origen.admin++;
                    else origen.manual++;
                }
            });
            setVentasPorOrigen([
                { name: 'Online', value: origen.online, color: '#c45a77' },
                { name: 'Manual', value: origen.manual, color: '#ec4899' },
                { name: 'Admin', value: origen.admin, color: '#f59e0b' },
            ]);

            await cargarDatosPedidos();
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const cargarDatosPedidos = async () => {
        try {
            const pedidos = await apiGet('/pedidos');

            const metodosPago = {};
            pedidos.forEach(p => {
                const ticket = p.ticket_compra;
                const estadoPago = ticket?.estado_pago?.nom_metodo || '';
                const metodoPago = ticket?.metodo_pago?.nom_metodo || '';
                const esPendiente =
                    estadoPago.toLowerCase().includes('pendiente') ||
                    metodoPago.toLowerCase().includes('pendiente');

                if (esPendiente) return; // ← saltar pedidos pendientes

                const m = metodoPago || 'Sin definir';
                if (!metodosPago[m]) metodosPago[m] = { metodo: m, monto_total: 0, cantidad: 0 };
                metodosPago[m].monto_total += parseFloat(ticket?.total_ticket) || 0;
                metodosPago[m].cantidad += 1;
            });
            setVentasPorMetodoPago(Object.values(metodosPago));

            const clientes = {};
            pedidos.forEach(p => {
                const id = p.id_usuario;
                const nombre = p.usuario ? `${p.usuario.nom_1} ${p.usuario.ape_1}` : id;
                const ticket = p.ticket_compra;

                const estadoPago = ticket?.estado_pago?.nom_metodo || '';
                const metodoPago = ticket?.metodo_pago?.nom_metodo || '';
                const esPendiente =
                    estadoPago.toLowerCase().includes('pendiente') ||
                    metodoPago.toLowerCase().includes('pendiente');

                if (!clientes[id]) clientes[id] = {
                    id_usuario: id,
                    nombre,
                    telefono: p.usuario?.telefono,
                    cantidad_pedidos: 0,
                    total_monto: 0
                };

                clientes[id].cantidad_pedidos += 1;

                // Solo suma el monto si el pago está confirmado
                if (!esPendiente) {
                    clientes[id].total_monto += parseFloat(ticket?.total_ticket) || 0;
                }
            });
            setTopClientes(Object.values(clientes).sort((a, b) => b.total_monto - a.total_monto).slice(0, 3));

            setIngresosPorPedido(pedidos
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10)
                .map(p => {
                    const ticket = p.ticket_compra;
                    const estadoPago = ticket?.estado_pago?.nom_metodo || '';
                    const metodoPago = ticket?.metodo_pago?.nom_metodo || '';
                    const esPendiente =
                        estadoPago.toLowerCase().includes('pendiente') ||
                        metodoPago.toLowerCase().includes('pendiente');

                    return {
                        id_pedido: p.id_pedido,
                        cliente: p.usuario ? `${p.usuario.nom_1} ${p.usuario.ape_1}` : p.id_usuario,
                        fecha: new Date(p.fecha).toLocaleDateString(),
                        metodo: metodoPago || '-',
                        estado: estadoPago || p.estado,
                        total: esPendiente ? 0 : (parseFloat(ticket?.total_ticket) || 0),  // ← aquí
                    };
                }));
        } catch (e) { console.error(e); }
    };

    const getEstadoClase = (estado) => {
        if (estado === 'Pagado') return 'pedido-estado-pagado';
        if (estado === 'Pendiente') return 'pedido-estado-pendiente';
        return 'pedido-estado-otro';
    };

    const totalVentas = ventasPorMetodoPago.reduce((s, m) => s + m.monto_total, 0);
    const totalPedidos = ingresosPorPedido
        .filter(p => !p.estado.toLowerCase().includes('pendiente'))
        .reduce((s, p) => s + p.total, 0);

    if (loading) return <p className="panel-loading">Generando reportes...</p>;

    return (
        <div className="reporte-imprimible">
            <div className="panel-filtros-fila">
                <div>
                    <label className="filtro-label">Desde:</label>
                    <input type="date" value={fechaDesde}
                        onChange={e => setFechaDesde(e.target.value)}
                        className="filtro-date-input" />
                </div>
                <div>
                    <label className="filtro-label">Hasta:</label>
                    <input type="date" value={fechaHasta}
                        onChange={e => setFechaHasta(e.target.value)}
                        className="filtro-date-input" />
                </div>
                <button className="btn-registrar btn-no-imprimir" onClick={handlePrint}>Imprimir Reporte</button>
            </div>

            {resumenGeneral && (
                <div className="panel-stats-grid">
                    <div className="panel-stat-card verde">
                        <div className="panel-stat-label">Total Entradas</div>
                        <div className="panel-stat-value">{Number(resumenGeneral.totalEntradas) || 0}</div>
                        <div className="panel-stat-sub">unidades recibidas</div>
                    </div>
                    <div className="panel-stat-card rojo">
                        <div className="panel-stat-label">Total Salidas</div>
                        <div className="panel-stat-value">{Number(resumenGeneral.totalSalidas) || 0}</div>
                        <div className="panel-stat-sub">unidades vendidas</div>
                    </div>
                    <div className="panel-stat-card azul">
                        <div className="panel-stat-label">Balance Neto</div>
                        <div className="panel-stat-value">
                            {(Number(resumenGeneral.totalEntradas) || 0) - (Number(resumenGeneral.totalSalidas) || 0)}
                        </div>
                        <div className="panel-stat-sub">diferencia</div>
                    </div>
                    <div className="panel-stat-card rosa">
                        <div className="panel-stat-label">Valor Total</div>
                        <div className="panel-stat-value panel-stat-value-sm">
                            ${totalVentas.toLocaleString('es-CO')}
                        </div>
                        <div className="panel-stat-sub">en ventas</div>
                    </div>
                </div>
            )}

            {topClientes.length > 0 && (
                <div className="panel-chart-box">
                    <h3 className="panel-chart-titulo">Top 3 Mejores Clientes</h3>
                    <div className="panel-top-clientes-grid">
                        {topClientes.map((cliente, idx) => (
                            <div key={idx} className={`panel-cliente-card ${TARJETAS_CLIENTES[idx]}`}>
                                <div className="panel-cliente-puesto">{idx + 1}</div>
                                <div className="panel-cliente-nombre">{cliente.nombre}</div>
                                <div className="panel-cliente-telefono">{String(cliente.telefono || '')}</div>
                                <div className="panel-cliente-monto">${cliente.total_monto.toLocaleString('es-CO')}</div>
                                <div className="panel-cliente-pedidos">{cliente.cantidad_pedidos} pedidos</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="panel-graficos-grid">
                {ventasPorOrigen.length > 0 && (
                    <div className="panel-chart-box">
                        <h3 className="panel-chart-titulo">Origen de Ventas</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={ventasPorOrigen} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                    {ventasPorOrigen.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {ventasPorMetodoPago.length > 0 && (
                    <div className="panel-chart-box">
                        <h3 className="panel-chart-titulo">Ventas por Método de Pago</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={ventasPorMetodoPago}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="metodo" tick={{ fontSize: 11 }} />
                                <YAxis />
                                <Tooltip formatter={v => `$${v.toLocaleString('es-CO')}`} />
                                <Bar dataKey="monto_total" fill="#c45a77" name="Monto Total" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {resumenMensual.length > 0 && (
                <div className="panel-chart-box">
                    <h3 className="panel-chart-titulo">Tendencia de Ventas Mensual</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={resumenMensual}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={3} name="Entradas" />
                            <Line type="monotone" dataKey="salidas" stroke="#c45a77" strokeWidth={3} name="Salidas" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {productosStockBajo.length > 0 && (
                <div className="panel-chart-box alerta">
                    <h3 className="panel-chart-titulo danger">⚠ Productos con Stock Bajo</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tabla">
                            <thead>
                                <tr>
                                    <th>Producto</th><th>Stock Actual</th>
                                    <th>Stock Mínimo</th><th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosStockBajo.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.producto}</td>
                                        <td className="celda-center">
                                            <span className="stock-badge stock-bajo">{p.stock_actual}</span>
                                        </td>
                                        <td className="celda-center celda-gris">{p.stock_minimo}</td>
                                        <td className="celda-center">
                                            <span className="badge-urgente">URGENTE</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {ingresosPorPedido.length > 0 && (
                <div className="panel-chart-box">
                    <h3 className="panel-chart-titulo">Últimos 10 Ingresos por Pedido</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tabla">
                            <thead>
                                <tr>
                                    <th>Pedido</th><th>Cliente</th><th>Fecha</th>
                                    <th>Método</th><th>Estado</th><th className="celda-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ingresosPorPedido.map((p, i) => (
                                    <tr key={i}>
                                        <td className="celda-id-pedido">#{p.id_pedido}</td>
                                        <td>{p.cliente}</td>
                                        <td className="celda-gris">{p.fecha}</td>
                                        <td className="celda-gris">{p.metodo}</td>
                                        <td>
                                            <span className={`pedido-estado-inline ${getEstadoClase(p.estado)}`}>
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="celda-right celda-bold">${p.total.toLocaleString('es-CO')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" className="celda-right celda-bold celda-gris-oscuro">Total:</td>
                                    <td className="celda-right celda-total-verde">${totalPedidos.toLocaleString('es-CO')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            <div className="panel-reporte-footer">
                <p>Sistema de Gestión de Inventario — Gurama Online</p>
                <p>Reporte generado el {new Date().toLocaleString('es-CO')}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const OPCIONES_PANEL = [
    { key: 'reportes', label: 'Reportes' },
    { key: 'historial_ventas', label: 'Historial de ventas' },
    { key: 'notificaciones', label: 'Notificaciones' },
];

export default function PanelControl() {
    const [activo, setActivo] = React.useState(null);

    const handleOpcion = (key) => setActivo(prev => prev === key ? null : key);

    const renderContenido = () => {
        switch (activo) {
            case 'reportes': return <Reportes />;
            case 'historial_ventas': return <HistorialVentas />;
            case 'notificaciones': return <Notificaciones />;
            default: return (
                <div className="panel-placeholder">
                    <div className="panel-placeholder-icono"></div>
                    <p>Seleccione una opción para ver su contenido aquí</p>
                </div>
            );
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="contenido">
                <HeaderPanel />

                <section className="opciones panel-selector">
                    <h2>Selecciona una opción</h2>
                    <div className="opciones-botones">
                        {OPCIONES_PANEL.map(({ key, label }) => (
                            <div key={key}
                                className={`opcion ${activo === key ? 'opcion-activa' : ''}`}
                                onClick={() => handleOpcion(key)}>
                                <p>{label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="cuadro-blanco panel-contenido">
                    {renderContenido()}
                </section>
            </main>
        </div>
    );
}