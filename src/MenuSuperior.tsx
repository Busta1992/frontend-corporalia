import React from 'react';
import { useNavigate } from 'react-router-dom';

const MenuSuperior: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      {/* Botón para volver al Home */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer'
          }}
        >
          ← Volver al Menú Usuario
        </button>
      </div>

      <h1 style={titleStyle}>Menú Principal</h1>
      <div style={buttonGroupStyle}>
        <button onClick={() => navigate('/menu')} style={buttonStyle}>🎾 Visual Pádel</button>
        
        <button onClick={() => navigate('/buses')} style={buttonStyle}>🚌 Buses</button>

        <button onClick={() => navigate('/mobiliario')} style={buttonStyle}>🪑 Mobiliario</button>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: 'linear-gradient(to bottom right,rgb(245, 158, 0),rgb(245, 158, 0))',
  position: 'relative', // necesario para posicionar el botón arriba a la izquierda
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'Fredoka, sans-serif',
  fontSize: '2.2rem',
  marginBottom: '30px',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '30px',
};

const buttonStyle: React.CSSProperties = {
  padding: '20px 50px',
  fontSize: '1.3rem',
  fontWeight: 'bold',
  borderRadius: '12px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: 'white',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

export default MenuSuperior;
