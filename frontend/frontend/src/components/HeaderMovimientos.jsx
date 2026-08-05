import React from "react";
import perfil from '../assets/icono_usuarioA.png';
import './css/headerA.css';


export default function HeaderMovimientos() {
    return(
        <header className="header-panel">
            <h1>Movimientos</h1>
            <div className="icono">
                <a href="/perfil_admin"> 
                    <span>Admin Gurama</span>
                    <img src={perfil} alt="perfil" />
                </a>
            </div>
        </header>
    );
} 
