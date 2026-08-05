// para encriptar los datos en el localStorage y sessionStorage  
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || 'clave_secreta_guruma';

const encrypt = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
        return null;
    }
};

export const secureStorage = {
    setItem: (key, value, storage = localStorage) => {
        const encrypted = encrypt(value);
        storage.setItem(key, encrypted);
    },

    getItem: (key, storage = localStorage) => {
        const encrypted = storage.getItem(key);
        if (!encrypted) return null;
        return decrypt(encrypted);
    },

    removeItem: (key, storage = localStorage) => {
        storage.removeItem(key);
    },
};