import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function RutasProtegidas ({ children, rolesPermitidos }) {
    const { usuarioActual, isLoggedIn } = useContext(AuthContext);

    // Si no está logueado, redirige al login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Si se especificaron roles y el usuario no tiene el rol permitido
    if (rolesPermitidos && !rolesPermitidos.includes(usuarioActual.id_rol_usuario)) {
        // Cliente va a /cliente, admin/trabajador van a su panel
        if (usuarioActual.id_rol_usuario === '2') {
        return <Navigate to="/cliente" replace />;
        }
        return <Navigate to="/panel_control" replace />;
    }

    return children;
}