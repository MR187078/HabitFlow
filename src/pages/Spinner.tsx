import React from 'react';
import './Spinner.css'; // Archivo CSS para estilos del spinner

const Spinner: React.FC = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  );
};

export default Spinner;