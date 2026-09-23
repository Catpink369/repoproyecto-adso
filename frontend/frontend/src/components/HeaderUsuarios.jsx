import React, { useContext } from "react";
import perfil from '../assets/icono_usuarioA.png';
import './css/headerA.css';
import { AuthContext } from '../context/AuthContext';
import { getRolLabel } from '../utils/roles';

export default function HeaderUsuarios() {
    const { usuarioActual } = useContext(AuthContext);
    const rolLabel = getRolLabel(usuarioActual);

    return(
        <header className="header-panel">
            <h1>Gestionar Usuarios</h1>
            <div className="icono">
                <a href="/perfil_admin"> 
                    <span>{rolLabel} Gurama</span>
                    <img src={perfil} alt="perfil" />
                </a>
            </div>
        </header>
    );
}