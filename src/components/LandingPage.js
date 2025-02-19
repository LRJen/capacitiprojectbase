import React from 'react';
import './LandingPage.css';
import logo from '../assets/Capture.PNG';
//import { useNavigate } from 'react-router-dom';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-container">
      <img src={logo} className="landing-logo" alt="CAPACITI logo" />
      <h1 className="landing-title">Welcome to the Digital Resource Request System</h1>
      <p className="landing-description">
        Streamline your digital resource requests with our AI-powered system. Get started today!
      </p>
      <button onClick={onGetStarted} className="get-started-button">Get Started</button>
    </div>
  );
};

export default LandingPage;