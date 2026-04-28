const { useState } = window.React;
import { usePacientesCRUD } from '../hooks/usePacientesCRUD.js';

export const AppointmentForm = () => {
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
    <React.Fragment>
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
    </React.Fragment>
  );
};