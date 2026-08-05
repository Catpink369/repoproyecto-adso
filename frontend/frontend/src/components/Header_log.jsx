import React from 'react';
import { Link } from 'react-router-dom';

//imagenes
import logo from '../assets/Logo_GO.jpeg';

import './css/header.css';

const Headerlog = () => { 

    return (
        <header className="Header">
            <div className="Header-container">
                <div className="logoG">
                    <Link to="/"> 
                        <img src={logo} alt="Logo Gurama Online" />            
                    </Link>
                </div>

                <nav className="Menu">
                    <ul>
                        <li><Link to="/">Volver</Link></li>
                        <li><Link to="/registro">Registrarse</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Headerlog;