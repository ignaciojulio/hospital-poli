import { useFetchPacientes } from '../hooks/useFetchPacientes.js';
import { usePacientesCRUD } from '../hooks/usePacientesCRUD.js';
import { AdminTableRow } from './AdminTableRow.jsx';

export const AdminPanel = () => {
  const { pacientes, setPacientes, loading, error } = useFetchPacientes();
  const { actualizarPaciente, eliminarPaciente } = usePacientesCRUD();

  const handleUpdate = async (id, datos) => {
    try {
      const actualizado = await actualizarPaciente(id, datos);
      setPacientes(pacientes.map(p => p.id === id ? actualizado : p));
    } catch (err) {
      alert('Error al actualizar paciente');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este paciente?')) {
      try {
        await eliminarPaciente(id);
        setPacientes(pacientes.filter(p => p.id !== id));
      } catch (err) {
        alert('Error al eliminar paciente');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Cargando pacientes...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '20px', color: '#4200ff' }}>Panel de Administración de Citas</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px' }}>Nombre</th><th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Fecha Cita</th><th style={{ padding: '12px' }}>Estado</th>
            <th style={{ padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map(pac => (<AdminTableRow key={pac.id} paciente={pac} onUpdate={handleUpdate} onDelete={handleDelete} />))}
          {pacientes.length === 0 && (<tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay pacientes registrados.</td></tr>)}
        </tbody>
      </table>
    </div>
  );
};