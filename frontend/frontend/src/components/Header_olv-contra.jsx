import React from 'react';
import { Link } from 'react-router-dom';

//imagenes
import logo from '../assets/Logo_GO.jpeg';

import './css/header.css';

const Headercont = () => { 

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
                        <li><Link to="/login">Volver</Link></li>
                        <li><Link to="/registro">Registrarse</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Headercont;