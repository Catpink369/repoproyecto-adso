import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar_p-a";
import HeaderUsuarios from "../../components/HeaderUsuarios";
import "../../components/css/styles.css";
import { apiGet, apiPatch, apiPost } from "../../context/api.js";

// ─── Paleta y estilos ────────────────────────────────────────────────────────
const C = {
    rosa:       '#c45c7e',
    rosaOsc:    '#a0405f',
    rosaPale:   '#fdf0f4',
    rosaBorder: '#f0d0db',
    rosaLight:  '#fdf6f8',
    verde:      '#2e7d32',
    verdeLight: '#edf7ed',
    verdeBorder:'#c8e6c9',
    rojo:       '#c62828',
    rojoLight:  '#fdecea',
    rojoBorder: '#ffcdd2',
    gris:       '#6b7280',
    texto:      '#2d1f27',
    textoSec:   '#7a5060',
    borde:      '#e8d5dc',
    fondo:      '#faf5f7',
};

const s = {
    pagina: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },

    // Stats
    statsRow: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
    statCard: (color) => ({
        flex: 1, minWidth: '110px',
        background: '#fff',
        border: `1.5px solid ${color === 'rosa' ? C.rosaBorder : color === 'verde' ? C.verdeBorder : C.rojoBorder}`,
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: '4px',
    }),
    statNum: (color) => ({
        fontSize: '28px', fontWeight: '800',
        color: color === 'rosa' ? C.rosa : color === 'verde' ? C.verde : C.rojo,
    }),
    statLabel: { fontSize: '12px', fontWeight: '600', color: C.textoSec, textTransform: 'uppercase', letterSpacing: '0.06em' },

    // Tabs
    tabsBar: { display: 'flex', gap: '0', borderBottom: `2px solid ${C.borde}` },
    tab: (activa) => ({
        padding: '12px 28px',
        background: 'none', border: 'none',
        fontSize: '14px', fontWeight: '600',
        color: activa ? C.rosa : C.textoSec,
        borderBottom: activa ? `2px solid ${C.rosa}` : '2px solid transparent',
        marginBottom: '-2px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px',
        transition: 'color 0.2s',
    }),
    tabBadge: (activa) => ({
        padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
        background: activa ? C.rosa : C.borde,
        color: activa ? '#fff' : C.textoSec,
    }),

    // Toolbar
    toolbar: {
        display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
    },
    searchWrap: { flex: 1, minWidth: '220px', position: 'relative' },
    searchInput: {
        width: '100%', padding: '10px 14px 10px 38px',
        border: `1.5px solid ${C.borde}`, borderRadius: '8px',
        fontSize: '14px', color: C.texto, background: '#fff',
        outline: 'none', boxSizing: 'border-box',
    },
    searchIcon: {
        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
        color: C.textoSec, pointerEvents: 'none', fontSize: '13px',
    },
    select: {
        padding: '10px 14px', border: `1.5px solid ${C.borde}`,
        borderRadius: '8px', fontSize: '14px', color: C.texto,
        background: '#fff', cursor: 'pointer', outline: 'none',
    },
    btnPrimario: {
        padding: '10px 20px',
        background: `linear-gradient(135deg, ${C.rosa}, ${C.rosaOsc})`,
        color: '#fff', border: 'none', borderRadius: '9px',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '7px',
        boxShadow: '0 3px 10px rgba(180,70,106,0.25)',
        whiteSpace: 'nowrap',
    },

    // Tabla
    tablaWrap: { overflowX: 'auto', borderRadius: '10px', border: `1px solid ${C.borde}` },
    tabla: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: {
        background: C.rosa, color: '#fff', padding: '12px 16px',
        textAlign: 'left', fontSize: '12px', fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        whiteSpace: 'nowrap',
    },
    td: { padding: '14px 16px', borderBottom: `1px solid ${C.fondo}`, verticalAlign: 'middle' },
    trHover: { background: '#fff', transition: 'background 0.15s' },

    // Avatar
    avatar: (seed) => {
        const colores = ['#c45c7e','#a0405f','#7b6cf0','#e8885a','#4caf7d','#5b8dee'];
        const c = colores[seed % colores.length];
        return {
            width: '40px', height: '40px', borderRadius: '50%',
            background: c, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '700', flexShrink: 0,
        };
    },
    nombreCell: { display: 'flex', alignItems: 'center', gap: '12px' },
    nombreTexto: { fontWeight: '600', color: C.texto, fontSize: '14px' },
    idTexto: { fontSize: '12px', color: C.gris, marginTop: '2px' },

    // Badges
    badgeRol: (rol) => {
        const map = {
            '1': { bg: '#ede8ff', color: '#5b3fc4', label: 'Admin' },
            '2': { bg: C.rosaPale, color: C.rosa, label: 'Cliente' },
            '3': { bg: '#e8f4fd', color: '#1565c0', label: 'Trabajador' },
        };
        const r = map[rol] || { bg: C.fondo, color: C.gris, label: 'N/A' };
        return { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: r.bg, color: r.color };
    },
    badgeEstado: (activo) => ({
        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
        background: activo ? C.verdeLight : C.rojoLight,
        color: activo ? C.verde : C.rojo,
        border: `1px solid ${activo ? C.verdeBorder : C.rojoBorder}`,
    }),

    // Botones de acción
    btnAccion: (tipo) => ({
        padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600',
        cursor: 'pointer', border: 'none',
        background: tipo === 'activar' ? C.verdeLight : tipo === 'desactivar' ? C.rojoLight : C.rosaPale,
        color: tipo === 'activar' ? C.verde : tipo === 'desactivar' ? C.rojo : C.rosa,
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        transition: 'opacity 0.15s',
    }),

    // Modal
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(45,31,39,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
    },
    modal: {
        background: '#fff', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(45,31,39,0.25)',
    },
    modalTitulo: {
        fontSize: '18px', fontWeight: '800', color: C.texto,
        marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px',
    },
    modalSub: { fontSize: '13px', color: C.textoSec, marginBottom: '24px' },
    modalCampo: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
    modalLabel: { fontSize: '13px', fontWeight: '600', color: C.texto },
    modalInput: {
        padding: '10px 14px', border: `1.5px solid ${C.borde}`,
        borderRadius: '8px', fontSize: '14px', color: C.texto,
        background: '#fff', outline: 'none',
    },
    modalInputReadonly: {
        padding: '10px 14px', border: `1.5px solid #eee`,
        borderRadius: '8px', fontSize: '14px', color: C.gris,
        background: C.fondo, cursor: 'not-allowed',
    },
    modalBotones: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' },
    btnSecundario: {
        padding: '10px 20px', background: C.fondo,
        color: C.textoSec, border: `1.5px solid ${C.borde}`,
        borderRadius: '9px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    },
    alerta: (tipo) => ({
        padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
        background: tipo === 'success' ? C.verdeLight : C.rojoLight,
        color: tipo === 'success' ? C.verde : C.rojo,
        border: `1px solid ${tipo === 'success' ? C.verdeBorder : C.rojoBorder}`,
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
    }),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRolNombre = (id) => ({ '1': 'Admin', '2': 'Cliente', '3': 'Trabajador' }[id] || 'N/A');
const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A';
const iniciales = (n, a) => ((n?.[0] || '') + (a?.[0] || '')).toUpperCase() || '??';
const hashStr = (s) => [...(s||'')].reduce((h, c) => h + c.charCodeAt(0), 0);

// Genera un código de trabajador aleatorio
const generarCodigo = () => 'TRB-' + Math.random().toString(36).substring(2, 7).toUpperCase();

// ─── Modal Registrar Trabajador ───────────────────────────────────────────────
function ModalRegistrar({ onClose, onGuardado }) {
    const [form, setForm] = useState({
        id_usuario: '', t_doc: 'CC',
        nom_1: '', nom_2: '', ape_1: '', ape_2: '',
        correo: '', telefono: '', contrasena: '',
        codigo: generarCodigo(),
        id_rol_usuario: '3',
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        setError('');
        if (!form.id_usuario || !form.nom_1 || !form.ape_1 || !form.correo || !form.contrasena) {
            setError('Documento, nombre, apellido, correo y contraseña son obligatorios.');
            return;
        }
        setGuardando(true);
        try {
            await apiPost('/usuarios', { ...form, estado: 1 });
            onGuardado('Trabajador registrado exitosamente.');
        } catch (e) {
            setError(e.message || 'Error al registrar el trabajador.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={s.modal}>
                <div style={s.modalTitulo}>
                    <span style={{ fontSize: '22px' }}></span>
                    Registrar Trabajador
                </div>
                <p style={s.modalSub}>El admin asigna un código único al nuevo trabajador.</p>

                {error && <div style={s.alerta('error')}><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

                {/* Código asignado */}
                <div style={s.modalCampo}>
                    <label style={s.modalLabel}>Código asignado</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input style={{ ...s.modalInputReadonly, flex: 1 }} value={form.codigo} readOnly />
                        <button
                            onClick={() => setForm(p => ({ ...p, codigo: generarCodigo() }))}
                            style={{ ...s.btnAccion('editar'), padding: '10px 14px', fontSize: '13px' }}
                        >
                            ↻ Nuevo
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={s.modalCampo}>
                        <label style={s.modalLabel}>Número de documento *</label>
                        <input style={s.modalInput} name="id_usuario" value={form.id_usuario} onChange={handleChange} placeholder="Ej: 1023456789" />
                    </div>
                    <div style={s.modalCampo}>
                        <label style={s.modalLabel}>Tipo de documento *</label>
                        <select style={s.modalInput} name="t_doc" value={form.t_doc} onChange={handleChange}>
                            <option value="CC">Cédula de ciudadanía</option>
                            <option value="CE">Cédula de extranjería</option>
                            <option value="TI">Tarjeta de identidad</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                        { name: 'nom_1', label: 'Primer Nombre *' },
                        { name: 'nom_2', label: 'Segundo Nombre' },
                        { name: 'ape_1', label: 'Primer Apellido *' },
                        { name: 'ape_2', label: 'Segundo Apellido' },
                    ].map(({ name, label }) => (
                        <div key={name} style={s.modalCampo}>
                            <label style={s.modalLabel}>{label}</label>
                            <input style={s.modalInput} name={name} value={form[name]} onChange={handleChange} placeholder={label.replace(' *', '')} />
                        </div>
                    ))}
                </div>

                <div style={s.modalCampo}>
                    <label style={s.modalLabel}>Correo *</label>
                    <input style={s.modalInput} name="correo" type="email" value={form.correo} onChange={handleChange} placeholder="correo@ejemplo.com" />
                </div>
                <div style={s.modalCampo}>
                    <label style={s.modalLabel}>Teléfono</label>
                    <input style={s.modalInput} name="telefono" value={form.telefono} onChange={handleChange} placeholder="3001234567" />
                </div>
                <div style={s.modalCampo}>
                    <label style={s.modalLabel}>Contraseña inicial *</label>
                    <input style={s.modalInput} name="contrasena" type="password" value={form.contrasena} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
                </div>

                <div style={s.modalBotones}>
                    <button style={s.btnSecundario} onClick={onClose} disabled={guardando}>Cancelar</button>
                    <button style={{ ...s.btnPrimario, opacity: guardando ? 0.7 : 1 }} onClick={handleSubmit} disabled={guardando}>
                        {guardando ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</> : <><i className="fa-solid fa-user-plus"></i> Registrar</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Editar Usuario ─────────────────────────────────────────────────────
function ModalEditar({ usuario, onClose, onGuardado }) {
    const [form, setForm] = useState({
        nom_1: usuario.nom_1 || '',
        nom_2: usuario.nom_2 || '',
        ape_1: usuario.ape_1 || '',
        ape_2: usuario.ape_2 || '',
        correo: usuario.correo || '',
        telefono: usuario.telefono || '',
        id_rol_usuario: usuario.id_rol_usuario || '2',
        //isaura
        codigo_visible: usuario.codigo_visible || '',
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        setError('');
        if (!form.nom_1 || !form.ape_1 || !form.correo) {
            setError('Nombre, apellido y correo son obligatorios.');
            return;
        }
        setGuardando(true);
        try {
            await apiPatch(`/usuarios/${usuario.id_usuario}`, form);
            onGuardado('Usuario actualizado exitosamente.');
        } catch (e) {
            setError(e.message || 'Error al actualizar el usuario.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={s.modal}>
                <div style={s.modalTitulo}>
                    <span style={{ fontSize: '22px' }}></span>
                    Editar Usuario
                </div>
                <p style={s.modalSub}>ID: {usuario.id_usuario}</p>

                {error && <div style={s.alerta('error')}><i className="fa-solid fa-circle-exclamation"></i>{error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                        { name: 'nom_1', label: 'Primer Nombre *' },
                        { name: 'nom_2', label: 'Segundo Nombre' },
                        { name: 'ape_1', label: 'Primer Apellido *' },
                        { name: 'ape_2', label: 'Segundo Apellido' },
                        { name: 'codigo_visible', label: 'Código' },
                    ].map(({ name, label }) => (
                        <div key={name} style={s.modalCampo}>
                            <label style={s.modalLabel}>{label}</label>
                            <input style={s.modalInput} name={name} value={form[name]} onChange={handleChange} />
                        </div>
                    ))}
                </div>

                <div style={s.modalCampo}>
                    <label style={s.modalLabel}>Correo *</label>
                    <input style={s.modalInput} name="correo" type="email" value={form.correo} onChange={handleChange} />
                </div>
                <div style={s.modalCampo}>
                    <label style={s.modalLabel}>Teléfono</label>
                    <input style={s.modalInput} name="telefono" value={form.telefono} onChange={handleChange} />
                </div>
                <div style={s.modalCampo}>
                    <label style={s.modalLabel}>Rol</label>
                    <select style={s.modalInput} name="id_rol_usuario" value={form.id_rol_usuario} onChange={handleChange}>
                        <option value="1">Administrador</option>
                        <option value="2">Cliente</option>
                        <option value="3">Trabajador</option>
                    </select>
                </div>

                <div style={s.modalBotones}>
                    <button style={s.btnSecundario} onClick={onClose} disabled={guardando}>Cancelar</button>
                    <button style={{ ...s.btnPrimario, opacity: guardando ? 0.7 : 1 }} onClick={handleSubmit} disabled={guardando}>
                        {guardando ? <><i className="fa-solid fa-spinner fa-spin"></i> Guardando...</> : <><i className="fa-solid fa-floppy-disk"></i> Guardar Cambios</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Usuarios() {
    const [tabActiva, setTabActiva] = useState('clientes');
    const [todos, setTodos] = useState([]);          // todos los usuarios sin filtrar por tab
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [modalRegistrar, setModalRegistrar] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null);
    const [toast, setToast] = useState({ text: '', type: '' });

    const mostrarToast = (text, type = 'success') => {
        setToast({ text, type });
        setTimeout(() => setToast({ text: '', type: '' }), 3500);
    };

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/usuarios');
            const data = Array.isArray(response) ? response : response.data || [];
            setTodos(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            mostrarToast('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarUsuarios(); }, []);

    const handleCambiarEstado = async (usuario) => {
        const nuevoEstado = usuario.estado === 1 ? 0 : 1;
        const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Seguro que deseas ${accion} a ${usuario.nom_1} ${usuario.ape_1}?`)) return;
        try {
            await apiPatch(`/usuarios/${usuario.id_usuario}/estado`);
            mostrarToast(`Usuario ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente.`);
            cargarUsuarios();
        } catch (e) {
            console.error("Error en patch:", e);
            mostrarToast('Error al cambiar el estado.', 'error');
        }
    };

    // Filtra por tab actual
    const porTab = todos.filter(u =>
        tabActiva === 'clientes' ? u.id_rol_usuario === '2'
        : tabActiva === 'trabajadores' ? u.id_rol_usuario === '3'
        : true
    );

    // Aplica búsqueda y estado
    const visibles = porTab.filter(u => {
        const nombre = `${u.nom_1||''} ${u.nom_2||''} ${u.ape_1||''} ${u.ape_2||''}`.toLowerCase();
        const ok = nombre.includes(searchTerm.toLowerCase())
            || (u.correo||'').toLowerCase().includes(searchTerm.toLowerCase())
            || (u.telefono||'').includes(searchTerm)
            || (u.id_usuario||'').toLowerCase().includes(searchTerm.toLowerCase());
        const okEstado =
            filtroEstado === 'todos' ||
            (filtroEstado === 'activos' && u.estado === 1) ||
            (filtroEstado === 'inactivos' && u.estado === 0);
        return ok && okEstado;
    });

    const stats = {
        total: porTab.length,
        activos: porTab.filter(u => u.estado === 1).length,
        inactivos: porTab.filter(u => u.estado === 0).length,
    };

    const cuentaPorRol = (rol) => todos.filter(u => u.id_rol_usuario === rol).length;

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="contenido">
                    <HeaderUsuarios />
                    <div style={{ padding: '60px', textAlign: 'center', color: C.textoSec }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: C.rosa, display: 'block', marginBottom: '12px' }}></i>
                        Cargando usuarios...
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="contenido">
                <HeaderUsuarios />

                <div style={s.pagina}>

                    {/* Toast */}
                    {toast.text && (
                        <div style={s.alerta(toast.type)}>
                            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                            {toast.text}
                        </div>
                    )}

                    {/* Stats */}
                    <div style={s.statsRow}>
                        <div style={s.statCard('rosa')}>
                            <span style={s.statNum('rosa')}>{stats.total}</span>
                            <span style={s.statLabel}>Total {tabActiva}</span>
                        </div>
                        <div style={s.statCard('verde')}>
                            <span style={s.statNum('verde')}>{stats.activos}</span>
                            <span style={s.statLabel}>Activos</span>
                        </div>
                        <div style={s.statCard('rojo')}>
                            <span style={s.statNum('rojo')}>{stats.inactivos}</span>
                            <span style={s.statLabel}>Inactivos</span>
                        </div>
                    </div>

                    {/* Panel principal */}
                    <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${C.borde}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>

                        {/* Tabs */}
                        <div style={{ padding: '0 24px', borderBottom: `2px solid ${C.borde}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={s.tabsBar}>
                                {[
                                    { key: 'clientes', label: 'Clientes', rol: '2' },
                                    { key: 'trabajadores', label: 'Trabajadores', rol: '3' },
                                ].map(({ key, label, rol }) => (
                                    <button key={key} style={s.tab(tabActiva === key)} onClick={() => { setTabActiva(key); setSearchTerm(''); setFiltroEstado('todos'); }}>
                                        {label}
                                        <span style={s.tabBadge(tabActiva === key)}>{cuentaPorRol(rol)}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Botón registrar trabajador */}
                            {tabActiva === 'trabajadores' && (
                                <button style={s.btnPrimario} onClick={() => setModalRegistrar(true)}>
                                    <i className="fa-solid fa-user-plus"></i>
                                    Registrar Trabajador
                                </button>
                            )}
                        </div>

                        {/* Toolbar */}
                        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.fondo}` }}>
                            <div style={s.toolbar}>
                                <div style={s.searchWrap}>
                                    <i className="fa-solid fa-magnifying-glass" style={s.searchIcon}></i>
                                    <input
                                        style={s.searchInput}
                                        type="text"
                                        placeholder="Buscar por nombre, correo, teléfono o ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select style={s.select} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                                    <option value="todos">Todos los estados</option>
                                    <option value="activos">Activos</option>
                                    <option value="inactivos">Inactivos</option>
                                </select>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div style={s.tablaWrap}>
                            <table style={s.tabla}>
                                <thead>
                                    <tr>
                                        {['Usuario', 'Contacto', 'Rol', 'Estado', 'Acciones'].map(h => (
                                            <th key={h} style={s.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibles.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: C.textoSec }}>
                                                <div style={{ fontSize: '32px', marginBottom: '10px' }}></div>
                                                <strong>{searchTerm ? 'Sin resultados' : `No hay ${tabActiva} registrados`}</strong>
                                                <p style={{ fontSize: '13px', marginTop: '6px' }}>
                                                    {searchTerm ? 'Prueba con otros términos' : tabActiva === 'trabajadores' ? 'Registra el primer trabajador con el botón de arriba.' : 'Los clientes aparecerán al registrarse.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : visibles.map((u, i) => (
                                        <tr key={u.id_usuario} style={{ background: i % 2 === 0 ? '#fff' : C.rosaLight }}>
                                            <td style={s.td}>
                                                <div style={s.nombreCell}>
                                                    <div style={s.avatar(hashStr(u.id_usuario))}>
                                                        {iniciales(u.nom_1, u.ape_1)}
                                                    </div>
                                                    <div>
                                                        <div style={s.nombreTexto}>{u.nom_1} {u.nom_2 || ''} {u.ape_1} {u.ape_2 || ''}</div>
                                                        <div style={s.idTexto}>ID: {u.id_usuario}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={s.td}>
                                                <div style={{ fontSize: '13px', color: C.texto }}>{u.correo || '—'}</div>
                                                <div style={{ fontSize: '12px', color: C.gris, marginTop: '2px' }}>{u.telefono || '—'}</div>
                                            </td>
                                            <td style={s.td}>
                                                <span style={s.badgeRol(u.id_rol_usuario)}>
                                                    {getRolNombre(u.id_rol_usuario)}
                                                </span>
                                            </td>
                                            <td style={s.td}>
                                                <span style={s.badgeEstado(u.estado === 1)}>
                                                    {u.estado === 1 ? '✓ Activo' : '✕ Inactivo'}
                                                </span>
                                            </td>
                                            
                                            <td style={s.td}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {/* Editar */}
                                                    <button style={s.btnAccion('editar')} onClick={() => setUsuarioEditar(u)}>
                                                        <i className="fa-solid fa-pen"></i> Editar
                                                    </button>
                                                    {/* Activar / Desactivar */}
                                                    <button
                                                        style={s.btnAccion(u.estado === 1 ? 'desactivar' : 'activar')}
                                                        onClick={() => handleCambiarEstado(u)}
                                                    >
                                                        {u.estado === 1
                                                            ? <><i className="fa-solid fa-ban"></i> Desactivar</>
                                                            : <><i className="fa-solid fa-check"></i> Activar</>
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer contador */}
                        {visibles.length > 0 && (
                            <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.fondo}`, fontSize: '13px', color: C.gris }}>
                                Mostrando <strong>{visibles.length}</strong> de <strong>{porTab.length}</strong> {tabActiva}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal registrar trabajador */}
                {modalRegistrar && (
                    <ModalRegistrar
                        onClose={() => setModalRegistrar(false)}
                        onGuardado={(msg) => {
                            setModalRegistrar(false);
                            mostrarToast(msg);
                            cargarUsuarios();
                        }}
                    />
                )}

                {/* Modal editar usuario */}
                {usuarioEditar && (
                    <ModalEditar
                        usuario={usuarioEditar}
                        onClose={() => setUsuarioEditar(null)}
                        onGuardado={(msg) => {
                            setUsuarioEditar(null);
                            mostrarToast(msg);
                            cargarUsuarios();
                        }}
                    />
                )}
            </main>
        </div>
    );
}