export const API_URL = 'https://hospital-poli-backend.onrender.com';

export const API_ENDPOINTS = {
  PACIENTES: '/api/pacientes',
  PACIENTE_BY_ID: (id) => `/api/pacientes/${id}`,
};

export const HEADERS = { 'Content-Type': 'application/json' };