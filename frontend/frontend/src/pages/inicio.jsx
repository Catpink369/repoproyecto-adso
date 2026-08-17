import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../components/css/styles.css";
import img from "../assets/2.png";

import Headeri from "../components/Header.jsx";
import Footer from '../components/Footer.jsx'; 

import { apiGet } from '../context/api.js';

function Inicio() {
    const navigate = useNavigate();
    const [mostrarVentana, setMostrarVentana] = useState(false);
    
    // Estados para productos y filtros
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categorias, setCategorias] = useState(['Todo']);
    const [clasificaciones, setClasificaciones] = useState(['Todas']);
    const [cat_seleccionada, setcat_seleccionada] = useState('Todo');
    const [clas_seleccionada, setClas_seleccionada] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Funciones auxiliares
    
    // Manejar cambio de categoría
    const handleCategoryFilter = (category) => {
        setcat_seleccionada(category);
    };

    // Manejar cambio de clasificación
    const handleClasificacionFilter = (clasificacion) => {
        setClas_seleccionada(clasificacion);
    };

    // Manejar búsqueda
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // Función para obtener la URL de la imagen
    const getImageUrl = (rutaImagen) => {
        if (!rutaImagen) return null;
        return `http://localhost:3000${rutaImagen}`;
    };

    // Función para determinar si el stock es bajo
    const isStockBajo = (producto) => {
        return producto.stock_actual <= producto.stock_minimo;
    };

    // Función para obtener el badge del producto
    const getBadgeInfo = (producto) => {
        // Stock bajo tiene prioridad
        if (isStockBajo(producto) && producto.stock_actual > 0) {
            return {
                texto: 'Últimas Unidades',
                color: '#f88787ff',
                mostrar: true
            };
        }

        // Clasificación de la BD
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
            if (clasificacion === 'ultimas unidades' || clasificacion === 'últimas unidades') {
                return { texto: 'Últimas Unidades', color: '#eb54bdff', mostrar: true };
            }
            
            // Si es una clasificación personalizada, reemplaza guiones bajos por espacios
            return { texto: producto.nombre_clas.replace(/_/g, ' '), color: '#bbbbbbff', mostrar: true };
        }

        return { mostrar: false };
    };

    // Manejar clic en "Ver ofertas" - aplica filtro de ofertas y cierra ventana
    const handleVerOfertas = () => {
        setMostrarVentana(false);
        setClas_seleccionada('En oferta');
        setTimeout(() => {
            const catalogo = document.querySelector('.contenido-inicio');
            if (catalogo) {
                catalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Mostrar ventana emergente al cargar
    useEffect(() => {
        setMostrarVentana(true);
    }, []);

    // Cargar productos desde la API
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setCargando(true);
                const response = await apiGet('/productos');
                const productos = Array.isArray(response) ? response : response.data || [];
                setProducts(productos);
                
                // Extraer categorías únicas (reemplazando _ por espacio si existen)
                const categoriasUnicas = ['Todo', ...new Set(productos.map(p => p.nombre_c?.replace(/_/g, ' ')).filter(Boolean))];
                setCategorias(categoriasUnicas);
                
                // Extraer clasificaciones únicas (excluyendo "Sin clasificar" y reemplazando _ por espacio)
                const clasificacionesUnicas = ['Todas', 'Últimas Unidades', ...new Set(
                    productos
                        .filter(p => p.nombre_clas && p.nombre_clas.toLowerCase() !== 'sin clasificar')
                        .map(p => p.nombre_clas.replace(/_/g, ' '))
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

        fetchProductos();
    }, []);

    // Aplicar filtros (Categoría, Clasificación y Búsqueda)
    useEffect(() => {
        const productos_filtrados = products.filter((product) => {
            // Nombre formateado de categoría y clasificación del producto actual
            const catProdFormatted = product.nombre_c ? product.nombre_c.replace(/_/g, ' ') : '';
            const clasProdFormatted = product.nombre_clas ? product.nombre_clas.replace(/_/g, ' ') : '';

            // Condición de Categoría
            const conincide_cate = 
                cat_seleccionada === 'Todo' || 
                catProdFormatted === cat_seleccionada ||
                product.nombre_c === cat_seleccionada;

            // Condición de Clasificación
            let coincide_clas = true;
            if (clas_seleccionada !== 'Todas') {
                if (clas_seleccionada === 'Últimas Unidades') {
                    coincide_clas = isStockBajo(product);
                } else {
                    // Comparación flexible para clasificaciones
                    const clasProducto = clasProdFormatted.toLowerCase();
                    const clasBuscada = clas_seleccionada.toLowerCase();
                    
                    if (clasBuscada === 'nuevo' || clasBuscada === 'nuevos') {
                        coincide_clas = clasProducto === 'nuevo' || clasProducto === 'nuevos';
                    } else if (clasBuscada === 'en oferta' || clasBuscada === 'oferta') {
                        coincide_clas = clasProducto === 'en oferta' || clasProducto === 'oferta';
                    } else {
                        coincide_clas = clasProducto === clasBuscada;
                    }
                }
            }

            // Condición de Búsqueda por Nombre
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const busqueda_coincide = 
                product.nom_producto.toLowerCase().includes(lowerCaseSearchTerm) ||
                (product.descripcion && product.descripcion.toLowerCase().includes(lowerCaseSearchTerm));

            return conincide_cate && coincide_clas && busqueda_coincide; 
        });

        setFilteredProducts(productos_filtrados);
        
    }, [cat_seleccionada, clas_seleccionada, searchTerm, products]);


    return (
        <>
        <Headeri />

        {/* CONTENIDO */}
        <main>
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

                <div className="hero-imagen">
                    <img src={img} alt="imagen" />
                </div>
            </div>

            <div className="franja-gris">
                <p>Sorprende a tus seres queridos con regalos únicos y hechos con amor</p>
            </div>


            {/* CATALOGO COMPLETO */}
            <section className="contenido-inicio">
                <h1>Catálogo de productos</h1>
                <p>Explora todos nuestros productos. Inicia sesión para agregar al carrito y realizar compras.</p>

                {/* Buscador */}
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

                {/* Productos */}
                {cargando ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Cargando productos...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="contenedor-productos">
                        {filteredProducts.map((product) => {
                            const badgeInfo = getBadgeInfo(product);
                            
                            return (
                                <Link 
                                    to={`/d_producto/${product.id_producto}`}
                                    key={product.id_producto}
                                >
                                    <div className="producto" style={{ position: 'relative' }}>
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
                                            {product.nombre_c ? product.nombre_c.replace(/_/g, ' ') : ''}
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
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Mensaje si no hay resultados */}
                        {filteredProducts.length === 0 && (
                            <p className="no-results">
                                No se encontraron productos para los criterios de búsqueda actuales.
                            </p>
                        )}
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
                        ¿Quieres comprar estos productos?
                    </h3>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        Inicia sesión para agregar productos al carrito y realizar tu compra
                    </p>
                    <Link to="/login">
                        <button className="boton-ver" style={{
                            padding: '15px 40px',
                            fontSize: '16px'
                        }}>
                            Iniciar Sesión
                        </button>
                    </Link>
                </div>
            </section>
        </main>
            
        <Footer />


        {/* VENTANA EMERGENTE DE OFERTAS */}
        {mostrarVentana && (
            <div id="ventana" className="ventana" style={{ display: "flex" }}>
                <div className="ventana-contenido">
                    <span className="cerrar" onClick={() => setMostrarVentana(false)}>
                        &times;
                    </span>

                    <h2>¡Descubre nuestras mejores ofertas!</h2>
                    <p>Dale un toque tierno y único a tu mundo con nuestros amigurumis hechos a mano.</p>
                    <p>O decora tu cama con nuestras sabanas y cubrelechos</p>
                    <p>Hasta 30% de descuento en modelos seleccionados.</p>
                    <p>Hechos con amor, perfectos para regalar o coleccionar.</p>

                    <img 
                        src={products.length > 0 && products[0].ruta_imagen 
                            ? getImageUrl(products[0].ruta_imagen) 
                            : img
                        } 
                        alt="Amigurumi en promoción" 
                        style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '15px' }}
                        onError={(e) => {
                            e.target.src = img;
                        }}
                    />

                    <button 
                        onClick={handleVerOfertas}
                        className="boton-ver"
                        style={{ marginTop: '20px' }}
                    >
                        Ver ofertas
                    </button>
                </div>
            </div>
        )}

        {/* CSS para animación */}
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
}

export default Inicio;