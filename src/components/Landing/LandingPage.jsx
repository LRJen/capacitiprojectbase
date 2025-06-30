import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import SearchBar from './SearchBar';
import RecommendationPopup from './RecommendationPopup';
import Navbar from './Navbar';

import '../../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="landing-container">
      <Navbar />
      <HeroSection />
      <SearchBar setRecommendations={setRecommendations} setShowPopup={setShowPopup} />

      {showPopup && recommendations.length > 0 && (
        <RecommendationPopup recommendations={recommendations} onClose={() => setShowPopup(false)} />
      )}

      <div className="landing-buttons">
        <button onClick={() => navigate('/auth')} className="get-started-button">Get Started</button>
      </div>
    </div>
  );
};

export default LandingPage;
