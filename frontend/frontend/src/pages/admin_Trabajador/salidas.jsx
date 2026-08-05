import React, { useState, useContext } from "react";
import Sidebarmov from "../../components/Sidebarmov";
import HeaderPanel from "../../components/HeaderPanel";
import "../../components/css/styles.css"; 
import { AuthContext } from "../../context/AuthContext.jsx"; 
import { useNavigate } from 'react-router-dom';

import { apiGet, apiPost } from '../../context/api.js';

export default function FormularioSalidaProducto() {
    
    const navigate = useNavigate();
    const { userId, userName } = useContext(AuthContext); 

    const [formData, setFormData] = useState({
        id_producto: '',
        cantidad: '',
        nombre_cliente: '',
        telefono_cliente: '',
        documento_cliente: '',
        correo_cliente: '',
        metodo_pago: 'efectivo',
        observaciones: '',
        id_usuario: userId || 'Adm-01',
    });

    const [productoEncontrado, setProductoEncontrado] = useState(null);
    const [mensaje, setMensaje] = useState({ text: '', type: '' });
    const [cargando, setCargando] = useState(false);
    const [mostrarResumen, setMostrarResumen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'id_producto') {
            setProductoEncontrado(null);
            setMensaje({ text: '', type: '' });
            setMostrarResumen(false);
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckProducto = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const id = formData.id_producto;
            if (!id || cargando) return;

            setCargando(true);
            setMensaje({ text: '', type: '' });
            setProductoEncontrado(null);

            try {
                const response = await apiGet(`/productos/check/${id}`);
                if (response.found) {
                    setProductoEncontrado(response.product);
                    setMensaje({ 
                        text: `Producto encontrado: ${response.product.nom_producto} | Stock: ${response.product.stock_actual}`, 
                        type: 'success' 
                    });
                    document.getElementById('cantidad').focus();
                } else {
                    setMensaje({ text: 'Producto no encontrado o inactivo.', type: 'error' });
                }
            } catch (error) {
                setMensaje({ text: 'Error al buscar el producto.', type: 'error' });
            } finally {
                setCargando(false);
            }
        }
    };

    const calcularTotal = () => {
        if (!formData.cantidad || !productoEncontrado) return 0;
        return parseFloat(formData.cantidad) * parseFloat(productoEncontrado.precio_unitario || 0);
    };

    const handlePreview = (e) => {
        e.preventDefault();
        
        if (!productoEncontrado) {
            setMensaje({ text: 'Primero valide el producto con el ID y ENTER.', type: 'error' });
            return;
        }
        if (!formData.cantidad || parseInt(formData.cantidad) <= 0) {
            setMensaje({ text: 'La cantidad debe ser un número positivo.', type: 'error' });
            return;
        }
        if (parseInt(formData.cantidad) > productoEncontrado.stock_actual) {
            setMensaje({ text: `Stock insuficiente. Disponible: ${productoEncontrado.stock_actual}`, type: 'error' });
            return;
        }
        if (!formData.nombre_cliente.trim()) {
            setMensaje({ text: 'El nombre del cliente es obligatorio.', type: 'error' });
            return;
        }
        if (!formData.telefono_cliente.trim()) {
            setMensaje({ text: 'El teléfono del cliente es obligatorio.', type: 'error' });
            return;
        }

        setMostrarResumen(true);
        setMensaje({ text: '', type: '' });
    };
    
    const handleConfirmarVenta = async () => {
        setCargando(true);
        setMensaje({ text: '', type: '' });

        const observacionesCompletas = `VENTA MANUAL - Cliente: ${formData.nombre_cliente} | Tel: ${formData.telefono_cliente} | Total: $${calcularTotal().toLocaleString('es-CO')} | Pago: ${formData.metodo_pago}${formData.observaciones ? ` | Notas: ${formData.observaciones}` : ''}`;

        const dataToSend = {
            Cantidad_m: parseInt(formData.cantidad),
            observaciones: observacionesCompletas,
            id_m: 'M_S',
            id_producto: parseInt(formData.id_producto),
            id_usuario: userId || 'Adm-01',
        };

        try {
            await apiPost('/movimientos', dataToSend); 
            setMensaje({ text: `¡Venta registrada exitosamente!`, type: 'success' });
            setTimeout(() => navigate('/productos'), 3000);
        } catch (error) {
            setMensaje({ text: `Error: ${error.message}`, type: 'error' });
            setMostrarResumen(false);
        } finally {
            setCargando(false);
        }
    };
        
    const handleReset = () => {
        setFormData({
            id_producto: '',
            cantidad: '',
            nombre_cliente: '',
            telefono_cliente: '',
            documento_cliente: '',
            correo_cliente: '',
            metodo_pago: 'efectivo',
            observaciones: '',
            id_usuario: userId || 'Adm-01',
        });
        setProductoEncontrado(null);
        setMensaje({ text: '', type: '' });
        setMostrarResumen(false);
    };

    return (
        <div className="dashboard-layout">
            <Sidebarmov />
            <main className="contenido">
                <HeaderPanel title="Venta Manual/Presencial"/>

                {mensaje.text && (
                    <div className={`alerta ${mensaje.type}`}>
                        {mensaje.text}
                    </div>
                )}

                <section className="cuadro-blanco form-producto">
                    
                    {!mostrarResumen ? (
                        <form className="formulario" onSubmit={handlePreview}>
                            
                            {/* PRODUCTO */}
                            <div style={{ backgroundColor: '#f3e4e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #da819f' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#da819f;' }}>Información del Producto</h3>

                                <div className="campo">
                                    <label htmlFor="id_producto">
                                        ID del Producto <span style={{ color: 'red' }}>*</span>
                                        <small style={{ color: '#666', marginLeft: '10px' }}>(Presiona Enter para buscar)</small>
                                    </label>
                                    <input 
                                        type="number" 
                                        id="id_producto" 
                                        name="id_producto" 
                                        placeholder="Ingrese el ID y presione ENTER" 
                                        required 
                                        value={formData.id_producto}
                                        onChange={handleChange}
                                        onKeyDown={handleCheckProducto} 
                                        disabled={cargando}
                                        style={{ borderColor: productoEncontrado ? '#2ecc71' : (formData.id_producto ? '#fff0f3e8' : '#ccc'), borderWidth: '2px' }}
                                    />
                                </div>

                                {productoEncontrado && (
                                    <div className="campo-grupo" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                                        <div className="campo">
                                            <label>Nombre del Producto</label>
                                            <input type="text" readOnly value={productoEncontrado.nom_producto}
                                                style={{ backgroundColor: '#e8f5e9', fontWeight: 'bold' }} />
                                        </div>
                                        <div className="campo">
                                            <label>Stock Disponible</label>
                                            <input type="number" readOnly value={productoEncontrado.stock_actual}
                                                style={{ fontWeight: 'bold', fontSize: '18px', color: '#2ecc71', backgroundColor: '#e8f5e9', textAlign: 'center' }} />
                                        </div>
                                        <div className="campo">
                                            <label>Precio de Venta</label>
                                            <input type="text" readOnly 
                                                value={`$${parseFloat(productoEncontrado.precio_unitario || 0).toLocaleString('es-CO')}`}
                                                style={{ fontWeight: 'bold', backgroundColor: '#e8f5e9', textAlign: 'center' }} />
                                        </div>
                                    </div>
                                )}

                                <div className="campo">
                                    <label htmlFor="cantidad">Cantidad <span style={{ color: 'red' }}>*</span></label>
                                    <input 
                                        type="number" 
                                        id="cantidad" 
                                        name="cantidad" 
                                        placeholder="Ej: 2" 
                                        required 
                                        min="1"
                                        max={productoEncontrado ? productoEncontrado.stock_actual : undefined}
                                        value={formData.cantidad}
                                        onChange={handleChange}
                                        disabled={!productoEncontrado || cargando}
                                        style={{ fontSize: '16px' }}
                                    />
                                </div>

                                {/* Total en tiempo real */}
                                {productoEncontrado && formData.cantidad && (
                                    <div style={{ backgroundColor: '#e8f5e9', padding: '12px 15px', borderRadius: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '500' }}>Total:</span>
                                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#2ecc71' }}>
                                            ${calcularTotal().toLocaleString('es-CO')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* CLIENTE */}
                            <div style={{ backgroundColor: '#fff8e1', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #fff0f3e8' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#fff0f3e8' }}>Información del Cliente</h3>

                                <div className="campo-grupo" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div className="campo">
                                        <label htmlFor="nombre_cliente">Nombre Completo <span style={{ color: 'red' }}>*</span></label>
                                        <input type="text" id="nombre_cliente" name="nombre_cliente" 
                                            placeholder="Ej: Juan Pérez" required 
                                            value={formData.nombre_cliente} onChange={handleChange}
                                            disabled={!productoEncontrado || cargando} />
                                    </div>
                                    <div className="campo">
                                        <label htmlFor="telefono_cliente">Teléfono <span style={{ color: 'red' }}>*</span></label>
                                        <input type="tel" id="telefono_cliente" name="telefono_cliente" 
                                            placeholder="Ej: 3001234567" required maxLength="10"
                                            value={formData.telefono_cliente} onChange={handleChange}
                                            disabled={!productoEncontrado || cargando} />
                                    </div>
                                </div>

                                <div className="campo-grupo" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div className="campo">
                                        <label htmlFor="documento_cliente">Documento (Opcional)</label>
                                        <input type="text" id="documento_cliente" name="documento_cliente" 
                                            placeholder="CC, CE, TI"
                                            value={formData.documento_cliente} onChange={handleChange}
                                            disabled={!productoEncontrado || cargando} />
                                    </div>
                                    <div className="campo">
                                        <label htmlFor="correo_cliente">Correo (Opcional)</label>
                                        <input type="email" id="correo_cliente" name="correo_cliente" 
                                            placeholder="ejemplo@correo.com"
                                            value={formData.correo_cliente} onChange={handleChange}
                                            disabled={!productoEncontrado || cargando} />
                                    </div>
                                </div>
                            </div>

                            {/* PAGO */}
                            <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #2ecc71' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2ecc71' }}>Método de Pago</h3>
                                <div className="campo">
                                    <label htmlFor="metodo_pago">Método de Pago <span style={{ color: 'red' }}>*</span></label>
                                    <select id="metodo_pago" name="metodo_pago"
                                        value={formData.metodo_pago} onChange={handleChange}
                                        disabled={!productoEncontrado || cargando}
                                        style={{ padding: '10px', fontSize: '15px', fontWeight: '500' }}>
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="nequi">Nequi</option>
                                        <option value="daviplata">DaviPlata</option>
                                    </select>
                                </div>
                            </div>

                            {/* OBSERVACIONES */}
                            <div className="campo">
                                <label htmlFor="observaciones">Observaciones Adicionales</label>
                                <textarea id="observaciones" name="observaciones" rows="3"
                                    placeholder="Detalles adicionales de la venta, acuerdos, garantías, etc."
                                    value={formData.observaciones} onChange={handleChange}
                                    disabled={!productoEncontrado || cargando}
                                    style={{ resize: 'vertical' }}>
                                </textarea>
                            </div>

                            {/* BOTONES */}
                            <div className="botones">
                                <button type="submit" className="btn-guardar" 
                                    disabled={!productoEncontrado || cargando}
                                    style={{ opacity: (!productoEncontrado || cargando) ? 0.5 : 1 }}>
                                    <i className="fa-solid fa-eye"></i> Vista Previa
                                </button>
                                <button type="button" className="btn-cancelar" onClick={handleReset} disabled={cargando}>
                                    <i className="fa-solid fa-rotate-left"></i> Limpiar
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* RESUMEN */
                        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '25px', borderBottom: '3px solid #3498db', paddingBottom: '15px' }}>
                                    Confirmación de Venta
                                </h2>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ color: '#3498db', marginBottom: '10px' }}>Producto</h3>
                                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                        <p><strong>Nombre:</strong> {productoEncontrado.nom_producto}</p>
                                        <p><strong>Cantidad:</strong> {formData.cantidad} unidad(es)</p>
                                        <p><strong>Precio Unitario:</strong> ${parseFloat(productoEncontrado.precio_unitario || 0).toLocaleString('es-CO')}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ color: '#fff0f3e8', marginBottom: '10px' }}>Cliente</h3>
                                    <div style={{ backgroundColor: '#fff8e1', padding: '15px', borderRadius: '8px' }}>
                                        <p><strong>Nombre:</strong> {formData.nombre_cliente}</p>
                                        <p><strong>Teléfono:</strong> {formData.telefono_cliente}</p>
                                        {formData.documento_cliente && <p><strong>Documento:</strong> {formData.documento_cliente}</p>}
                                        {formData.correo_cliente && <p><strong>Correo:</strong> {formData.correo_cliente}</p>}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ color: '#2ecc71', marginBottom: '10px' }}>Total</h3>
                                    <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>TOTAL:</span>
                                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                                                ${calcularTotal().toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                        <p style={{ marginTop: '10px', fontSize: '14px' }}>
                                            <strong>Método de Pago:</strong> {formData.metodo_pago.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {formData.observaciones && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ color: '#95a5a6', marginBottom: '10px' }}>Observaciones</h3>
                                        <div style={{ backgroundColor: '#ecf0f1', padding: '15px', borderRadius: '8px' }}>
                                            <p>{formData.observaciones}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="botones">
                                    <button onClick={handleConfirmarVenta} className="btn-guardar"
                                        disabled={cargando} style={{ opacity: cargando ? 0.5 : 1, fontSize: '16px', padding: '15px 30px' }}>
                                        {cargando ? 'Procesando...' : 'Confirmar Venta'}
                                    </button>
                                    <button onClick={() => setMostrarResumen(false)} className="btn-cancelar" disabled={cargando}>
                                        Editar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}