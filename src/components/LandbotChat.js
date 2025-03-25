/* // src/LandbotChat.js
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const LandbotChat = ({ configUrl, embedType = 'livechat', showOnlyForNewUsers = true }) => {
  useEffect(() => {
    // Check if this is a new user (based on localStorage)
    const hasVisited = localStorage.getItem('visited');
    if (showOnlyForNewUsers && hasVisited) {
      console.log('LandbotChat.js - User has visited before, skipping chatbot load');
      return;
    }

    // Load Landbot script
    const script = document.createElement('script');
    script.src = 'https://static.landbot.io/landbot-3/landbot-3.1.0.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      let myLandbot;
      switch (embedType.toLowerCase()) {
        case 'livechat':
          myLandbot = new window.Landbot.Livechat({ configUrl });
          console.log('LandbotChat.js - Initialized Livechat');
          break;
        case 'popup':
          myLandbot = new window.Landbot.Popup({ configUrl });
          console.log('LandbotChat.js - Initialized Popup');
          break;
        case 'fullpage':
          myLandbot = new window.Landbot.Fullpage({ configUrl });
          console.log('LandbotChat.js - Initialized Fullpage');
          break;
        default:
          console.error('LandbotChat.js - Invalid embedType:', embedType);
          return;
      }

      // Mark user as visited after loading
      if (showOnlyForNewUsers) {
        localStorage.setItem('visited', 'true');
      }
    };

    script.onerror = () => {
      console.error('LandbotChat.js - Failed to load Landbot script');
    };

    // Cleanup on unmount
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [configUrl, embedType, showOnlyForNewUsers]); // Re-run if these props change

  // No DOM rendering needed; Landbot handles its own UI
  return null;
};

LandbotChat.propTypes = {
  configUrl: PropTypes.string.isRequired,
  embedType: PropTypes.oneOf(['livechat', 'popup', 'fullpage']),
  showOnlyForNewUsers: PropTypes.bool,
};

LandbotChat.defaultProps = {
  embedType: 'livechat',
  showOnlyForNewUsers: true,
};

export default LandbotChat; */