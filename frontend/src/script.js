/**
 * LÓGICA FRONT-END HOSPITAL EL POLI
 * Proyecto: Entrega 2, Semana 5 - Subgrupo 9
 * * Desarrolladores:
 * - Ignacio Julio Posada
 * - Luis Alejandro Murcia Pimiento
 * - Christian Alejandro Granada Dorado
 * - Emmanuel López Velandia
 */

const { useState, useEffect } = React;

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
  useEffect(() => {
    const form = document.getElementById("cita-form");
    if (!form) return;
    const handleSubmit = (e) => {
      e.preventDefault();
      setData({ nombre: form.nombre.value, fecha: form.fecha.value });
      form.reset();
    };
    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);
  return data ? <ConfirmModal {...data} onClose={() => setData(null)} /> : null;
};

/* --- 3. COMPONENTE ESPECIALISTAS (NUEVO DISEÑO ELEVADO) --- */
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
      
      {/* TARJETA ELEVADA CON BOTÓN FLOTANTE */}
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

      {/* GRID DE DOCTORES */}
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

/* --- 4. RENDERIZADO EN EL DOM --- */
const renderApp = () => {
  const videoRoot = document.getElementById("video-root");
  const confirmRoot = document.getElementById("confirm-root");
  const especialistasRoot = document.getElementById("especialistas-root");

  if (videoRoot) ReactDOM.createRoot(videoRoot).render(<VideoButton />);
  if (confirmRoot) ReactDOM.createRoot(confirmRoot).render(<AppointmentConfirm />);
  if (especialistasRoot) ReactDOM.createRoot(especialistasRoot).render(<EspecialistasSection />);
};

renderApp();

const API_URL = 'https://hospital-poli-backend.onrender.com'; // En Producción
// O en desarrollo:
// const API_URL = 'http://localhost:3000';

fetch(`${window.API_URL}/api/pacientes`)