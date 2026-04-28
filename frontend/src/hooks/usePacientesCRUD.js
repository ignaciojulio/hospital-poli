import { PacientesAPI } from '../utils/apiClient.js';

export const usePacientesCRUD = () => {
  const crearPaciente = async (datos) => {
    return await PacientesAPI.crearPaciente(datos);
  };

  const actualizarPaciente = async (id, datos) => {
    return await PacientesAPI.actualizarPaciente(id, datos);
  };

  const eliminarPaciente = async (id) => {
    return await PacientesAPI.eliminarPaciente(id);
  };

  return { crearPaciente, actualizarPaciente, eliminarPaciente };
};