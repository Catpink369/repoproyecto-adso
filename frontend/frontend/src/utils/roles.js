// src/utils/roles.js
export const esAdministrador = (user) => {
    return user?.id_rol_usuario === '1' || user?.id_rol_usuario === '3';
};

export const getRolLabel = (user) => {
    switch (user?.id_rol_usuario) {
        case '1':
            return 'Administrador';
        case '3':
            return 'Trabajador';
        case '2':
            return 'Usuario';
        default:
            return '';
    }
};