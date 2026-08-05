import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../components/css/styles.css";
import p_sabana from "../../assets/sabana.webp";
import Header from '../../components/Header_c.jsx';
import Footer from '../../components/Footer.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { apiGet, apiPost } from '../../context/api.js';

const METROS_POR_TAMANO = {
    cuna:        3,
    individual:  6,
    doble:       8,
    rey:         10,
    rey_europeo: 11,
    emperador:   12,
};
const METROS_ALMOHADA    = 1;
const METROS_SOBRESABANA = 2;

const TAMANO_LABEL = {
    cuna:        'Cuna (100x145 cm)',
    individual:  'Individual (180x275 cm)',
    doble:       'Doble (230x275 cm)',
    rey:         'Rey (275x275 cm)',
    rey_europeo: 'Rey europeo (300x275 cm)',
    emperador:   'Emperador (320x290 cm)',
};

const TAMANOS = [
    { value: 'cuna',        label: 'Cuna',        dim: '100 x 145 cm' },
    { value: 'individual',  label: 'Individual',  dim: '180 x 275 cm' },
    { value: 'doble',       label: 'Doble',       dim: '230 x 275 cm' },
    { value: 'rey',         label: 'Rey',         dim: '275 x 275 cm' },
    { value: 'rey_europeo', label: 'Rey europeo', dim: '300 x 275 cm' },
    { value: 'emperador',   label: 'Emperador',   dim: '320 x 290 cm' },
];

