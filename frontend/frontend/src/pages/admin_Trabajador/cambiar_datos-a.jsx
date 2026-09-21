import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.jsx";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import "../../components/css/styles.css";

import { apiPatch } from '../../context/api.js';

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÄËÏÖÜäëïöüÑñÜü\s]+$/;
const SOLO_DIGITOS = /^\d+$/;
const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarFormulario(formData) {
    if (!formData.nom_1?.trim() || !formData.ape_1?.trim() || !formData.correo?.trim() || !String(formData.telefono).trim()) {
        return 'Los campos marcados con * son obligatorios.';
    }

    if (!SOLO_LETRAS.test(formData.nom_1.trim())) {
        return 'El primer nombre solo puede contener letras y espacios (sin números ni caracteres especiales).';
    }
    if (formData.nom_2?.trim() && !SOLO_LETRAS.test(formData.nom_2.trim())) {
        return 'El segundo nombre solo puede contener letras y espacios (sin números ni caracteres especiales).';
    }
    if (!SOLO_LETRAS.test(formData.ape_1.trim())) {
        return 'El primer apellido solo puede contener letras y espacios (sin números ni caracteres especiales).';
    }
    if (formData.ape_2?.trim() && !SOLO_LETRAS.test(formData.ape_2.trim())) {
        return 'El segundo apellido solo puede contener letras y espacios (sin números ni caracteres especiales).';
    }

    if (!CORREO_OK.test(formData.correo.trim())) {
        return 'El correo electrónico no es válido.';
    }

    const tel = String(formData.telefono).trim();
    if (!SOLO_DIGITOS.test(tel)) {
        return 'El teléfono solo puede contener números (sin letras ni símbolos).';
    }
    if (tel.length < 7) {
        return 'El teléfono debe tener al menos 7 dígitos.';
    }
    if (tel.length > 15) {
        return 'El teléfono no puede tener más de 15 dígitos.';
    }

    return null;
}

export default function CambiarDatosAdmin() {
    const { usuarioActual, updateusuarioActual } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nom_1: '',
        nom_2: '',
        ape_1: '',
        ape_2: '',
        correo: '',
        telefono: '',
        t_doc: '',
        id_usuario: ''
    });

    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (usuarioActual) {
            setFormData({
                nom_1: usuarioActual.nom_1 || '',
                nom_2: usuarioActual.nom_2 || '',
                ape_1: usuarioActual.ape_1 || '',
                ape_2: usuarioActual.ape_2 || '',
                correo: usuarioActual.correo || '',
                telefono: usuarioActual.telefono || '',
                t_doc: usuarioActual.t_doc || 'CC',
                id_usuario: usuarioActual.id_usuario || ''
            });
        }
    }, [usuarioActual]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        const errorValidacion = validarFormulario(formData);
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setLoading(true);

        try {
            const response = await apiPatch(`/usuarios/${usuarioActual.id_usuario}`, {
                nom_1: formData.nom_1.trim(),
                nom_2: formData.nom_2?.trim() || null,
                ape_1: formData.ape_1.trim(),
                ape_2: formData.ape_2?.trim() || null,
                correo: formData.correo.trim(),
                telefono: Number(String(formData.telefono).trim()),
                t_doc: formData.t_doc
            });

            if (response.id_usuario || response.nom_1) {
                setMensaje('¡Datos actualizados exitosamente!');
                updateusuarioActual({ ...usuarioActual, ...formData, telefono: Number(String(formData.telefono).trim()) });
                setTimeout(() => navigate('/perfil_admin'), 1500);
            } else {
                setError(response.error || response.message || 'Error al actualizar.');
            }
        } catch (err) {
            console.error('Error:', err);
            const msg = err?.message || '';
            if (msg && !/failed to fetch|networkerror|load failed/i.test(msg)) {
                setError(msg);
            } else {
                setError('Error de conexión. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!usuarioActual) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <HeaderPerfil />

            <main>
                <form className="form-container" onSubmit={handleSubmit}>
                    <div className="subtitulo">
                        <h2>Cambiar datos</h2>
                    </div>

                    {error && (
                        <div className="alerta error">
                            {error}
                        </div>
                    )}

                    {mensaje && (
                        <div className="alerta success">
                            {mensaje}
                        </div>
                    )}

                    <label htmlFor="nom_1">Primer nombre *</label>
                    <input
                        type="text"
                        id="nom_1"
                        name="nom_1"
                        value={formData.nom_1}
                        onChange={handleChange}
                        placeholder="Primer nombre"
                        required
                        maxLength={50}
                    />

                    <label htmlFor="nom_2">Segundo nombre (Opcional)</label>
                    <input
                        type="text"
                        id="nom_2"
                        name="nom_2"
                        value={formData.nom_2}
                        onChange={handleChange}
                        placeholder="Segundo nombre"
                        maxLength={50}
                    />

                    <label htmlFor="ape_1">Primer apellido *</label>
                    <input
                        type="text"
                        id="ape_1"
                        name="ape_1"
                        value={formData.ape_1}
                        onChange={handleChange}
                        placeholder="Primer apellido"
                        required
                        maxLength={50}
                    />

                    <label htmlFor="ape_2">Segundo apellido (Opcional)</label>
                    <input
                        type="text"
                        id="ape_2"
                        name="ape_2"
                        value={formData.ape_2}
                        onChange={handleChange}
                        placeholder="Segundo apellido"
                        maxLength={50}
                    />

                    <label htmlFor="correo">Correo electrónico *</label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        required
                        maxLength={40}
                    />

                    <label htmlFor="telefono">Número telefónico *</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Solo números, ej. 3001234567"
                        required
                        inputMode="numeric"
                    />

                    <label htmlFor="t_doc">Tipo de documento</label>
                    <select
                        id="t_doc"
                        name="t_doc"
                        value={formData.t_doc}
                        onChange={handleChange}
                        required
                    >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="CE">Cédula de Extranjería</option>
                    </select>

                    <label htmlFor="id_usuario">Número de documento</label>
                    <input
                        type="text"
                        id="id_usuario"
                        name="id_usuario"
                        value={formData.id_usuario}
                        placeholder="Número de documento"
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>

                    <button
                        type="button"
                        style={{ backgroundColor: '#6c757d', marginTop: '10px' }}
                        onClick={() => navigate('/perfil_admin')}
                    >
                        Cancelar
                    </button>
                </form>
            </main>
        </>
    );
}
