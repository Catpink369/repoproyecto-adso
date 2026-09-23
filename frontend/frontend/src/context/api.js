const API_URL = import.meta.env.VITE_API_URL;

// Obtiene los headers con token y authorization
const getHeaders = () => {
    // Primero token de admin, luego de cliente
    const token = sessionStorage.getItem('token_admin') || localStorage.getItem('token_client');

    return {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY,
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

/** Extrae un mensaje legible del body de error de NestJS / fetch */
const extraerMensajeError = (errorData, status) => {
    if (!errorData) return `Error ${status || ''}`.trim();

    let msg = errorData.message ?? errorData.error ?? errorData.msg;

    // class-validator suele devolver un array de mensajes
    if (Array.isArray(msg)) {
        msg = msg.filter(Boolean).join('. ');
    }

    if (typeof msg === 'object' && msg !== null) {
        msg = JSON.stringify(msg);
    }

    if (!msg || String(msg).trim() === '') {
        msg = `Error ${status || 'en la solicitud'}`;
    }

    return String(msg);
};

const handleErrorResponse = async (response) => {
    let errorData = null;
    try {
        errorData = await response.json();
    } catch {
        errorData = null;
    }

    const mensaje = extraerMensajeError(errorData, response.status);

    // Si la cuenta fue desactivada → limpiar sesión y redirigir
    if (
        response.status === 401 &&
        mensaje.toLowerCase().includes('desactivada')
    ) {
        localStorage.removeItem('token_client');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token_admin');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');

        // Redirigir al login
        window.location.href = '/login';
    }

    const err = new Error(mensaje);
    err.status = response.status;
    err.data = errorData;
    throw err;
};

// GET
export const apiGet = async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: getHeaders(),
        credentials: 'include',
    });
    if (!response.ok) {
        await handleErrorResponse(response);
    }

    return response.json();
};

// POST
export const apiPost = async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include',
    });
    if (!response.ok) {
        await handleErrorResponse(response);
    }

    return response.json();
};

// PATCH
export const apiPatch = async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include',
    });
    if (!response.ok) {
        await handleErrorResponse(response);
    }

    return response.json();
};

// DELETE
export const apiDelete = async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
    });
    if (!response.ok) {
        await handleErrorResponse(response);
    }

    return response.json();
};

export default API_URL;