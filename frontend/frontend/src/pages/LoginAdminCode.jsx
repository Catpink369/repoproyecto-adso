import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import "../components/css/styles.css";
import Headeri from "../components/Header";

export default function LoginAdminCode() {
  const [codigo, setCodigo] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [verificando, setVerificando] = useState(false); 
  const { verifyAdminCode, usuarioPendiente, usuarioActual } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usuarioPendiente) {
      setErrorMessage("Error: No hay sesión pendiente. Vuelva a iniciar sesión.");
      return;
    }

 setVerificando(true); // bloquea el useEffect antes de verificar

    const result = await verifyAdminCode(codigo.trim());

    if (result.success) {
      navigate("/panel_control");
    } else {
      setVerificando(false); // si falla, vuelve a permitir el useEffect
      if (result.message?.includes("Demasiados intentos")) {
        setErrorMessage(result.message);
      } else {
        setErrorMessage(result.message || "Error al verificar el código.");
      }
    }
  };

  const volver = () => {
    sessionStorage.removeItem('usuarioPendiente');
    navigate("/login");
  };

  useEffect(() => {
    if (verificando) return; 

    if (usuarioActual) {
      navigate("/panel_control");
    }
    if (!usuarioPendiente) {
      console.log("No hay usuarioPendiente, redirigiendo a login");
      navigate("/login");
    }
  }, [usuarioActual, usuarioPendiente, navigate, verificando]); 

  if (!usuarioPendiente && !usuarioActual) 
    return null;

  return (
    <>
      <Headeri /> 

      <main> 
        <form className="form-container">
          <div className="subtitulo">
            <h2>Iniciar sesión</h2>
          </div>

          {errorMessage && (
            <div className="alerta error">
              {errorMessage}
            </div>
          )}

          <p style={{ marginBottom: '20px', textAlign: 'center', color: '#5a3d54' }}>
            Está ingresando como administrador, para continuar ingrese su código
          </p>

          <label htmlFor="codigo">Código de administrador</label>
          <input
            type="password"
            id="codigo"
            name="codigo"
            placeholder="Ingresa tu código de administrador"
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />

          <button type="submit" onClick={handleSubmit}>Ingresar</button>
          
          <button 
            type="button" 
            onClick={volver}
          > 
            Volver
          </button>
        </form>
      </main>
    </>
  );
}