import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Headercont from "../components/Header_olv-contra.jsx";
import "../components/css/styles.css";

const API_URL = 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

const OlvideMiContrasena = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: solicitar código, 2: ingresar código y nueva contraseña
    const [correo, setCorreo] = useState('');
    const [codigo, setCodigo] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 

    // Solicitar código
    const handleSolicitarCodigo = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        setLoading(true);

        if (!correo) {
            setError('Por favor ingresa tu correo electrónico.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/usuarios/solicitar-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                 },
                body: JSON.stringify({ correo })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje('Código enviado a tu correo. Revisa tu bandeja de entrada.');
                setStep(2);
            } else {
                // limite de contraseñas olvidadas alcanzado, muestra mensaje
                if (data.message && data.message.includes("Demasiadas solicitudes")) {
                    setError(data.message);    
                } else {
                    setError(data.message || 'Error al enviar el código.');
                }
            }

        } catch (err) {
            console.error('Error:', err);
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Verificar código y cambiar contraseña
    const handleRestablecerContrasena = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (!codigo || !nuevaContrasena || !confirmarContrasena) {
            setError('Por favor completa todos los campos.');
            return;
        }

        if (nuevaContrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (nuevaContrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/usuarios/reset-contrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify({ 
                    correo, 
                    codigo, 
                    nuevaContrasena 
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje('¡Contraseña actualizada exitosamente!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Error al restablecer la contraseña.');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Headercont />
            <main>
                <form className="form-container">
                    <div className="subtitulo">
                        <h2>Recuperar Contraseña</h2>
                    </div>

                    {/* Mensajes de error y éxito */}
                    {error && <div className="alerta error">{error}</div>}
                    {mensaje && <div className="alerta success">{mensaje}</div>}

                    {step === 1 ? (
                        <>
                            <p style={{ marginBottom: '20px', textAlign: 'center', color: '#5a3d54' }}>
                                Ingresa tu correo electrónico y te enviaremos un código de verificación.
                            </p>

                            <label htmlFor="correo">Correo electrónico</label>
                            <input 
                                type="email" 
                                id="correo" 
                                name="correo"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="correo@ejemplo.com" 
                                required
                            />

                            <button 
                                type="submit" 
                                onClick={handleSolicitarCodigo}
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Enviar Código'}
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ marginBottom: '20px', textAlign: 'center', color: '#5a3d54' }}>
                                Ingresa el código que recibiste en tu correo y tu nueva contraseña.
                            </p>

                            <label htmlFor="codigo">Código de Verificación</label>
                            <input 
                                type="text" 
                                id="codigo" 
                                name="codigo"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                placeholder="123456" 
                                maxLength="6"
                                required
                            />

                            <label htmlFor="nueva">Nueva Contraseña</label>
                            <input 
                                type="password" 
                                id="nueva" 
                                name="nueva"
                                value={nuevaContrasena}
                                onChange={(e) => setNuevaContrasena(e.target.value)}
                                placeholder="Mínimo 6 caracteres" 
                                required
                            />

                            <label htmlFor="confirmar">Confirmar Contraseña</label>
                            <input 
                                type="password" 
                                id="confirmar" 
                                name="confirmar"
                                value={confirmarContrasena}
                                onChange={(e) => setConfirmarContrasena(e.target.value)}
                                placeholder="Repite tu nueva contraseña" 
                                required
                            />

                            <button 
                                type="submit" 
                                onClick={handleRestablecerContrasena}
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                            </button>

                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                            >
                                Volver
                            </button>
                        </>
                    )}
                </form>
            </main>
        </>
    );
};

export default OlvideMiContrasena;