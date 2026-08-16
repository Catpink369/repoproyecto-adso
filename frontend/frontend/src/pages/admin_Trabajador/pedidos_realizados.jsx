import React, { useState, useEffect, useContext } from 'react';
import Sidebar from "../../components/Sidebar_p-a";
import HeaderPedidos from "../../components/HeaderPedidos";
import "../../components/css/styles.css";
import { apiGet, apiPatch, apiPost } from '../../context/api.js';
import { AuthContext } from '../../context/AuthContext.jsx';

export default function PedidosRealizados() {
    const { userId } = useContext(AuthContext);

    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPedido, setExpandedPedido] = useState(null);
    const [detallesPedido, setDetallesPedido] = useState({});

    const [editandoId, setEditandoId] = useState(null);
    const [nuevoEstadoTemp, setNuevoEstadoTemp] = useState('');

    const [editandoMetodoId, setEditandoMetodoId] = useState(null);
    const [nuevoMetodoTemp, setNuevoMetodoTemp] = useState('');
    const [procesandoMetodo, setProcesandoMetodo] = useState(false);

    const [filtroTipo, setFiltroTipo] = useState('todos');

    // ── 'En preparación' agregado entre Pagado y Entregado
    const opcionesEstado = ['Pendiente', 'Pagado', 'En preparación', 'Entregado', 'Finalizado'];
    const opcionesMetodoPago = ['Por_definir', 'Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'DaviPlata'];

    useEffect(() => { cargarPedidos(); }, []);

    // ─── PRIORIDAD DE ORDENAMIENTO ────────────────────────────────────────────
    const getPrioridad = (pedido) => {
        const metodo = pedido.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir';
        const estado = pedido.estado || '';
        const esPendienteMetodo = metodo === 'Por_definir';
        const esPendienteEstado = estado === 'Pendiente';
        if (esPendienteMetodo && esPendienteEstado) return 0;
        if (esPendienteMetodo)                     return 1;
        if (esPendienteEstado)                     return 2;
        return 3;
    };

    // ─── CARGAR PEDIDOS ───────────────────────────────────────────────────────
    const cargarPedidos = async () => {
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

            const todos = [...estandar, ...personalizados].sort((a, b) => {
                const diffPrioridad = getPrioridad(a) - getPrioridad(b);
                if (diffPrioridad !== 0) return diffPrioridad;
                return new Date(b.fecha) - new Date(a.fecha);
            });

            setPedidos(todos);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            alert('Error al cargar los pedidos');
        } finally {
            setLoading(false);
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
    const esPedidoPersonalizado = (detalle) => detalle?._tipo === 'personalizado';

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

    // ─── ESTADO ───────────────────────────────────────────────────────────────
    const handleEditarEstado = (pedido) => {
        setEditandoId(pedido.id_pedido);
        setNuevoEstadoTemp(pedido.estado);
    };
    const handleCancelarEstado = () => { setEditandoId(null); setNuevoEstadoTemp(''); };

    const handleGuardarEstado = async (pedido) => {
        const idParaPatch = pedido._tipo === 'personalizado'
            ? pedido.id_pedido_ref
            : pedido.id_pedido;
        try {
            await apiPatch(`/pedidos/${idParaPatch}`, { estado: nuevoEstadoTemp });
            setPedidos(prev => prev.map(p =>
                p.id_pedido === pedido.id_pedido
                    ? { ...p, estado: nuevoEstadoTemp }
                    : p
            ));
            setEditandoId(null);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert(error?.response?.data?.message || error?.message || 'Error al actualizar el estado');
        }
    };

    // ─── ANULAR PEDIDO ────────────────────────────────────────────────────────
    // Estados finales: coincide con ESTADOS_INMUTABLES del backend (pedidos.service.ts)
    const ESTADOS_FINALES = ['Entregado', 'Finalizado', 'Anulado'];
    const puedeAnularse = (pedido) => !ESTADOS_FINALES.includes(pedido.estado);

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
                p.id_pedido === pedido.id_pedido
                    ? { ...p, estado: 'Anulado' }
                    : p
            ));
            alert('✅ Pedido anulado correctamente.');
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
                if (p.id_pedido !== pedido.id_pedido) return p;
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
            'Entregado':      'estado-Entegado',
            'Finalizado':     'estado-Finalizado',
            'Anulado':        'estado-anulado',
        };
        return `pedido-estado-badge ${clases[estado] || ''}`;
    };

    // ─── INDICADOR VISUAL DE URGENCIA ─────────────────────────────────────────
    const getRowAccent = (pedido) => {
        const p = getPrioridad(pedido);
        if (p === 0) return '#e74c3c';
        if (p === 1) return '#e67e22';
        if (p === 2) return '#f1c40f';
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
                    <h5 style={{
                        color: '#da819f', marginBottom: '10px',
                        fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
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
                    <h5 style={{
                        color: '#da819f', marginBottom: '10px',
                        fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        Materiales Utilizados
                    </h5>
                    {tieneMateriales ? (
                        <table className="detalle-tabla-productos">
                            <thead>
                                <tr>
                                    <th>Material</th><th>Tipo</th><th>Cantidad</th><th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materiales.map((det, idx) => (
                                    <tr key={idx}>
                                        <td className="detalle-producto-nombre">
                                            {det.material?.nombre || 'N/A'}
                                        </td>
                                        <td>{det.material?.tipo || 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="detalle-producto-cantidad-badge">
                                                {det.cantidad} {det.material?.unidad || ''}
                                            </span>
                                        </td>
                                        <td className="detalle-producto-subtotal">
                                            {formatPrice(det.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="detalle-total-label">TOTAL:</td>
                                    <td className="detalle-total-valor">{formatPrice(obtenerTotal(d))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <div style={{
                            padding: '12px 16px',
                            background: '#fdf3f7',
                            border: '1px dashed #da819f',
                            borderRadius: '8px',
                            color: '#999',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}>
                            <span>⚠️</span>
                            <span>
                                No hay detalle de materiales registrado para este pedido.
                                <strong style={{ color: '#da819f', marginLeft: '4px' }}>
                                    Total: {formatPrice(obtenerTotal(d))}
                                </strong>
                            </span>
                        </div>
                    )}
                </div>

                <div className="detalle-pago-box" style={{ marginTop: '15px' }}>
                    <div className="detalle-pago-info">
                        <div className="detalle-pago-metodo">
                            <strong>Método de Pago:</strong>{' '}
                            <span className="detalle-pago-metodo-valor">
                                {d.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir'}
                            </span>
                        </div>
                        <div className="detalle-pago-estado">
                            <strong>Estado de Pago:</strong>{' '}
                            <span className="detalle-estado-pago-badge">
                                {d.ticket_compra?.estado_pago?.nom_metodo || 'N/A'}
                            </span>
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
                    <span style={{
                        marginLeft: '10px', fontSize: '13px',
                        background: '#5dade2', color: '#fff',
                        padding: '2px 10px', borderRadius: '20px',
                    }}>
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
                                const nombre   = item.producto?.nom_producto ?? item.nom_producto ?? 'N/A';
                                const precio   = item.producto?.precio_unitario ?? item.precio_unitario ?? 0;
                                const cantidad = item.cantidad ?? 1;
                                return (
                                    <tr key={idx}>
                                        <td className="detalle-producto-nombre">{nombre}</td>
                                        <td className="detalle-producto-precio">{formatPrice(precio)}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="detalle-producto-cantidad-badge">{cantidad}</span>
                                        </td>
                                        <td className="detalle-producto-subtotal">
                                            {formatPrice(Number(precio) * cantidad)}
                                        </td>
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
                            <span className="detalle-pago-metodo-valor">
                                {d.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir'}
                            </span>
                        </div>
                        <div className="detalle-pago-estado">
                            <strong>Estado de Pago:</strong>{' '}
                            <span className="detalle-estado-pago-badge">
                                {d.ticket_compra?.estado_pago?.nom_metodo || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── PEDIDOS FILTRADOS ────────────────────────────────────────────────────
    const pedidosFiltrados = pedidos.filter(p => {
        if (filtroTipo === 'estandar')      return p._tipo === 'estandar';
        if (filtroTipo === 'personalizado') return p._tipo === 'personalizado';
        return true;
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

                    {/* Título + filtros */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '20px',
                    }}>
                        <h2 style={{ margin: 0 }}>
                            Pedidos Realizados ({pedidosFiltrados.length})
                        </h2>
                        <span style={{ color: '#ccc', fontSize: '20px' }}>|</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontWeight: '500', fontSize: '14px', color: '#666' }}>Filtrar:</span>
                            {[
                                { value: 'todos',         label: 'Todos',         color: '#888'    },
                                { value: 'estandar',      label: 'Estándar',      color: '#5dade2' },
                                { value: 'personalizado', label: 'Personalizado', color: '#da819f' },
                            ].map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    onClick={() => setFiltroTipo(value)}
                                    style={{
                                        padding: '5px 14px',
                                        borderRadius: '20px',
                                        border: filtroTipo === value ? 'none' : `1.5px solid ${color}`,
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: filtroTipo === value ? 'bold' : 'normal',
                                        background: filtroTipo === value ? color : 'transparent',
                                        color: filtroTipo === value ? '#fff' : color,
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Leyenda de colores de urgencia */}
                    <div style={{
                        display: 'flex', gap: '16px', marginBottom: '12px',
                        fontSize: '12px', color: '#888', flexWrap: 'wrap',
                    }}>
                        {[
                            { color: '#e74c3c', label: 'Pago sin definir + estado Pendiente' },
                            { color: '#e67e22', label: 'Método de pago sin definir'          },
                            { color: '#f1c40f', label: 'Estado Pendiente'                    },
                        ].map(({ color, label }) => (
                            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{
                                    display: 'inline-block', width: '10px', height: '10px',
                                    borderRadius: '50%', background: color,
                                }} />
                                {label}
                            </span>
                        ))}
                    </div>

                    <div className="tabla-usuarios">
                        <table>
                            <thead>
                                <tr>
                                    <th>Pedido #</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Método Pago</th>
                                    <th>Total</th>
                                    <th>Items</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="pedidos-tabla-vacia">
                                            No hay pedidos registrados todavía
                                        </td>
                                    </tr>
                                ) : (
                                    pedidosFiltrados.map((pedido) => {
                                        const accentColor = getRowAccent(pedido);
                                        return (
                                            <React.Fragment key={`${pedido._tipo}-${pedido.id_pedido}`}>
                                                <tr style={{
                                                    borderLeft: accentColor !== 'transparent'
                                                        ? `4px solid ${accentColor}`
                                                        : '4px solid transparent',
                                                }}>
                                                    {/* PEDIDO # */}
                                                    <td>
                                                        <strong className="pedido-id">#{pedido.id_pedido}</strong>
                                                        {pedido._tipo === 'personalizado' && (
                                                            <span style={{
                                                                display: 'block', fontSize: '11px',
                                                                color: '#da819f', fontWeight: 'bold',
                                                            }}>
                                                                Personalizado
                                                            </span>
                                                        )}
                                                        {pedido.ticket_compra?.num_ticket && (
                                                            <span className="pedido-ticket">
                                                                Ticket: {pedido.ticket_compra.num_ticket}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* CLIENTE */}
                                                    <td>
                                                        <div className="pedido-cliente-nombre">
                                                            {pedido.usuario
                                                                ? `${pedido.usuario.nom_1} ${pedido.usuario.ape_1}`
                                                                : 'N/A'}
                                                        </div>
                                                        <span className="pedido-cliente-telefono">
                                                            {pedido.usuario?.telefono?.toString() || 'N/A'}
                                                        </span>
                                                    </td>

                                                    {/* FECHA */}
                                                    <td className="pedido-fecha">{formatFecha(pedido.fecha)}</td>

                                                    {/* ESTADO */}
                                                    <td>
                                                        {editandoId === pedido.id_pedido ? (
                                                            <select
                                                                value={nuevoEstadoTemp}
                                                                onChange={(e) => setNuevoEstadoTemp(e.target.value)}
                                                                className="pedido-estado-select"
                                                            >
                                                                {opcionesEstado.map(op =>
                                                                    <option key={op} value={op}>{op}</option>
                                                                )}
                                                            </select>
                                                        ) : (
                                                            <span className={getEstadoClass(pedido.estado)}>
                                                                {pedido.estado}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* MÉTODO PAGO */}
                                                    <td className="pedido-metodo-pago">
                                                        {editandoMetodoId === pedido.id_pedido ? (
                                                            <select
                                                                value={nuevoMetodoTemp}
                                                                onChange={(e) => setNuevoMetodoTemp(e.target.value)}
                                                                className="pedido-estado-select"
                                                                disabled={procesandoMetodo}
                                                            >
                                                                {opcionesMetodoPago.map(op =>
                                                                    <option key={op} value={op}>{op}</option>
                                                                )}
                                                            </select>
                                                        ) : (
                                                            <span className={
                                                                (!pedido.ticket_compra?.metodo_pago?.nom_metodo ||
                                                                    pedido.ticket_compra?.metodo_pago?.nom_metodo === 'Por_definir')
                                                                    ? 'pedido-estado-badge estado-pendiente'
                                                                    : 'pedido-estado-badge estado-en-proceso'
                                                            }>
                                                                {pedido.ticket_compra?.metodo_pago?.nom_metodo || 'Por_definir'}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* TOTAL */}
                                                    <td>
                                                        <strong className="pedido-total">
                                                            {formatPrice(obtenerTotal(pedido))}
                                                        </strong>
                                                    </td>

                                                    {/* ITEMS */}
                                                    <td>
                                                        <span className="pedido-productos-badge">
                                                            {pedido._tipo === 'personalizado'
                                                                ? '—'
                                                                : (() => {
                                                                    const count = pedido.detalles_pedido?.length ?? 0;
                                                                    return count === 0
                                                                        ? <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>⚠ Sin items</span>
                                                                        : `${count} item${count !== 1 ? 's' : ''}`;
                                                                })()}
                                                        </span>
                                                    </td>

                                                    {/* ACCIONES */}
                                                    <td>
                                                        <div className="pedido-acciones">
                                                            {editandoId === pedido.id_pedido ? (
                                                                <>
                                                                    <button onClick={() => handleGuardarEstado(pedido)} className="btn-guardar">
                                                                        ✓ Guardar
                                                                    </button>
                                                                    <button onClick={handleCancelarEstado} className="btn-cancelar-edicion">
                                                                        ✕ Cancelar
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEditarEstado(pedido)}
                                                                    className="btn-editar-estado"
                                                                    disabled={editandoMetodoId === pedido.id_pedido}
                                                                >
                                                                    Editar Estado
                                                                </button>
                                                            )}

                                                            {editandoMetodoId === pedido.id_pedido ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleGuardarMetodo(pedido)}
                                                                        className="btn-guardar"
                                                                        disabled={procesandoMetodo}
                                                                        style={{ opacity: procesandoMetodo ? 0.6 : 1 }}
                                                                    >
                                                                        {procesandoMetodo ? '...' : '✓ Confirmar'}
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelarMetodo}
                                                                        className="btn-cancelar-edicion"
                                                                        disabled={procesandoMetodo}
                                                                    >
                                                                        ✕ Cancelar
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEditarMetodo(pedido)}
                                                                    className="btn-editar-estado"
                                                                    disabled={editandoId === pedido.id_pedido}
                                                                    style={{ backgroundColor: '#3498db' }}
                                                                >
                                                                    Editar Pago
                                                                </button>
                                                            )}

                                                            {puedeAnularse(pedido) && (
                                                                <button
                                                                    onClick={() => handleAnularPedido(pedido)}
                                                                    className="btn-editar-estado"
                                                                    disabled={editandoId === pedido.id_pedido || editandoMetodoId === pedido.id_pedido}
                                                                    style={{ backgroundColor: '#e74c3c' }}
                                                                >
                                                                    Anular pedido
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => cargarDetallePedido(pedido)}
                                                                className={`btn-ver-detalles ${expandedPedido === pedido.id_pedido ? 'activo' : ''}`}
                                                            >
                                                                {expandedPedido === pedido.id_pedido ? 'Ocultar' : 'Ver Detalles'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* FILA EXPANDIDA */}
                                                {expandedPedido === pedido.id_pedido && detallesPedido[pedido.id_pedido] && (
                                                    <tr className="detalle-pedido-row">
                                                        <td colSpan="8">
                                                            {esPedidoPersonalizado(detallesPedido[pedido.id_pedido]) ? (
                                                                <DetallePersonalizado
                                                                    d={detallesPedido[pedido.id_pedido]}
                                                                    pedidoId={pedido.id_pedido}
                                                                />
                                                            ) : (
                                                                <DetalleEstandar
                                                                    d={detallesPedido[pedido.id_pedido]}
                                                                    pedidoId={pedido.id_pedido}
                                                                />
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
                    </div>
                </section>
            </main>
        </div>
    );
}