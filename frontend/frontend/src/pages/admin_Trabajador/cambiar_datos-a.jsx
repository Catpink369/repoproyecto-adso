import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.jsx";
import HeaderPerfil from "../../components/HeaderPerfil.jsx";
import "../../components/css/styles.css";

import { apiPatch } from '../../context/api.js';

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

    // Cargar datos del usuario actual
    useEffect(() => {
        if (usuarioActual) {
            console.log("Objeto usuarioActual cargado:", usuarioActual);
            setFormData({
                nom_1: usuarioActual.nom_1 || '',
                nom_2: usuarioActual.nom_2 || '',
                ape_1: usuarioActual.ape_1 || '',
                ape_2: usuarioActual.ape_2 || '',
                correo: usuarioActual.correo || '',
                telefono: usuarioActual.telefono || '',
                t_doc: usuarioActual.t_doc || '',
                id_usuario: usuarioActual.id_usuario || ''
            });
        }
    }, [usuarioActual]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        setLoading(true);

        if (!formData.nom_1 || !formData.ape_1 || !formData.correo || !formData.telefono) {
            setError('Los campos marcados con * son obligatorios.');
            setLoading(false);
            return;
        }

        try {
            const response = await apiPatch(`/usuarios/${usuarioActual.id_usuario}`, {
                nom_1: formData.nom_1,
                nom_2: formData.nom_2 || null,
                ape_1: formData.ape_1,
                ape_2: formData.ape_2 || null,
                correo: formData.correo,
                telefono: parseInt(formData.telefono),
                t_doc: formData.t_doc
            });

            if (response.id_usuario || response.nom_1) {
                setMensaje('¡Datos actualizados exitosamente!');
                updateusuarioActual({ ...usuarioActual, ...formData });
                setTimeout(() => navigate('/perfil_admin'), 1500);
            } else {
                setError(response.error || response.message || 'Error al actualizar.');
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
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
                    />

                    <label htmlFor="nom_2">Segundo nombre (Opcional)</label>
                    <input 
                        type="text" 
                        id="nom_2" 
                        name="nom_2" 
                        value={formData.nom_2}
                        onChange={handleChange}
                        placeholder="Segundo nombre" 
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
                    />

                    <label htmlFor="ape_2">Segundo apellido (Opcional)</label>
                    <input 
                        type="text" 
                        id="ape_2" 
                        name="ape_2" 
                        value={formData.ape_2}
                        onChange={handleChange}
                        placeholder="Segundo apellido" 
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
                    />

                    <label htmlFor="telefono">Número telefónico *</label>
                    <input 
                        type="tel" 
                        id="telefono" 
                        name="telefono" 
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Número de teléfono" 
                        required 
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