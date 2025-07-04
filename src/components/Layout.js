// src/Layout.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; 
import { signOut } from 'firebase/auth';
import logo from '../assets/logo-light.png';
import '../styles/Layout.css'; 

/* // Header Component
const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Layout.js - Logout error:', error.message);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <header className="header">
      <Link to="/" className="logo-link">
        <img src={logo} className="logo" alt="Resource Hub Logo" />
      </Link>
      <h1 className="header-title">Resource Hub</h1>
      <nav className="header-nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          {user ? (
            <>
              <li>
                <Link to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}>
                  {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </li>
              <li className="user-info">Welcome, {user.name} ({user.role})</li>
            </>
          ) : (
            <li><Link to="/auth">Login/Register</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}; */

// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <img src={logo} className="footer-logo" alt="Resource Hub Logo" />
      <p>&copy; {new Date().getFullYear()} Resource Hub. All rights reserved.</p>
      <div className="footer-links">
        <Link to="/contact">Contact Us</Link>
        <Link to="/terms">Terms of Service</Link>
      </div>
    </footer>
  );
};

// Layout Component (Wraps pages with Header and Footer)
const Layout = ({ children, user }) => {
  return (
    <div className="layout-container">
      <Footer user={user} />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;