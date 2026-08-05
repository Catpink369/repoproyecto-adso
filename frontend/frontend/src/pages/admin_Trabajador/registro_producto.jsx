import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import Sidebar from "../../components/Sidebar_p-a";
import HeaderPanel from "../../components/HeaderPanel";
import "../../components/css/styles.css"; 
import { AuthContext } from "../../context/AuthContext.jsx";  

import { apiGet, apiPost } from "../../context/api.js";

export default function FormularioProductoNuevo() {
    const { userId } = useContext(AuthContext);
    const navigate = useNavigate(); 
    
    const [formData, setFormData] = useState({
        nom_producto: '',
        precio_unitario: '',
        stock_actual: '',
        stock_minimo: 1,
        color: '',
        talla: '',
        tamaño: '',
        descripcion: '',
        id_categoria: '',
        id_clasificacion: '',
        observaciones: 'Stock inicial registrado al crear producto.',
        id_usuario: userId || 'Adm-01',
    });

    const [imagen, setImagen] = useState(null);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [clasificaciones, setClasificaciones] = useState([]);
    const [mensaje, setMensaje] = useState({ text: '', type: '' });
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (userId) {
            setFormData(prev => ({ ...prev, id_usuario: userId }));
        } else {
            setFormData(prev => ({ ...prev, id_usuario: 'Adm-01' }));
        }
    }, [userId]);

    useEffect(() => {
        const fetchExternalData = async () => {
            try {
                const [catRes, clasRes] = await Promise.all([
                    apiGet('/categorias'),
                    apiGet('/categorias/clasificaciones'),
                ]);
                setCategorias(catRes);
                setClasificaciones(clasRes);

                const sinClasif = clasRes.find(c =>
                    c.nombre_clas?.toLowerCase().includes('sin clasificac')
                );
                if (sinClasif) {
                    setFormData(prev => ({ ...prev, id_clasificacion: sinClasif.id_clasificacion }));
                }
            } catch (error) {
                console.error("Error al cargar datos externos:", error);
                setMensaje({ text: 'Error al cargar categorías/clasificaciones.', type: 'error' });
            }
        };
        fetchExternalData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImagen(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagenPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagenPreview(null);
        }
    };

    const handleQuitarImagen = () => {
        setImagen(null);
        setImagenPreview(null);
        document.getElementById('imagen_producto').value = '';
    };
    
    const handleReset = () => {
        setFormData({
            nom_producto: '', precio_unitario: '', stock_actual: '', stock_minimo: 1,
            color: '', talla: '', tamaño: '', descripcion: '', 
            id_categoria: '', id_clasificacion: '',
            observaciones: 'Stock inicial registrado al crear producto.',
            id_usuario: userId || '', 
        });
        setImagen(null);
        setImagenPreview(null);
        setMensaje({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ text: '', type: '' });

    if (!formData.nom_producto || !formData.precio_unitario || !formData.id_categoria ||
        !formData.id_clasificacion || !formData.stock_actual || !formData.descripcion ||
        formData.stock_minimo === '' || formData.stock_minimo === null) {
        setMensaje({ 
            text: "Faltan campos obligatorios: Nombre, Precio, Categoría, Clasificación, Stock Inicial, Descripción, o Stock Mínimo.", 
            type: 'error' 
        });
        setCargando(false); 
        return;
    }

    if (!formData.id_usuario) {
        setMensaje({ text: "Error: No se pudo identificar al usuario de la sesión.", type: 'error' });
        setCargando(false); 
        return;
    }

    try { 
        const productoData = {
            nom_producto: formData.nom_producto,
            precio_unitario: parseFloat(formData.precio_unitario),
            stock_actual: parseInt(formData.stock_actual),
            stock_minimo: parseInt(formData.stock_minimo),
            color: formData.color || null,
            talla: formData.talla || null,
            tamaño: formData.tamaño || null,
            descripcion: formData.descripcion,
            id_categoria: parseInt(formData.id_categoria),
            id_clasificacion: parseInt(formData.id_clasificacion),
        };

        const response = await apiPost('/productos', productoData);
        const idNuevo = response.id_producto;

        if (imagen && idNuevo) {
            const formDataImagen = new FormData();
            formDataImagen.append('imagen_producto', imagen);

            await fetch(`http://localhost:3000/productos/${idNuevo}/imagen`, {
                method: 'POST',
                headers: {
                    'x-api-key': import.meta.env.VITE_API_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formDataImagen,
            });
        }

        setMensaje({ 
            text: `Producto registrado exitosamente. ID: ${idNuevo}`, 
            type: 'success' 
        });
        handleReset();
        setTimeout(() => navigate('/productos'), 2000);

    } catch (error) {  
        const errorMessage = error.response?.data?.error || error.message || "Error al registrar el producto.";
        setMensaje({ text: errorMessage, type: 'error' });
    } finally {
        setCargando(false);
    }
};

    const handleCancel = () => navigate('/productos');
    
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="contenido">
                <HeaderPanel title="Registrar Nuevo Producto en Catálogo"/>

                {mensaje.text && (
                    <div className={`alerta ${mensaje.type}`}>
                        {mensaje.text}
                    </div>
                )}

                <section className="cuadro-blanco form-producto">
                    <form className="formulario" onSubmit={handleSubmit}>

                        {/* ── LAYOUT DOS COLUMNAS ── */}
                        <div className="form-dos-columnas">

                            {/* ── COLUMNA IZQUIERDA: campos ── */}
                            <div className="form-col-campos">

                                <h2>Información General y Stock Inicial</h2>

                                <div className="campo">
                                    <label htmlFor="nom_producto">Nombre del Producto *</label>
                                    <input type="text" id="nom_producto" name="nom_producto"
                                        placeholder="Nombre completo del producto"
                                        required value={formData.nom_producto}
                                        onChange={handleChange} disabled={cargando} />
                                </div>

                                <div className="campo">
                                    <label htmlFor="precio_unitario">Precio Unitario (Venta) *</label>
                                    <input type="number" id="precio_unitario" name="precio_unitario"
                                        placeholder="Precio al que se venderá"
                                        required min="0.01" step="0.01"
                                        value={formData.precio_unitario}
                                        onChange={handleChange} disabled={cargando} />
                                </div>

                                <div className="campo-grupo">
                                    <div className="campo">
                                        <label htmlFor="stock_actual">Stock Inicial (Entrada) *</label>
                                        <input type="number" id="stock_actual" name="stock_actual"
                                            placeholder="Cantidad inicial en inventario"
                                            required min="1" value={formData.stock_actual}
                                            onChange={handleChange} disabled={cargando} />
                                    </div>
                                    <div className="campo">
                                        <label htmlFor="stock_minimo">Stock Mínimo (Alerta) *</label>
                                        <input type="number" id="stock_minimo" name="stock_minimo"
                                            placeholder="Mínimo para alerta"
                                            required min="0" value={formData.stock_minimo}
                                            onChange={handleChange} disabled={cargando} />
                                    </div>
                                </div>

                                <h2>Clasificación y Atributos</h2>

                                <div className="campo-grupo">
                                    <div className="campo">
                                        <label htmlFor="id_categoria">Categoría *</label>
                                        <select id="id_categoria" name="id_categoria" required
                                            value={formData.id_categoria}
                                            onChange={handleChange} disabled={cargando}>
                                            <option value="">Seleccione Categoría</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                                    {cat.nombre_c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="campo">
                                        <label htmlFor="id_clasificacion">Clasificación *</label>
                                        <select id="id_clasificacion" name="id_clasificacion" required
                                            value={formData.id_clasificacion}
                                            onChange={handleChange} disabled={cargando}>
                                            <option value="">Seleccione Clasificación</option>
                                            {clasificaciones.map(clas => (
                                                <option key={clas.id_clasificacion} value={clas.id_clasificacion}>
                                                    {clas.nombre_clas}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="campo-grupo">
                                    <div className="campo">
                                        <label htmlFor="color">Color</label>
                                        <input type="text" id="color" name="color"
                                            placeholder="Ej: Rojo, Azul"
                                            value={formData.color} onChange={handleChange} disabled={cargando} />
                                    </div>
                                    <div className="campo">
                                        <label htmlFor="talla">Talla</label>
                                        <input type="text" id="talla" name="talla"
                                            placeholder="Ej: S, M, L, XL"
                                            value={formData.talla} onChange={handleChange} disabled={cargando} />
                                    </div>
                                    <div className="campo">
                                        <label htmlFor="tamaño">Tamaño</label>
                                        <input type="text" id="tamaño" name="tamaño"
                                            placeholder="Ej: Grande, Pequeño"
                                            value={formData.tamaño} onChange={handleChange} disabled={cargando} />
                                    </div>
                                </div>

                            </div>

                            {/* ── COLUMNA DERECHA: imagen ── */}
                            <div className="form-col-imagen">
                                <h2>Imagen del Producto</h2>

                                {/* Preview */}
                                <div className="imagen-preview-box">
                                    {imagenPreview ? (
                                        <img src={imagenPreview} alt="Vista previa" className="imagen-preview-img" />
                                    ) : (
                                        <div className="imagen-preview-placeholder">
                                            <div className="imagen-preview-icono"></div>
                                            <p>Sin imagen seleccionada</p>
                                            <span>La imagen aparecerá aquí</span>
                                        </div>
                                    )}
                                </div>

                                {/* Nombre del archivo */}
                                {imagen && (
                                    <p className="imagen-nombre-archivo">
                                        {imagen.name}
                                    </p>
                                )}

                                {/* Controles */}
                                <div className="imagen-controles">
                                    <label htmlFor="imagen_producto" className="btn-elegir-imagen">
                                        Elegir archivo
                                    </label>
                                    <input
                                        type="file"
                                        id="imagen_producto"
                                        name="imagen_producto"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        disabled={cargando}
                                        className="input-file-oculto"
                                    />
                                    {imagenPreview && (
                                        <button
                                            type="button"
                                            className="btn-quitar-imagen"
                                            onClick={handleQuitarImagen}
                                            disabled={cargando}
                                        >
                                            Quitar imagen
                                        </button>
                                    )}
                                </div>

                                {/* Descripción va en la columna derecha debajo de la imagen */}
                                <div className="campo" style={{marginTop: '20px'}}>
                                    <label htmlFor="descripcion">Descripción *</label>
                                    <textarea id="descripcion" name="descripcion"
                                        placeholder="Detalles completos del producto..."
                                        rows="4" required
                                        value={formData.descripcion}
                                        onChange={handleChange} disabled={cargando}>
                                    </textarea>
                                </div>

                            </div>
                        </div>

                        {/* ── OBSERVACIONES — ancho completo ── */}
                        <div className="campo">
                            <label htmlFor="observaciones">Observaciones de Registro</label>
                            <textarea id="observaciones" name="observaciones"
                                placeholder="Notas sobre el proveedor, factura de compra, etc."
                                rows="2" value={formData.observaciones}
                                onChange={handleChange} disabled={cargando}>
                            </textarea>
                        </div>

                        {/* ── BOTONES ── */}
                        <div className="botones">
                            <button type="submit" className="btn-guardar" disabled={cargando}>
                                <i className="fa-solid fa-plus"></i>
                                {cargando ? 'Registrando...' : 'Registrar Nuevo Producto'}
                            </button>
                            <button type="button" className="btn-cancelar"
                                onClick={handleCancel} disabled={cargando}>
                                <i className="fa-solid fa-xmark"></i> Cancelar
                            </button>
                        </div>

                    </form>
                </section>
            </main>
        </div>
    );
}