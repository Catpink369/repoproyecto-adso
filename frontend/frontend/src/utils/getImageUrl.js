const API_URL = 'http://localhost:3000';
const PLACEHOLDER = 'https://placehold.co/400x300?text=Gurama+Online/400x400?text=Sin+Imagen';

// Devuelve la URL completa para mostrar una imagen de producto/material/diseño.
// - Si no hay ruta, devuelve un placeholder.
// - Si ya es una URL absoluta (Cloudinary: http/https), la deja tal cual.
// - Si es una ruta relativa vieja (/uploads/...), le antepone el host del backend.
export function getImageUrl(rutaImagen) {
  if (!rutaImagen) return PLACEHOLDER;
  if (rutaImagen.startsWith('http://') || rutaImagen.startsWith('https://')) {
    return rutaImagen;
  }
  return `${API_URL}${rutaImagen}`;
}