import React, { useState } from 'react';
import './AuthForm.css';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ isAdmin: initialIsAdmin }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const navigate = useNavigate();
  const adminCodeHardcoded = '12345';

  const handleAuth = (e) => {
    e.preventDefault();
    if (isSignUp) {
      // Simulate sign-up logic
      console.log('Sign-up logic');
      // Redirect based on user role after sign-up
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Login logic
      console.log('Login logic'); // Debug output
      if (isAdmin) {
        if (adminCode !== adminCodeHardcoded) {
          console.log('Invalid Admin Code');
          alert('Invalid Admin Code');
        } else {
          console.log('Admin login successful');
          navigate('/admin-dashboard');
        }
      } else {
        console.log('User login successful');
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      <button onClick={() => navigate('/welcome')} className="back-button">Back</button>
      <h1 className="auth-title">RESOURCE HUB</h1>
      <div className="auth-toggle-buttons">
        <button onClick={() => setIsAdmin(false)} className={!isAdmin ? 'active' : ''}>User</button>
        <button onClick={() => setIsAdmin(true)} className={isAdmin ? 'active' : ''}>Admin</button>
      </div>
      <form onSubmit={handleAuth} className="auth-form">
        {isSignUp && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isAdmin && (
          <input
            type="text"
            placeholder="Admin Code"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
          />
        )}
        <button type="submit" className="auth-button">{isSignUp ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-form-button">
        {isSignUp ? 'Switch to Login' : 'Switch to Register'}
      </button>
      <footer className="auth-footer">
        <img src="capaciti-logo.png" alt="CAPACITI logo" />
        <p>CAPACITI</p>
      </footer>
    </div>
  );
};
export default AuthForm;