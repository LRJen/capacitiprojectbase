import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-light.png';
import '../../styles/LandingPage.css'; // already loaded globally, but safe here

const Navbar = () => {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // When user scrolls more than 50px vertically, set scrolled to true
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left" onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" className="navbar-logo" />
        <span className="navbar-title">Resource Hub</span>
      </div>

      <div className="navbar-links">
        <a href="#features">Dashboard</a>
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
