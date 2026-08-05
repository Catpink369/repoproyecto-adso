import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header_c.jsx'; 
import Footer from '../../components/Footer.jsx';
import "../../components/css/styles.css";  

import { useCart } from '../../context/logica_carrito.jsx';

import { apiGet } from '../../context/api.js'; 

const ProductoDetalle = () => {
    const { id } = useParams();
    
    const [producto, setProducto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart, cartItems } = useCart();

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
            return 'Últimas Unidades';
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

    // Obtener cantidad en carrito de este producto
    const getCantidadEnCarrito = () => {
        if (!producto) return 0;
        const item = cartItems.find(item => item.id === producto.id_producto);
        return item ? item.cantidad : 0;
    };

    // Función mejorada para agregar al carrito
    const handleAddToCartClick = () => {
        if (!producto || producto.stock_actual <= 0) {
            alert('Este producto no tiene stock disponible');
            return;
        }

        // Verificar si ya está en el carrito
        const itemInCart = cartItems.find(item => item.id === producto.id_producto);
        if (itemInCart && itemInCart.cantidad >= producto.stock_actual) {
            alert('No puedes agregar más unidades. Stock insuficiente.');
            return;
        }

        // Adaptar formato para el carrito (igual que en Catalogo_c)
        const productoParaCarrito = {
            id_producto: producto.id_producto,
            nom_producto: producto.nom_producto,
            precio_unitario: producto.precio_unitario,
            ruta_imagen: producto.ruta_imagen,
            nombre_c: producto.nombre_c,
            stock_actual: producto.stock_actual
        };
        
        addToCart(productoParaCarrito);
        
        // Mostrar notificación
        const toast = document.createElement('div');
        toast.textContent = `✓ ${producto.nom_producto} agregado al carrito`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // Estados de carga
    if (isLoading) {
        return (
            <>
                <Header />
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
                <Header />
                <main>
                    <div className="error-container" style={{ 
                        textAlign: 'center', 
                        padding: '80px 20px',
                        minHeight: '60vh'
                    }}>
                        <h2>Producto no encontrado</h2>
                        <p style={{ marginBottom: '20px' }}>{error || 'El producto que buscas no existe'}</p>
                        <Link to="/catalogo_c">
                            <button className="btn-carrito">Volver al Catálogo</button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const cantidadEnCarrito = getCantidadEnCarrito();
    const stockRestante = producto.stock_actual - cantidadEnCarrito;

    // Renderizado del producto
    return (
        <>
            <Header />
            
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
                            color: stockRestante > 0 ? '#2e7d32' : '#c62828',
                            fontWeight: 'bold',
                            marginBottom: '20px'
                        }}>
                            {stockRestante > 0 
                                ? `Stock disponible: ${stockRestante} unidad${stockRestante !== 1 ? 'es' : ''}`
                                : 'Producto agotado'
                            }
                        </p>

                        {/* Mostrar cantidad en carrito */}
                        {cantidadEnCarrito > 0 && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#e3f2fd',
                                border: '1px solid #2196f3',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                color: '#1565c0'
                            }}>
                                <strong>✓ Ya tienes {cantidadEnCarrito} unidad{cantidadEnCarrito !== 1 ? 'es' : ''} en el carrito</strong>
                            </div>
                        )}

                        {/* Alerta de stock bajo */}
                        {isStockBajo() && stockRestante > 0 && (
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
                            onClick={handleAddToCartClick} 
                            className="btn-carrito"
                            disabled={stockRestante <= 0}
                            style={{
                                backgroundColor: stockRestante > 0 ? '#f176bcff' : '#c4c4c4ff',
                                opacity: stockRestante > 0 ? 1 : 0.6,
                                cursor: stockRestante > 0 ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {stockRestante > 0 
                                ? 'Agregar al carrito' 
                                : 'Sin stock disponible'
                            }
                        </button>

                        {/* Botón volver */}
                        <Link to="/catalogo_c">
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
                                Volver al catálogo
                            </button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default ProductoDetalle;