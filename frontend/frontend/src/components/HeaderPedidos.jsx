import React from "react";
import perfil from '../assets/icono_usuarioA.png';
import './css/headerA.css';


export default function HeaderPedidos() {
    return(
        <header className="header-panel">
            <h1>Pedidos realizados</h1>
            <div className="icono">
                <a href="/perfil_admin"> 
                    <span>Admin Gurama</span>
                    <img src={perfil} alt="perfil" />
                </a>
            </div>
        </header>
    );
}