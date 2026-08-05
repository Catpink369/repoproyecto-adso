import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../components/css/styles.css";
import p_cubrelechos from "../../assets/cubrelecho.webp";
import Header from '../../components/Header_c.jsx';
import Footer from '../../components/Footer.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import { apiGet, apiPost } from '../../context/api.js';

const METROS_POR_TAMANO = {
    sencilla:  4,
    semidoble: 5,
    doble:     6,
    queen:     7,
    king:      8,
};

const TAMANO_LABEL = {
    sencilla:  'Sencilla',
    semidoble: 'Semidoble',
    doble:     'Doble',
    queen:     'Queen',
    king:      'King',
};

const TAMANOS = [
    { value: 'sencilla',  label: 'Sencilla' },
    { value: 'semidoble', label: 'Semidoble' },
    { value: 'doble',     label: 'Doble' },
    { value: 'queen',     label: 'Queen' },
    { value: 'king',      label: 'King' },
];

const PersonalizarCubrelecho = () => {
    const { usuarioActual } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tamano, setTamano]               = useState('');
    const [ladoActivo, setLadoActivo]       = useState('lado1');
    const [telaLado1, setTelaLado1]         = useState(null);
    const [telaLado2, setTelaLado2]         = useState(null);
    const [telas, setTelas]                 = useState([]);
    const [cargandoTelas, setCargandoTelas] = useState(true);
    const [enviando, setEnviando]           = useState(false);
    const [mensaje, setMensaje]             = useState({ text: '', type: '' });

    // colores y diseños por lado
    const [coloresL1, setColoresL1]                   = useState([]);
    const [coloresL2, setColoresL2]                   = useState([]);
    const [disenosL1, setDisenosL1]                   = useState([]);
    const [disenosL2, setDisenosL2]                   = useState([]);
    const [colorL1, setColorL1]                       = useState(null);
    const [colorL2, setColorL2]                       = useState(null);
    const [disenoL1, setDisenoL1]                     = useState(null);
    const [disenoL2, setDisenoL2]                     = useState(null);
    const [cargandoOpcionesL1, setCargandoOpcionesL1] = useState(false);
    const [cargandoOpcionesL2, setCargandoOpcionesL2] = useState(false);

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

    // Cargar colores/diseños cuando cambia la tela del lado 1
    useEffect(() => {
        if (!telaLado1) { setColoresL1([]); setDisenosL1([]); setColorL1(null); setDisenoL1(null); return; }
        const fetch = async () => {
            setCargandoOpcionesL1(true);
            try {
                const [cols, dis] = await Promise.all([
                    apiGet(`/pedidos-personalizados/materiales/${telaLado1.id_material}/colores`),
                    apiGet(`/pedidos-personalizados/materiales/${telaLado1.id_material}/disenos`),
                ]);
                setColoresL1(Array.isArray(cols) ? cols : []);
                setDisenosL1(Array.isArray(dis) ? dis : []);
                setColorL1(null); setDisenoL1(null);
            } catch (err) { console.error('Error opciones lado 1:', err); }
            finally { setCargandoOpcionesL1(false); }
        };
        fetch();
    }, [telaLado1]);

    // Cargar colores/diseños cuando cambia la tela del lado 2
    useEffect(() => {
        if (!telaLado2) { setColoresL2([]); setDisenosL2([]); setColorL2(null); setDisenoL2(null); return; }
        const fetch = async () => {
            setCargandoOpcionesL2(true);
            try {
                const [cols, dis] = await Promise.all([
                    apiGet(`/pedidos-personalizados/materiales/${telaLado2.id_material}/colores`),
                    apiGet(`/pedidos-personalizados/materiales/${telaLado2.id_material}/disenos`),
                ]);
                setColoresL2(Array.isArray(cols) ? cols : []);
                setDisenosL2(Array.isArray(dis) ? dis : []);
                setColorL2(null); setDisenoL2(null);
            } catch (err) { console.error('Error opciones lado 2:', err); }
            finally { setCargandoOpcionesL2(false); }
        };
        fetch();
    }, [telaLado2]);

    const formatPrice = (price) =>
        Number(price)?.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const calcularMetros   = () => METROS_POR_TAMANO[tamano] || 0;
    const metrosPorLado    = () => calcularMetros() / 2;

    const calcularPrecio = () => {
        if (!tamano || !telaLado1 || !telaLado2) return null;
        const mitad = calcularMetros() / 2;
        const total = (mitad * Number(telaLado1.precio_unitario)) +
                      (mitad * Number(telaLado2.precio_unitario));
        return Math.ceil(total / 1000) * 1000;
    };

    const precio         = calcularPrecio();
    const puedeConfirmar = tamano && telaLado1 && telaLado2;

    // helpers para el lado activo
    const telaActual    = ladoActivo === 'lado1' ? telaLado1 : telaLado2;
    const setTelaActual = ladoActivo === 'lado1' ? setTelaLado1 : setTelaLado2;
    const coloresActual      = ladoActivo === 'lado1' ? coloresL1 : coloresL2;
    const disenosActual      = ladoActivo === 'lado1' ? disenosL1 : disenosL2;
    const colorActual        = ladoActivo === 'lado1' ? colorL1 : colorL2;
    const setColorActual     = ladoActivo === 'lado1' ? setColorL1 : setColorL2;
    const disenoActual       = ladoActivo === 'lado1' ? disenoL1 : disenoL2;
    const setDisenoActual    = ladoActivo === 'lado1' ? setDisenoL1 : setDisenoL2;
    const cargandoActual     = ladoActivo === 'lado1' ? cargandoOpcionesL1 : cargandoOpcionesL2;

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
        const mitad  = metros / 2;
        const materiales = [];

        const agregarMaterial = (id, cantidad) => {
            const existe = materiales.find(m => m.id_material === id);
            if (existe) { existe.cantidad += cantidad; }
            else { materiales.push({ id_material: id, cantidad }); }
        };
        agregarMaterial(telaLado1.id_material, mitad);
        agregarMaterial(telaLado2.id_material, mitad);

        const dto = {
            id_usuario:    usuarioActual.id_usuario,
            tipo_producto: 'Cubrelecho',
            tamanio:       TAMANO_LABEL[tamano],
            metodo_pago:   'Mtd_PD',
            materiales,
        };

        try {
            const response = await apiPost('/pedidos-personalizados', dto);
            sessionStorage.setItem('ticketPersonalizado', JSON.stringify({
                num_ticket:   response.num_ticket,
                id_pedido:    response.id_pedido,
                precio_total: response.precio_total,
                tipo:         'Cubrelecho',
                tamano:       TAMANO_LABEL[tamano],
                telaLado1:    telaLado1.nombre,
                telaLado2:    telaLado2.nombre,
                colorLado1:   colorL1?.nombre || null,
                colorLado2:   colorL2?.nombre || null,
                disenoLado1:  disenoL1?.nombre || null,
                disenoLado2:  disenoL2?.nombre || null,
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
                    <h2>Personalizar cubrelecho</h2>
                </div>

                {mensaje.text && (
                    <div className={`alerta ${mensaje.type}`} style={{ margin: '0 20px 16px' }}>
                        {mensaje.text}
                    </div>
                )}

                <div className="personalizar-layout">

                    {/* Columna izquierda */}
                    <div className="personalizar-col-imagen">
                        <img src={p_cubrelechos} alt="Cubrelecho" className="personalizar-imagen" />
                        <div className="personalizar-imagen-info">
                            <p className="personalizar-nota">
                                El precio puede variar según la disponibilidad de materiales al momento de confirmar.
                            </p>

                            {(telaLado1 || telaLado2) && tamano && (
                                <div style={{
                                    background: '#fdf8fb', border: '1.5px solid #f0d8e5',
                                    borderRadius: '10px', padding: '12px 14px',
                                    fontSize: '0.82rem', color: '#5a3d54', lineHeight: '1.8',
                                    marginBottom: '12px'
                                }}>
                                    <div><strong>Tamaño:</strong> {TAMANO_LABEL[tamano]}</div>
                                    <div><strong>Metros totales:</strong> {calcularMetros()} m</div>
                                    {telaLado1 && (
                                        <div>
                                            <strong>Lado 1:</strong> {telaLado1.nombre}
                                            {colorL1 && <span style={{ color: '#c45a77' }}> · {colorL1.nombre}</span>}
                                            {disenoL1 && <span style={{ color: '#9a7a8a' }}> · {disenoL1.nombre}</span>}
                                        </div>
                                    )}
                                    {telaLado2 && (
                                        <div>
                                            <strong>Lado 2:</strong> {telaLado2.nombre}
                                            {colorL2 && <span style={{ color: '#c45a77' }}> · {colorL2.nombre}</span>}
                                            {disenoL2 && <span style={{ color: '#9a7a8a' }}> · {disenoL2.nombre}</span>}
                                        </div>
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
                            <h3>Tamaño de cama</h3>
                            <div className="opciones-radio-grid">
                                {TAMANOS.map(t => (
                                    <label key={t.value} className={`radio-card ${tamano === t.value ? 'seleccionado' : ''}`}>
                                        <input type="radio" name="tamano" value={t.value}
                                            checked={tamano === t.value}
                                            onChange={e => setTamano(e.target.value)} />
                                        <span>{t.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tipo de tela + colores + diseños por lado */}
                        <div className="opcion-seccion">
                            <h3>Tipo de tela</h3>

                            <div className="botones-lado">
                                <button className={`btn-lado ${ladoActivo === 'lado1' ? 'activo' : ''}`}
                                    onClick={() => setLadoActivo('lado1')} type="button">
                                    Lado 1 {telaLado1 ? '✓' : ''}
                                </button>
                                <button className={`btn-lado ${ladoActivo === 'lado2' ? 'activo' : ''}`}
                                    onClick={() => setLadoActivo('lado2')} type="button">
                                    Lado 2 {telaLado2 ? '✓' : ''}
                                </button>
                            </div>

                            <div className="panel-tela">
                                <div className="grupo-telas">
                                    <h5>{ladoActivo === 'lado1' ? 'LADO 1' : 'LADO 2'}</h5>
                                    <h4>Telas disponibles</h4>
                                    {cargandoTelas ? (
                                        <p style={{ color: '#9a7a8a' }}>Cargando telas...</p>
                                    ) : telas.length === 0 ? (
                                        <p style={{ color: '#e74c3c' }}>No hay telas disponibles.</p>
                                    ) : (
                                        <div className="lista-telas">
                                            {telas.map(tela => (
                                                <div key={tela.id_material}
                                                    className={`tela-item ${telaActual?.id_material === tela.id_material ? 'activo' : ''}`}
                                                    onClick={() => setTelaActual(tela)}>
                                                    {telaActual?.id_material === tela.id_material ? '✓ ' : ''}
                                                    {tela.nombre}
                                                    <small style={{ color: '#9a7a8a', marginLeft: '8px' }}>
                                                        {formatPrice(tela.precio_unitario)}/metro
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Colores del lado activo */}
                        {telaActual && (
                            <div className="opcion-seccion">
                                <h3>Color — {ladoActivo === 'lado1' ? 'Lado 1' : 'Lado 2'}</h3>
                                {cargandoActual ? (
                                    <p style={{ color: '#9a7a8a' }}>Cargando colores...</p>
                                ) : coloresActual.length === 0 ? (
                                    <p style={{ fontSize: '0.88rem', color: '#9a7a8a' }}>
                                        Esta tela no tiene colores registrados aún.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {coloresActual.map(c => (
                                            <div key={c.id_color}
                                                onClick={() => setColorActual(
                                                    colorActual?.id_color === c.id_color ? null : c
                                                )}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
                                                    border: colorActual?.id_color === c.id_color
                                                        ? '2px solid #c45a77' : '2px solid #e8d5e0',
                                                    background: colorActual?.id_color === c.id_color
                                                        ? '#fff0f5' : '#fdf8fb',
                                                    fontSize: '0.88rem', fontWeight: 500, color: '#5a3d54',
                                                }}>
                                                {c.codigo_hex && (
                                                    <span style={{
                                                        width: '18px', height: '18px', borderRadius: '50%',
                                                        background: c.codigo_hex, flexShrink: 0,
                                                        border: '1.5px solid rgba(0,0,0,0.1)',
                                                        display: 'inline-block',
                                                    }} />
                                                )}
                                                {c.nombre}
                                                {colorActual?.id_color === c.id_color && ' ✓'}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Diseños del lado activo */}
                        {telaActual && disenosActual.length > 0 && (
                            <div className="opcion-seccion">
                                <h3>Diseño — {ladoActivo === 'lado1' ? 'Lado 1' : 'Lado 2'}</h3>
                                <div className="lista-telas">
                                    {disenosActual.map(d => (
                                        <div key={d.id_diseno}
                                            className={`tela-item ${disenoActual?.id_diseno === d.id_diseno ? 'activo' : ''}`}
                                            onClick={() => setDisenoActual(
                                                disenoActual?.id_diseno === d.id_diseno ? null : d
                                            )}>
                                            {disenoActual?.id_diseno === d.id_diseno ? '✓ ' : ''}
                                            {d.nombre}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PersonalizarCubrelecho;