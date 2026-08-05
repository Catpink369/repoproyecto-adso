import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from "../../components/Sidebar_p-a";
import HeaderProductos from "../../components/HeaderProductos";
import "../../components/css/styles.css";

import { apiGet, apiDelete } from '../../context/api.js';

export default function Productos(){
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    // Estados para filtros
    const [busqueda, setBusqueda] = useState('');
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [filtros, setFiltros] = useState({
        categoria: '',
        stockBajo: false,
        fechaDesde: '',
        fechaHasta: '',
        precioMin: '',
        precioMax: ''
    });

    // Estado para ordenamiento
    const [ordenamiento, setOrdenamiento] = useState({
        campo: 'id_producto',
        direccion: 'desc' // 'asc' o 'desc'
    });

    // Función para determinar si un producto tiene stock bajo
    const isStockBajo = (producto) => {
        return producto.stock_actual <= producto.stock_minimo;
    };

    // Función para obtener el texto de clasificación
    const getClasificacionTexto = (producto) => {
        if (isStockBajo(producto)) {
            return ' Últimas Unidades';
        }
        return producto.clasificacion?.nombre_clas || producto.id_clasificacion;
    };

    // Cargar productos
    const fetchProductos = async () => {
        try {
            setCargando(true);
            const response = await apiGet('/productos');
            setProductos(response); 
            setProductosFiltrados(response);
            setError(null);
        } catch (err) {
            console.error("Error al cargar los productos:", err);
            setError("Error al cargar los productos. Por favor, intente de nuevo más tarde.");
        } finally {
            setCargando(false);
        }
    };

    // Cargar categorías
    const fetchCategorias = async () => {
        try {
            const response = await apiGet('/categorias');
            setCategorias(response);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        }
    };

    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, []);

    // Aplicar filtros y ordenamiento
    useEffect(() => {
        aplicarFiltrosYOrdenamiento();
    }, [busqueda, filtros, productos, ordenamiento]);

    const aplicarFiltrosYOrdenamiento = () => {
        let resultado = [...productos];

        // Aplicar filtros
        if (busqueda.trim() !== '') {
            const searchLower = busqueda.toLowerCase();
            resultado = resultado.filter(p => 
                p.nom_producto?.toLowerCase().includes(searchLower) ||
                p.descripcion?.toLowerCase().includes(searchLower) ||
                p.id_producto?.toString().includes(searchLower)
            );
        }

        if (filtros.categoria !== '') {
            resultado = resultado.filter(p => 
                p.id_categoria?.toString() === filtros.categoria
            );
        }

        if (filtros.stockBajo) {
            resultado = resultado.filter(p => 
                p.stock_actual <= p.stock_minimo
            );
        }

        if (filtros.precioMin !== '') {
            resultado = resultado.filter(p => 
                parseFloat(p.precio_unitario) >= parseFloat(filtros.precioMin)
            );
        }
        if (filtros.precioMax !== '') {
            resultado = resultado.filter(p => 
                parseFloat(p.precio_unitario) <= parseFloat(filtros.precioMax)
            );
        }

        if (filtros.fechaDesde !== '') {
            resultado = resultado.filter(p => {
                const fechaProducto = new Date(p.ultima_actualiz);
                const fechaDesde = new Date(filtros.fechaDesde);
                return fechaProducto >= fechaDesde;
            });
        }
        if (filtros.fechaHasta !== '') {
            resultado = resultado.filter(p => {
                const fechaProducto = new Date(p.ultima_actualiz);
                const fechaHasta = new Date(filtros.fechaHasta);
                fechaHasta.setHours(23, 59, 59);
                return fechaProducto <= fechaHasta;
            });
        }

        // Aplicar ordenamiento
        resultado.sort((a, b) => {
            let valorA, valorB;

            switch(ordenamiento.campo) {
                case 'id_producto':
                    valorA = a.id_producto;
                    valorB = b.id_producto;
                    break;
                case 'nom_producto':
                    valorA = a.nom_producto?.toLowerCase() || '';
                    valorB = b.nom_producto?.toLowerCase() || '';
                    break;
                case 'precio_unitario':
                    valorA = parseFloat(a.precio_unitario);
                    valorB = parseFloat(b.precio_unitario);
                    break;
                case 'stock_actual':
                    valorA = a.stock_actual;
                    valorB = b.stock_actual;
                    break;
                case 'ultima_actualiz':
                    valorA = new Date(a.ultima_actualiz);
                    valorB = new Date(b.ultima_actualiz);
                    break;
                case 'nombre_c':
                    valorA = a.categoria?.nombre_c?.toLowerCase() || '';
                    valorB = b.categoria?.nombre_c?.toLowerCase() || '';
                    break;
                default:
                    return 0;
            }

            if (valorA < valorB) return ordenamiento.direccion === 'asc' ? -1 : 1;
            if (valorA > valorB) return ordenamiento.direccion === 'asc' ? 1 : -1;
            return 0;
        });

        setProductosFiltrados(resultado);
    };

    const handleOrdenamiento = (campo) => {
        setOrdenamiento(prev => ({
            campo: campo,
            direccion: prev.campo === campo && prev.direccion === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleEditar = (producto) => {
        navigate(`/editar_productos/${producto.id_producto}`, { 
            state: { producto } 
        });
    };

    const handleEliminar = async (id_producto) => {
        const confirmar = window.confirm(
            "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        );
        if (!confirmar) return;

        try { 
            await apiDelete(`/productos/${id_producto}`);  
            setProductos(prev => prev.filter(p => p.id_producto !== id_producto));
            alert("Producto eliminado con éxito");
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar el producto");
        }
    };

    const contarFiltrosActivos = () => {
        let count = 0;
        if (filtros.categoria !== '') count++;
        if (filtros.stockBajo) count++;
        if (filtros.fechaDesde !== '' || filtros.fechaHasta !== '') count++;
        if (filtros.precioMin !== '' || filtros.precioMax !== '') count++;
        return count;
    };

    if (cargando) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="contenido">
                    <HeaderProductos /> 
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <p>Cargando productos...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="contenido">
                    <HeaderProductos /> 
                    <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
                        <p>{error}</p>
                        <button onClick={fetchProductos}>Reintentar</button>
                    </div>
                </main>
            </div>
        );
    }

    const filtrosActivos = contarFiltrosActivos();

    return(
        <div className="dashboard-layout">
            <Sidebar />

            <main className="contenido">
                <HeaderProductos /> 

                <section className="cuadro-blanco">
                    {/* Barra de búsqueda y filtros */}
                    <div className="acciones" style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginBottom: '20px'
                    }}>
                        {/* Búsqueda */}
                        <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                className="buscar"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{ 
                                    width: '100%',
                                    paddingRight: busqueda ? '40px' : '12px'
                                }}
                            />
                            {busqueda && (
                                <button
                                    onClick={() => setBusqueda('')}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        color: '#999'
                                    }}
                                >
                                </button>
                            )}
                        </div>

                        {/* Botón de filtros */}
                        <button 
                            className="btn-categoria"
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                position: 'relative'
                            }}
                        >
                            <i className="fa-solid fa-filter"></i>
                            Filtros
                            {filtrosActivos > 0 && (
                                <span style={{
                                    background: '#e91e63',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {filtrosActivos}
                                </span>
                            )}
                        </button>

                        {/* Dropdown de ordenamiento */}
                        <select 
                            value={`${ordenamiento.campo}-${ordenamiento.direccion}`}
                            onChange={(e) => {
                                const [campo, direccion] = e.target.value.split('-');
                                setOrdenamiento({ campo, direccion });
                            }}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <option value="id_producto-desc">ID Mayor a Menor</option>
                            <option value="id_producto-asc">ID Menor a Mayor</option>
                            <option value="nom_producto-asc">Nombre A-Z</option>
                            <option value="nom_producto-desc">Nombre Z-A</option>
                            <option value="precio_unitario-desc">Precio Mayor a Menor</option>
                            <option value="precio_unitario-asc">Precio Menor a Mayor</option>
                            <option value="stock_actual-desc">Stock Mayor a Menor</option>
                            <option value="stock_actual-asc">Stock Menor a Mayor</option>
                            <option value="ultima_actualiz-desc">Fecha Más Reciente</option>
                            <option value="ultima_actualiz-asc">Fecha Más Antigua</option>
                            <option value="nombre_c-asc">Categoría A-Z</option>
                            <option value="nombre_c-desc">Categoría Z-A</option>
                        </select>

                        {/* Botón registrar */}
                        <Link to="/registro_prod" style={{ marginLeft: 'auto' }}>
                            <button className="btn-registrar">
                                <i className="fa-solid fa-plus"></i> Registrar nuevo Producto
                            </button>
                        </Link>
                    </div>

                    {/* Panel de filtros desplegable */}
                    {mostrarFiltros && (
                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #dee2e6'
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>
                                Filtros Avanzados
                            </h3>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '15px'
                            }}>
                                {/* Filtro por categoría */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                        Categoría
                                    </label>
                                    <select 
                                        value={filtros.categoria}
                                        onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ced4da'
                                        }}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id_categoria} value={cat.id_categoria}>
                                                {cat.nombre_c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro de stock bajo - ACTUALIZADO */}
                                <div className="campo-grupo" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox"
                                            checked={filtros.stockBajo}
                                            onChange={(e) => handleFiltroChange('stockBajo', e.target.checked)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: '500' }}>
                                            Solo productos con stock bajo / Últimas Unidades
                                        </span>
                                    </label>
                                </div>

                                {/* Rango de precios */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                        Rango de Precio
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input 
                                            type="number"
                                            placeholder="Min"
                                            value={filtros.precioMin}
                                            onChange={(e) => handleFiltroChange('precioMin', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ced4da'
                                            }}
                                        />
                                        <span>-</span>
                                        <input 
                                            type="number"
                                            placeholder="Max"
                                            value={filtros.precioMax}
                                            onChange={(e) => handleFiltroChange('precioMax', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ced4da'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Rango de fechas */}
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                        Rango de Fechas (Última actualización)
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input 
                                            type="date"
                                            value={filtros.fechaDesde}
                                            onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ced4da'
                                            }}
                                        />
                                        <span>hasta</span>
                                        <input 
                                            type="date"
                                            value={filtros.fechaHasta}
                                            onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ced4da'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resultados */}
                    <div style={{ 
                        marginBottom: '15px', 
                        color: '#6c757d',
                        fontSize: '14px'
                    }}>
                        Mostrando <strong>{productosFiltrados.length}</strong> de <strong>{productos.length}</strong> productos
                    </div>

                    {/* Tabla de productos */}
                    <div style={{ overflowX: 'auto' }}>
                        <table className="tabla">
                            <thead> 
                                <tr>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleOrdenamiento('id_producto')}>
                                        ID {ordenamiento.campo === 'id_producto' && (ordenamiento.direccion === 'desc' ? 'v' : '^')}
                                    </th>
                                    <th>Imagen</th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleOrdenamiento('nom_producto')}>
                                        Producto {ordenamiento.campo === 'nom_producto' && (ordenamiento.direccion === 'desc' ? 'v' : '^')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleOrdenamiento('nombre_c')}>
                                        Categoria {ordenamiento.campo === 'nombre_c' && (ordenamiento.direccion === 'desc' ? 'v' : '^')}
                                    </th>
                                    <th>Clasificación</th>
                                    <th>Descripción</th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleOrdenamiento('precio_unitario')}>
                                        Precio {ordenamiento.campo === 'precio_unitario' && (ordenamiento.direccion === 'desc' ? 'v' : '^')}
                                    </th>
                                    <th style={{ cursor: 'pointer' }} onClick={() => handleOrdenamiento('stock_actual')}>
                                        Stock {ordenamiento.campo === 'stock_actual' && (ordenamiento.direccion === 'desc' ? 'v' : '^')}
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            
                            <tbody> 
                                {productosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                                            {productos.length === 0 
                                                ? "No hay productos registrados" 
                                                : "No se encontraron productos con los filtros seleccionados"
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    productosFiltrados.map((producto) => (
                                        <tr key={producto.id_producto}>
                                            <td>{producto.id_producto}</td>

                                            <td>
                                                {producto.ruta_imagen ? (
                                                    <img 
                                                        src={`http://localhost:3000${producto.ruta_imagen}`}
                                                        alt={producto.nom_producto} 
                                                        style={{ 
                                                            width: '50px', 
                                                            height: '50px', 
                                                            objectFit: 'cover',
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ color: '#999' }}>Sin imagen</span>
                                                )}
                                            </td>

                                            <td>{producto.nom_producto}</td>
                                            <td>{producto.categoria?.nombre_c || producto.id_categoria}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: isStockBajo(producto) ? '#ffebee' : '#e8f5e9',
                                                    color: isStockBajo(producto) ? '#c62828' : '#2e7d32',
                                                    fontWeight: 'bold',
                                                    fontSize: '12px'
                                                }}>
                                                    {getClasificacionTexto(producto)}
                                                </span>
                                            </td>

                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {producto.descripcion || '-'}
                                            </td>
                                            <td>${parseFloat(producto.precio_unitario).toFixed(2)}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: producto.stock_actual <= producto.stock_minimo ? '#ffebee' : '#e8f5e9',
                                                    color: producto.stock_actual <= producto.stock_minimo ? '#c62828' : '#2e7d32',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {producto.stock_actual}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => handleEditar(producto)}
                                                    className="editar"
                                                    style={{ 
                                                        marginRight: '5px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleEliminar(producto.id_producto)}
                                                    className="eliminar"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div> 
    );
}