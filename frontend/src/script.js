/**
 * LÓGICA FRONT-END HOSPITAL EL POLI
 * Proyecto: Entrega 2, Semana 5 - Subgrupo 9
 * Stack PERN: PostgreSQL + Express + React + Node.js
 * Desarrolladores:
 * - Ignacio Julio Posada
 * - Luis Alejandro Murcia Pimiento
 * - Christian Alejandro Granada Dorado
 * - Emmanuel López Velandia
 */

const { useState, useEffect } = React;

// ============================================
// CONFIGURACIÓN API
// ============================================
const API_URL = 'https://hospital-poli-backend.onrender.com'; // PRODUCCIÓN

/* --- 1. COMPONENTE VIDEO MODAL --- */
const VideoModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>✕</button>
      <h3 className="modal-title">Hospital EL POLI — Conócenos</h3>
      <iframe
        className="modal-iframe"
        src="https://www.youtube.com/embed/tZeR1AGk_Uk?autoplay=1&mute=1"
        allowFullScreen
      />
    </div>
  </div>
);

const VideoButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button className="btn-text" onClick={() => setIsOpen(true)}>
        ▶ Ver video institucional
      </button>
      {isOpen && <VideoModal onClose={() => setIsOpen(false)} />}
    </>
  );
};

/* --- 2. COMPONENTE CONFIRMACIÓN DE CITAS --- */
const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
};

