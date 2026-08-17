import React, { useState, useEffect, useContext } from "react";
import { Link } from 'react-router-dom';
import Sidebarmov from "../../components/Sidebarmov";
import HeaderMovimientos from "../../components/HeaderMovimientos";
import "../../components/css/styles.css";

import { AuthContext } from '../../context/AuthContext.jsx';
import { apiGet, apiPost } from "../../context/api.js";

const MOV_MATERIAL_VACIO = { id_material: '', id_m: 'M-E', cantidad_m: '', observaciones: '' };

export default function Movimientos(){
    const { usuarioActual } = useContext(AuthContext);

    // ── Pestaña activa: 'productos' | 'materiales' ───────────
    const [vista, setVista] = useState('productos');

    // ── Productos (historial existente) ──────────────────────
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Materiales (historial nuevo) ─────────────────────────
    const [movimientosMaterial, setMovimientosMaterial] = useState([]);
    const [loadingMaterial, setLoadingMaterial] = useState(true);
    const [materiales, setMateriales] = useState([]); // para el <select> del formulario

    // ── Filtros compartidos por ambas pestañas ───────────────
    const [filtro, setFiltro] = useState('todos');
    const [busqueda, setBusqueda] = useState('');

    // ── Formulario rápido: registrar movimiento de material ──
    const [mostrarFormMaterial, setMostrarFormMaterial] = useState(false);
    const [formMaterial, setFormMaterial] = useState(MOV_MATERIAL_VACIO);
    const [guardandoMovMaterial, setGuardandoMovMaterial] = useState(false);

    // búsqueda dinámica de material (mismo patrón que la entrada de productos:
    // se escribe ID o nombre y se valida con ENTER, sin depender de un <select>)
    const [busquedaMaterial, setBusquedaMaterial] = useState('');
    const [materialEncontrado, setMaterialEncontrado] = useState(null);
    const [mensajeBusquedaMaterial, setMensajeBusquedaMaterial] = useState({ text: '', type: '' });

    useEffect(() => {
        cargarMovimientos();
        cargarMovimientosMaterial();
        cargarMateriales();
    }, []);

    const cargarMovimientos = async () => {
        try {
            setLoading(true);
            const response = await apiGet(`/movimientos`);
            const data = Array.isArray(response) ? response : response.data || [];
            setMovimientos(data);
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            alert('Error al cargar los movimientos');
        } finally {
            setLoading(false);
        }
    };

    const cargarMovimientosMaterial = async () => {
        try {
            setLoadingMaterial(true);
            const response = await apiGet(`/movimientos/material`);
            const data = Array.isArray(response) ? response : response.data || [];
            setMovimientosMaterial(data);
        } catch (error) {
            console.error('Error al cargar movimientos de material:', error);
            alert('Error al cargar los movimientos de material');
        } finally {
            setLoadingMaterial(false);
        }
    };

    const cargarMateriales = async () => {
        try {
            const data = await apiGet('/pedidos-personalizados/materiales');
            setMateriales(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar materiales:', error);
        }
    };

    const resetFormMaterial = () => {
        setFormMaterial(MOV_MATERIAL_VACIO);
        setBusquedaMaterial('');
        setMaterialEncontrado(null);
        setMensajeBusquedaMaterial({ text: '', type: '' });
    };

    // Al escribir de nuevo, se invalida el material ya validado (igual que
    // en la entrada de productos: cambiar el ID obliga a revalidar).
    const handleChangeBusquedaMaterial = (e) => {
        setBusquedaMaterial(e.target.value);
        setMaterialEncontrado(null);
        setFormMaterial(prev => ({ ...prev, id_material: '' }));
        setMensajeBusquedaMaterial({ text: '', type: '' });
    };

    // BUSCAR MATERIAL AL PRESIONAR ENTER (mismo patrón que /productos/check/:id,
    // pero validando contra la lista ya cargada — no hay un endpoint de
    // materiales equivalente por ahora).
    const handleBuscarMaterial = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const query = busquedaMaterial.trim();
        if (!query) return;

        const porId = materiales.find(m => String(m.id_material) === query);
        const q = query.toLowerCase();
        const encontrado = porId
            || materiales.find(m => m.nombre?.toLowerCase() === q)
            || materiales.find(m => m.nombre?.toLowerCase().includes(q));

        if (encontrado) {
            setMaterialEncontrado(encontrado);
            setFormMaterial(prev => ({ ...prev, id_material: encontrado.id_material }));
            setMensajeBusquedaMaterial({
                text: `Material encontrado: ${encontrado.nombre} | Stock: ${encontrado.stock_actual} ${encontrado.unidad}s`,
                type: 'success',
            });
            document.getElementById('cantidad_m_material')?.focus();
        } else {
            setMaterialEncontrado(null);
            setMensajeBusquedaMaterial({ text: 'Material no encontrado o inactivo.', type: 'error' });
        }
    };

    const handleRegistrarMovMaterial = async (e) => {
        e.preventDefault();
        if (!materialEncontrado || !formMaterial.id_material) {
            alert('Primero valide el material con el ID o nombre y ENTER.');
            return;
        }
        if (!formMaterial.cantidad_m || Number(formMaterial.cantidad_m) <= 0) {
            alert('La cantidad debe ser mayor a 0.');
            return;
        }
        setGuardandoMovMaterial(true);
        try {
            await apiPost('/movimientos/material', {
                id_material: Number(formMaterial.id_material),
                id_m: formMaterial.id_m,
                cantidad_m: Number(formMaterial.cantidad_m),
                observaciones: formMaterial.observaciones || undefined,
                id_usuario: usuarioActual?.id_usuario,
            });
            resetFormMaterial();
            setMostrarFormMaterial(false);
            await Promise.all([cargarMovimientosMaterial(), cargarMateriales()]);
        } catch (err) {
            alert(err?.response?.data?.message || 'Error al registrar el movimiento de material.');
        } finally {
            setGuardandoMovMaterial(false);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Al cambiar de pestaña, no tiene sentido conservar un filtro de texto
    // pensado para la otra tabla — se limpia para evitar un "0 resultados"
    // confuso.
    const cambiarVista = (nuevaVista) => {
        setVista(nuevaVista);
        setBusqueda('');
        setFiltro('todos');
    };

    const movimientosFiltrados = movimientos.filter(mov => {
        const coincideFiltro = filtro === 'todos' ||
            (filtro === 'entradas' && mov.tipo === 'entrada') ||
            (filtro === 'salidas' && mov.tipo === 'salida');

        const coincideBusqueda = busqueda === '' ||
            mov.nom_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
            mov.id_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
            mov.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase());

        return coincideFiltro && coincideBusqueda;
    });

    const movimientosMaterialFiltrados = movimientosMaterial.filter(mov => {
        const coincideFiltro = filtro === 'todos' ||
            (filtro === 'entradas' && mov.tipo === 'entrada') ||
            (filtro === 'salidas' && mov.tipo === 'salida');

        const coincideBusqueda = busqueda === '' ||
            mov.nom_material?.toLowerCase().includes(busqueda.toLowerCase()) ||
            mov.id_usuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
            mov.nombre_usuario?.toLowerCase().includes(busqueda.toLowerCase());

        return coincideFiltro && coincideBusqueda;
    });

    return(
        <div className="dashboard-layout">
            <Sidebarmov />
            <main className="contenido">
                <HeaderMovimientos />

                {/* Tarjetas de acceso rápido */}
                <section className="cuadro-blanco movimientos-principal">
                    <h2>Registre todas sus entradas y salidas aquí</h2>

                    <div className="contenedor-movimientos">
                        <div className="tarjeta">
                            <div className="texto">Entradas</div>
                            <Link to="/entradas" className="btn-agregar">+</Link>
                        </div>

                        <div className="tarjeta">
                            <div className="texto">Salidas</div>
                            <Link to="/salidas" className="btn-agregar">+</Link>
                        </div>
                    </div>
                </section>

                {/* Historial de Movimientos */}
                <section className="cuadro-blanco" style={{ marginTop: '30px' }}>
                    <h2 className="historial-titulo">Historial de Movimientos</h2>

                    {/* Pestañas Productos | Materiales */}
                    <div className="movimientos-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button
                            className={`btn-filtro-mov ${vista === 'productos' ? 'activo' : ''}`}
                            onClick={() => cambiarVista('productos')}
                        >
                            Productos
                        </button>
                        <button
                            className={`btn-filtro-mov ${vista === 'materiales' ? 'activo' : ''}`}
                            onClick={() => cambiarVista('materiales')}
                        >
                            Materiales
                        </button>
                    </div>

                    {/* Controles de filtro */}
                    <div className="movimientos-controles">
                        <input
                            type="text"
                            placeholder={vista === 'productos'
                                ? "Buscar por producto o usuario..."
                                : "Buscar por material o usuario..."}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="movimientos-buscar"
                        />

                        <div className="movimientos-filtros-grupo">
                            <button
                                className={`btn-filtro-mov todos ${filtro === 'todos' ? 'activo' : ''}`}
                                onClick={() => setFiltro('todos')}
                            >
                                Todos
                            </button>
                            <button
                                className={`btn-filtro-mov entradas ${filtro === 'entradas' ? 'activo' : ''}`}
                                onClick={() => setFiltro('entradas')}
                            >
                                Entradas
                            </button>
                            <button
                                className={`btn-filtro-mov salidas ${filtro === 'salidas' ? 'activo' : ''}`}
                                onClick={() => setFiltro('salidas')}
                            >
                                Salidas
                            </button>

                            {vista === 'materiales' && (
                                <button
                                    className="btn-registrar"
                                    style={{ marginLeft: 'auto' }}
                                    onClick={() => {
                                        if (mostrarFormMaterial) resetFormMaterial();
                                        setMostrarFormMaterial(!mostrarFormMaterial);
                                    }}
                                >
                                    {mostrarFormMaterial ? 'Cancelar' : '+ Registrar entrada'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Formulario rápido: registrar entrada/salida de material */}
                    {vista === 'materiales' && mostrarFormMaterial && (
                        <form onSubmit={handleRegistrarMovMaterial} className="cuadro-blanco"
                            style={{ margin: '16px 0', padding: '16px', border: '1.5px solid #e8d5e0' }}>

                            {mensajeBusquedaMaterial.text && (
                                <div className={`alerta ${mensajeBusquedaMaterial.type}`} style={{ marginBottom: '10px' }}>
                                    {mensajeBusquedaMaterial.text}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label className="filtro-label">ID o nombre del material (presiona Enter)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1, 2, ..."
                                        value={busquedaMaterial}
                                        onChange={handleChangeBusquedaMaterial}
                                        onKeyDown={handleBuscarMaterial}
                                        disabled={guardandoMovMaterial}
                                        style={{ borderColor: materialEncontrado ? '#2ecc71' : (busquedaMaterial ? '#f0d0d8' : '#ccc') }}
                                    />
                                </div>

                                <div>
                                    <label className="filtro-label">Material</label>
                                    <input
                                        type="text" readOnly
                                        value={materialEncontrado ? materialEncontrado.nombre : ''}
                                        placeholder="Aún no validado"
                                    />
                                </div>

                                <div>
                                    <label className="filtro-label">Stock disponible</label>
                                    <input
                                        type="text" readOnly
                                        value={materialEncontrado ? `${materialEncontrado.stock_actual} ${materialEncontrado.unidad}s` : ''}
                                        style={{ fontWeight: 'bold', color: '#2ecc71' }}
                                        placeholder="0"
                                    />
                                </div>

                                {/* Sin selector de tipo: aquí solo se registran ENTRADAS
                                    (restock manual). Las salidas se registran solas cuando
                                    se crea un pedido personalizado que consume el material. */}

                                <div>
                                    <label className="filtro-label">Cantidad</label>
                                    <input
                                        id="cantidad_m_material"
                                        type="number" min="0.01" step="0.01"
                                        value={formMaterial.cantidad_m}
                                        onChange={e => setFormMaterial({ ...formMaterial, cantidad_m: e.target.value })}
                                        disabled={!materialEncontrado || guardandoMovMaterial}
                                        required
                                    />
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="filtro-label">Observaciones (opcional)</label>
                                    <input
                                        type="text" maxLength={80}
                                        value={formMaterial.observaciones}
                                        onChange={e => setFormMaterial({ ...formMaterial, observaciones: e.target.value })}
                                        disabled={!materialEncontrado || guardandoMovMaterial}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-registrar" style={{ marginTop: '14px' }}
                                disabled={guardandoMovMaterial || !materialEncontrado}>
                                {guardandoMovMaterial ? 'Guardando...' : 'Registrar entrada'}
                            </button>
                        </form>
                    )}

                    {/* ── TABLA: PRODUCTOS ─────────────────────────────── */}
                    {vista === 'productos' && (
                        loading ? (
                            <div className="movimientos-loading">
                                <p>Cargando movimientos...</p>
                            </div>
                        ) : (
                            <>
                                <p className="movimientos-contador">
                                    Mostrando <strong>{movimientosFiltrados.length}</strong> de <strong>{movimientos.length}</strong> movimientos
                                </p>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="tabla">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tipo</th>
                                                <th>Fecha y Hora</th>
                                                <th>Producto</th>
                                                <th>Imagen</th>
                                                <th>Cantidad</th>
                                                <th>Usuario</th>
                                                <th>Rol</th>
                                                <th>Observaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimientosFiltrados.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="tabla-vacia-mensaje">
                                                        {movimientos.length === 0
                                                            ? "No hay movimientos registrados todavía"
                                                            : "No se encontraron movimientos con los filtros seleccionados"
                                                        }
                                                    </td>
                                                </tr>
                                            ) : (
                                                movimientosFiltrados.map((mov) => (
                                                    <tr key={mov.id_movimiento}>
                                                        <td>
                                                            <strong style={{ color: '#666' }}>
                                                                #{mov.id_movimiento}
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            <span className={mov.tipo === 'entrada' ? 'badge-entrada' : 'badge-salida'}>
                                                                {mov.tipo === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                                                            </span>
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                                                            {formatFecha(mov.fecha_m)}
                                                        </td>
                                                        <td>
                                                            <strong style={{ color: '#333' }}>
                                                                {mov.nom_producto}
                                                            </strong>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {mov.ruta_imagen ? (
                                                                <img
                                                                    src={`http://localhost:3000${mov.ruta_imagen}`}
                                                                    alt={mov.nom_producto}
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '60px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px',
                                                                        border: '2px solid #e0e0e0'
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://placehold.co/400x300?text=Gurama+Online/60x60?text=N/A';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="mov-sin-imagen">
                                                                    <span>Sin img</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={mov.tipo === 'entrada' ? 'cantidad-entrada' : 'cantidad-salida'}>
                                                                {mov.Cantidad_m}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="mov-usuario-nombre">{mov.nombre_usuario}</div>
                                                            <div className="mov-usuario-id">ID: {mov.id_usuario}</div>
                                                            <span className={mov.origen_movimiento === 'Venta Online' ? 'badge-origen-venta' : 'badge-origen-manual'}>
                                                                {mov.origen_movimiento === 'Venta Online' ? 'Venta Online' : 'Manual'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={mov.nombre_rol === 'Administrador' ? 'badge-rol-admin' : 'badge-rol-trabajador'}>
                                                                {mov.nombre_rol}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {mov.observaciones ? (
                                                                <span className="mov-observaciones">{mov.observaciones}</span>
                                                            ) : (
                                                                <span className="mov-sin-observaciones">Sin observaciones</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )
                    )}

                    {/* ── TABLA: MATERIALES ────────────────────────────── */}
                    {vista === 'materiales' && (
                        loadingMaterial ? (
                            <div className="movimientos-loading">
                                <p>Cargando movimientos de material...</p>
                            </div>
                        ) : (
                            <>
                                <p className="movimientos-contador">
                                    Mostrando <strong>{movimientosMaterialFiltrados.length}</strong> de <strong>{movimientosMaterial.length}</strong> movimientos
                                </p>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="tabla">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tipo</th>
                                                <th>Fecha y Hora</th>
                                                <th>Material</th>
                                                <th>Tipo material</th>
                                                <th>Cantidad</th>
                                                <th>Usuario</th>
                                                <th>Rol</th>
                                                <th>Observaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {movimientosMaterialFiltrados.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="tabla-vacia-mensaje">
                                                        {movimientosMaterial.length === 0
                                                            ? "No hay movimientos de material registrados todavía"
                                                            : "No se encontraron movimientos con los filtros seleccionados"
                                                        }
                                                    </td>
                                                </tr>
                                            ) : (
                                                movimientosMaterialFiltrados.map((mov) => (
                                                    <tr key={mov.id_movimiento_material}>
                                                        <td>
                                                            <strong style={{ color: '#666' }}>
                                                                #{mov.id_movimiento_material}
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            <span className={mov.tipo === 'entrada' ? 'badge-entrada' : 'badge-salida'}>
                                                                {mov.tipo === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                                                            </span>
                                                        </td>
                                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                                                            {formatFecha(mov.fecha_m)}
                                                        </td>
                                                        <td>
                                                            <strong style={{ color: '#333' }}>
                                                                {mov.nom_material}
                                                            </strong>
                                                        </td>
                                                        <td className="celda-gris">{mov.tipo_material}</td>
                                                        <td>
                                                            <span className={mov.tipo === 'entrada' ? 'cantidad-entrada' : 'cantidad-salida'}>
                                                                {mov.cantidad_m} {mov.unidad}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="mov-usuario-nombre">{mov.nombre_usuario}</div>
                                                            <div className="mov-usuario-id">ID: {mov.id_usuario}</div>
                                                        </td>
                                                        <td>
                                                            <span className={mov.nombre_rol === 'Administrador' ? 'badge-rol-admin' : 'badge-rol-trabajador'}>
                                                                {mov.nombre_rol}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {mov.observaciones ? (
                                                                <span className="mov-observaciones">{mov.observaciones}</span>
                                                            ) : (
                                                                <span className="mov-sin-observaciones">Sin observaciones</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )
                    )}
                </section>
            </main>
        </div>
    );
}