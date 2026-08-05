import React, { useState, useContext} from "react";
import { Link, useNavigate } from "react-router-dom"; 
// logica de autentificacion :D
import { AuthContext } from "../context/AuthContext.jsx"; 
// estilos
import Headerlog from "../components/Header_log"; 
import "../components/css/styles.css";

export default function Login() { 
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErrorMessage("");
    
    console.log('Enviando al backend:');
    console.log('   Correo:', correo);
    console.log('   Contraseña (longitud):', contrasena.length);
    
    const result = await login(correo, contrasena);

    console.log('Respuesta del login:', result);

    if (result.success) {
      console.log('Login exitoso - Redirigiendo a /cliente');
      navigate("/cliente");
    } 
    else if (result.needs_code) {
      console.log('Requiere código - Redirigiendo a /admin-code');
      navigate("/admin-code");
    } 
    else {
      console.log('Login fallido:', result.message);
      
      //  el mensaje de error indica demasiados intentos y muestra mensaje
      if (result.message && result.message.includes("Demasiados intentos")) {
        setErrorMessage(result.message);
      } else {
        setErrorMessage(result.message || "Error al iniciar sesión");
      }
    }
  };

  return (
    <>
      <Headerlog /> 

      <main>
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="subtitulo"> 
            <h2>Iniciar sesión</h2>
          </div>

          {errorMessage && (
            <div className="alerta error">
              {errorMessage}
            </div>
          )}

          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            placeholder="Ingrese su correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <label htmlFor="contrasena">Contraseña</label>
          <input
            type="password"
            id="contrasena"
            placeholder="Ingrese su contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit">Ingresar</button>

          <div className="preguntas"> 
            <p>
              <Link to="/registro">¿No tiene cuenta?</Link>
            </p>
            <p>
              <Link to="/olvide_c">¿Olvidó su contraseña?</Link>
            </p>
          </div>
        </form>
      </main>
    </>
  );
}