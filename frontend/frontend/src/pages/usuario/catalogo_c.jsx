import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

//estilos
import "../../components/css/styles.css"; 
// header y footer
import Header from '../../components/Header_c.jsx'; 
import Footer from '../../components/Footer.jsx';
// Importar el hook del carrito
import { useCart } from '../../context/logica_carrito.jsx';

import { apiGet } from '../../context/api.js'; 

const Catalogo_c = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialSearchTerm = searchParams.get('search') || '';
    const initialClasificacion = searchParams.get('clasificacion') || 'Todas';
    
    // Hook del carrito
    const { addToCart, cartItems, getTotalItems } = useCart();
    
    // Estados
    const [products, setProducts] = useState([]);
    const [cat_seleccionada, setcat_seleccionada] = useState('Todo');
    const [clas_seleccionada, setClas_seleccionada] = useState(initialClasificacion);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm); 
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categorias, setCategorias] = useState(['Todo']);
    const [clasificaciones, setClasificaciones] = useState(['Todas']);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    //Cargar productos desde la API
    const fetchProductos = async () => {
        try {
            setCargando(true);
            const response = await apiGet('/productos');
            const productosAPI = Array.isArray(response) ? response : [];

            const productosMapeados = productosAPI.map(p => ({
                ...p,
                nombre_c:    p.categoria?.nombre_c    || null,
                nombre_clas: p.clasificacion?.nombre_clas || null,
            }));

            setProducts(productosMapeados);
            
            const categoriasUnicas = ['Todo', ...new Set(productosMapeados.map(p => p.nombre_c).filter(Boolean))];
            setCategorias(categoriasUnicas);
            
            const clasificacionesUnicas = ['Todas', 'Últimas Unidades', ...new Set(
                productosMapeados
                    .filter(p => p.nombre_clas && p.nombre_clas.toLowerCase() !== 'sin clasificar')
                    .map(p => p.nombre_clas)
            )];
            setClasificaciones(clasificacionesUnicas);
            
            setError(null);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError("No se pudieron cargar los productos");
        } finally {
            setCargando(false);
        }
    };
    
    useEffect(() => {
        fetchProductos();
    }, []);

    //Aplicar filtro de clasificación desde URL cuando cambian los searchParams
    useEffect(() => {
        const clasificacionURL = searchParams.get('clasificacion');
        if (clasificacionURL) {
            setClas_seleccionada(clasificacionURL);
        }
    }, [searchParams]);

    //Recargar cuando se vuelve a la página
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchProductos();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Función para manejar el cambio en la barra de búsqueda
    const handleSearch = (event) => {
        setSearchTerm(event.target.value); 
    };

    // Función para manejar el cambio de filtro de categoría
    const handleCategoryFilter = (category) => {
        setcat_seleccionada(category);
    };

    // Función para manejar el cambio de filtro de clasificación
    const handleClasificacionFilter = (clasificacion) => {
        setClas_seleccionada(clasificacion);
    };

    // Función para determinar si el stock es bajo
    const isStockBajo = (producto) => {
        return producto.stock_actual <= producto.stock_minimo;
    };

    // Función para agregar al carrito desde el catálogo
    const handleAddToCart = (e, producto) => {
        e.preventDefault();
        e.stopPropagation();

        if (producto.stock_actual <= 0) {
            alert('Este producto no tiene stock disponible');
            return;
        }

        const itemInCart = cartItems.find(item => item.id === producto.id_producto);
        if (itemInCart && itemInCart.cantidad >= producto.stock_actual) {
            alert('No puedes agregar más unidades. Stock insuficiente.');
            return;
        }

        const productoParaCarrito = {
            id_producto: producto.id_producto,
            nom_producto: producto.nom_producto,
            precio_unitario: producto.precio_unitario,
            ruta_imagen: producto.ruta_imagen,
            nombre_c: producto.nombre_c,
            stock_actual: producto.stock_actual
        };

        addToCart(productoParaCarrito);
        
        const toast = document.createElement('div');
        toast.textContent = `${producto.nom_producto} agregado al carrito`;
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

    //useEffect para aplicar los filtros
    useEffect(() => {
        const productos_filtrados = products.filter((product) => {
            const conincide_cate = 
                cat_seleccionada === 'Todo' || 
                product.nombre_c === cat_seleccionada;

            let coincide_clas = true;
            if (clas_seleccionada !== 'Todas') {
                if (clas_seleccionada === 'Últimas Unidades') {
                    coincide_clas = isStockBajo(product);
                } else {
                    // Comparación flexible para clasificaciones
                    const clasProducto = product.nombre_clas ? product.nombre_clas.toLowerCase() : '';
                    const clasBuscada = clas_seleccionada.toLowerCase();
                    
                    // Manejar variaciones de "Nuevo"
                    if (clasBuscada === 'nuevo' || clasBuscada === 'nuevos') {
                        coincide_clas = clasProducto === 'nuevo' || clasProducto === 'nuevos';
                    }
                    // Manejar variaciones de "En Oferta"
                    else if (clasBuscada === 'en oferta' || clasBuscada === 'oferta') {
                        coincide_clas = clasProducto === 'en oferta' || clasProducto === 'oferta';
                    }
                    // Para otras clasificaciones, comparar directamente
                    else {
                        coincide_clas = clasProducto === clasBuscada;
                    }
                }
            }

            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const busqueda_coincide = 
                product.nom_producto.toLowerCase().includes(lowerCaseSearchTerm) ||
                (product.descripcion && product.descripcion.toLowerCase().includes(lowerCaseSearchTerm));

            return conincide_cate && coincide_clas && busqueda_coincide;
        });

        setFilteredProducts(productos_filtrados);
        
    }, [cat_seleccionada, clas_seleccionada, searchTerm, products]);

    // Función para obtener la URL de la imagen
    const getImageUrl = (rutaImagen) => {
        if (!rutaImagen) return null;
        return `http://localhost:3000${rutaImagen}`;
    };

    // Función para obtener el badge del producto
    const getBadgeInfo = (producto) => {
        if (isStockBajo(producto) && producto.stock_actual > 0) {
            return {
                texto: 'Últimas Unidades',
                color: '#f88787ff',
                mostrar: true
            };
        }

        if (producto.nombre_clas) {
            const clasificacion = producto.nombre_clas.toLowerCase();

            if (clasificacion === 'sin clasificar') {
                return { mostrar: false };
            }

            if (clasificacion === 'nuevo' || clasificacion === 'nuevos') {
                return { texto: 'Nuevo', color: '#33f321ff', mostrar: true };
            }
            if (clasificacion === 'en oferta' || clasificacion === 'oferta') {
                return { texto: 'En Oferta', color: '#ec9614ff', mostrar: true };
            }
            if (clasificacion.includes('vendido') || clasificacion === 'mas vendidos') {
                return { texto: 'Más Vendido', color: '#0b87ecff', mostrar: true };
            }
            if (clasificacion === 'ultimas unidades') {
                return { texto: 'Últimas Unidades', color: '#eb54bdff', mostrar: true };
            }
            
            return { texto: producto.nombre_clas, color: '#bbbbbbff', mostrar: true };
        }

        return { mostrar: false };
    };

    // Obtener cantidad en carrito de un producto
    const getCantidadEnCarrito = (idProducto) => {
        const item = cartItems.find(item => item.id === idProducto);
        return item ? item.cantidad : 0;
    };

    if (cargando) {
        return (
            <>
                <Header />
                <main>
                    <section className="contenido-inicio">
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p>Cargando productos...</p>
                        </div>
                    </section>
                </main>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <main>
                    <section className="contenido-inicio">
                        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                            <p>{error}</p>
                        </div>
                    </section>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
        <Header />

        <main>
            <section className="contenido-inicio">
                {/* NUEVO HEADER CON TÍTULO CENTRADO Y BOTÓN A LA DERECHA */}
                <div className="catalogo-header-wrapper">
                    <div className="catalogo-titulo-carrito-container">
                        <div className="catalogo-titulo-centro">
                            <h1>Catálogo de productos</h1>
                            <p>Explora nuestros productos tejidos a mano, hechos con amor y dedicación</p>
                        </div>
                        
                        {/* Botón del carrito posicionado absolutamente a la derecha */}
                        <div className="catalogo-boton-carrito-absoluto">
                            <button
                                onClick={() => navigate('/carrito')}
                                className="btn-ver-carrito"
                            >
                                Ver Carrito
                                {getTotalItems() > 0 && (
                                    <span className="badge-carrito">
                                        {getTotalItems()}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>             

                <section className="buscador">
                    <input 
                        type="text" 
                        placeholder="Buscar productos..." 
                        value={searchTerm}
                        onChange={handleSearch} 
                    />
                    <button>🔍︎</button>
                </section>
                
                {/* Filtro de Categorías */}
                <div className="filtro-categorias">
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Categoría:</label>
                    {categorias.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryFilter(category)}
                            className={cat_seleccionada === category ? 'active' : ''}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Filtro de Clasificaciones */}
                <div className="filtro-categorias" style={{ marginTop: '10px' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Clasificación:</label>
                    {clasificaciones.map((clasificacion) => (
                        <button
                            key={clasificacion}
                            onClick={() => handleClasificacionFilter(clasificacion)}
                            className={clas_seleccionada === clasificacion ? 'active' : ''}
                        >
                            {clasificacion}
                        </button>
                    ))}
                </div>

                {/* CONTENEDOR DE PRODUCTOS */}
                <div className="contenedor-productos">
                    {filteredProducts.map((product) => {
                        const badgeInfo = getBadgeInfo(product);
                        const cantidadEnCarrito = getCantidadEnCarrito(product.id_producto);
                        const stockRestante = product.stock_actual - cantidadEnCarrito;
                        
                        return (
                            <div key={product.id_producto} style={{ position: 'relative' }}>
                                <Link to={`/producto/${product.id_producto}`}>
                                    <div className="producto">
                                        {/* Badge de Clasificación */}
                                        {badgeInfo.mostrar && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: badgeInfo.color,
                                                color: 'white',
                                                zIndex: 1,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                animation: badgeInfo.texto.includes('Últimas') ? 'pulse 2s infinite' : 'none'
                                            }}>
                                                {badgeInfo.texto}
                                            </div>
                                        )}

                                        {product.ruta_imagen ? (
                                            <img 
                                                src={getImageUrl(product.ruta_imagen)} 
                                                alt={product.nom_producto}
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/400x300?text=Gurama+Online/200x200?text=Sin+Imagen';
                                                }}
                                            />
                                        ) : (
                                            <img 
                                                src="https://placehold.co/400x300?text=Gurama+Online/200x200?text=Sin+Imagen" 
                                                alt="Sin imagen"
                                            />
                                        )}
                                        
                                        <p><strong>{product.nom_producto}</strong></p>
                                        <p style={{ 
                                            color: '#666', 
                                            fontSize: '14px',
                                            marginBottom: '8px'
                                        }}>
                                            {product.nombre_c}
                                        </p>
                                        
                                        <p className="precio">${parseFloat(product.precio_unitario).toLocaleString('es-CO')}</p>
                                        
                                        {/* Indicador de stock */}
                                        {product.stock_actual > 0 ? (
                                            isStockBajo(product) ? (
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '5px 10px',
                                                    borderRadius: '5px',
                                                    backgroundColor: '#fff3cd',
                                                    color: '#856404',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    marginTop: '8px'
                                                }}>
                                                    Pocas unidades
                                                </span>
                                            ) : (
                                                <span className="disponible">Disponible</span>
                                            )
                                        ) : (
                                            <span className="agotado">Agotado</span>
                                        )}

                                        {/* Mostrar cantidad en carrito */}
                                        {cantidadEnCarrito > 0 && (
                                            <p style={{
                                                fontSize: '12px',
                                                color: '#3498db',
                                                fontWeight: 'bold',
                                                marginTop: '5px'
                                            }}>
                                                {cantidadEnCarrito} en carrito
                                            </p>
                                        )}
                                    </div>
                                </Link>

                                {/* Botón de agregar al carrito */}
                                <button
                                    onClick={(e) => handleAddToCart(e, product)}
                                    disabled={stockRestante <= 0}
                                    style={{
                                        width: '100%',
                                        marginTop: '10px',
                                        padding: '10px',
                                        backgroundColor: stockRestante > 0 ? '#bdafb7ff' : '#c4c4c4ff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: stockRestante > 0 ? 'pointer' : 'not-allowed',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        transition: 'all 0.3s ease',
                                        opacity: stockRestante > 0 ? 1 : 0.6
                                    }}
                                    onMouseOver={(e) => {
                                        if (stockRestante > 0) {
                                            e.target.style.backgroundColor = '#c2549dff';
                                            e.target.style.transform = 'scale(1.02)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (stockRestante > 0) {
                                            e.target.style.backgroundColor = '#bdafb7ff';
                                            e.target.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    {stockRestante > 0 ? ' Agregar al carrito' : ' Sin stock'}
                                </button>
                            </div>
                        );
                    })}

                    {/* Mensaje si no hay resultados */}
                    {filteredProducts.length === 0 && (
                        <p className="no-results">
                            No se encontraron productos para los criterios de búsqueda actuales.
                        </p>
                    )}
                </div>
            </section>
        </main>
            
        <Footer />

        {/* CSS para animación */}
        <style>{`
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
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

export default Catalogo_c;