import React from 'react';
import './LandingPage.css';
import logo from '../assets/nameLogo.jpg';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-container">
      <h1 className="landing-title">Welcome to the CAPACITI Resource Hub</h1>
      <p className="landing-description">
        Streamline your digital resource requests with our AI-powered system. Get started today!
      </p>
      <button onClick={onGetStarted} className="get-started-button">Get Started</button>
      <img src={logo} className="landing-logo" alt="CAPACITI logo" />
    </div>
  );
};

export default LandingPage;