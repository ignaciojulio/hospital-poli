/**
 * SCRIPT MONOLÍTICO - HOSPITAL EL POLI
 * 
 * Este archivo unifica toda la lógica de la aplicación en un solo lugar
 * para solucionar problemas de despliegue con módulos en Render.
 * Contiene constantes, utilidades, el cliente API, hooks y componentes de React.
 */

// Desestructuración de React (disponible globalmente desde el CDN)
const { useState, useEffect, Fragment } = React;

// =================================================================
// 1. CONSTANTES
// =================================================================

const API_URL = 'https://hospital-poli-backend.onrender.com';

const API_ENDPOINTS = {
  PACIENTES: '/api/pacientes',
  PACIENTE_BY_ID: (id) => `/api/pacientes/${id}`,
};

const HEADERS = { 'Content-Type': 'application/json' };

const ESPECIALISTAS = [
  { id: 1, nombre: 'Dr. Carlos Mendoza', especialidad: 'Cardiología' },
  { id: 2, nombre: 'Dra. Ana López', especialidad: 'Pediatría' },
  { id: 3, nombre: 'Dr. Luis Ramírez', especialidad: 'Medicina General' },
  { id: 4, nombre: 'Dra. Marta Silva', especialidad: 'Neurología' }
];

// =================================================================
// 2. UTILIDADES
// =================================================================

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Sumar el offset de zona horaria para prevenir que el día cambie por horas UTC
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

// =================================================================
// 3. CLIENTE API
// =================================================================

class PacientesAPI {
  static async obtenerPacientes() {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PACIENTES}`, { method: 'GET' });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error en GET /api/pacientes:', error);
      throw error;
    }
  }

  static async crearPaciente(datos) {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PACIENTES}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error en POST /api/pacientes:', error);
      throw error;
    }
  }

  static async actualizarPaciente(id, datos) {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PACIENTE_BY_ID(id)}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(datos),
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`❌ Error en PUT /api/pacientes/${id}:`, error);
      throw error;
    }
  }

  static async eliminarPaciente(id) {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PACIENTE_BY_ID(id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`❌ Error en DELETE /api/pacientes/${id}:`, error);
      throw error;
    }
  }
}

// =================================================================
// 4. CUSTOM HOOKS
// =================================================================

const useFetchPacientes = () => {
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

const usePacientesCRUD = () => {
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

// =================================================================
// 5. COMPONENTES REACT
// =================================================================

// --- Componente: VideoButton ---
const VideoButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Fragment>
      <button className="btn-outline" onClick={() => setIsOpen(true)}>
        Ver Video Institucional
      </button>
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>
            <h2 className="modal-title">Conoce el Hospital EL POLI</h2>
            <iframe 
              className="modal-iframe" 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Video Institucional"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </Fragment>
  );
};

// --- Componente: AppointmentForm ---
const AppointmentForm = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', fecha_cita: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const { crearPaciente } = usePacientesCRUD();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearPaciente(formData);
      setShowConfirm(true);
      setFormData({ nombre: '', email: '', fecha_cita: '' });
      setTimeout(() => setShowConfirm(false), 3000);
    } catch (error) {
      alert('Error al agendar cita');
    }
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit} className="inline-form">
        <input type="text" placeholder="Nombre completo" 
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          required />
        <input type="email" placeholder="Correo electrónico" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required />
        <input type="date" 
          value={formData.fecha_cita}
          onChange={(e) => setFormData({...formData, fecha_cita: e.target.value})}
          required />
        <button type="submit" className="btn-primary">Enviar Solicitud</button>
      </form>
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-box">
            <div className="confirm-icon">✓</div>
            <h3 className="confirm-title">¡Cita Confirmada!</h3>
            <p>Hemos recibido tu solicitud correctamente.</p>
          </div>
        </div>
      )}
    </Fragment>
  );
};

// --- Componente: EspecialistasSection ---
const EspecialistasSection = () => {
  return (
    <Fragment>
      <div className="specialists-trigger-card">
        <h2>Nuestro Equipo Médico</h2>
        <p className="trigger-helper-text">Contamos con los mejores profesionales para tu salud.</p>
      </div>
      <div className="doctors-grid">
        {ESPECIALISTAS.map(doc => (
          <div key={doc.id} className="doctor-card">
            <div className="doctor-avatar">
              {doc.nombre.charAt(0)}
            </div>
            <h3>{doc.nombre}</h3>
            <p className="doctor-role">{doc.especialidad}</p>
          </div>
        ))}
      </div>
    </Fragment>
  );
};

// --- Componente: AdminTableRow ---
const AdminTableRow = ({ paciente, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fecha_cita: paciente.fecha_cita ? paciente.fecha_cita.split('T')[0] : '',
    estado: paciente.estado || 'Pendiente'
  });

  const handleSave = () => {
    onUpdate(paciente.id, editData);
    setIsEditing(false);
  };

  return (
    <tr>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{paciente.nombre}</td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{paciente.email}</td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        {isEditing ? (
          <input type="date" value={editData.fecha_cita} onChange={(e) => setEditData({...editData, fecha_cita: e.target.value})} />
        ) : (
          paciente.fecha_cita ? paciente.fecha_cita.split('T')[0] : ''
        )}
      </td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        {isEditing ? (
          <select value={editData.estado} onChange={(e) => setEditData({...editData, estado: e.target.value})}>
            <option value="Pendiente">Pendiente</option>
            <option value="Atendido">Atendido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        ) : (
          <span style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: paciente.estado === 'Atendido' ? '#d4edda' : '#fff3cd' }}>
            {paciente.estado}
          </span>
        )}
      </td>
      <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
        {isEditing ? (<button className="btn-primary" onClick={handleSave} style={{ marginRight: '8px' }}>Guardar</button>) 
                  : (<button className="btn-outline" onClick={() => setIsEditing(true)} style={{ marginRight: '8px' }}>Atender</button>)}
        <button className="btn-outline" style={{ color: 'red', borderColor: 'red' }} onClick={() => onDelete(paciente.id)}>Borrar</button>
      </td>
    </tr>
  );
};

// --- Componente: AdminPanel ---
const AdminPanel = () => {
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

// =================================================================
// 6. RENDERIZADO DE LA APLICACIÓN
// =================================================================

const renderApp = () => {
  const videoRoot = document.getElementById("video-root");
  const confirmRoot = document.getElementById("confirm-root");
  const especialistasRoot = document.getElementById("especialistas-root");
  const adminRoot = document.getElementById("admin-root");

  if (videoRoot) ReactDOM.createRoot(videoRoot).render(<VideoButton />);
  if (confirmRoot) ReactDOM.createRoot(confirmRoot).render(<AppointmentForm />);
  if (especialistasRoot) ReactDOM.createRoot(especialistasRoot).render(<EspecialistasSection />);
  if (adminRoot) ReactDOM.createRoot(adminRoot).render(<AdminPanel />);
};

// Ejecutar cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}