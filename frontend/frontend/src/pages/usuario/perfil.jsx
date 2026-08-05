import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import sinFoto from '../../assets/sin_foto_p.webp';

// Estilos
import '../../components/css/styles.css';
import Header from '../../components/Header_c.jsx';

import { apiGet } from '../../context/api.js';

export default function PerfilAdmin() {
    const { usuarioActual, logout, updateusuarioActual } = useContext(AuthContext);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(Date.now());
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchdatosUsuario = async () => {
            if (!usuarioActual || !usuarioActual.id_usuario) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiGet(`/usuarios/${usuarioActual.id_usuario}`); // ← directo
                setDatosUsuario(data);
                updateusuarioActual({ ...usuarioActual, ...data });
            } catch (error) {
                console.error('Error de conexión:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchdatosUsuario();
    }, [usuarioActual?.id_usuario]);

    if (!usuarioActual || loading) {
        return (
            <div className="perfil-page-container">
                <Header />
                <main>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Cargando perfil...</p>
                    </div>
                </main>
            </div>
        );
    }

    const user = datosUsuario || usuarioActual;
    const nombreCompleto = `${user.nom_1} ${user.nom_2 || ''} ${user.ape_1} ${user.ape_2 || ''}`.trim();
    const tipoDocumento = user.desc_doc || user.t_doc || '';
    const identificacion = `${tipoDocumento} ${user.id_usuario}`.trim();

    const handlePlaceholderClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const handleFileChange = (event) => {
        setArchivoSeleccionado(event.target.files[0]);
        setUploadMessage('');
        setUploadError('');
    };

    const handleUpload = async () => {
        const usuario = datosUsuario || usuarioActual;

        if (!archivoSeleccionado || !usuario || !usuario.id_usuario) {
            setUploadError('Debe seleccionar un archivo y estar logueado.');
            return;
        }

        setUploadMessage('Subiendo imagen...');
        setUploadError('');

        const formData = new FormData();
        formData.append('profileImage', archivoSeleccionado); 

        try {
            const response = await fetch(
                `http://localhost:3000/usuarios/${usuario.id_usuario}/imagen`,
                {
                method: 'POST',
                headers: {
                    'x-api-key': import.meta.env.VITE_API_KEY,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            const data = await response.json();
            
            if (response.ok) {
                setUploadMessage('Imagen subida con éxito. Actualizando vista...');
                setArchivoSeleccionado(null);
                
                updateusuarioActual({ ...user, img_perfil: data.img_perfil });
                setReloadKey(Date.now());
            } else {
                setUploadError(data.message || data.error || 'Error al subir la imagen.');
                setUploadMessage('');
            }
        } catch (error) {
            console.error('Error en la subida:', error);
            setUploadError('Error de conexión o subida fallida.');
            setUploadMessage('');
        }
    };

    return (
        <div className="perfil-page-container"> 
            <Header />

            <main>
                <section className="perfil-box">
                    <div className="profile-card">
                        <h2>Perfil</h2>
                        
                        <div className="profile-content">
                            {/* SECCIÓN DE IMAGEN Y SUBIDA */}
                            <div className="profile-picture-container">
                                <div 
                                    className="profile-picture" 
                                    onClick={handlePlaceholderClick} 
                                    role="button" 
                                    tabIndex="0"
                                    onKeyPress={(e) => e.key === 'Enter' && handlePlaceholderClick()}
                                >
                                    {usuarioActual.img_perfil ? (
                                        <img 
                                            key={reloadKey} 
                                            src={`http://localhost:3000${usuarioActual.img_perfil}?t=${reloadKey}`}
                                            alt="Perfil" 
                                            className="profile-image-actual"
                                        />               
                                    ) : (
                                        <img 
                                            src={sinFoto}
                                            alt="Sin foto"
                                            className="profile-image-actual"
                                        />
                                        )} 
                                    <span className="user-role">
                                        {usuarioActual.rol || usuarioActual.nombre_rol || 'Cliente'}
                                    </span> 
                                </div>
                                
                                {/* CONTROLES DE SUBIDA */}
                                <div className="image-upload-controls">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                    />

                                    {archivoSeleccionado && (
                                        <p className="file-name-display">
                                            Archivo: <strong>{archivoSeleccionado.name}</strong>
                                        </p>
                                    )}

                                    {archivoSeleccionado && (
                                        <button 
                                            onClick={handleUpload} 
                                            className="btn rosa btn-upload"
                                        >
                                            Confirmar Subida
                                        </button>
                                    )}

                                    {uploadMessage && (
                                        <p className="upload-feedback" style={{ color: '#059669' }}>
                                            {uploadMessage}
                                        </p>
                                    )}
                                    {uploadError && (
                                        <p className="upload-feedback" style={{ color: '#dc2626' }}>
                                            {uploadError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* SECCIÓN DE DATOS */}
                            <div className="info">
                                <h4>
                                    <strong>Nombre de usuario</strong>
                                    <span className="dato">{nombreCompleto}</span>
                                </h4>

                                <h4>
                                    <strong>Correo electrónico</strong>
                                    <span className="dato">{usuarioActual.correo}</span>
                                </h4>

                                <h4>
                                    <strong>Número telefónico</strong>
                                    <span className="dato">{usuarioActual.telefono}</span>
                                </h4>

                                <h4>
                                    <strong>Identificación</strong>
                                    <span className="dato">{identificacion}</span>
                                </h4>
                            </div>
                        </div>

                        {/* SECCIÓN DE ACCIONES */}
                        <div className="actions-container">
                            <Link to="/cambiar_datos">
                                <button className="btn rosa">Cambiar datos</button>
                            </Link>
                            <Link to="/cambiar_contrasena">
                                <button className="btn rosa">Cambiar contraseña</button>
                            </Link>
                            <Link to="/" onClick={logout}> 
                                <button className="btn gris">Cerrar sesión</button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}