export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Sumar el offset de zona horaria para prevenir que el día cambie por horas UTC
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};