import React from 'react';
import { Link } from 'react-router-dom';

//imagenes
import logoG from '../assets/Logo_GO.jpeg'; 

import './css/header.css';

const Headeri = () => {

    return (
        <header className="Header">
            <div className="Header-container">
                <div className="logoG">
                    <Link to="/"> 
                        <img src={logoG} alt="Logo Gurama Online" />            
                    </Link>
                </div>

            <nav className="Menu">
                <ul>
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/registro">Registrarse</Link></li>
                    <li><Link to="/login">Iniciar sesión </Link></li>
                </ul>
            </nav>
            </div>
        </header>
    );
};

export default Headeri;