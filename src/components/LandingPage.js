import React, { useState } from 'react';
import './LandingPage.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import fetchRecommendations from './recommendations';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const handleRegister = () => {
    console.log('LandingPage - Get Started clicked, navigating to /auth'); // Debug log
    navigate('/auth'); // This takes the user to the auth page
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const recs = await fetchRecommendations(searchTerm);
      setRecommendations(recs);
      setShowPopup(true);
    }
  };

  return (
    <div className="landing-container">
      <img src={logo} className="landing-logo" alt="CAPACITI logo" />
      <h1 className="landing-title">Welcome to the Resource Hub</h1>
      <p className="landing-description">
        Streamline your digital resource requests with our AI-powered system. Get started today!
      </p>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for resources..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {showPopup && recommendations.length > 0 && (
        <div className="recommendation-popup">
          <h2>Recommended Resources</h2>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>
                <a href={rec.link} target="_blank" rel="noopener noreferrer">
                  {rec.title}
                </a>
                <p>{rec.snippet}</p>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowPopup(false)} className="close-button">Close</button>
        </div>
      )}
      <div className="landing-buttons">
        <button onClick={handleRegister} className="get-started-button">Get Started</button>
      </div>
    </div>
  );
};

export default LandingPage;