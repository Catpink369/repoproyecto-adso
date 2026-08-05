// Detalle de prodicto individual - inicio
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Headeri from "../components/Header.jsx";
import Footer from '../components/Footer.jsx';
import '../components/css/styles.css';  

import { apiGet } from '../context/api.js';

const ProductoDetalles = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [producto, setProducto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar el producto desde la API
    useEffect(() => {
        const fetchProducto = async () => {
            try {
                setIsLoading(true);
                const response = await apiGet(`/productos/${id}`); 
                const prod = {
                    ...response,
                    nombre_clas: response.clasificacion?.nombre_clas || null,
                    nombre_c: response.categoria?.nombre_c || null,
                };
                setProducto(prod);
                setError(null);
            } catch (err) {
                console.error("Error al cargar el producto:", err);
                setError("No se pudo cargar el producto");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducto();
    }, [id]);

    // Función para obtener la URL de la imagen
    const getImageUrl = (rutaImagen) => {
        if (!rutaImagen) return 'https://placehold.co/400x300?text=Gurama+Online/400x400?text=Sin+Imagen';
        return `http://localhost:3000${rutaImagen}`;
    };

    // Función para determinar si el stock es bajo
    const isStockBajo = () => {
        if (!producto) return false;
        return producto.stock_actual <= producto.stock_minimo;
    };

    // Función para obtener el texto de clasificación (oculta "Sin clasificar")
    const getClasificacionTexto = () => {
        if (!producto) return '';
        
        // Si el stock es bajo, mostrar "Últimas Unidades"
        if (isStockBajo()) {
            return ' Últimas Unidades';
        }
        
        // Si tiene clasificación y NO es "Sin clasificar"
        if (producto.nombre_clas && producto.nombre_clas.toLowerCase() !== 'sin clasificar') {
            const clasificacion = producto.nombre_clas.toLowerCase();
            
            if (clasificacion === 'nuevo' || clasificacion === 'nuevos') {
                return 'Nuevo';
            }
            if (clasificacion === 'en oferta' || clasificacion === 'oferta') {
                return 'En Oferta';
            }
            if (clasificacion.includes('vendido') || clasificacion === 'mas vendidos') {
                return 'Más Vendido';
            }
            if (clasificacion === 'ultimas unidades') {
                return 'Últimas Unidades';
            }
            if (clasificacion === 'destacado' || clasificacion === 'destacados') {
                return 'Destacado';
            }
            if (clasificacion === 'edición limitada' || clasificacion === 'limitado') {
                return 'Edición Limitada';
            }
            
            // Clasificación personalizada
            return producto.nombre_clas;
        }
        
        // Si es "Sin clasificar", no mostrar badge
        return null;
    };

    // Función para verificar si debe mostrar el badge
    const shouldShowBadge = () => {
        if (!producto) return false;
        
        // Siempre mostrar si stock bajo
        if (isStockBajo()) return true;
        
        // No mostrar si es "Sin clasificar"
        if (!producto.nombre_clas || producto.nombre_clas.toLowerCase() === 'sin clasificar') {
            return false;
        }
        
        // Mostrar para cualquier otra clasificación
        return true;
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    // Estados de carga
    if (isLoading) {
        return (
            <>
                <Headeri />
                <main>
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '80px 20px',
                        minHeight: '60vh'
                    }}>
                        <p className="loading-message">Cargando detalles del producto...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !producto) {
        return (
            <>
                <Headeri />
                <main>
                    <div className="error-container" style={{ 
                        textAlign: 'center', 
                        padding: '80px 20px',
                        minHeight: '60vh'
                    }}>
                        <h2>Producto no encontrado</h2>
                        <p style={{ marginBottom: '20px' }}>{error || 'El producto que buscas no existe'}</p>
                        <Link to="/">
                            <button className="btn-carrito">Volver </button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Renderizado del producto
    return (
        <>
            <Headeri />
            
            <main>
                <div className="contenedor-producto">
                    {/* IMAGEN DEL PRODUCTO */}
                    <div className="imagen-producto">
                        <img 
                            src={getImageUrl(producto.ruta_imagen)} 
                            alt={producto.nom_producto}
                            id="producto-imagen"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/400x300?text=Gurama+Online/400x400?text=Sin+Imagen';
                            }}
                        />
                    </div>

                    {/* INFORMACIÓN DEL PRODUCTO */}
                    <div className="info-producto">
                        {/* Clasificación / Badge de Últimas Unidades (solo si no es "Sin clasificar") */}
                        {shouldShowBadge() && (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    backgroundColor: isStockBajo() ? '#ff5252' : '#4caf50',
                                    color: 'white'
                                }}>
                                    {getClasificacionTexto()}
                                </span>
                            </div>
                        )}

                        {/* Nombre del producto */}
                        <h2 id="producto-nombre">{producto.nom_producto}</h2>

                        {/* Categoría */}
                        <p style={{ 
                            color: '#666', 
                            marginBottom: '15px',
                            fontSize: '16px'
                        }}>
                            <strong>Categoría:</strong> {producto.nombre_c || 'Sin categoría'}
                        </p>

                        {/* Descripción */}
                        <p id="producto-descripcion" style={{ 
                            marginBottom: '20px',
                            lineHeight: '1.6'
                        }}>
                            {producto.descripcion || 'Sin descripción disponible'}
                        </p>

                        {/* Detalles adicionales */}
                        {(producto.color || producto.talla || producto.tamaño) && (
                            <div style={{ 
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px'
                            }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Detalles:</h3>
                                {producto.color && (
                                    <p><strong>Color:</strong> {producto.color}</p>
                                )}
                                {producto.talla && (
                                    <p><strong>Talla:</strong> {producto.talla}</p>
                                )}
                                {producto.tamaño && (
                                    <p><strong>Tamaño:</strong> {producto.tamaño}</p>
                                )}
                            </div>
                        )}

                        {/* Precio */}
                        <p className="precio" id="producto-precio">
                            Precio: ${parseFloat(producto.precio_unitario).toLocaleString('es-CO')}
                        </p>

                        {/* Stock */}
                        <p className="stock" style={{
                            color: producto.stock_actual > 0 ? '#2e7d32' : '#c62828',
                            fontWeight: 'bold',
                            marginBottom: '20px'
                        }}>
                            {producto.stock_actual > 0 
                                ? `Stock disponible: ${producto.stock_actual} unidad${producto.stock_actual !== 1 ? 'es' : ''}`
                                : 'Producto agotado'
                            }
                        </p>

                        {/* Alerta de stock bajo */}
                        {isStockBajo() && producto.stock_actual > 0 && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                color: '#856404'
                            }}>
                                <strong>¡Últimas unidades disponibles!</strong> Quedan pocas unidades en stock.
                            </div>
                        )}

                        {/* Botón agregar al carrito */}
                        <button 
                            onClick={handleLoginRedirect} 
                            className="btn-carrito"
                            disabled={producto.stock_actual === 0}
                            style={{
                                opacity: producto.stock_actual === 0 ? 0.5 : 1,
                                cursor: producto.stock_actual === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Añadir a carrito
                        </button>

                        {/* Botón volver */}
                        <Link to="/">
                            <button 
                                style={{
                                    marginTop: '10px',
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Volver
                            </button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default ProductoDetalles;