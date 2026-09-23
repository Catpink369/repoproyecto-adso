import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function RutasProtegidas({ children, rolesPermitidos }) {
  const { usuarioActual, isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  // 1. No está logueado → login
  if (!isLoggedIn || !usuarioActual) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const rol = usuarioActual.id_rol_usuario;

  // 2. Tiene rol pero no está permitido en esta ruta
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    // Redirigir al lugar correcto según su rol real
    if (rol === "2") {
      return <Navigate to="/cliente" replace />;
    }
    // Admin o Trabajador
    return <Navigate to="/panel_control" replace />;
  }

  // 3. Todo correcto
  return children;
}