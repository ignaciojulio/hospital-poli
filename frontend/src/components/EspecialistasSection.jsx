import { ESPECIALISTAS } from '../constants/especialistas.js';

export const EspecialistasSection = () => {
  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};