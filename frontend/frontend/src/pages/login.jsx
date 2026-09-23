import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Headerlog from "../components/Header_log";
import "../components/css/styles.css";

export default function Login() {
  const { login, usuarioActual, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [listo, setListo] = useState(false); // para evitar parpadeos

  // Al montar el Login: si hay sesión activa, la cerramos
  useEffect(() => {
    const limpiarSesion = async () => {
      if (usuarioActual) {
        await logout();
      }
      setListo(true);
    };

    limpiarSesion();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const result = await login(correo, contrasena);

    if (result.success) {
      const rol = result.user?.id_rol_usuario;
      if (rol === "1" || rol === "3") {
        navigate("/panel_control", { replace: true });
      } else {
        navigate("/cliente", { replace: true });
      }
    } else if (result.needs_code) {
      navigate("/admin-code", { replace: true });
    } else {
      if (result.message && result.message.includes("Demasiados intentos")) {
        setErrorMessage(result.message);
      } else {
        setErrorMessage(result.message || "Error al iniciar sesión");
      }
    }
  };

  // Mientras se limpia la sesión anterior, no mostramos el formulario
  if (!listo) {
    return (
      <>
        <Headerlog />
        <main>
          <div className="form-container">
            <p style={{ textAlign: "center" }}>Cargando...</p>
          </div>
        </main>
      </>
    );
  }

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