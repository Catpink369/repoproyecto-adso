import React from "react";
// Importamos useLocation y Link
import { Link, useLocation } from 'react-router-dom';
// imágenes
import logo from '../assets/Logo_GO.jpeg'; 
import "./css/Sidebar.css"; 

export default function Sidebar() {
    // OBTENER la ubicación actual para saber qué enlace está activo
    const location = useLocation();

    // Función auxiliar para chequear si la ruta es la actual (o una sub-ruta)
    const isLinkActive = (path) => {
        // Chequea si el pathname actual comienza con la ruta del enlace.
        // Esto permite que /productos/editar también active /productos
        return location.pathname.startsWith(path);
    };

    return(
        <aside className="sidebar">
            <div className="logo">
                <Link to="/panel_control">
                    <img src={logo} alt="Logo GuramaOnline" />
                </Link>
            </div>

            <nav className="menu">
                {/* 1. Panel de Control */}
                <Link 
                    to="/panel_control" 
                    // Si el path es '/panel_control' O solo '/', lo marcamos como activo
                    className={location.pathname === '/panel_control' || location.pathname === '/' ? 'activo' : ''}
                >
                    <span>Panel de control</span>
                </Link>

                {/* 2. Productos */}
                <Link 
                    to="/productos" 
                    // Usamos la función auxiliar, excluyendo la raíz si es necesario
                    className={isLinkActive('/productos') ? 'activo' : ''}
                >
                    <span>Productos</span>
                </Link>

                {/* 3. Materiales */}
                <Link 
                    to="/materiales" 
                    // Usamos la función auxiliar, excluyendo la raíz si es necesario
                    className={isLinkActive('/materiales') ? 'activo' : ''}
                >
                    <span>Materiales</span>
                </Link>

                {/* 4. Movimientos - Usamos <Link> en lugar de <a> */}
                <Link 
                    to="/movimientos"
                    className={isLinkActive('/movimientos') ? 'activo' : ''}
                > 
                    <span>Movimientos</span>
                </Link>

                {/* 5. Usuarios - Usamos <Link> en lugar de <a> */}
                <Link 
                    to="/usuarios"
                    className={isLinkActive('/usuarios') ? 'activo' : ''}
                >
                    <span>Usuarios</span>
                </Link>

                {/* 6. Pedidos Realizados - Usamos <Link> en lugar de <a> */}
                <Link 
                    to="/pedidos_realizados"
                    className={isLinkActive('/pedidos_realizados') ? 'activo' : ''}
                >
                    <span>Pedidos realizados</span>
                </Link>
            </nav>
        </aside>
    );
}