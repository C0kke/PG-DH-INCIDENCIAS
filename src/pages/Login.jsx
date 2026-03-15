import React, { useState } from 'react';
import axios from 'axios';
import './styles/Login.css';
import { useAuth } from '../utils/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const response = await axios.post(import.meta.env.VITE_API_BASE_URL + '/usuarios/login', {
        email,
        password,
      });
      setMensaje('¡Inicio de sesión exitoso!');
      login(response.data.user); // Use the login function from context
    } catch (error) {
      console.error(error)
      setMensaje(error.response?.data || 'Error de conexión. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="form-card">
        <h2 className="form-title">
          Accede a tu cuenta
        </h2>

        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-group">
            <label 
              htmlFor="email" 
              className="form-label"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label 
              htmlFor="password" 
              className="form-label"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              enterKeyHint="go"
              className="form-input"
            />
          </div>
          <button 
            type="submit"
            className="form-button"
          >
            Iniciar Sesión
          </button>
        </form>

        {mensaje && (
          <p
            role="status"
            aria-live="polite"
            className={`message-box ${mensaje.includes('exitoso') ? 'success' : 'error'}`}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