const PersonalizarSabana = () => {
    const { usuarioActual } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tamano, setTamano]                       = useState('');
    const [almohadas, setAlmohadas]                 = useState('no');
    const [sobresabana, setSobresabana]             = useState(false);
    const [telaSeleccionada, setTelaSeleccionada]   = useState(null);
    const [telas, setTelas]                         = useState([]);
    const [cargandoTelas, setCargandoTelas]         = useState(true);
    const [enviando, setEnviando]                   = useState(false);
    const [mensaje, setMensaje]                     = useState({ text: '', type: '' });

    // colores y diseños
    const [colores, setColores]                     = useState([]);
    const [disenos, setDisenos]                     = useState([]);
    const [colorSeleccionado, setColorSeleccionado] = useState(null);
    const [disenoSeleccionado, setDisenoSeleccionado] = useState(null);
    const [cargandoOpciones, setCargandoOpciones]   = useState(false);

    useEffect(() => {
        const fetchTelas = async () => {
            try {
                const data = await apiGet('/pedidos-personalizados/materiales/Tela');
                setTelas(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error al cargar telas:', err);
            } finally {
                setCargandoTelas(false);
            }
        };
        fetchTelas();
    }, []);

    // Cuando cambia la tela seleccionada, cargar sus colores y diseños
    useEffect(() => {
        if (!telaSeleccionada) {
            setColores([]);
            setDisenos([]);
            setColorSeleccionado(null);
            setDisenoSeleccionado(null);
            return;
        }
        const fetchOpciones = async () => {
            setCargandoOpciones(true);
            try {
                const [cols, dis] = await Promise.all([
                    apiGet(`/pedidos-personalizados/materiales/${telaSeleccionada.id_material}/colores`),
                    apiGet(`/pedidos-personalizados/materiales/${telaSeleccionada.id_material}/disenos`),
                ]);
                setColores(Array.isArray(cols) ? cols : []);
                setDisenos(Array.isArray(dis) ? dis : []);
                setColorSeleccionado(null);
                setDisenoSeleccionado(null);
            } catch (err) {
                console.error('Error al cargar colores/diseños:', err);
            } finally {
                setCargandoOpciones(false);
            }
        };
        fetchOpciones();
    }, [telaSeleccionada]);

    const formatPrice = (price) =>
        Number(price)?.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const calcularMetros = () => {
        let metros = METROS_POR_TAMANO[tamano] || 0;
        if (almohadas === 'una') metros += METROS_ALMOHADA;
        if (almohadas === 'dos') metros += METROS_ALMOHADA * 2;
        if (sobresabana) metros += METROS_SOBRESABANA;
        return metros;
    };

    const calcularPrecio = () => {
        if (!tamano || !telaSeleccionada) return null;
        const subtotal = calcularMetros() * Number(telaSeleccionada.precio_unitario);
        return Math.ceil(subtotal / 1000) * 1000;
    };

    const precio = calcularPrecio();
    const puedeConfirmar = tamano && telaSeleccionada && almohadas;

    const handleConfirmar = async () => {
        if (!usuarioActual?.id_usuario) {
            setMensaje({ text: 'Debes iniciar sesión para hacer un pedido.', type: 'error' });
            return;
        }
        if (!puedeConfirmar) {
            setMensaje({ text: 'Completa todas las opciones antes de confirmar.', type: 'error' });
            return;
        }

        setEnviando(true);
        setMensaje({ text: '', type: '' });

        const metros = calcularMetros();
        const dto = {
            id_usuario:    usuarioActual.id_usuario,
            tipo_producto: 'Sábana',
            tamanio:       TAMANO_LABEL[tamano],
            metodo_pago:   'Mtd_PD',
            materiales: [{ id_material: telaSeleccionada.id_material, cantidad: metros }],
        };

        try {
            const response = await apiPost('/pedidos-personalizados', dto);
            sessionStorage.setItem('ticketPersonalizado', JSON.stringify({
                num_ticket:   response.num_ticket,
                id_pedido:    response.id_pedido,
                precio_total: response.precio_total,
                tipo:         'Sábana',
                tamano:       TAMANO_LABEL[tamano],
                tela:         telaSeleccionada.nombre,
                color:        colorSeleccionado?.nombre || null,
                diseno:       disenoSeleccionado?.nombre || null,
                sobresabana,
                almohadas,
                metros,
                usuario: {
                    nombre:     `${usuarioActual.nom_1} ${usuarioActual.ape_1}`,
                    correo:     usuarioActual.correo,
                    telefono:   usuarioActual.telefono,
                    id_usuario: usuarioActual.id_usuario,
                },
            }));
            navigate('/ticket_personalizado');
        } catch (error) {
            setMensaje({ text: error.message || 'Error al confirmar el pedido.', type: 'error' });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="app-container">
            <Header />
            <main className="personalizar-main">

                <div className="personalizar-topbar">
                    <Link to="/pedidos_personalizados" className="btn-volver-ped">← Volver</Link>
                    <h2>Personalizar sábana</h2>
                </div>

                {mensaje.text && (
                    <div className={`alerta ${mensaje.type}`} style={{ margin: '0 20px 16px' }}>
                        {mensaje.text}
                    </div>
                )}

                <div className="personalizar-layout">

                    {/* Columna izquierda */}
                    <div className="personalizar-col-imagen">
                        <img src={p_sabana} alt="Sábana" className="personalizar-imagen" />
                        <div className="personalizar-imagen-info">
                            <p className="personalizar-nota">
                                El precio se calcula según la tela y el tamaño seleccionados.
                            </p>

                            {telaSeleccionada && tamano && (
                                <div style={{
                                    background: '#fdf8fb', border: '1.5px solid #f0d8e5',
                                    borderRadius: '10px', padding: '12px 14px',
                                    fontSize: '0.82rem', color: '#5a3d54', lineHeight: '1.8',
                                    marginBottom: '12px'
                                }}>
                                    <div><strong>Tela:</strong> {telaSeleccionada.nombre}</div>
                                    {colorSeleccionado && <div><strong>Color:</strong> {colorSeleccionado.nombre}</div>}
                                    {disenoSeleccionado && <div><strong>Diseño:</strong> {disenoSeleccionado.nombre}</div>}
                                    <div><strong>Tamaño:</strong> {TAMANO_LABEL[tamano]}</div>
                                    <div><strong>Metros:</strong> {calcularMetros()} m</div>
                                    {sobresabana && <div>Incluye sobresábana</div>}
                                    {almohadas !== 'no' && (
                                        <div>{almohadas === 'una' ? '1 funda' : '2 fundas'} de almohada</div>
                                    )}
                                </div>
                            )}

                            <div className="personalizar-precio-box">
                                <span className="personalizar-precio-label">Precio estimado</span>
                                <span className="personalizar-precio-valor">
                                    {precio ? formatPrice(precio) : '—'}
                                </span>
                            </div>

                            <button
                                className="btn-confirmar-ped"
                                disabled={!puedeConfirmar || enviando}
                                onClick={handleConfirmar}
                            >
                                {enviando ? 'Procesando...' : 'Confirmar pedido'}
                            </button>
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="personalizar-col-opciones">

                        {/* Tamaño */}
                        <div className="opcion-seccion">
                            <h3>Tamaño de sábana</h3>
                            <div className="opciones-radio-grid">
                                {TAMANOS.map(t => (
                                    <label key={t.value} className={`radio-card ${tamano === t.value ? 'seleccionado' : ''}`}>
                                        <input type="radio" name="tamano" value={t.value}
                                            checked={tamano === t.value}
                                            onChange={e => setTamano(e.target.value)} />
                                        <span>{t.label} <small style={{ color: '#9a7a8a', fontSize: '0.8rem' }}>({t.dim})</small></span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tipo de tela */}
                        <div className="opcion-seccion">
                            <h3>Tipo de tela</h3>
                            {cargandoTelas ? (
                                <p style={{ color: '#9a7a8a' }}>Cargando telas...</p>
                            ) : telas.length === 0 ? (
                                <p style={{ color: '#e74c3c' }}>No hay telas disponibles.</p>
                            ) : (
                                <div className="lista-telas">
                                    {telas.map(tela => (
                                        <div key={tela.id_material}
                                            className={`tela-item ${telaSeleccionada?.id_material === tela.id_material ? 'activo' : ''}`}
                                            onClick={() => setTelaSeleccionada(tela)}
                                        >
                                            {telaSeleccionada?.id_material === tela.id_material ? '✓ ' : ''}
                                            {tela.nombre}
                                            <small style={{ color: '#9a7a8a', marginLeft: '8px' }}>
                                                {formatPrice(tela.precio_unitario)}/metro
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Colores — aparece solo si la tela tiene colores */}
                        {telaSeleccionada && (
                            <div className="opcion-seccion">
                                <h3>Color de tela</h3>
                                {cargandoOpciones ? (
                                    <p style={{ color: '#9a7a8a' }}>Cargando colores...</p>
                                ) : colores.length === 0 ? (
                                    <p style={{ fontSize: '0.88rem', color: '#9a7a8a' }}>
                                        Esta tela no tiene colores registrados aún.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {colores.map(c => (
                                            <div
                                                key={c.id_color}
                                                onClick={() => setColorSeleccionado(
                                                    colorSeleccionado?.id_color === c.id_color ? null : c
                                                )}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
                                                    border: colorSeleccionado?.id_color === c.id_color
                                                        ? '2px solid #c45a77'
                                                        : '2px solid #e8d5e0',
                                                    background: colorSeleccionado?.id_color === c.id_color
                                                        ? '#fff0f5' : '#fdf8fb',
                                                    fontSize: '0.88rem', fontWeight: 500,
                                                    color: '#5a3d54',
                                                }}
                                            >
                                                {c.codigo_hex && (
                                                    <span style={{
                                                        width: '18px', height: '18px', borderRadius: '50%',
                                                        background: c.codigo_hex, flexShrink: 0,
                                                        border: '1.5px solid rgba(0,0,0,0.1)',
                                                        display: 'inline-block',
                                                    }} />
                                                )}
                                                {c.nombre}
                                                {colorSeleccionado?.id_color === c.id_color && ' ✓'}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Diseños — aparece solo si la tela tiene diseños */}
                        {telaSeleccionada && disenos.length > 0 && (
                            <div className="opcion-seccion">
                                <h3>Diseño / Estampado</h3>
                                <div className="lista-telas">
                                    {disenos.map(d => (
                                        <div
                                            key={d.id_diseno}
                                            className={`tela-item ${disenoSeleccionado?.id_diseno === d.id_diseno ? 'activo' : ''}`}
                                            onClick={() => setDisenoSeleccionado(
                                                disenoSeleccionado?.id_diseno === d.id_diseno ? null : d
                                            )}
                                        >
                                            {disenoSeleccionado?.id_diseno === d.id_diseno ? '✓ ' : ''}
                                            {d.nombre}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Extras */}
                        <div className="opcion-seccion">
                            <h3>Extras</h3>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={sobresabana}
                                    onChange={e => setSobresabana(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }} />
                                <div>
                                    <strong>Incluir sobresábana</strong>
                                    <small style={{ display: 'block', color: '#9a7a8a' }}>
                                        +{METROS_SOBRESABANA} metros de tela adicionales
                                    </small>
                                </div>
                            </label>

                            <h4 style={{ marginBottom: '8px', color: '#5a3d54' }}>Fundas de almohada</h4>
                            <div className="metodo-pago-grid">
                                {[
                                    { value: 'no',  label: 'Sin fundas', sub: 'No incluir' },
                                    { value: 'una', label: 'Una funda',  sub: `+${METROS_ALMOHADA} metro de tela` },
                                    { value: 'dos', label: 'Dos fundas', sub: `+${METROS_ALMOHADA * 2} metros de tela` },
                                ].map(a => (
                                    <label key={a.value} className={`metodo-pago-opcion ${almohadas === a.value ? 'seleccionado' : ''}`}>
                                        <input type="radio" name="almohada" value={a.value}
                                            checked={almohadas === a.value}
                                            onChange={e => setAlmohadas(e.target.value)} />
                                        <div className="metodo-pago-texto">
                                            <strong>{a.label}</strong>
                                            <span>{a.sub}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PersonalizarSabana;