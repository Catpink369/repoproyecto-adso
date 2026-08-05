
const API_URL = 'http://localhost:3000';

// Obtiene los headers con token y authorization
const getHeaders = () => {
    
    return {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY,
    };
};

// GET
export const apiGet = async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: getHeaders(),
        credentials: 'include',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
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
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
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
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
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
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
    }

    return response.json();
};

export default API_URL;