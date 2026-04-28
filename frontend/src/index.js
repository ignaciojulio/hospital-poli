/**
 * APLICACIÓN PRINCIPAL - HOSPITAL EL POLI
 * 
 * Archivo limpio que orquesta los componentes
 * Todos los componentes, hooks y utilidades están organizados en carpetas
 */

import { VideoButton } from './components/VideoButton.jsx';
import { AppointmentForm } from './components/AppointmentForm.jsx';
import { EspecialistasSection } from './components/EspecialistasSection.jsx';
import { AdminPanel } from './components/AdminPanel.jsx';

/**
 * Función principal de renderizado
 * Monta todos los componentes en sus respectivos div del HTML
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

// Ejecutar cuando el DOM está listo (o inmediatamente si ya lo está por ser defer)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
