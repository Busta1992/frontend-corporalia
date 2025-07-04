import React from 'react';
import { useNavigate } from 'react-router-dom';

const regiones = ['Bilbao', 'Madrid', 'Barcelona', 'Malaga', 'Sevilla'];

const Menu: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (region: string) => {
    let path = region.toLowerCase();

    if (path === 'malaga') {
      path = 'Malaga'; // Ruta especial para Norte
    }

    navigate(`/${path}`);
  };

  return (
    <div style={styles.container}>
      {/* Botón de volver al menú superior */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button
          onClick={() => navigate('/inicio')}
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
          ← Volver al Menú Principal
        </button>
      </div>

      <h2 style={styles.title}>Visual Padel</h2>
      <div style={styles.buttonGroup}>
        <div style={styles.row}>
          {regiones.slice(0, 3).map((region, index) => (
            <button key={index} style={styles.button} onClick={() => handleClick(region)}>
              {region}
            </button>
          ))}
        </div>
        <div style={styles.row}>
          {regiones.slice(3).map((region, index) => (
            <button key={index + 3} style={styles.button} onClick={() => handleClick(region)}>
              {region}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(to right,rgb(147, 213, 0),rgb(147, 213, 0))',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    padding: '60px',
    position: 'relative' as const, // ✅ para posicionar el botón correctamente
  },
  title: {
    fontSize: '56px',
    fontWeight: 'bold' as const,
    marginBottom: '70px',
    textShadow: '2px 2px 6px rgba(0,0,0,0.3)',
    fontFamily: 'Poppins, sans-serif',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '40px',
  },
  row: {
    display: 'flex',
    gap: '50px',
    justifyContent: 'center',
  },
  button: {
    padding: '28px 60px',
    fontSize: '26px',
    fontWeight: 'bold' as const,
    borderRadius: '20px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.25)',
    color: '#fff',
    cursor: 'pointer',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease, background 0.3s ease',
  },
};

export default Menu;
