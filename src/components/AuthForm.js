import React, { useState } from 'react';
import './AuthForm.css';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import from firebase.js
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const navigate = useNavigate();
  const adminCodeHardcoded = '12345';

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const role = isAdmin && adminCode === adminCodeHardcoded ? 'admin' : 'user';
        await setDoc(doc(db, 'users', user.uid), {
          name: username,
          role,
          email,
          createdAt: new Date(),
        });
        navigate(role === 'admin' ? '/admin-dashboard' : '/dashboard');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.exists() ? userDoc.data().role : 'user';
        navigate(role === 'admin' ? '/admin-dashboard' : '/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      alert(error.message);
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