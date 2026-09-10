import React, { useState, useEffect, useContext } from 'react';
import Sidebar from "../../components/Sidebar_p-a";
import HeaderPedidos from "../../components/HeaderPedidos";
import "../../components/css/styles.css";
import { apiGet, apiPatch } from '../../context/api.js';
import { AuthContext } from '../../context/AuthContext.jsx';

export default function PedidosRealizados() {
    const { userId } = useContext(AuthContext);

    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPedido, setExpandedPedido] = useState(null);
    const [detallesPedido, setDetallesPedido] = useState({});

    const [editandoId, setEditandoId] = useState(null);
    const [nuevoEstadoTemp, setNuevoEstadoTemp] = useState('');
    const [procesandoEstado, setProcesandoEstado] = useState(false);

    const [editandoMetodoId, setEditandoMetodoId] = useState(null);
    const [nuevoMetodoTemp, setNuevoMetodoTemp] = useState('');
    const [procesandoMetodo, setProcesandoMetodo] = useState(false);

    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [ordenFecha, setOrdenFecha] = useState('desc');

    const opcionesMetodoPago = ['Por_definir', 'Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'DaviPlata'];

    const TRANSICIONES_VALIDAS = {
        'Pendiente':      ['En preparación'],
        'En preparación': ['Pagado'],
        'Pagado':         ['Entregado', 'Finalizado'],
    };

    const opcionesEstadoPara = (estadoActual) => {
        const siguientes = TRANSICIONES_VALIDAS[estadoActual] || [];
        return [estadoActual, ...siguientes];
    };

    useEffect(() => { cargarPedidos(); }, []);

    // ─── CARGAR PEDIDOS ───────────────────────────────────────────────────────
    const cargarPedidos = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const responseEstandar = await apiGet('/pedidos');
            const estandar = (Array.isArray(responseEstandar)
                ? responseEstandar
                : responseEstandar.data || []
            ).map(p => ({ ...p, _tipo: 'estandar' }));

            const responsePersonal = await apiGet('/pedidos-personalizados');
            const personalizados = (Array.isArray(responsePersonal)
                ? responsePersonal
                : responsePersonal.data || []
            ).map(p => ({
                id_pedido:     p.id_ped_personal,
                id_pedido_ref: p.id_pedido,
                fecha:           p.pedido?.fecha,
                estado:          p.pedido?.estado,
                usuario:         p.pedido?.usuario ?? null,
                ticket_compra:   p.pedido?.ticket_compra ?? null,
                detalles_pedido: p.detalles ?? [],
                tipo_producto:   p.tipo_producto,
                tamanio:         p.tamanio,
                precio_total:    p.precio_total,
                _tipo:           'personalizado',
            }));

            const todos = [...estandar, ...personalizados].sort(
                (a, b) => new Date(b.fecha) - new Date(a.fecha)
            );

            setPedidos(todos);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            if (!silent) alert('Error al cargar los pedidos');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // ─── CARGAR DETALLE ───────────────────────────────────────────────────────
    const cargarDetallePedido = async (pedido) => {
        const id = pedido.id_pedido;
        if (expandedPedido === id) { setExpandedPedido(null); return; }
        if (detallesPedido[id])    { setExpandedPedido(id);   return; }

        try {
            let detalle;
            if (pedido._tipo === 'personalizado') {
                const padre = await apiGet(`/pedidos/detalle/${pedido.id_pedido_ref}`);
                detalle = {
                    usuario:         padre.usuario,
                    ticket_compra:   padre.ticket_compra,
                    tipo_producto:   pedido.tipo_producto,
                    tamanio:         pedido.tamanio,
                    precio_total:    pedido.precio_total,
                    detalles_pedido: pedido.detalles_pedido,
                    _tipo:           'personalizado',
                };
            } else {
                const raw = await apiGet(`/pedidos/detalle/${id}`);
                detalle = { ...raw, _tipo: 'estandar' };
            }

            setDetallesPedido(prev => ({ ...prev, [id]: detalle }));
            setExpandedPedido(id);
        } catch (error) {
            console.error('Error al cargar detalle:', error);
            alert('Error al cargar el detalle del pedido');
        }
    };

    // ─── HELPERS ──────────────────────────────────────────────────────────────
    const obtenerTotal = (obj) =>
        obj?.ticket_compra?.precio_total
        ?? obj?.ticket_compra?.total_ticket
        ?? obj?.precio_total
        ?? obj?.total
        ?? 0;

    const obtenerProductos = (detalle) =>
        detalle?.detalles_pedido
        ?? detalle?.detalle_pedido
        ?? detalle?.productos
        ?? detalle?.items
        ?? [];

    const obtenerNombreCliente = (usuario) => {
        if (!usuario) return 'N/A';
        if (usuario.nom_1) return `${usuario.nom_1} ${usuario.ape_1 ?? ''}`.trim();
        if (usuario.nombre) return usuario.nombre;
        return 'N/A';
    };

    // ─── GUARDAR ESTADO (Ajustado igual al método de pago) ────────────────────
    const handleEditarEstado = (pedido) => {
        setEditandoId(pedido.id_pedido);
        setNuevoEstadoTemp(pedido.estado);
    };
    const handleCancelarEstado = () => { setEditandoId(null); setNuevoEstadoTemp(''); };

    const ESTADOS_QUE_REQUIEREN_PAGO = ['Entregado', 'Finalizado'];
    const metodoPagoDefinido = (pedido) => {
        const metodo = pedido.ticket_compra?.metodo_pago?.nom_metodo;
        return !!metodo && metodo !== 'Por_definir';
    };

    const handleGuardarEstado = async (pedido) => {
        if (ESTADOS_QUE_REQUIEREN_PAGO.includes(nuevoEstadoTemp) && !metodoPagoDefinido(pedido)) {
            alert(
                `⚠ No puedes marcar este pedido como "${nuevoEstadoTemp}" sin antes definir el método de pago.\n` +
                `Usa el botón "Editar Pago" primero.`
            );
            return;
        }

        if (nuevoEstadoTemp === pedido.estado) {
            setEditandoId(null);
            setNuevoEstadoTemp('');
            return;
        }

        setProcesandoEstado(true);

        const idParaPatch = pedido._tipo === 'personalizado'
            ? pedido.id_pedido_ref
            : pedido.id_pedido;

        try {
            await apiPatch(`/pedidos/${idParaPatch}`, { estado: nuevoEstadoTemp });

            setPedidos(prev => prev.map(p =>
                (p.id_pedido === pedido.id_pedido && p._tipo === pedido._tipo)
                    ? { ...p, estado: nuevoEstadoTemp }
                    : p
            ));

            setDetallesPedido(prev => {
                if (!prev[pedido.id_pedido]) return prev;
                return {
                    ...prev,
                    [pedido.id_pedido]: {
                        ...prev[pedido.id_pedido],
                        estado: nuevoEstadoTemp
                    }
                };
            });

            setEditandoId(null);
            setNuevoEstadoTemp('');

            cargarPedidos(true);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert(error?.response?.data?.message || error?.message || 'Error al actualizar el estado');
        } finally {
            setProcesandoEstado(false);
        }
    };

    // ─── ANULAR PEDIDO ────────────────────────────────────────────────────────
    const ESTADOS_FINALES = ['Entregado', 'Finalizado', 'Anulado'];
    const esEstadoFinal = (pedido) => ESTADOS_FINALES.includes(pedido.estado);
    const puedeAnularse = (pedido) => !esEstadoFinal(pedido);

    const handleAnularPedido = async (pedido) => {
        const confirmar = window.confirm(
            `¿Estás seguro de anular el pedido #${pedido.id_pedido}? Esta acción no se puede deshacer.`
        );
        if (!confirmar) return;

        const idParaPatch = pedido._tipo === 'personalizado'
            ? pedido.id_pedido_ref
            : pedido.id_pedido;

        try {
            await apiPatch(`/pedidos/${idParaPatch}`, { estado: 'Anulado' });
            setPedidos(prev => prev.map(p =>
                (p.id_pedido === pedido.id_pedido && p._tipo === pedido._tipo)
                    ? { ...p, estado: 'Anulado' }
                    : p
            ));
            alert('✅ Pedido anulado correctamente.');
            cargarPedidos(true);
        } catch (error) {
            console.error('Error al anular pedido:', error);
            alert(error?.response?.data?.message || 'Error al anular el pedido');
        }
    };

    // ─── MÉTODO DE PAGO ───────────────────────────────────────────────────────
    const handleEditarMetodo = (pedido) => {
        setEditandoMetodoId(pedido.id_pedido);
        setNuevoMetodoTemp(pedido.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir');
    };
    const handleCancelarMetodo = () => { setEditandoMetodoId(null); setNuevoMetodoTemp(''); };

    const handleGuardarMetodo = async (pedido) => {
        const metodoActual = pedido.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir';
        if (nuevoMetodoTemp === metodoActual) { setEditandoMetodoId(null); return; }

        const idParaPatch = pedido._tipo === 'personalizado'
            ? pedido.id_pedido_ref
            : pedido.id_pedido;

        setProcesandoMetodo(true);
        try {
            await apiPatch(`/pedidos/${idParaPatch}`, { metodo_pago: nuevoMetodoTemp });

            alert('✅ Método de pago actualizado correctamente.');

            setPedidos(prev => prev.map(p => {
                if (p.id_pedido !== pedido.id_pedido || p._tipo !== pedido._tipo) return p;
                return {
                    ...p,
                    ticket_compra: {
                        ...p.ticket_compra,
                        metodo_pago: {
                            ...(p.ticket_compra?.metodo_pago || {}),
                            nom_metodo: nuevoMetodoTemp,
                        },
                    },
                };
            }));
            setEditandoMetodoId(null);
            cargarPedidos(true);
        } catch (error) {
            console.error('Error al actualizar método:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setProcesandoMetodo(false);
        }
    };

    // ─── FORMAT ───────────────────────────────────────────────────────────────
    const formatPrice = (price) => {
        if (!price) return '$0';
        return Number(price).toLocaleString('es-CO', {
            style: 'currency', currency: 'COP', minimumFractionDigits: 0,
        });
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString('es-CO', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const getEstadoClass = (estado) => {
        const clases = {
            'Pendiente':      'estado-pendiente',
            'Pagado':         'estado-en-proceso',
            'En preparación': 'estado-en-preparacion',
            'Entregado':      'estado-entregado',
            'Finalizado':     'estado-finalizado',
            'Anulado':        'estado-anulado',
        };
        return `pedido-estado-badge ${clases[estado] || ''}`;
    };

    const getRowAccent = (pedido) => {
        const metodo = pedido.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir';
        const esPendienteMetodo = metodo === 'Por_definir';
        const esPendienteEstado = pedido.estado === 'Pendiente';
        if (esPendienteMetodo && esPendienteEstado) return '#e74c3c';
        if (esPendienteMetodo)                     return '#e67e22';
        if (esPendienteEstado)                     return '#f1c40f';
        return 'transparent';
    };

    // ─── SUB-COMPONENTE: detalle pedido personalizado ─────────────────────────
    const DetallePersonalizado = ({ d, pedidoId }) => {
        const materiales = d.detalles_pedido ?? [];
        const tieneMateriales = materiales.length > 0;

        return (
            <div className="detalle-pedido-container">
                <h4 className="detalle-pedido-titulo">
                    Detalle del Pedido #{pedidoId}
                    <span style={{
                        marginLeft: '10px', fontSize: '13px',
                        background: '#da819f', color: '#fff',
                        padding: '2px 10px', borderRadius: '20px',
                    }}>
                        Pedido Personalizado
                    </span>
                </h4>

                <div className="detalle-cliente-box">
                    <div className="detalle-cliente-grid">
                        <div className="detalle-cliente-item">
                            <strong className="detalle-cliente-label">Cliente:</strong>
                            <p className="detalle-cliente-valor">{obtenerNombreCliente(d.usuario)}</p>
                        </div>
                        <div className="detalle-cliente-item">
                            <strong className="detalle-cliente-label">Correo:</strong>
                            <p className="detalle-cliente-valor">{d.usuario?.correo || 'N/A'}</p>
                        </div>
                        <div className="detalle-cliente-item">
                            <strong className="detalle-cliente-label">Teléfono:</strong>
                            <p className="detalle-cliente-valor">{d.usuario?.telefono?.toString() || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <h5 style={{ color: '#da819f', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Especificaciones del Producto
                    </h5>
                    <table className="detalle-tabla-productos">
                        <thead>
                            <tr><th>Especificación</th><th>Detalle</th></tr>
                        </thead>
                        <tbody>
                            {d.tipo_producto && (
                                <tr>
                                    <td className="detalle-producto-nombre"><strong>Tipo de Producto</strong></td>
                                    <td>{d.tipo_producto}</td>
                                </tr>
                            )}
                            {d.tamanio && (
                                <tr>
                                    <td className="detalle-producto-nombre"><strong>Tamaño</strong></td>
                                    <td>{d.tamanio}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <h5 style={{ color: '#da819f', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Materiales Utilizados
                    </h5>
                    {tieneMateriales ? (
                        <table className="detalle-tabla-productos">
                            <thead>
                                <tr>
                                    <th>Concepto</th>
                                    <th>Material</th>
                                    <th>Color</th>
                                    <th>Diseño</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materiales.map((det, idx) => (
                                    <tr key={idx}>
                                        <td className="detalle-producto-nombre">{det.concepto || '—'}</td>
                                        <td>
                                            {det.material?.nombre || 'N/A'}
                                            <div style={{ fontSize: '11px', color: '#999' }}>
                                                {det.material?.tipo || ''}
                                            </div>
                                        </td>
                                        <td>{det.color?.nombre || '—'}</td>
                                        <td>{det.diseno?.nombre || '—'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="detalle-producto-cantidad-badge">
                                                {det.cantidad} {det.material?.unidad || ''}
                                            </span>
                                        </td>
                                        <td className="detalle-producto-subtotal">{formatPrice(det.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" className="detalle-total-label">TOTAL:</td>
                                    <td colSpan="2" className="detalle-total-valor">{formatPrice(obtenerTotal(d))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <div style={{ padding: '12px 16px', background: '#fdf3f7', border: '1px dashed #da819f', borderRadius: '8px', color: '#999', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>⚠️ No hay detalle de materiales registrado para este pedido. <strong style={{ color: '#da819f', marginLeft: '4px' }}>Total: {formatPrice(obtenerTotal(d))}</strong></span>
                        </div>
                    )}
                </div>

                <div className="detalle-pago-box" style={{ marginTop: '15px' }}>
                    <div className="detalle-pago-info">
                        <div className="detalle-pago-metodo">
                            <strong>Método de Pago:</strong>{' '}
                            <span className="detalle-pago-metodo-valor">{d.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir'}</span>
                        </div>
                        <div className="detalle-pago-estado">
                            <strong>Estado de Pago:</strong>{' '}
                            <span className="detalle-estado-pago-badge">{d.ticket_compra?.estado_pago?.nom_metodo || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── SUB-COMPONENTE: detalle pedido estándar ──────────────────────────────
    const DetalleEstandar = ({ d, pedidoId }) => {
        const productos = obtenerProductos(d);
        return (
            <div className="detalle-pedido-container">
                <h4 className="detalle-pedido-titulo">
                    Detalle del Pedido #{pedidoId}
                    <span style={{ marginLeft: '10px', fontSize: '13px', background: '#5dade2', color: '#fff', padding: '2px 10px', borderRadius: '20px' }}>
                        Pedido Estándar
                    </span>
                </h4>

                <div className="detalle-cliente-box">
                    <div className="detalle-cliente-grid">
                        <div className="detalle-cliente-item">
                            <strong className="detalle-cliente-label">Cliente:</strong>
                            <p className="detalle-cliente-valor">{obtenerNombreCliente(d.usuario)}</p>
                        </div>
                        <div className="detalle-cliente-item">
                            <strong className="detalle-cliente-label">Correo:</strong>
                            <p className="detalle-cliente-valor">{d.usuario?.correo || 'N/A'}</p>
                        </div>
                        <div className="detalle-cliente-item">
                            <strong className="detalle-cliente-label">Teléfono:</strong>
                            <p className="detalle-cliente-valor">{d.usuario?.telefono?.toString() || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <table className="detalle-tabla-productos">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio Unitario</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: '#999', padding: '15px' }}>
                                    No hay productos registrados en este pedido
                                </td>
                            </tr>
                        ) : (
                            productos.map((item, idx) => {
                                const nombre = item.producto?.nom_producto ?? item.nom_producto ?? 'N/A';
                                const precio = item.producto?.precio_unitario ?? item.precio_unitario ?? 0;
                                const cantidad = item.cantidad ?? 1;
                                return (
                                    <tr key={idx}>
                                        <td className="detalle-producto-nombre">{nombre}</td>
                                        <td className="detalle-producto-precio">{formatPrice(precio)}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="detalle-producto-cantidad-badge">{cantidad}</span>
                                        </td>
                                        <td className="detalle-producto-subtotal">{formatPrice(Number(precio) * cantidad)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="detalle-total-label">TOTAL:</td>
                            <td className="detalle-total-valor">{formatPrice(obtenerTotal(d))}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="detalle-pago-box">
                    <div className="detalle-pago-info">
                        <div className="detalle-pago-metodo">
                            <strong>Método de Pago:</strong>{' '}
                            <span className="detalle-pago-metodo-valor">{d.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir'}</span>
                        </div>
                        <div className="detalle-pago-estado">
                            <strong>Estado de Pago:</strong>{' '}
                            <span className="detalle-estado-pago-badge">{d.ticket_compra?.estado_pago?.nom_metodo || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── PEDIDOS FILTRADOS Y ORDENADOS ────────────────────────────────────────
    const pedidosFiltrados = pedidos
        .filter(p => {
            if (filtroTipo === 'anulados') return p.estado === 'Anulado';
            if (p.estado === 'Anulado') return false;
            if (filtroTipo === 'estandar') return p._tipo === 'estandar';
            if (filtroTipo === 'personalizado') return p._tipo === 'personalizado';
            if (filtroTipo === 'finalizados') return p.estado === 'Finalizado';
            return true;
        })
        .sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            return ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA;
        });

    // ─── RENDER ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="contenido">
                <HeaderPedidos />
                <div className="pedidos-loading"><p>Cargando pedidos...</p></div>
            </main>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="contenido">
                <HeaderPedidos />
                <section className="cuadro-blanco pedidos">

                    {/* Controles superiores */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                        <h2 style={{ margin: 0 }}>Pedidos Realizados ({pedidosFiltrados.length})</h2>
                        <span style={{ color: '#ccc', fontSize: '20px' }}>|</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontWeight: '500', fontSize: '14px', color: '#666' }}>Filtrar:</span>
                            {[
                                { value: 'todos', label: 'Todos', color: '#888' },
                                { value: 'estandar', label: 'Estándar', color: '#5dade2' },
                                { value: 'personalizado', label: 'Personalizado', color: '#da819f' },
                                { value: 'finalizados', label: 'Finalizados', color: '#8e44ad' },
                                { value: 'anulados', label: 'Anulados', color: '#e74c3c' },
                            ].map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    onClick={() => setFiltroTipo(value)}
                                    style={{
                                        padding: '5px 14px',
                                        borderRadius: '20px',
                                        border: filtroTipo === value ? 'none' : `1.5px solid ${color}`,
                                        backgroundColor: filtroTipo === value ? color : 'transparent',
                                        color: filtroTipo === value ? '#fff' : color,
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: '#666' }}>Ordenar:</label>
                            <select
                                value={ordenFecha}
                                onChange={(e) => setOrdenFecha(e.target.value)}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >
                                <option value="desc">Más reciente primero</option>
                                <option value="asc">Más antiguo primero</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabla Principal */}
                    <table className="tabla-pedidos">
                        <thead>
                            <tr>
                                <th>PEDIDO #</th>
                                <th>CLIENTE</th>
                                <th>FECHA</th>
                                <th>ESTADO</th>
                                <th>MÉTODO PAGO</th>
                                <th>TOTAL</th>
                                <th>ITEMS</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                        No hay pedidos registrados en esta categoría.
                                    </td>
                                </tr>
                            ) : (
                                pedidosFiltrados.map((pedido) => {
                                    const id = pedido.id_pedido;
                                    const estaExpandido = expandedPedido === id;
                                    const estaEditandoEstado = editandoId === id;
                                    const estaEditandoMetodo = editandoMetodoId === id;
                                    const metodoNombre = pedido.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir';

                                    return (
                                        <React.Fragment key={`${pedido._tipo}-${id}`}>
                                            <tr style={{ borderLeft: `5px solid ${getRowAccent(pedido)}` }}>
                                                <td>
                                                    <strong>#{id}</strong>
                                                    <div style={{ fontSize: '11px', color: pedido._tipo === 'personalizado' ? '#da819f' : '#5dade2' }}>
                                                        {pedido._tipo === 'personalizado' ? 'Personalizado' : 'Estándar'}
                                                    </div>
                                                </td>
                                                <td>{obtenerNombreCliente(pedido.usuario)}</td>
                                                <td>{formatFecha(pedido.fecha)}</td>
                                                
                                                {/* Celda Estado */}
                                                <td>
                                                    {estaEditandoEstado ? (
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                            <select
                                                                value={nuevoEstadoTemp}
                                                                onChange={(e) => setNuevoEstadoTemp(e.target.value)}
                                                                disabled={procesandoEstado}
                                                            >
                                                                {opcionesEstadoPara(pedido.estado).map(op => (
                                                                    <option key={op} value={op}>{op}</option>
                                                                ))}
                                                            </select>
                                                            <button 
                                                                onClick={() => handleGuardarEstado(pedido)}
                                                                disabled={procesandoEstado}
                                                            >
                                                                {procesandoEstado ? '...' : '✓'}
                                                            </button>
                                                            <button 
                                                                onClick={handleCancelarEstado}
                                                                disabled={procesandoEstado}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={getEstadoClass(pedido.estado)}>
                                                            {pedido.estado}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Celda Método Pago */}
                                                <td>
                                                    {estaEditandoMetodo ? (
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                            <select
                                                                value={nuevoMetodoTemp}
                                                                onChange={(e) => setNuevoMetodoTemp(e.target.value)}
                                                                disabled={procesandoMetodo}
                                                            >
                                                                {opcionesMetodoPago.map(met => (
                                                                    <option key={met} value={met}>{met}</option>
                                                                ))}
                                                            </select>
                                                            <button 
                                                                onClick={() => handleGuardarMetodo(pedido)}
                                                                disabled={procesandoMetodo}
                                                            >
                                                                {procesandoMetodo ? '...' : '✓'}
                                                            </button>
                                                            <button 
                                                                onClick={handleCancelarMetodo}
                                                                disabled={procesandoMetodo}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            backgroundColor: metodoNombre === 'Por_definir' ? '#f39c12' : '#2ecc71',
                                                            color: '#fff',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {metodoNombre}
                                                        </span>
                                                    )}
                                                </td>

                                                <td>{formatPrice(obtenerTotal(pedido))}</td>
                                                <td>—</td>

                                                {/* Acciones */}
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {!estaEditandoEstado && !esEstadoFinal(pedido) && (
                                                            <button onClick={() => handleEditarEstado(pedido)} className="btn-accion">
                                                                Editar Estado
                                                            </button>
                                                        )}
                                                        {!estaEditandoMetodo && (
                                                            <button onClick={() => handleEditarMetodo(pedido)} className="btn-accion">
                                                                Editar Pago
                                                            </button>
                                                        )}
                                                        {puedeAnularse(pedido) && (
                                                            <button onClick={() => handleAnularPedido(pedido)} className="btn-accion btn-anular">
                                                                Anular
                                                            </button>
                                                        )}
                                                        <button onClick={() => cargarDetallePedido(pedido)} className="btn-accion">
                                                            {estaExpandido ? 'Ocultar Detalles' : 'Ver Detalles'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Fila desplegable del detalle */}
                                            {estaExpandido && detallesPedido[id] && (
                                                <tr>
                                                    <td colSpan="8">
                                                        {detallesPedido[id]._tipo === 'personalizado' ? (
                                                            <DetallePersonalizado d={detallesPedido[id]} pedidoId={id} />
                                                        ) : (
                                                            <DetalleEstandar d={detallesPedido[id]} pedidoId={id} />
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
}