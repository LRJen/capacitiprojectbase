// src/Recommendations.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import './Recommendations.css';

const Recommendations = ({ user, resources }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.uid) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    // Fetch user downloads
    const downloadsRef = dbRef(db, `userDownloads/${user.uid}`);
    onValue(downloadsRef, (snapshot) => {
      const downloadsData = snapshot.val() || {};
      const userDownloads = Object.values(downloadsData);

      // Fetch all requests for popularity
      const requestsRef = dbRef(db, 'requests');
      onValue(requestsRef, (requestsSnapshot) => {
        const requestsData = requestsSnapshot.val() || {};
        const requestCounts = {};

        // Calculate popularity (count requests per resource)
        Object.values(requestsData).forEach((request) => {
          requestCounts[request.resourceId] = (requestCounts[request.resourceId] || 0) + 1;
        });

        // Recommendation logic
        const recommended = [];

        // 1. Based on Past Downloads (match type or title keywords)
        userDownloads.forEach((download) => {
          resources.forEach((resource) => {
            if (resource.id !== download.id && !recommended.some(r => r.id === resource.id)) {
              const typeMatch = resource.type === download.type;
              const titleMatch = resource.title.toLowerCase().includes(download.title.toLowerCase().split(' ')[0]);
              if (typeMatch || titleMatch) {
                recommended.push(resource);
              }
            }
          });
        });

        // 2. Based on Popularity (top 3 most requested)
        const popularResources = resources
          .map(resource => ({
            ...resource,
            requestCount: requestCounts[resource.id] || 0,
          }))
          .sort((a, b) => b.requestCount - a.requestCount)
          .slice(0, 3)
          .filter(r => !recommended.some(rec => rec.id === r.id));

        setRecommendations([...recommended, ...popularResources].slice(0, 5)); // Limit to 5 recommendations
        setLoading(false);
      }, { onlyOnce: true });
    }, { onlyOnce: true });
  }, [user, resources]);

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return <div>No recommendations available yet. Start downloading resources!</div>;
  }

  return (
    <div className="recommendations-container">
      <h2>Recommended for You</h2>
      <ul className="recommendations-list">
        {recommendations.map((resource) => (
          <li key={resource.id} className="recommendation-item">
            <span>{resource.title} ({resource.type})</span>
            <button
              onClick={() => window.location.href = `/dashboard?resource=${resource.id}`} // Simple navigation
              className="recommendation-button"
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;