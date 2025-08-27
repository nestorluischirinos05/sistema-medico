// utils/formatoFecha.js
export const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};