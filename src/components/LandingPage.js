import React from 'react';
import './LandingPage.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/auth');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="landing-container">
      {/* Logo */}
      <img src={logo} className="landing-logo" alt="CAPACITI logo" />

      {/* Title and Description */}
      <h1 className="landing-title">Welcome to the Resource Hub</h1>
      <p className="landing-description">
        Streamline your digital resource requests with our AI-powered system. Get started today!
      </p>

      {/* Buttons */}
      <div className="landing-buttons">
        <button onClick={handleRegister} className="get-started-button">Get Started</button>
        {/* Back button removed since this is now the root page */}
      </div>
    </div>
  );
};

export default LandingPage;
