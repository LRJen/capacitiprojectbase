import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import '../../styles/LandingPage.css'; // already loaded globally, but safe here

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" className="navbar-logo" />
        <span className="navbar-title">Resource Hub</span>
      </div>

      <div className="navbar-links">
        <a href="#about">About Us</a>
        <a href="#contact">Contact Us</a>
        <a href="#faq">FAQ</a>
      </div>

      <div className="navbar-right">
        <button className="nav-auth-button" onClick={() => navigate('/auth')}>
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
