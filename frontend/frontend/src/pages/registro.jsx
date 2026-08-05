import { useState } from "react"; // ← quita useEffect
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Headerreg from "../components/Header_reg";
import "../components/css/styles.css";

const API_URL = 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

const Registro = () => {
  const [nom_1, setNom1] = useState("");
  const [nom_2, setNom2] = useState("");
  const [ape_1, setApe1] = useState("");
  const [ape_2, setApe2] = useState("");
  const [id_usuario, setIdUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [t_doc, setTDoc] = useState("CC");
  const [telefono, setTelefono] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // ← mejor que alert

  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!id_usuario.trim() || !nom_1.trim() || !ape_1.trim() || !correo.trim() || !telefono.trim() || !contrasena.trim()) {
      setErrorMessage("Por favor, complete todos los campos obligatorios.");
      return;
    }

    const datosUsuario = {
      id_usuario: id_usuario.trim(),
      nom_1: nom_1.trim(),
      nom_2: nom_2.trim() || null,
      ape_1: ape_1.trim(),
      ape_2: ape_2.trim() || null,
      correo: correo.trim(),
      telefono: (telefono.trim()), 
      contrasena: contrasena.trim(),
      t_doc: t_doc,
      id_rol_usuario: "2", // cliente por defecto
    };

    console.log('Enviando registro:', datosUsuario);

    axios.post(`${API_URL}/usuarios`, datosUsuario, 
      { headers: { authorization: API_KEY } } 
    )
    .then(response => {
        console.log("Registro exitoso:", response.data);
        navigate('/login');
      })
      .catch(error => {
        console.error("Error al registrar:", error.response?.data);
        const mensaje = error.response?.data?.message || "Error al registrar el usuario";
        setErrorMessage(Array.isArray(mensaje) ? mensaje.join(', ') : mensaje);
      });
  };

  return (
    <>
      <Headerreg />

      <main>
        <form className="form-container" onSubmit={handleCreate}>
          <h2 className="subtitulo">Crear cuenta</h2>

          {errorMessage && (
            <div className="alerta error">
              {errorMessage}
            </div>
          )}

          <label htmlFor="t_doc">Tipo de Documento</label>
          <select
            id="t_doc"
            value={t_doc}
            onChange={(e) => setTDoc(e.target.value)}
            required
          >
            <option value="CC">Cédula de Ciudadanía (CC)</option>
            <option value="CE">Cédula de Extranjería (CE)</option>
            <option value="TI">Tarjeta de Identidad (TI)</option>
          </select>

          <label htmlFor="id_usuario">Número de documento</label>
          <input
            type="text"
            id="id_usuario"
            value={id_usuario}
            onChange={(e) => setIdUsuario(e.target.value)}
            placeholder="Ingrese su número de documento"
            required
          />

          <label htmlFor="nom_1">Primer Nombre</label>
          <input
            type="text"
            id="nom_1"
            value={nom_1}
            onChange={(e) => setNom1(e.target.value)}
            placeholder="Primer nombre"
            required
          />

          <label htmlFor="nom_2">Segundo Nombre (Opcional)</label>
          <input
            type="text"
            id="nom_2"
            value={nom_2}
            onChange={(e) => setNom2(e.target.value)}
            placeholder="Segundo nombre"
          />

          <label htmlFor="ape_1">Primer Apellido</label>
          <input
            type="text"
            id="ape_1"
            value={ape_1}
            onChange={(e) => setApe1(e.target.value)}
            placeholder="Primer apellido"
            required
          />

          <label htmlFor="ape_2">Segundo Apellido (Opcional)</label>
          <input
            type="text"
            id="ape_2"
            value={ape_2}
            onChange={(e) => setApe2(e.target.value)}
            placeholder="Segundo apellido"
          />

          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
          />

          <label htmlFor="telefono">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Número de teléfono"
            required
          />

          <label htmlFor="contrasena">Contraseña</label>
          <input
            type="password"
            id="contrasena"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Ingrese su contraseña"
            required
          />

          <button type="submit">Registrarse</button>
        </form>
      </main>
    </>
  );
};

export default Registro;