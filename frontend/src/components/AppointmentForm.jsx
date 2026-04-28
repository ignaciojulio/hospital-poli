const { useState } = window.React;
import { usePacientesCRUD } from '../hooks/usePacientesCRUD.js';

export const AppointmentForm = () => {
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
      
      // Si es un error de email duplicado, ofrecer una solución clara
      if (error.errorCode === 'EMAIL_ALREADY_EXISTS' || error.status === 409) {
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
    <React.Fragment>
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
          borderLeft: '4px solid #ff9800'
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
    </React.Fragment>
  );
};