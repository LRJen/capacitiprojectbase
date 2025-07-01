import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, House, X } from 'lucide-react';
import logo from '../../assets/logo.png';

const Header = ({ user, unreadCount, onProfileClick, onLogout, toggleNotifications }) => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link to="/" className="logo-link">
        <img src={logo} alt="CAPACITI logo" className="logo" />
      </Link>
      <h1 className="title">Resource Hub Dashboard</h1>
      <div className="user-controls">
        <button className="notification-button" onClick={() => navigate('/')}>
          <House size={24} />
        </button>
        <button className="notification-button" onClick={toggleNotifications}>
          <Bell size={24} />
          {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
        </button>
        <button className="user-button" onClick={onProfileClick}>
          <User size={24} />
          <p>Username: {user.name}</p>
        </button>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header;
