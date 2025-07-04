import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Archivo CSS para estilos

const Home: React.FC = () => {
  // Estados locales para username y password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Función para manejar el login
  const handleLogin = async () => {
    if (username && password) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/Corporalia/v2/Usuarios/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre: username, password: password }),
        });

        if (response.ok) {
          const data = await response.text(); // Leer respuesta del servidor
          alert(data); // Mostrar mensaje de éxito
          navigate('/inicio'); // Redirigir al menú
          setUsername(''); // Limpiar campo de usuario
          setPassword(''); // Limpiar campo de contraseña
        } else {
          alert('Credenciales incorrectas. Intenta nuevamente.');
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Ocurrió un problema al conectarse con el servidor.');
      }
    } else {
      alert('Por favor, ingresa usuario y contraseña.');
    }
  };

  // Función para manejar el registro
  const handleRegister = async () => {
    if (username && password) {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/Corporalia/v2/Usuarios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nombre: username, password: password }),
        });

        if (response.ok) {
          alert('Usuario registrado con éxito.');
          setUsername(''); // Limpiar campo de usuario
          setPassword(''); // Limpiar campo de contraseña
        } else {
          alert('Error al registrar usuario.');
        }
      } catch (error) {
        console.error('Error al registrar usuario:', error);
        alert('Ocurrió un problema al conectarse con el servidor.');
      }
    } else {
      alert('Por favor, ingresa usuario y contraseña para registrarte.');
    }
  };

  // Renderizado del componente Home
  return (
    <div className="home-container">
      <h1 className="home-title">Inicio de Sesión</h1>
      <form className="home-form" onSubmit={(e) => e.preventDefault()}>
        <label className="home-label">Usuario:</label>
        <input
          type="text"
          className="home-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ingrese su usuario"
        />
        <label className="home-label">Contraseña:</label>
        <input
          type="password"
          className="home-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
        />
        <button type="button" className="home-button" onClick={handleLogin}>
          Entrar
        </button>
        <button type="button" className="register-button" onClick={handleRegister}>
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default Home;