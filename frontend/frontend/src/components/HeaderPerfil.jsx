// src/components/HeaderPerfil.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo_GO.jpeg'; 
// importación de estilos globales o específicos del header
import './css/header.css';

export default function HeaderPerfil() {
    return (
        <header className="Header">
            <div className="Header-container">
                <div className="logoG">
                    <Link to="/panel_control"> 
                        <img src={logo} alt="Logo Gurama Online" />            
                    </Link>
                </div>
            </div>
            
            {/* Usamos <Link> para la navegación hacia el panel principal */}
            <Link to="/panel_control">
                <button className="volver">Volver</button>
            </Link> 
        </header>
    );
}