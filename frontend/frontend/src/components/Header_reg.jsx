import React from 'react';
import { Link } from 'react-router-dom';

import './css/header.css'; 

//imagenes
import logo from '../assets/Logo_GO.jpeg';

const Headerreg = () => {

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
                    <li><Link to="/login">iniciar sesión </Link></li>
                </ul>
            </nav>
            </div>
        </header>
    );
};

export default Headerreg;