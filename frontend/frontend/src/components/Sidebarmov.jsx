import React from "react";
import { Link, useLocation } from 'react-router-dom';
import "./css/Sidebar.css";
// imágenes
import logo from '../assets/Logo_GO.jpeg'; 

export default function Sidebar() {
    const location = useLocation();

    const isLinkActive = (path) => {
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
                <Link 
                    to="/panel_control" 
                    className={location.pathname === '/panel_control' || location.pathname === '/' ? 'activo' : ''}
                >
                    <span>Panel de control</span>
                </Link>

                {/* Productos (Stock) */}
                <Link 
                    to="/productos" 
                    className={isLinkActive('/productos') ? 'activo' : ''}
                >
                    <span>Productos</span>
                </Link>

                {/* Materiales } */}
                <Link 
                    to="/materiales" 
                    className={isLinkActive('/materiales') ? 'activo' : ''}
                >
                    <span>Materiales</span>
                </Link>

                {/* Movimientos */}
                <Link 
                    to="/movimientos"
                    className={isLinkActive('/movimientos') ? 'activo' : ''}
                > 
                    <span>Movimientos</span>
                </Link>

                {/* Entradas */}
                <Link 
                    to="/entradas"
                    className={isLinkActive('/entradas') ? 'activo' : ''}
                > 
                    <span>^ Entradas</span>
                </Link>
                
                {/* Salidas */}
                <Link 
                    to="/salidas"
                    className={isLinkActive('/salidas') ? 'activo' : ''}
                > 
                    <span>v Salidas</span>
                </Link>

                {/* Usuarios */}
                <Link 
                    to="/usuarios"
                    className={isLinkActive('/usuarios') ? 'activo' : ''}
                >
                    <span>Usuarios</span>
                </Link>

                {/* Pedidos Realizados */}
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