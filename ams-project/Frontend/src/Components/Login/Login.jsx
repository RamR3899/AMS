import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setError('');
    setIsLoading(true);

    fetch('http://localhost:5000/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          const roleId = data.user.role_id;
          onLogin(true, roleId);
          setIsLoading(false);
          let path = '/login';
          switch (roleId) {
            case 1: // Admin
              path = '/my-asset';
              break;
            case 2: // Store Manager
              path = '/inbox';
              break;
            case 3: // User
              path = '/my-asset';
              break;
            default:
              path = '/login';
              break;
          }
          navigate(path);
        } else {
          setError(data.error);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        setError('Failed to authenticate');
        setIsLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Asset Management System</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              aria-describedby="email-help"
            />
            <small id="email-help" className="form-text"></small>
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              aria-describedby="password-help"
            />
            <small id="password-help" className="form-text"></small>
          </div>
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>or</p>
        <button className="google-login-button" type="button">
          <img
            src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
            alt="Google Logo"
          />
          Login with Google
        </button>
        <p><Link to="/forgot-password">Forgot Password?</Link></p>
      </div>
    </div>
  );
};

export default Login;