import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobiliarioNorte: React.FC = () => {
  const navigate = useNavigate();

  const zonas = [{ nombre: 'Torrelavega', ruta: 'torrelavega' }];

  const handleClick = (ruta: string) => {
    navigate(`/mobiliario/${ruta}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🪧 Marquesinas</h1>

      {/* Botón de volver al menú superior */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button
          onClick={() => navigate('/mobiliario')}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 40px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
        >
          ← Volver al Menú Principal
        </button>
      </div>

      {/* Botón Cantabria centrado debajo de Marquesinas */}
      <div style={styles.buttonContainer}>
        <button
          onClick={() => handleClick(zonas[0].ruta)}
          style={styles.button}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.93)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 10px 18px rgba(0, 0, 0, 0.3)')}
          onMouseOut={(e) => (e.currentTarget.style.boxShadow = styles.button.boxShadow!)}
        >
          {zonas[0].nombre}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom right, rgb(245, 158, 0), rgb(245, 158, 0))',
    minHeight: '100vh',
    padding: '40px 20px',
    position: 'relative',
  },
  title: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  button: {
    padding: '35px 50px',
    fontSize: '2rem',
    fontWeight: 'bold',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.2s ease-in-out',
  },
};

export default MobiliarioNorte;
