/**
 * Cliente API centralizado para Hospital EL POLI
 * Encapsula toda la lógica de comunicación con el backend
 */

import { API_URL, API_ENDPOINTS, HEADERS } from '../constants/api.js';

export class PacientesAPI {
  /**
   * Obtener lista completa de pacientes
   * GET /api/pacientes
   */
  static async obtenerPacientes() {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PACIENTES}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error en GET /api/pacientes:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo paciente (cita)
   * POST /api/pacientes
   */
  static async crearPaciente(datos) {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PACIENTES}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(datos),
      });

      // Intentar extraer el cuerpo de la respuesta (error o éxito)
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        // Si la respuesta tiene estructura de errores, construir mensaje descriptivo
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          const errorMessages = responseData.errors
            .map(err => Object.values(err)[0])
            .join(', ');
          const error = new Error(errorMessages);
          error.status = response.status;
          throw error;
        }
        // Si tiene un mensaje genérico
        if (responseData?.msg) {
          const error = new Error(responseData.msg);
          error.status = response.status;
          throw error;
        }
        // Fallback a mensaje genérico
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return responseData;
    } catch (error) {
      console.error('❌ Error en POST /api/pacientes:', error);
      throw error;
    }
  }

  /**
   * Actualizar paciente existente
   * PUT /api/pacientes/:id
   */
  static async actualizarPaciente(id, datos) {
    try {
      const response = await fetch(
        `${API_URL}${API_ENDPOINTS.PACIENTE_BY_ID(id)}`,
        {
          method: 'PUT',
          headers: HEADERS,
          body: JSON.stringify(datos),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Error en PUT /api/pacientes/${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar paciente
   * DELETE /api/pacientes/:id
   */
  static async eliminarPaciente(id) {
    try {
      const response = await fetch(
        `${API_URL}${API_ENDPOINTS.PACIENTE_BY_ID(id)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Error en DELETE /api/pacientes/${id}:`, error);
      throw error;
    }
  }
};
