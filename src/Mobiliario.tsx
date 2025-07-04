import React from 'react';
import { useNavigate } from 'react-router-dom';

const regiones = [
  { nombre: 'Andalucía', ruta: 'andalucia' },
  { nombre: 'Norte', ruta: 'norte' },
  { nombre: 'Madrid', ruta: 'madrid' },
];

const Mobiliario: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (ruta: string) => {
    navigate(`/mobiliario/${ruta}`);
  };

  return (
    <div style={styles.container}>
      {/* Botón volver */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button
          onClick={() => navigate('/inicio')}
          style={styles.backButton}
        >
          ← Volver al Menú Principal
        </button>
      </div>

      <h2 style={styles.title}>🪑 Mobiliario</h2>

      <div style={styles.buttonGroup}>
        <div style={styles.row}>
          {regiones.map((region, index) => (
            <button
              key={index}
              style={styles.button}
              onClick={() => handleClick(region.ruta)}
            >
              {region.nombre}
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
    background: 'linear-gradient(to right, rgb(245, 158, 0), rgb(245, 158, 0))',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    padding: '60px',
    position: 'relative' as const,
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
    background: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease, background 0.3s ease',
  },
  backButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold' as const,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  },
};

export default Mobiliario;
