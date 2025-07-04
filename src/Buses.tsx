import React from 'react';
import { useNavigate } from 'react-router-dom';

const regiones = [
  { nombre: 'Madrid', ruta: 'busesMadrid' },
  { nombre: 'Andalucía', ruta: 'andalucia' },
  { nombre: 'CastillaLaMancha', ruta: 'CastillaLaMancha' },
  { nombre: 'Castilla y León', ruta: 'CastillaLeon' },
  { nombre: 'Levante', ruta: 'levante' },
  { nombre: 'Norte', ruta: 'norte' },
  { nombre: 'Extremadura', ruta: 'extremadura' },
  { nombre: 'Mallorca', ruta: 'mallorca' },
];

const Buses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button onClick={() => navigate('/inicio')} style={styles.backButton}>
          ⬅️ Volver al Menú Principal
        </button>
      </div>

      <h2 style={styles.title}>🚌 Regiones de Buses</h2>

      <div style={styles.grid}>
        {regiones.map((region) => (
          <button
            key={region.ruta}
            style={styles.button}
            onClick={() => navigate(`/buses/${region.ruta}`)}
          >
            {region.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, rgb(245, 158, 0), rgb(245, 158, 0))',
    padding: '20px',
    boxSizing: 'border-box',
  },
  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgb(245, 158, 0)',
    paddingBottom: '10px',
  },
  backButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  title: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: '10px',
    marginBottom: '30px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  button: {
    padding: '25px 0',
    fontSize: '1.5rem',
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

export default Buses;
