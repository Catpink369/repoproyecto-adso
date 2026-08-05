import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

// Estilos
import "../../components/css/styles.css";
//imagenes
import img_cliente from "../../assets/2.png";
// Header y Footer 
import Header from '../../components/Header_c.jsx'; 
import Footer from '../../components/Footer.jsx'; 

// API y metodos 
import { apiGet } from '../../context/api.js';

const Cliente = () => {
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [mostrarVentana, setMostrarVentana] = useState(false);
    const [productosNuevos, setProductosNuevos] = useState([]);
    const [products, setProducts] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Cargar todos los productos (para la ventana emergente)
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setCargando(true);
                const productos = await apiGet('/productos');
                
                setProducts(productos);
                
                // Filtrar solo productos con clasificación "nuevo" o "nuevos"
                const nuevos = productos.filter(p => 
                    p.nombre_clas && 
                    (p.nombre_clas.toLowerCase() === 'nuevo' || 
                    p.nombre_clas.toLowerCase() === 'nuevos')
                ).slice(0, 4); // Mostrar máximo 4 productos
                
                setProductosNuevos(nuevos);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchProductos();
    }, []);

    // Mostrar ventana emergente al cargar
    useEffect(() => {
        setMostrarVentana(true);
    }, []);

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/catalogo_c?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const getImageUrl = (rutaImagen) => {
        if (!rutaImagen) return 'https://placehold.co/400x300?text=Gurama+Online/200x200?text=Sin+Imagen';
        return `http://localhost:3000${rutaImagen}`;
    };

    // redirige al catálogo con filtro de ofertas
    const handleVerOfertas = () => {
        setMostrarVentana(false);
        navigate('/catalogo_c?clasificacion=En_oferta');
    };

    return (
        <>
        <Header />
        
        <main>
            {/* BUSCADOR */}
            <section className="buscador">
                <input 
                    type="text" 
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSearch}>🔍︎</button> 
            </section>
            
            {/* HERO SECTION */}
            <div className="hero">
                <div className="hero-texto">
                    <div className="titulo_principal">
                        <h1>Gurama</h1>
                        <h2>Confecciones y pedidos</h2>
                    </div>

                    <div className="subtitulo">
                        <h2>
                            <span className="subtitulo-parte1">¡Crea momentos especiales con nuestros </span>
                            <span className="subtitulo-parte2">amigurumis y sábanas personalizadas!</span>
                        </h2>
                    </div>
                </div>

                {products.length > 0 && products[0]?.ruta_imagen && (
                    <div className="hero-imagen">
                        <img src={img_cliente} alt="imagen" />
                    </div>
                )}
            </div>

            {/* FRANJA GRIS */}
            <div className="franja-gris">
                <p>Sorprende a tus seres queridos con regalos únicos y hechos con amor</p>
            </div>

            {/* SECCIÓN DE PRODUCTOS NUEVOS */}
            {productosNuevos.length > 0 && (
                <section className="contenido-inicio">
                    <h1>¡Nuevos Productos!</h1>
                    <p>Descubre nuestras últimas novedades hechas con amor y dedicación.</p>

                    {cargando ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p>Cargando productos...</p>
                        </div>
                    ) : (
                        <div className="contenedor-productos">
                            {productosNuevos.map((producto) => (
                                <Link 
                                    key={producto.id_producto} 
                                    to={`/producto/${producto.id_producto}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="producto">
                                        {/* Badge de Nuevo */}
                                        <div className="producto-badge" style={{
                                            backgroundColor: '#33f321ff'
                                        }}>
                                            Nuevo
                                        </div>

                                        <img 
                                            src={getImageUrl(producto.ruta_imagen)} 
                                            alt={producto.nom_producto}
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/400x300?text=Gurama+Online/200x200?text=Sin+Imagen';
                                            }}
                                        />
                                        
                                        <p><strong>{producto.nom_producto}</strong></p>
                                        
                                        <p style={{ 
                                            color: '#666', 
                                            fontSize: '14px',
                                            marginBottom: '8px'
                                        }}>
                                            {producto.nombre_c}
                                        </p>
                                        
                                        <p className="precio">
                                            ${parseFloat(producto.precio_unitario).toLocaleString('es-CO')}
                                        </p>

                                        {/* Indicador de stock */}
                                        {producto.stock_actual > 0 ? (
                                            <span className="disponible">Disponible</span>
                                        ) : (
                                            <span className="agotado">Agotado</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Banner de llamado a la acción */}
                    <div style={{
                        marginTop: '40px',
                        padding: '30px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ marginBottom: '15px', color: '#333' }}>
                            Explora todo nuestro catálogo
                        </h3>
                        <p style={{ marginBottom: '20px', color: '#666' }}>
                            Descubre todos nuestros productos y encuentra el regalo perfecto
                        </p>
                        <Link to="/catalogo_c">
                            <button className="boton-ver" style={{
                                padding: '15px 40px',
                                fontSize: '16px'
                            }}>
                                Ver Catálogo Completo
                            </button>
                        </Link>
                    </div>
                </section>
            )}
        </main>
        
        <Footer />

        {/* VENTANA EMERGENTE DE OFERTAS */}
        {mostrarVentana && (
            <div className="ventana" style={{ display: "flex" }}>
                <div className="ventana-contenido">
                    <span className="cerrar" onClick={() => setMostrarVentana(false)}>
                        &times;
                    </span>

                    <h2>¡Descubre nuestras mejores ofertas!</h2>
                    <p>Dale un toque tierno y único a tu mundo con nuestros amigurumis hechos a mano.</p>
                    <p>O decora tu cama con nuestras sábanas y cubrelechos personalizados.</p>
                    <p>Hasta 30% de descuento en modelos seleccionados.</p>
                    <p>Hechos con amor, perfectos para regalar o coleccionar.</p>

                    <img 
                        src={products.length > 0 && products[0].ruta_imagen 
                            ? getImageUrl(products[0].ruta_imagen) 
                            : 'https://placehold.co/400x300?text=Gurama+Online/400x300?text=Gurama+Online'
                        } 
                        alt="Amigurumi en promoción"
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/400x300?text=Gurama+Online/400x300?text=Gurama+Online';
                        }}
                    />

                    <button 
                        onClick={handleVerOfertas}
                        className="boton-ver"
                    >
                        Ver ofertas
                    </button>
                </div>
            </div>
        )}

        {/* CSS para animación de pulse */}
        <style>{`
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }
        `}</style>
        </>
    );
};

export default Cliente;