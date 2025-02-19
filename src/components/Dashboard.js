import React from 'react';
import './Dashboard.css'; // Import the CSS file for styling

const Dashboard = ({ user }) => {
  const isAdmin = user.role === 'admin'; // Check if the user is an admin

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/resources">Resources</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>

      {/* User Greeting */}
      <div className="user-greeting">
        <h1>Welcome, {user.name}!</h1>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/upload">Upload</a></li>
          <li><a href="/view-resources">View Resources</a></li>
          <li><a href="/recent-activity">Recent Activity</a></li>
          {isAdmin && <li><a href="/manage-users">Manage Users</a></li>} {/* Admin-specific link */}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;