import React from 'react';
import { useNavigate } from 'react-router-dom';

const BusesNorte: React.FC = () => {
  const navigate = useNavigate();
  const lineas = ['Cantabria', 'Galicia'];

  const handleClick = (linea: string) => {
    navigate(`/buses/${linea}`);
  };

  return (
    <div style={styles.container}>
      {/* Botón de volver al menú superior */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button
          onClick={() => navigate('/buses')}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 20px',
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

      <h1 style={styles.title}>🚌 Líneas de Buses</h1>
      <div style={styles.grid}>
        {lineas.map((linea) => (
          <button
            key={linea}
            onClick={() => handleClick(linea)}
            style={styles.button}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.93)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 10px 18px rgba(0, 0, 0, 0.3)')}
            onMouseOut={(e) => (e.currentTarget.style.boxShadow = styles.button.boxShadow!)}
          >
            {linea}
          </button>
        ))}
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
    position: 'relative', // necesario para posicionar el botón arriba a la izquierda
  },
  title: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '50px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    width: '100%',
    maxWidth: '500px',
  },
  button: {
    padding: '35px 0',
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

export default BusesNorte;
