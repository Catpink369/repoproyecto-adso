import React, { createContext, useState } from 'react';
import axios from 'axios';
import { secureStorage } from '../utils/storage'; // importa el helper

const API_URL = 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

export const AuthContext = createContext();

const esAdministrador = (user) => {
    return user?.id_rol_usuario === '1' || user?.id_rol_usuario === '3';
};

const getInitialUser = () => {
    const sessionUser = secureStorage.getItem('user', sessionStorage);
    if (sessionUser) return sessionUser;
    const localUser = secureStorage.getItem('user', localStorage);
    if (localUser) return localUser;
    return null;
};

const initialState = getInitialUser();
const initialusuarioPendiente = secureStorage.getItem('usuarioPendiente', sessionStorage) || null;

export const AuthProvider = ({ children }) => {
    const [usuarioActual, setUsuarioActual] = useState(initialState);
    const [usuarioPendiente, setUsuarioPendiente] = useState(initialusuarioPendiente);

    const saveusuarioPendiente = (user) => {
        setUsuarioPendiente(user);
        secureStorage.setItem('usuarioPendiente', user, sessionStorage); // encriptado
    };

    const clearusuarioPendiente = () => {
        setUsuarioPendiente(null);
        secureStorage.removeItem('usuarioPendiente', sessionStorage);
    };

    const updateusuarioActual = (newdatosUsuario) => {
        setUsuarioActual(newdatosUsuario);
        if (esAdministrador(newdatosUsuario)) {
            secureStorage.setItem('user', newdatosUsuario, sessionStorage); // encriptado
            secureStorage.removeItem('user', localStorage);
        } else {
            secureStorage.setItem('user', newdatosUsuario, localStorage); // encriptado
            secureStorage.removeItem('user', sessionStorage);
        }
    };

    /* ==========LOGIN============ */

    const login = async (correo, contrasena) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`,
                { correo, contrasena },
                {
                    headers: { 'x-api-key': API_KEY },
                    withCredentials: true,
                }
            );
            const data = response.data;
            const user = data.user;

            if (data.needs_code) {
                saveusuarioPendiente(user);
                return { needs_code: true, user };
            }

            updateusuarioActual(user);
            clearusuarioPendiente();
            return { success: true, user };

        } catch (error) {
            const message = error.response?.data?.message || "Error de conexión o credenciales inválidas.";
            return { success: false, message };
        }
    };

    /* ==========CODIGO ADMIN============ */
    const verifyAdminCode = async (codigo) => {
        const userToVerify = usuarioPendiente || secureStorage.getItem('usuarioPendiente', sessionStorage);

        if (!userToVerify) {
            return { success: false, message: "No hay sesión pendiente. Vuelve a iniciar sesión." };
        }

        try {
            const response = await axios.post(`${API_URL}/auth/verify-code`,
                { id_usuario: userToVerify.id_usuario, codigo },
                {
                    headers: { 'x-api-key': API_KEY },
                    withCredentials: true,
                }
            );

            const data = response.data;

            if (data.success) {
                updateusuarioActual(data.user);
                clearusuarioPendiente();
                return { success: true, user: data.user };
            }

            return { success: false, message: data.message || "Código incorrecto" };

        } catch (error) {
            const message = error.response?.data?.message || "Error al verificar el código";
            return { success: false, message };
        }
    };

    /* ==========CERRAR SESIÓN============ */
    
    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, {
                headers: { 'x-api-key': API_KEY },
                withCredentials: true,
            });
        } catch (_) {}

        setUsuarioActual(null);
        clearusuarioPendiente();
        secureStorage.removeItem('user', localStorage);
        secureStorage.removeItem('user', sessionStorage);
    };

    const userId = usuarioActual ? usuarioActual.id_usuario : null;

    return (
        <AuthContext.Provider value={{
            usuarioActual,
            userId,
            usuarioPendiente,
            login,
            logout,
            verifyAdminCode,
            isLoggedIn: !!usuarioActual,
            updateusuarioActual,
            saveusuarioPendiente,
            clearusuarioPendiente
        }}>
            {children}
        </AuthContext.Provider>
    );
};