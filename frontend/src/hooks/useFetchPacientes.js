const { useState, useEffect } = window.React;
import { PacientesAPI } from '../utils/apiClient.js';

export const useFetchPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const data = await PacientesAPI.obtenerPacientes();
        setPacientes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  return { pacientes, setPacientes, loading, error };
};