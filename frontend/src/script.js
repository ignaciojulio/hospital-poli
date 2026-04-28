/**
 * SCRIPT MONOLÍTICO - HOSPITAL EL POLI
 *
 * Este archivo unifica toda la lógica de la aplicación en un solo lugar
 * para solucionar problemas de despliegue con módulos en Render.
 * Contiene constantes, utilidades, el cliente API, hooks y componentes de React.
 *
 * ¿Por qué un solo archivo?
 * Para este proyecto, que no utiliza un empaquetador como Webpack o Vite,
 * unificar el código en un solo script que es procesado por Babel Standalone
 * en el navegador es la forma más sencilla de asegurar la compatibilidad
 * y evitar problemas de CORS o de tipo MIME al cargar módulos (`.jsx`).
 */

// Desestructuración de React.
// Como React se carga desde un CDN, el objeto `React` está disponible globalmente en `window`.
// Extraemos las funciones que más usaremos para un código más limpio.
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

// Datos estáticos. Tenerlos aquí permite modificarlos sin tocar la lógica de los componentes.
const ESPECIALISTAS = [
  { id: 1, nombre: 'Dr. Carlos Mendoza', especialidad: 'Cardiología' },
  { id: 2, nombre: 'Dra. Ana López', especialidad: 'Pediatría' },
  { id: 3, nombre: 'Dr. Luis Ramírez', especialidad: 'Medicina General' },
  { id: 4, nombre: 'Dra. Marta Silva', especialidad: 'Neurología' }
];

// =================================================================
// 2. UTILIDADES
// =================================================================

/**
 * Formatea una cadena de fecha (ej. '2023-10-27T00:00:00.000Z') a un formato legible en español.
 * @param {string} dateString - La fecha en formato ISO.
 * @returns {string} La fecha formateada (ej. "27 de octubre de 2023") o un string vacío si la entrada es inválida.
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  /**
   * ¿Por qué este cálculo? El objeto `Date` de JS puede ser complicado con zonas horarias.
   * Al recibir una fecha del backend (que viene en UTC), el navegador puede interpretarla
   * y mostrar el día anterior. Este ajuste compensa el offset de la zona horaria local.
   */
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

// =================================================================
// 3. CLIENTE API
// =================================================================

/**
 * @class PacientesAPI
 * @description Clase estática que centraliza todas las peticiones `fetch` al backend.
 * ¿Por qué una clase? Agrupa toda la comunicación con la API en un solo lugar (Patrón API Client).
 * Si en el futuro la API cambia (ej. una nueva versión /v2), solo modificamos este archivo.
 */
class PacientesAPI {
  /**
   * Obtiene la lista completa de pacientes.
   * @returns {Promise<Array<Object>>} Una promesa que resuelve a un array de pacientes.
   */
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

  /**
   * Crea un nuevo paciente (cita).
   * @param {Object} datos - Objeto con los datos del paciente {nombre, email, fecha_cita}.
   * @returns {Promise<Object>} Una promesa que resuelve al objeto del paciente recién creado.
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
        // Prioridad 1: Si tiene un mensaje explícito del servidor (error de negocio)
        if (responseData?.msg) {
          const error = new Error(responseData.msg);
          error.status = response.status;
          error.errorCode = responseData.error_code;
          throw error;
        }
        
        // Prioridad 2: Si la respuesta tiene estructura de errores de validación (422)
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          const errorMessages = responseData.errors
            .map(err => Object.values(err)[0])
            .join('\n');
          const error = new Error(errorMessages);
          error.status = response.status;
          error.validationErrors = responseData.errors;
          throw error;
        }
        
        // Fallback: mensaje genérico basado en HTTP status
        const statusMessages = {
          400: 'Datos inválidos. Por favor revisa tu entrada.',
          409: 'El correo electrónico ya está registrado.',
          422: 'Hay errores en los datos. Por favor revisa tu entrada.',
          429: 'Demasiadas solicitudes. Por favor espera unos momentos.',
          500: 'Error del servidor. Por favor intenta más tarde.',
        };
        
        const errorMsg = statusMessages[response.status] || `Error ${response.status}: ${response.statusText}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Error en POST /api/pacientes:', error);
      throw error;
    }
  }

  /**
   * Actualiza un paciente existente.
   * @param {number|string} id - El ID del paciente a actualizar.
   * @param {Object} datos - Objeto con los campos a actualizar {fecha_cita, estado}.
   * @returns {Promise<Object>} Una promesa que resuelve al objeto del paciente actualizado.
   */
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

