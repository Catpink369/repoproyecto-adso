import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar_p-a.jsx';
import '../../components/css/styles.css';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../context/api.js';

const API_URL = 'http://localhost:3000';
const TIPOS = ['Todos', 'Tela', 'Bordado', 'Diseño', 'Relleno', 'Accesorio'];
const TIPO_COLORS = {
    Tela:      'badge-tipo-Tela',
    Bordado:   'badge-tipo-Bordado',
    'Diseño':  'badge-tipo-Diseno',
    Relleno:   'badge-tipo-Relleno',
    Accesorio: 'badge-tipo-Accesorio',
};

const MATERIAL_VACIO = {
    nombre: '', tipo: 'Tela', unidad: 'metro',
    precio_unitario: '', stock_actual: '', stock_minimo: 5,
};

const Materiales = () => {
    const [materiales, setMateriales]               = useState([]);
    const [loading, setLoading]                     = useState(true);
    const [error, setError]                         = useState(null);
    const [buscar, setBuscar]                       = useState('');
    const [tipoFiltro, setTipoFiltro]               = useState('Todos');

    // formulario crear
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [guardando, setGuardando]                 = useState(false);
    const [nuevoMaterial, setNuevoMaterial]         = useState(MATERIAL_VACIO);
    const [imagenNuevo, setImagenNuevo]             = useState(null);
    const fileNuevoRef                              = useRef(null);

    // edición (modal "Editar datos")
    const [editando, setEditando]                   = useState(null); // material completo
    const [editForm, setEditForm]                   = useState({});
    const [imagenEdit, setImagenEdit]               = useState(null);
    const [guardandoEdit, setGuardandoEdit]         = useState(false);
    const fileEditRef                               = useRef(null);

    // gestión de colores/diseños (modal aparte, solo Tela)
    const [gestionando, setGestionando]             = useState(null); // material completo
    const [colores, setColores]                     = useState([]);
    const [disenos, setDisenos]                     = useState([]);
    const [cargandoColoresDisenos, setCargandoColoresDisenos] = useState(false);

    const [nuevoColorNombre, setNuevoColorNombre]   = useState('');
    const [nuevoColorHex, setNuevoColorHex]         = useState('#c45a77');
    const [guardandoColor, setGuardandoColor]       = useState(false);

    const [nuevoDisenoNombre, setNuevoDisenoNombre] = useState('');
    const [nuevoDisenoImagen, setNuevoDisenoImagen] = useState(null);
    const [guardandoDiseno, setGuardandoDiseno]     = useState(false);
    const fileDisenoRef                             = useRef(null);

    const cargarMateriales = async () => {
        try {
            setLoading(true); setError(null);
            const data = await apiGet('/pedidos-personalizados/materiales');
            setMateriales(Array.isArray(data) ? data : []);
        } catch { setError('No se pudieron cargar los materiales.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargarMateriales(); }, []);

    const total     = materiales.length;
    const sinStock  = materiales.filter(m => m.stock_actual === 0).length;
    const stockBajo = materiales.filter(m => m.stock_actual > 0 && m.stock_actual <= (m.stock_minimo ?? 5)).length;

    const materialesFiltrados = materiales.filter(m => {
        const coincideBusqueda = m.nombre?.toLowerCase().includes(buscar.toLowerCase());
        const coincideTipo     = tipoFiltro === 'Todos' || m.tipo === tipoFiltro;
        return coincideBusqueda && coincideTipo;
    });

    const formatPrice = (p) =>
        Number(p).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const getStockClass = (m) => {
        if (m.stock_actual === 0) return 'stock-material-cero';
        if (m.stock_actual <= (m.stock_minimo ?? 5)) return 'stock-material-bajo';
        return 'stock-material-ok';
    };

    // ── CREAR ──────────────────────────────────────────────
    const handleRegistrar = async (e) => {
        e.preventDefault();
        if (!nuevoMaterial.nombre || !nuevoMaterial.precio_unitario || !nuevoMaterial.stock_actual) {
            alert('Completa todos los campos obligatorios.'); return;
        }
        setGuardando(true);
        try {
            const creado = await apiPost('/pedidos-personalizados/materiales', {
                nombre:          nuevoMaterial.nombre,
                tipo:            nuevoMaterial.tipo,
                unidad:          nuevoMaterial.unidad,
                precio_unitario: parseFloat(nuevoMaterial.precio_unitario),
                stock_actual:    parseInt(nuevoMaterial.stock_actual),
                stock_minimo:    parseInt(nuevoMaterial.stock_minimo),
            });

            // subir imagen si se seleccionó
            if (imagenNuevo && creado?.id_material) {
                const fd = new FormData();
                fd.append('imagen', imagenNuevo);
                await fetch(`${API_URL}/pedidos-personalizados/materiales/${creado.id_material}/imagen`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': import.meta.env.VITE_API_KEY,
                    },
                    credentials: 'include',
                    body: fd,
                });
            }

            setNuevoMaterial(MATERIAL_VACIO);
            setImagenNuevo(null);
            setMostrarFormulario(false);
            await cargarMateriales();
        } catch { alert('Error al registrar el material.'); }
        finally { setGuardando(false); }
    };

    // ── EDITAR DATOS ───────────────────────────────────────
    const abrirEdicion = (m) => {
        setEditando(m);
        setEditForm({
            nombre:          m.nombre,
            tipo:            m.tipo,
            unidad:          m.unidad,
            precio_unitario: m.precio_unitario,
            stock_actual:    m.stock_actual,
            stock_minimo:    m.stock_minimo ?? 5,
        });
        setImagenEdit(null);
    };

    // ── GESTIONAR COLORES/DISEÑOS (modal aparte) ────────────
    const abrirColoresDisenos = (m) => {
        setGestionando(m);
        setNuevoColorNombre('');
        setNuevoColorHex('#c45a77');
        setNuevoDisenoNombre('');
        setNuevoDisenoImagen(null);
        cargarColoresDisenos(m.id_material);
    };

    // ── Colores y diseños: cargar ─────────────────────────
    const cargarColoresDisenos = async (id_material) => {
        setCargandoColoresDisenos(true);
        try {
            const [cols, dis] = await Promise.all([
                apiGet(`/pedidos-personalizados/materiales/${id_material}/colores`),
                apiGet(`/pedidos-personalizados/materiales/${id_material}/disenos`),
            ]);
            setColores(Array.isArray(cols) ? cols : []);
            setDisenos(Array.isArray(dis) ? dis : []);
        } catch (err) {
            console.error('Error al cargar colores/diseños:', err);
        } finally {
            setCargandoColoresDisenos(false);
        }
    };

    // ── Colores: crear / eliminar ─────────────────────────
    const handleAgregarColor = async (e) => {
        e.preventDefault();
        if (!nuevoColorNombre.trim()) { alert('El color necesita un nombre.'); return; }
        setGuardandoColor(true);
        try {
            await apiPost(`/pedidos-personalizados/materiales/${gestionando.id_material}/colores`, {
                nombre: nuevoColorNombre.trim(),
                codigo_hex: nuevoColorHex,
            });
            setNuevoColorNombre('');
            setNuevoColorHex('#c45a77');
            await cargarColoresDisenos(gestionando.id_material);
        } catch (err) {
            alert(err?.response?.data?.message || 'Error al registrar el color.');
        } finally {
            setGuardandoColor(false);
        }
    };

    const handleEliminarColor = async (id_color) => {
        if (!window.confirm('¿Desactivar este color? Ya no aparecerá para elegir en pedidos nuevos.')) return;
        try {
            await apiDelete(`/pedidos-personalizados/materiales/colores/${id_color}`);
            await cargarColoresDisenos(gestionando.id_material);
        } catch (err) {
            alert(err?.response?.data?.message || 'Error al desactivar el color.');
        }
    };

    // ── Diseños: crear / eliminar ─────────────────────────
    const handleAgregarDiseno = async (e) => {
        e.preventDefault();
        if (!nuevoDisenoNombre.trim()) { alert('El diseño necesita un nombre.'); return; }
        setGuardandoDiseno(true);
        try {
            const creado = await apiPost(`/pedidos-personalizados/materiales/${gestionando.id_material}/disenos`, {
                nombre: nuevoDisenoNombre.trim(),
            });

            if (nuevoDisenoImagen && creado?.id_diseno) {
                const fd = new FormData();
                fd.append('imagen', nuevoDisenoImagen);
                await fetch(`${API_URL}/pedidos-personalizados/materiales/disenos/${creado.id_diseno}/imagen`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': import.meta.env.VITE_API_KEY,
                    },
                    credentials: 'include',
                    body: fd,
                });
            }

            setNuevoDisenoNombre('');
            setNuevoDisenoImagen(null);
            await cargarColoresDisenos(gestionando.id_material);
        } catch (err) {
            alert(err?.response?.data?.message || 'Error al registrar el diseño.');
        } finally {
            setGuardandoDiseno(false);
        }
    };

    const handleEliminarDiseno = async (id_diseno) => {
        if (!window.confirm('¿Desactivar este diseño? Ya no aparecerá para elegir en pedidos nuevos.')) return;
        try {
            await apiDelete(`/pedidos-personalizados/materiales/disenos/${id_diseno}`);
            await cargarColoresDisenos(gestionando.id_material);
        } catch (err) {
            alert(err?.response?.data?.message || 'Error al desactivar el diseño.');
        }
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        setGuardandoEdit(true);
        try {
            // 1. actualizar datos
            await apiPatch(`/pedidos-personalizados/materiales/${editando.id_material}`, {
                nombre:          editForm.nombre,
                tipo:            editForm.tipo,
                unidad:          editForm.unidad,
                precio_unitario: parseFloat(editForm.precio_unitario),
                stock_actual:    parseInt(editForm.stock_actual),
                stock_minimo:    parseInt(editForm.stock_minimo),
            });

            // 2. subir imagen si se seleccionó
            if (imagenEdit) {
                const fd = new FormData();
                fd.append('imagen', imagenEdit);
                await fetch(`${API_URL}/pedidos-personalizados/materiales/${editando.id_material}/imagen`, {
                    method: 'POST',
                    headers: {
                        'x-api-key': import.meta.env.VITE_API_KEY,
                    },
                    credentials: 'include',
                    body: fd,
                });
            }

            setEditando(null);
            await cargarMateriales();
        } catch { alert('Error al actualizar el material.'); }
        finally { setGuardandoEdit(false); }
    };

    // ── RENDER ─────────────────────────────────────────────
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="contenido">
                <div className="cuadro-blanco materiales">

                    {/* Header */}
                    <div className="materiales-header">
                        <h2>Materiales</h2>
                        <button className="btn-registrar" onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditando(null); }}>
                            <i className="fa-solid fa-plus"></i> Registrar material
                        </button>
                    </div>

                    {/* ── Formulario CREAR ── */}
                    {mostrarFormulario && (
                        <form onSubmit={handleRegistrar} style={{
                            background: '#f8f9fa', padding: '20px', borderRadius: '8px',
                            marginBottom: '20px', border: '1px solid #dee2e6',
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'
                        }}>
                            <div className="campo">
                                <label>Nombre *</label>
                                <input type="text" value={nuevoMaterial.nombre}
                                    onChange={e => setNuevoMaterial(p => ({ ...p, nombre: e.target.value }))}
                                    placeholder="Ej: Ovejero" required />
                            </div>
                            <div className="campo">
                                <label>Tipo *</label>
                                <select value={nuevoMaterial.tipo}
                                    onChange={e => setNuevoMaterial(p => ({ ...p, tipo: e.target.value }))}>
                                    {['Tela','Bordado','Diseño','Relleno','Accesorio'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="campo">
                                <label>Unidad *</label>
                                <select value={nuevoMaterial.unidad}
                                    onChange={e => setNuevoMaterial(p => ({ ...p, unidad: e.target.value }))}>
                                    <option value="metro">Metro</option>
                                    <option value="unidad">Unidad</option>
                                </select>
                            </div>
                            <div className="campo">
                                <label>Precio unitario *</label>
                                <input type="number" min="0" step="0.01" value={nuevoMaterial.precio_unitario}
                                    onChange={e => setNuevoMaterial(p => ({ ...p, precio_unitario: e.target.value }))}
                                    placeholder="Ej: 15000" required />
                            </div>
                            <div className="campo">
                                <label>Stock inicial *</label>
                                <input type="number" min="0" value={nuevoMaterial.stock_actual}
                                    onChange={e => setNuevoMaterial(p => ({ ...p, stock_actual: e.target.value }))}
                                    placeholder="Ej: 50" required />
                            </div>
                            <div className="campo">
                                <label>Stock mínimo</label>
                                <input type="number" min="0" value={nuevoMaterial.stock_minimo}
                                    onChange={e => setNuevoMaterial(p => ({ ...p, stock_minimo: e.target.value }))} />
                            </div>

                            {/* Imagen */}
                            <div className="campo" style={{ gridColumn: '1 / -1' }}>
                                <label>Imagen (opcional)</label>
                                <input type="file" accept="image/*" ref={fileNuevoRef} style={{ display: 'none' }}
                                    onChange={e => setImagenNuevo(e.target.files[0])} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button type="button" className="btn-categoria"
                                        onClick={() => fileNuevoRef.current.click()}>
                                        <i className="fa-solid fa-image"></i> Seleccionar imagen
                                    </button>
                                    {imagenNuevo && (
                                        <span style={{ fontSize: '13px', color: '#555' }}>
                                            {imagenNuevo.name}
                                            <button type="button" onClick={() => setImagenNuevo(null)}
                                                style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '16px' }}>✕</button>
                                        </span>
                                    )}
                                    {imagenNuevo && (
                                        <img src={URL.createObjectURL(imagenNuevo)} alt="preview"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #ddd' }} />
                                    )}
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-guardar" disabled={guardando}>
                                    {guardando ? 'Guardando...' : 'Guardar material'}
                                </button>
                                <button type="button" className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Modal EDITAR ── */}
                    {editando && (
                        <div style={{
                            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                        }}>
                            <div style={{
                                background: '#fff', borderRadius: '12px', padding: '30px',
                                width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                            }}>
                                <h3 style={{ marginTop: 0, color: '#5a3d54', borderBottom: '2px solid #e0d0e0', paddingBottom: '10px' }}>
                                    Editar material — {editando.nombre}
                                </h3>

                                <form onSubmit={handleGuardarEdicion}
                                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                                    <div className="campo">
                                        <label>Nombre *</label>
                                        <input type="text" value={editForm.nombre}
                                            onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} required />
                                    </div>
                                    <div className="campo">
                                        <label>Tipo *</label>
                                        <select value={editForm.tipo}
                                            onChange={e => setEditForm(p => ({ ...p, tipo: e.target.value }))}>
                                            {['Tela','Bordado','Diseño','Relleno','Accesorio'].map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="campo">
                                        <label>Unidad *</label>
                                        <select value={editForm.unidad}
                                            onChange={e => setEditForm(p => ({ ...p, unidad: e.target.value }))}>
                                            <option value="metro">Metro</option>
                                            <option value="unidad">Unidad</option>
                                        </select>
                                    </div>
                                    <div className="campo">
                                        <label>Precio unitario *</label>
                                        <input type="number" min="0" step="0.01" value={editForm.precio_unitario}
                                            onChange={e => setEditForm(p => ({ ...p, precio_unitario: e.target.value }))} required />
                                    </div>
                                    <div className="campo">
                                        <label>Stock actual</label>
                                        <input type="number" min="0" value={editForm.stock_actual}
                                            onChange={e => setEditForm(p => ({ ...p, stock_actual: e.target.value }))} />
                                    </div>
                                    <div className="campo">
                                        <label>Stock mínimo</label>
                                        <input type="number" min="0" value={editForm.stock_minimo}
                                            onChange={e => setEditForm(p => ({ ...p, stock_minimo: e.target.value }))} />
                                    </div>

                                    {/* Imagen actual + cambiar */}
                                    <div className="campo" style={{ gridColumn: '1 / -1' }}>
                                        <label>Imagen</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                            {/* imagen actual */}
                                            {editando.ruta_imagen && !imagenEdit && (
                                                <img src={`${API_URL}${editando.ruta_imagen}`} alt="actual"
                                                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }} />
                                            )}
                                            {/* preview nueva */}
                                            {imagenEdit && (
                                                <img src={URL.createObjectURL(imagenEdit)} alt="nueva"
                                                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #c45a77' }} />
                                            )}
                                            <div>
                                                <input type="file" accept="image/*" ref={fileEditRef} style={{ display: 'none' }}
                                                    onChange={e => setImagenEdit(e.target.files[0])} />
                                                <button type="button" className="btn-categoria"
                                                    onClick={() => fileEditRef.current.click()}>
                                                    <i className="fa-solid fa-image"></i> {editando.ruta_imagen ? 'Cambiar imagen' : 'Subir imagen'}
                                                </button>
                                                {imagenEdit && (
                                                    <button type="button" onClick={() => setImagenEdit(null)}
                                                        style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                                                        ✕ Cancelar cambio
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '8px' }}>
                                        <button type="submit" className="btn-guardar" disabled={guardandoEdit}>
                                            {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
                                        </button>
                                        <button type="button" className="btn-cancelar" onClick={() => setEditando(null)}>
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ── Modal COLORES Y DISEÑOS (solo Tela, botón aparte) ── */}
                    {gestionando && (
                        <div style={{
                            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                        }}>
                            <div style={{
                                background: '#fff', borderRadius: '12px', padding: '30px',
                                width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                            }}>
                                <h3 style={{ marginTop: 0, color: '#5a3d54', borderBottom: '2px solid #e0d0e0', paddingBottom: '10px' }}>
                                    Colores y diseños — {gestionando.nombre}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#9a7a8a', marginTop: '10px', marginBottom: '16px' }}>
                                    Esto es lo que el cliente podrá elegir al personalizar una sábana o cubrelecho con esta tela.
                                </p>

                                {cargandoColoresDisenos ? (
                                            <p style={{ color: '#9a7a8a' }}>Cargando colores y diseños...</p>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>

                                                {/* ── Colores ── */}
                                                <div>
                                                    <h4 style={{ marginBottom: '10px', color: '#5a3d54' }}>Colores</h4>

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                                        {colores.length === 0 && (
                                                            <p style={{ fontSize: '13px', color: '#9a7a8a' }}>
                                                                Aún no hay colores registrados para esta tela.
                                                            </p>
                                                        )}
                                                        {colores.map(c => (
                                                            <div key={c.id_color} style={{
                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                padding: '6px 10px', borderRadius: '20px',
                                                                border: '1.5px solid #e8d5e0', background: '#fdf8fb',
                                                                fontSize: '13px', color: '#5a3d54',
                                                            }}>
                                                                {c.codigo_hex && (
                                                                    <span style={{
                                                                        width: '16px', height: '16px', borderRadius: '50%',
                                                                        background: c.codigo_hex, display: 'inline-block',
                                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                                    }} />
                                                                )}
                                                                {c.nombre}
                                                                <button type="button" onClick={() => handleEliminarColor(c.id_color)}
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '14px' }}
                                                                    title="Desactivar color">
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <form onSubmit={handleAgregarColor} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input type="color" value={nuevoColorHex}
                                                            onChange={e => setNuevoColorHex(e.target.value)}
                                                            style={{ width: '38px', height: '34px', padding: '2px', border: '1.5px solid #e8d5e0', borderRadius: '6px', cursor: 'pointer' }} />
                                                        <input type="text" placeholder="Nombre del color" value={nuevoColorNombre}
                                                            onChange={e => setNuevoColorNombre(e.target.value)}
                                                            style={{ flex: 1, minWidth: 0 }} />
                                                        <button type="submit" className="btn-guardar" disabled={guardandoColor} style={{ whiteSpace: 'nowrap' }}>
                                                            {guardandoColor ? '...' : '+ Agregar'}
                                                        </button>
                                                    </form>
                                                </div>

                                                {/* ── Diseños ── */}
                                                <div>
                                                    <h4 style={{ marginBottom: '10px', color: '#5a3d54' }}>Diseños / estampados</h4>

                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                                        {disenos.length === 0 && (
                                                            <p style={{ fontSize: '13px', color: '#9a7a8a' }}>
                                                                Aún no hay diseños registrados para esta tela.
                                                            </p>
                                                        )}
                                                        {disenos.map(d => (
                                                            <div key={d.id_diseno} style={{
                                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                                width: '76px',
                                                            }}>
                                                                {d.ruta_imagen ? (
                                                                    <img src={`${API_URL}${d.ruta_imagen}`} alt={d.nombre}
                                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e8d5e0' }} />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '60px', height: '60px', borderRadius: '8px',
                                                                        border: '2px dashed #e8d5e0', display: 'flex',
                                                                        alignItems: 'center', justifyContent: 'center',
                                                                        fontSize: '10px', color: '#9a7a8a', textAlign: 'center',
                                                                    }}>
                                                                        Sin imagen
                                                                    </div>
                                                                )}
                                                                <span style={{ fontSize: '11px', color: '#5a3d54', textAlign: 'center' }}>{d.nombre}</span>
                                                                <button type="button" onClick={() => handleEliminarDiseno(d.id_diseno)}
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '11px' }}>
                                                                    Desactivar
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <form onSubmit={handleAgregarDiseno} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <input type="text" placeholder="Nombre del diseño" value={nuevoDisenoNombre}
                                                            onChange={e => setNuevoDisenoNombre(e.target.value)} />
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <input type="file" accept="image/*" ref={fileDisenoRef} style={{ display: 'none' }}
                                                                onChange={e => setNuevoDisenoImagen(e.target.files[0])} />
                                                            <button type="button" className="btn-categoria" onClick={() => fileDisenoRef.current.click()}>
                                                                <i className="fa-solid fa-image"></i> {nuevoDisenoImagen ? nuevoDisenoImagen.name : 'Foto del diseño'}
                                                            </button>
                                                            <button type="submit" className="btn-guardar" disabled={guardandoDiseno} style={{ whiteSpace: 'nowrap' }}>
                                                                {guardandoDiseno ? '...' : '+ Agregar'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>

                                            </div>
                                        )}

                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-cancelar" onClick={() => setGestionando(null)}>
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <div className="alerta error" style={{ marginBottom: '16px' }}>{error}</div>}

                    {/* Stats */}
                    <div className="materiales-stats">
                        <div className="material-stat-card rosa">
                            <span className="material-stat-label">Total materiales</span>
                            <span className="material-stat-value">{total}</span>
                        </div>
                        <div className="material-stat-card amarillo">
                            <span className="material-stat-label">Stock bajo</span>
                            <span className="material-stat-value">{stockBajo}</span>
                            <span className="material-stat-sub">Por debajo del mínimo</span>
                        </div>
                        <div className="material-stat-card rojo">
                            <span className="material-stat-label">Sin stock</span>
                            <span className="material-stat-value">{sinStock}</span>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="materiales-controles">
                        <input type="text" className="materiales-buscar" placeholder="Buscar material..."
                            value={buscar} onChange={e => setBuscar(e.target.value)} />
                        <select className="materiales-filtro-tipo" value={tipoFiltro}
                            onChange={e => setTipoFiltro(e.target.value)}>
                            {TIPOS.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="resultado-contador">
                        Mostrando <strong>{materialesFiltrados.length}</strong> de {total} materiales
                    </div>

                    {/* Tabla */}
                    {loading ? (
                        <div className="tabla-vacia-mensaje"><p>Cargando materiales...</p></div>
                    ) : (
                        <div className="tabla-scroll">
                            <table className="tabla">
                                <thead>
                                    <tr>
                                        <th>Imagen</th>
                                        <th>Nombre</th>
                                        <th>Tipo</th>
                                        <th>Unidad</th>
                                        <th>Precio unitario</th>
                                        <th>Stock actual</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materialesFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className="tabla-vacia-mensaje"><p>No se encontraron materiales</p></div>
                                            </td>
                                        </tr>
                                    ) : materialesFiltrados.map(m => (
                                        <tr key={m.id_material}>
                                            <td>
                                                {m.ruta_imagen
                                                    ? <img src={`${API_URL}${m.ruta_imagen}`} alt={m.nombre} className="material-img" />
                                                    : <div className="material-sin-img">Sin imagen</div>
                                                }
                                            </td>
                                            <td style={{ fontWeight: 600, color: '#5a3d54' }}>{m.nombre}</td>
                                            <td>
                                                <span className={`badge-tipo-material ${TIPO_COLORS[m.tipo] || ''}`}>{m.tipo}</span>
                                            </td>
                                            <td className="celda-gris">{m.unidad}</td>
                                            <td className="material-precio">{formatPrice(m.precio_unitario)}</td>
                                            <td>
                                                <span className={getStockClass(m)}>
                                                    {m.stock_actual} {m.unidad}s
                                                </span>
                                                {m.stock_actual > 0 && m.stock_actual <= (m.stock_minimo ?? 5) && (
                                                    <span className="stock-minimo-alerta">⚠ Por debajo del mínimo</span>
                                                )}
                                                {m.stock_actual === 0 && (
                                                    <span className="stock-minimo-alerta">Agotado</span>
                                                )}
                                            </td>
                                            <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                <button className="editar" onClick={() => abrirEdicion(m)}>
                                                    Editar
                                                </button>
                                                {m.tipo === 'Tela' && (
                                                    <button className="btn-categoria" onClick={() => abrirColoresDisenos(m)}>
                                                        Colores/Diseños
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Materiales;