const ConfirmModal = ({ nombre, fecha, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
      <div className="confirm-icon">✓</div>
      <h3 className="confirm-title">¡Solicitud recibida!</h3>
      <p className="confirm-text">
        Hola <strong>{nombre}</strong>, cita para el <strong>{formatDate(fecha)}</strong>.
      </p>
      <button className="btn-primary confirm-btn" onClick={onClose}>
        Entendido
      </button>
    </div>
  </div>
);

const AppointmentConfirm = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const form = document.getElementById("cita-form");
    if (!form) return;

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const formData = {
        nombre: form.nombre.value,
        email: form.email.value,
        fecha_cita: form.fecha.value,
      };

      try {
        // ========================================
        // CREATE (C) - Registrar nueva cita
        // ========================================
        const response = await fetch(`${API_URL}/api/pacientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Error al registrar cita');

        const result = await response.json();
        console.log('✓ Cita registrada:', result);

        // Mostrar confirmación
        setData({ nombre: formData.nombre, fecha: formData.fecha_cita });
        form.reset();
      } catch (err) {
        console.error('✗ Error en registro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  return (
    <>
      {error && <div style={{color: 'red', padding: '10px', margin: '10px 0'}}>Error: {error}</div>}
      {data && <ConfirmModal {...data} onClose={() => setData(null)} />}
    </>
  );
};

// ============================================
// 3. COMPONENTE ESPECIALISTAS
// ============================================
const EspecialistasSection = () => {
  const [visible, setVisible] = useState(false);
  const especialistas = [
    { id: 1, nombre: "Dr. Camilo Ruiz", cargo: "Pediatra Principal", dias: ["Lun", "Mie", "Vie"] },
    { id: 2, nombre: "Dra. Alena Gómez", cargo: "Medicina General", dias: ["Mar", "Jue", "Sab"] },
    { id: 3, nombre: "Dr. Marco Tulio", cargo: "Cirujano General", dias: ["Lun", "Mar", "Mie", "Jue"] },
    { id: 4, nombre: "Dr. Carlos José", cargo: "Odontólogo", dias: ["Mar", "Mie", "Jue", "Sab"] }
  ];
  const semana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

  return (
    <div className="specialists-wrapper">
      <div className="specialists-trigger-card">
        <button 
          className={`btn-floating-specialists ${visible ? 'active' : ''}`}
          onClick={() => setVisible(!visible)}
        >
          <span className="icon-circle">{visible ? "✕" : "✚"}</span>
          {visible ? "Ocultar Lista de Especialistas" : "Ver Especialistas y Disponibilidad"}
        </button>
        <p className="trigger-helper-text">
          Haga clic para conocer a nuestros expertos y sus horarios.
        </p>
      </div>

      {visible && (
        <div className="doctors-grid">
          {especialistas.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-avatar">
                {doc.nombre.charAt(4)}
              </div>
              <h3>{doc.nombre}</h3>
              <p className="doctor-role">{doc.cargo}</p>
              
              <div className="calendar-container">
                <small>Disponibilidad</small>
                <div className="calendar-grid">
                  {semana.map((dia) => (
                    <div key={dia} className={`calendar-day ${doc.dias.includes(dia) ? "day-available" : ""}`}>
                      {dia}
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="btn-outline" 
                style={{ marginTop: "20px", width: "100%" }} 
                onClick={() => (window.location.href = "#citas")}
              >
                Solicitar Cita
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 4. COMPONENTE PANEL DE ADMINISTRACIÓN (CRUD)
// ============================================
const AdminPanel = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  // ========================================
  // READ (R) - Cargar lista de pacientes
  // ========================================
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/pacientes`);
        if (!response.ok) throw new Error('Error al cargar pacientes');
        const data = await response.json();
        console.log('✓ Pacientes cargados:', data);
        setPacientes(data);
      } catch (err) {
        console.error('✗ Error en READ:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  // ========================================
  // UPDATE (U) - Actualizar estado/datos
  // ========================================
  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Error al actualizar paciente');

      const updated = await response.json();
      console.log('✓ Paciente actualizado:', updated);

      // Actualizar lista en tiempo real
      setPacientes(pacientes.map(p => p.id === id ? updated : p));
      setEditingId(null);
      setEditData({});
    } catch (err) {
      console.error('✗ Error en UPDATE:', err);
      alert('Error: ' + err.message);
    }
  };

  // ========================================
  // DELETE (D) - Eliminar paciente
  // ========================================
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este paciente?')) return;

    try {
      const response = await fetch(`${API_URL}/api/pacientes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar paciente');

      console.log('✓ Paciente eliminado:', id);

      // Actualizar lista en tiempo real
      setPacientes(pacientes.filter(p => p.id !== id));
    } catch (err) {
      console.error('✗ Error en DELETE:', err);
      alert('Error: ' + err.message);
    }
  };

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(p => {
    if (filterStatus === 'all') return true;
    return p.estado === filterStatus;
  });

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando pacientes...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📋 Panel de Administración - Gestión de Pacientes</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Filtrar por estado: </label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="atendido">Atendido</option>
        </select>
        <p style={{ fontSize: '0.9em', color: '#666' }}>Total de pacientes: <strong>{pacientesFiltrados.length}</strong></p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Fecha Cita</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((paciente) => (
              <tr key={paciente.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{paciente.id}</td>
                <td style={{ padding: '12px' }}>
                  {editingId === paciente.id ? (
                    <input
                      type="text"
                      value={editData.nombre || paciente.nombre}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                    />
                  ) : (
                    paciente.nombre
                  )}
                </td>
                <td style={{ padding: '12px' }}>{paciente.email}</td>
                <td style={{ padding: '12px' }}>
                  {editingId === paciente.id ? (
                    <input
                      type="date"
                      value={editData.fecha_cita || paciente.fecha_cita}
                      onChange={(e) => setEditData({ ...editData, fecha_cita: e.target.value })}
                    />
                  ) : (
                    paciente.fecha_cita
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  {editingId === paciente.id ? (
                    <select
                      value={editData.estado || paciente.estado || 'pendiente'}
                      onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="atendido">Atendido</option>
                    </select>
                  ) : (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: paciente.estado === 'atendido' ? '#28a745' : '#ffc107',
                      color: paciente.estado === 'atendido' ? 'white' : '#333',
                      fontSize: '0.85em',
                    }}>
                      {paciente.estado || 'pendiente'}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {editingId === paciente.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(paciente.id)}
                        style={{
                          padding: '6px 12px',
                          marginRight: '5px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        💾 Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(paciente.id);
                          setEditData({ nombre: paciente.nombre, fecha_cita: paciente.fecha_cita, estado: paciente.estado });
                        }}
                        style={{
                          padding: '6px 12px',
                          marginRight: '5px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ✔ Atender
                      </button>
                      <button
                        onClick={() => handleDelete(paciente.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑 Borrar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pacientesFiltrados.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          No hay pacientes para mostrar
        </div>
      )}
    </div>
  );
};

// ============================================
// 5. RENDERIZADO EN EL DOM
// ============================================
const renderApp = () => {
  const videoRoot = document.getElementById("video-root");
  const confirmRoot = document.getElementById("confirm-root");
  const especialistasRoot = document.getElementById("especialistas-root");
  const adminRoot = document.getElementById("admin-root");

  if (videoRoot) ReactDOM.createRoot(videoRoot).render(<VideoButton />);
  if (confirmRoot) ReactDOM.createRoot(confirmRoot).render(<AppointmentConfirm />);
  if (especialistasRoot) ReactDOM.createRoot(especialistasRoot).render(<EspecialistasSection />);
  if (adminRoot) ReactDOM.createRoot(adminRoot).render(<AdminPanel />);
};

renderApp();