  /**
   * Elimina un paciente.
   * @param {number|string} id - El ID del paciente a eliminar.
   * @returns {Promise<Object>} Una promesa que resuelve a un mensaje de confirmación del backend.
   */
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

/**
 * @hook useFetchPacientes
 * @description Hook personalizado para obtener y gestionar la lista de pacientes.
 * Encapsula la lógica de fetching (petición GET), el estado de carga (loading) y el manejo de errores.
 * @returns {{pacientes: Array, setPacientes: Function, loading: boolean, error: string|null}} Un objeto con el estado de los pacientes.
 */
const useFetchPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const doFetch = async () => {
      try {
        const data = await PacientesAPI.obtenerPacientes();
        setPacientes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        // `finally` asegura que `loading` se desactive siempre, haya o no un error.
        setLoading(false);
      }
    };
    doFetch();
  }, []); // El array de dependencias vacío `[]` significa que este efecto se ejecuta solo una vez (al montar el componente).

  return { pacientes, setPacientes, loading, error };
};

/**
 * @hook usePacientesCRUD
 * @description Hook personalizado que provee funciones para crear, actualizar y eliminar pacientes.
 * No maneja estado, simplemente expone los métodos del `PacientesAPI` para ser usados en los componentes.
 * @returns {{crearPaciente: Function, actualizarPaciente: Function, eliminarPaciente: Function}}
 *          Un objeto con las funciones para realizar las operaciones CRUD.
 */
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

/**
 * @component VideoButton
 * @description Un botón que, al ser presionado, abre un modal con un video de YouTube.
 * Maneja su propio estado interno (`isOpen`) para mostrar u ocultar el modal.
 * @returns {React.ReactElement} El componente renderizado.
 */
const VideoButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Fragment>
      <button className="btn-outline" onClick={() => setIsOpen(true)}>
        Ver Video Institucional
      </button>
      {isOpen && ( // El `Fragment` permite agrupar elementos sin añadir un `div` extra al DOM.
        // El modal se renderiza condicionalmente basado en el estado `isOpen`.
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

/**
 * @component AppointmentForm
 * @description Formulario para que los usuarios soliciten una nueva cita.
 * Maneja el estado del formulario, la petición POST al backend y muestra una confirmación.
 * @returns {React.ReactElement} El componente renderizado.
 */
const AppointmentForm = () => {
  // `useState` para controlar los datos del formulario y el modal de confirmación.
  const [formData, setFormData] = useState({ nombre: '', email: '', fecha_cita: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { crearPaciente } = usePacientesCRUD();

  // Validación local del cliente
  const validarFormulario = () => {
    if (!formData.nombre || !formData.email || !formData.fecha_cita) {
      return 'Por favor completa todos los campos.';
    }
    if (formData.nombre.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }
    if (!formData.email.includes('@')) {
      return 'Por favor ingresa un correo electrónico válido.';
    }
    // Validar que la fecha no sea en el pasado
    const fechaIngresada = new Date(formData.fecha_cita);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaIngresada < hoy) {
      return 'La fecha de la cita no puede ser en el pasado.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    // `e.preventDefault()` evita que el formulario recargue la página, comportamiento por defecto de HTML.
    e.preventDefault();
    setError('');
    
    // Validar datos del cliente
    const validationError = validarFormulario();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await crearPaciente(formData);
      setShowConfirm(true);
      setFormData({ nombre: '', email: '', fecha_cita: '' });
      setTimeout(() => setShowConfirm(false), 3000);
    } catch (error) {
      // Interpretar el error y proporcionar un mensaje amigable y específico
      let displayError = error.message;
      
      // Si es un error de validación (422)
      if (error.status === 422) {
        if (error.validationErrors && Array.isArray(error.validationErrors)) {
          // Agrupar errores por campo
          displayError = error.validationErrors
            .map(err => {
              const field = Object.keys(err)[0];
              const message = err[field];
              return `• ${message}`;
            })
            .join('\n');
        }
        displayError = `❌ Por favor revisa los datos:\n${displayError}`;
      }
      // Si es un error de email duplicado
      else if (error.errorCode === 'EMAIL_ALREADY_EXISTS' || error.status === 409) {
        displayError = `⚠️ ${error.message}`;
      } 
      // Si es un error de validación/datos inválidos
      else if (error.status === 400) {
        displayError = `⚠️ Por favor revisa los datos: ${error.message}`;
      }
      // Si es un error de rate limit (demasiadas solicitudes)
      else if (error.status === 429) {
        displayError = '⏱️ Estás enviando demasiadas solicitudes. Por favor espera 15 minutos antes de intentar de nuevo.';
      }
      // Si es un error del servidor
      else if (error.status === 500) {
        displayError = '🔧 Error del servidor. Nuestro equipo ha sido notificado. Por favor intenta de nuevo más tarde.';
      }
      // Fallback
      else {
        displayError = displayError || 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
      }
      
      setError(displayError);
      console.error('Error al crear cita:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      {/* Este es un "componente controlado": el valor de los inputs está ligado al estado de React. */}
      <form onSubmit={handleSubmit} className="inline-form">
        <input type="text" placeholder="Nombre completo" 
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          disabled={isLoading}
          required />
        <input type="email" placeholder="Correo electrónico" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          disabled={isLoading}
          required />
        <input type="date" 
          value={formData.fecha_cita}
          onChange={(e) => setFormData({...formData, fecha_cita: e.target.value})}
          disabled={isLoading}
          required />
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Procesando...' : 'Enviar Solicitud'}
        </button>
      </form>

      {/* Mostrar mensajes de error específicos */}
      {error && (
        <div className="error-box" style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px 16px',
          marginTop: '12px',
          borderRadius: '4px',
          border: '1px solid #ffeaa7',
          fontSize: '14px',
          borderLeft: '4px solid #ff9800',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.5'
        }}>
          {error}
        </div>
      )}
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

/**
 * @component EspecialistasSection
 * @description Muestra una cuadrícula con las tarjetas de los especialistas.
 * Es un componente "de presentación" o "tonto", ya que solo muestra datos y no tiene lógica compleja.
 * @returns {React.ReactElement} El componente renderizado.
 */
const EspecialistasSection = () => {
  return (
    <Fragment>
      <div className="specialists-trigger-card">
        <h2>Nuestro Equipo Médico</h2>
        <p className="trigger-helper-text">Contamos con los mejores profesionales para tu salud.</p>
      </div>
      <div className="doctors-grid">
        {/* Mapea el array `ESPECIALISTAS` para renderizar cada tarjeta. La prop `key` es crucial para React. */}
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

/**
 * @component AdminTableRow
 * @description Representa una única fila en la tabla del panel de administración.
 * Maneja su propio estado de "edición" para cambiar entre mostrar datos y mostrar inputs.
 * @param {object} props Las propiedades del componente.
 * @param {object} props.paciente El objeto con los datos del paciente para esta fila.
 * @param {Function} props.onUpdate Función (del componente padre) para guardar los cambios.
 * @param {Function} props.onDelete Función (del componente padre) para eliminar el paciente.
 * @returns {React.ReactElement} El componente `<tr>` renderizado.
 */
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
        {/* Renderizado condicional: muestra un input si `isEditing` es true, o el texto si es false. */}
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

/**
 * @component AdminPanel
 * @description El componente principal para la administración de citas.
 * Orquesta todo: obtiene los datos con `useFetchPacientes`, pasa las funciones de
 * actualización/eliminación a `AdminTableRow` y renderiza la tabla completa.
 * @returns {React.ReactElement} El componente renderizado.
 */
const AdminPanel = () => {
  const { pacientes, setPacientes, loading, error } = useFetchPacientes();
  const { actualizarPaciente, eliminarPaciente } = usePacientesCRUD();

  const handleUpdate = async (id, datos) => {
    /**
     * ¿Por qué esta función está aquí y no en `AdminTableRow`? Es el patrón "Lifting State Up".
     * El estado (`pacientes`) vive en el padre (`AdminPanel`), y los hijos (`AdminTableRow`)
     * notifican al padre para que realice los cambios. Esto mantiene una única fuente de verdad.
     */
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

  // Manejo de los estados de carga y error para una mejor UX.
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
          {/* Se itera sobre `pacientes` y se pasa cada `pac` y las funciones handler a `AdminTableRow`. */}
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

/**
 * @function renderApp
 * @description Función principal que monta los componentes de React en el DOM.
 * Busca los `div` con los IDs correspondientes en el `index.html` y renderiza cada componente en su lugar.
 */
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

// Se asegura de que el script se ejecute solo después de que el DOM esté completamente cargado.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}