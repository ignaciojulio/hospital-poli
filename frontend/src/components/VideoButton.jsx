const { useState } = window.React;

export const VideoButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};