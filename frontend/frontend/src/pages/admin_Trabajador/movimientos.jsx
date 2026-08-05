import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Sidebarmov from "../../components/Sidebarmov";
import HeaderMovimientos from "../../components/HeaderMovimientos";
import "../../components/css/styles.css";

import { apiGet } from "../../context/api.js";

export default function Movimientos(){
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos');
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarMovimientos();
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

                    {/* Controles de filtro */}
                    <div className="movimientos-controles">
                        <input
                            type="text"
                            placeholder="Buscar por producto o usuario..."
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
                        </div>
                    </div>

                    {loading ? (
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

                                                    {/* ID */}
                                                    <td>
                                                        <strong style={{ color: '#666' }}>
                                                            #{mov.id_movimiento}
                                                        </strong>
                                                    </td>

                                                    {/* Tipo */}
                                                    <td>
                                                        <span className={mov.tipo === 'entrada' ? 'badge-entrada' : 'badge-salida'}>
                                                            {mov.tipo === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                                                        </span>
                                                    </td>

                                                    {/* Fecha */}
                                                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                                                        {formatFecha(mov.fecha_m)}
                                                    </td>

                                                    {/* Producto */}
                                                    <td>
                                                        <strong style={{ color: '#333' }}>
                                                            {mov.nom_producto}
                                                        </strong>
                                                    </td>

                                                    {/* Imagen */}
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

                                                    {/* Cantidad */}
                                                    <td>
                                                        <span className={mov.tipo === 'entrada' ? 'cantidad-entrada' : 'cantidad-salida'}>
                                                            {mov.Cantidad_m}
                                                        </span>
                                                    </td>

                                                    {/* Usuario */}
                                                    <td>
                                                        <div className="mov-usuario-nombre">{mov.nombre_usuario}</div>
                                                        <div className="mov-usuario-id">ID: {mov.id_usuario}</div>
                                                        <span className={mov.origen_movimiento === 'Venta Online' ? 'badge-origen-venta' : 'badge-origen-manual'}>
                                                            {mov.origen_movimiento === 'Venta Online' ? 'Venta Online' : 'Manual'}
                                                        </span>
                                                    </td>

                                                    {/* Rol */}
                                                    <td>
                                                        <span className={mov.nombre_rol === 'Administrador' ? 'badge-rol-admin' : 'badge-rol-trabajador'}>
                                                            {mov.nombre_rol}
                                                        </span>
                                                    </td>

                                                    {/* Observaciones */}
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
                    )}
                </section>
            </main>
        </div>
    );
}