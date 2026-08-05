import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/logica_carrito.jsx';
import Header from '../../components/Header_c.jsx';
import Footer from '../../components/Footer.jsx';
import '../../components/css/styles.css';
import { secureStorage } from '../../utils/storage';

const Carrito = () => {
    const navigate = useNavigate();
    
    // Extraemos "clearCart" (o "vaciarCarrito") del contexto de tu carrito
    const { cartItems, updateQuantity, removeItem, clearCart, getCartTotal, getTotalItems } = useCart();

    // Función para obtener la URL de la imagen
    const getImageUrl = (rutaImagen) => {
        if (!rutaImagen) return 'https://placehold.co/400x300?text=Gurama+Online/100x100?text=Sin+Imagen';
        return `http://localhost:3000${rutaImagen}`;
    };

    const formatPrice = (price) => {
        return price.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        });
    };

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) return;
        updateQuantity(id, newQuantity);
    };

    const handleRemoveItem = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto del carrito?')) {
            removeItem(id);
        }
    };

    // FUNCIÓN PARA VACIAR EL CARRITO COMPLETO
    const handleClearCart = () => {
        if (window.confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
            if (typeof clearCart === 'function') {
                clearCart();
            } else {
                // Por si en tu context se llama de otra forma (ej. vaciarCarrito)
                console.warn("clearCart no está definido, intentando vaciarCarrito...");
            }
        }
    };

    // VALIDA Y OBLIGA AL INICIO DE SESIÓN
    const handleGenerarTicket = () => {
        const user = secureStorage.getItem('user', localStorage) || secureStorage.getItem('user', sessionStorage);
        const isLoggedIn = !!user;

        if (!isLoggedIn) {
            alert('Debes iniciar sesión para generar un pedido');
            navigate('/login'); 
            return;
        }
        if (cartItems.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        console.log('Generando ticket con items:', cartItems);

        const subtotal = getCartTotal();
        const total = subtotal;

        const pedidoData = {
            cartItems: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                cantidad: item.cantidad,
                category: item.category || 'Sin categoría',
                image: item.image || null,
                stock_actual: item.stock_actual || null
            })),
            subtotal,
            total,
            timestamp: new Date().toISOString(),
            tipoPedido: 'pendiente'
        };

        console.log('Guardando en sessionStorage:', pedidoData);

        sessionStorage.removeItem('paymentData');
        sessionStorage.removeItem('pedidoProcesado');

        try {
            sessionStorage.setItem('paymentData', JSON.stringify(pedidoData));
            console.log('Datos guardados correctamente');
            navigate('/ticket-compra');
        } catch (error) {
            console.error('Error al guardar en sessionStorage:', error);
            alert('Error al procesar el pedido. Por favor intente nuevamente.');
        }
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Header />
                <main className="carrito-vacio-container">
                    <div className="carrito-vacio-content">
                        <div className="carrito-vacio-icono"></div>
                        <h2>Tu carrito está vacío</h2>
                        <p>Agrega productos desde nuestro catálogo</p>
                        <Link to="/catalogo_c">
                            <button className="carrito-btn-ir-catalogo">
                                Ir al Catálogo
                            </button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            
            <main className="carrito-main">
                <div className="carrito-container">
                    <div className="carrito-header">
                        <h1>Carrito ({getTotalItems()} productos)</h1>
                        <div className="carrito-header-acciones">
                            {/* NUEBO BOTÓN: Vaciar Carrito */}
                            <button 
                                onClick={handleClearCart} 
                                className="btn-vaciar-carrito"
                            >
                                Vaciar Carrito
                            </button>
                            <Link to="/catalogo_c">
                                <button className="btn-seguir-comprando">
                                    Seleccionar más productos
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="carrito-content">
                        {/* Lista de productos */}
                        <div className="carrito-productos-lista">
                            {cartItems.map((producto) => (
                                <div key={producto.id} className="carrito-producto-card">
                                    <img 
                                        src={getImageUrl(producto.image)} 
                                        alt={producto.name}
                                        className="carrito-producto-imagen"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/400x300?text=Gurama+Online/100x100?text=Sin+Imagen';
                                        }}
                                    />

                                    <div className="carrito-producto-info">
                                        <h3>{producto.name}</h3>
                                        <p className="carrito-producto-categoria">
                                            {producto.category}
                                        </p>
                                        <p className="carrito-producto-precio">
                                            {formatPrice(producto.price)}
                                        </p>
                                        
                                        {producto.stock_actual && (
                                            <p className="carrito-producto-stock">
                                                Stock disponible: {producto.stock_actual}
                                            </p>
                                        )}
                                    </div>

                                    <div className="carrito-producto-controles">
                                        <div className="carrito-cantidad-control">
                                            <button
                                                onClick={() => handleQuantityChange(producto.id, producto.cantidad - 1)}
                                                disabled={producto.cantidad <= 1}
                                                className="carrito-btn-cantidad"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={producto.cantidad}
                                                onChange={(e) => {
                                                    const newValue = parseInt(e.target.value);
                                                    if (!isNaN(newValue)) {
                                                        handleQuantityChange(producto.id, newValue);
                                                    }
                                                }}
                                                min="1"
                                                max={producto.stock_actual || 999}
                                                className="carrito-input-cantidad"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(producto.id, producto.cantidad + 1)}
                                                disabled={producto.stock_actual && producto.cantidad >= producto.stock_actual}
                                                className="carrito-btn-cantidad"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(producto.id)}
                                            className="eliminar" 
                                        >
                                            Eliminar
                                        </button>

                                        <div className="carrito-producto-subtotal">
                                            Subtotal: {formatPrice(producto.price * producto.cantidad)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Resumen del carrito */}
                        <div className="carrito-resumen">
                            <h2>Resumen del Pedido</h2>

                            <div className="carrito-resumen-detalles">
                                <div className="carrito-resumen-linea">
                                    <span>Productos ({getTotalItems()}):</span>
                                    <span>{formatPrice(getCartTotal())}</span>
                                </div>
                                <div className="carrito-resumen-divider"></div>
                                <div className="carrito-resumen-total">
                                    <span>Total:</span>
                                    <span>{formatPrice(getCartTotal())}</span>
                                </div>
                            </div>
 
                            <button
                                onClick={handleGenerarTicket}
                                className="carrito-btn-realizar-pedido"
                            >
                                Generar Ticket de Pedido
                            </button>

                            <p className="carrito-nota-pedido">
                                Se generará un ticket con los detalles de tu pedido
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </>
    );
};

export default Carrito;