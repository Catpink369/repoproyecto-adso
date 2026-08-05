// el Header de cliente con sesion iniciada
import React, { useState, useEffect, useContext, useRef } from 'react';
import logo from '../assets/Logo_GO.jpeg';
import carrito from '../assets/icono_carrito.png';
import perfil from '../assets/icono_usuario.png';
import carrito_rosa from '../assets/icono_carrito2.png';
import perfil_rosa from '../assets/icono_usuario2.png';
import notif from '../assets/notif.png';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { apiGet, apiPatch } from '../context/api.js';

import './css/header.css';

const WHATSAPP = 'https://wa.me/573123456789';

// Mapea el tipo de notificación guardado en BD a una ruta del front del cliente
const RUTA_POR_TIPO = {
    pedido_estado: '/mis_pedidos',
    };

const COLOR_POR_TIPO = {
    pedido_estado: '#2196F3',
    pedido_nuevo: '#4CAF50',
    stock_bajo: '#E91E63',
};

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { usuarioActual } = useContext(AuthContext);

    const [mostrarNotif, setMostrarNotif] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);
    const [cargando, setCargando] = useState(false);
    const pollingRef = useRef(null);
    const panelRef = useRef(null);

    const isCarritoActive = location.pathname.startsWith('/carrito');
    const isPerfilActive = location.pathname.startsWith('/perfil');
    const isPedidosPersonalizadosActive =
        location.pathname.startsWith('/pedidos_personalizados') ||
        location.pathname.startsWith('/p_sabanas') ||
        location.pathname.startsWith('/p_cubrelecho');
    const isProductosActive =
        location.pathname.startsWith('/catalogo_c') ||
        location.pathname.startsWith('/producto/');

    // ── Contador de no leídas (badge) ────────────────────────────
    const cargarContador = async () => {
        if (!usuarioActual?.id_usuario) return;
        try {
            const res = await apiGet(`/notificaciones/usuario/${usuarioActual.id_usuario}/count`);
            setCantidadNoLeidas(res?.count ?? 0);
        } catch (error) {
            console.error('Error al obtener contador de notificaciones:', error);
        }
    };

    // ── Lista completa (persistida en BD) ────────────────────────
    const cargarNotificaciones = async () => {
        if (!usuarioActual?.id_usuario) return;
        setCargando(true);
        try {
            const data = await apiGet(`/notificaciones/usuario/${usuarioActual.id_usuario}`);
            setNotificaciones(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setCargando(false);
        }
    };

    // Polling del contador cada 30s, y al montar
    useEffect(() => {
        if (!usuarioActual?.id_usuario) return;
        cargarContador();
        pollingRef.current = setInterval(cargarContador, 30000);
        return () => clearInterval(pollingRef.current);
    }, [usuarioActual?.id_usuario]);

    // Cerrar el panel si se hace clic afuera
    useEffect(() => {
        const handleClickFuera = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setMostrarNotif(false);
            }
        };
        if (mostrarNotif) {
            document.addEventListener('mousedown', handleClickFuera);
        }
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, [mostrarNotif]);

    const handleAbrirNotif = async () => {
        const abrir = !mostrarNotif;
        setMostrarNotif(abrir);
        if (abrir) {
            await cargarNotificaciones();
        }
    };

    // Marcar todas como leídas (botón dentro del panel)
    const handleMarcarTodas = async () => {
        try {
            await apiPatch(`/notificaciones/usuario/${usuarioActual.id_usuario}/leer-todas`);
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            setCantidadNoLeidas(0);
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    // Clic en una notificación: marcarla leída + navegar según su tipo
    const handleClicNotificacion = async (n) => {
        if (!n.leida) {
            try {
                await apiPatch(`/notificaciones/${n.id_notificacion}/leer?usuario=${usuarioActual.id_usuario}`);
                setNotificaciones(prev =>
                    prev.map(item => item.id_notificacion === n.id_notificacion ? { ...item, leida: true } : item)
                );
                setCantidadNoLeidas(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error al marcar notificación como leída:', error);
            }
        }

        const ruta = RUTA_POR_TIPO[n.tipo];
        if (ruta) {
            setMostrarNotif(false);
            navigate(ruta);
        }
    };

    const getTipoColor = (tipo) => COLOR_POR_TIPO[tipo] || '#999';

    return (
        <header className="Header">
        <div className="Header-container">
            <div className="logoG">
            <Link to="/cliente">
                <img src={logo} alt="Logo Gurama Online" />
            </Link>
            </div>

            <nav className="Menu">
            <ul>
                <li>
                    <Link
                        to="/cliente"
                        className={location.pathname === '/' || location.pathname === '/cliente' ? 'activo' : ''}
                    >
                        Inicio
                    </Link>
                </li>
                <li>
                    <Link to="/catalogo_c" className={isProductosActive ? 'activo' : ''}>
                        Catálogo
                    </Link>
                </li>
                <li>
                    <Link to="/pedidos_personalizados" className={isPedidosPersonalizadosActive ? 'activo' : ''}>
                        Pedidos personalizados
                    </Link>
                </li>
            </ul>
            </nav>

            <div className="iconos">
                <div className="notif-wrapper" onClick={handleAbrirNotif} ref={panelRef}>
                    <img src={notif} alt="notificaciones" className="notif-icono" />
                    {cantidadNoLeidas > 0 && (
                        <span className="notif-badge">{cantidadNoLeidas > 9 ? '9+' : cantidadNoLeidas}</span>
                    )}

                    {mostrarNotif && (
                        <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="notif-panel-header">
                                <h3>Notificaciones</h3>
                                {notificaciones.some(n => !n.leida) && (
                                    <span className="notif-marcar-todas" onClick={handleMarcarTodas}>
                                        Marcar todas como leídas
                                    </span>
                                )}
                                <span className="notif-cerrar" onClick={() => setMostrarNotif(false)}>×</span>
                            </div>

                            <div className="notif-panel-body">
                                {cargando ? (
                                    <p className="notif-vacia">Cargando...</p>
                                ) : notificaciones.length === 0 ? (
                                    <p className="notif-vacia">No tienes notificaciones por ahora.</p>
                                ) : (
                                    notificaciones.map(n => (
                                        <div
                                            key={n.id_notificacion}
                                            className={`notif-item ${!n.leida ? 'no-leida' : ''}`}
                                            style={{ borderLeft: `4px solid ${getTipoColor(n.tipo)}` }}
                                            onClick={() => handleClicNotificacion(n)}
                                        >
                                            <strong>{n.titulo}</strong>
                                            <p>{n.mensaje}</p>
                                            <span className="notif-fecha">
                                                {new Date(n.fecha).toLocaleString('es-CO', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="notif-panel-footer">
                                <a href={WHATSAPP} target="_blank" rel="noreferrer" className="notif-whatsapp">
                                    ¿Tienes preguntas? Escríbenos por WhatsApp
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <Link to="/carrito">
                    <img src={isCarritoActive ? carrito_rosa : carrito} alt="icono carrito" />
                </Link>
                <Link to="/perfil">
                    <img src={isPerfilActive ? perfil_rosa : perfil} alt="icono perfil" />
                </Link>
            </div>
        </div>
        </header>
    );
};

export default Header;