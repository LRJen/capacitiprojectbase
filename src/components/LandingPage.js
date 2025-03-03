import React from 'react';
import './LandingPage.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ onUserRegister, onAdminRegister }) => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/auth');
  };

  return (
    <div className="landing-container">
      <h1 className="landing-title">Welcome to the Resource Hub</h1>
      <p className="landing-description">
        Streamline your digital resource requests with our AI-powered system. Get started today!
      </p>
      <button onClick={handleRegister} className="get-started-button">Get Started</button>
      <img src={logo} className="landing-logo" alt="CAPACITI logo" />
    </div>
  );
}

export default LandingPage;