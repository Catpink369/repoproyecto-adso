import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../components/css/styles.css";

const API_URL = 'http://localhost:3000';

const CambiarContrasena = () => {
    const { usuarioActual } = useContext(AuthContext);
    const navigate = useNavigate();

    const [contrasenaActual, setContrasenaActual] = useState("");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        // validaciones frontend
        if (!contrasenaActual || !nuevaContrasena || !confirmar) {
        setError("Por favor completa todos los campos.");
        return;
        }
        if (nuevaContrasena !== confirmar) {
        setError("Las contraseñas nuevas no coinciden.");
        return;
        }
        if (nuevaContrasena.length < 6) {
        setError("La nueva contraseña debe tener mínimo 6 caracteres.");
        return;
        }
        if (contrasenaActual === nuevaContrasena) {
        setError("La nueva contraseña debe ser diferente a la actual.");
        return;
        }

        setLoading(true);

        try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(
            `${API_URL}/usuarios/${usuarioActual.id_usuario}/cambiar-contrasena`,
            { contrasenaActual, nuevaContrasena },
            { headers: { Authorization: `Bearer ${token}`,
            'x-api-key' : import.meta.env.VITE_API_KEY, //esta linea es para agregar la API KEY a la cabecera de la solicitud
        } }
        );

        setMensaje(response.data.message || "¡Contraseña actualizada exitosamente!");
        
        // limpiar campos
        setContrasenaActual("");
        setNuevaContrasena("");
        setConfirmar("");

        // redirigir después de 2 segundos
        setTimeout(() => navigate(-1), 2000);

        } catch (err) {
        const msg = err.response?.data?.message || "Error al cambiar la contraseña.";
        setError(msg);
        } finally {
        setLoading(false);
        }
    };

    return (
        <main>
        <form className="form-container" onSubmit={handleSubmit}>
            <div className="subtitulo">
            <h2>Cambiar Contraseña</h2>
            </div>

            {error && <div className="alerta error">{error}</div>}
            {mensaje && <div className="alerta success">{mensaje}</div>}

            <label htmlFor="actual">Contraseña actual</label>
            <input
            type="password"
            id="actual"
            value={contrasenaActual}
            onChange={(e) => setContrasenaActual(e.target.value)}
            placeholder="Ingresa tu contraseña actual"
            required
            />

            <label htmlFor="nueva">Nueva contraseña</label>
            <input
            type="password"
            id="nueva"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            />

            <label htmlFor="confirmar">Confirmar nueva contraseña</label>
            <input
            type="password"
            id="confirmar"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repite la nueva contraseña"
            required
            />

            <button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>

            <button type="button" onClick={() => navigate(-1)}>
            Volver
            </button>
        </form>
        </main>
    );
};

export default CambiarContrasena;
