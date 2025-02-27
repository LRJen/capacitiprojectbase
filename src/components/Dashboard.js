import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import './Dashboard.css';
import { ref as dbRef, onValue, push } from 'firebase/database';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const resourcesRef = dbRef(db, 'resources');
    const requestsRef = dbRef(db, 'requests');

    const unsubscribeResources = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const resourceList = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setResources(resourceList);
      } else {
        setResources([]);
      }
    }, (error) => {
      console.error('Error fetching resources:', error);
    });

    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestList = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setNotifications(requestList.filter(req => req.userId === user.uid && req.status === 'pending')
          .map(req => ({ id: req.id, message: 'Request pending...' })));
      } else {
        setNotifications([]);
      }
    }, (error) => {
      console.error('Error fetching requests:', error);
    });

    return () => {
      unsubscribeResources();
      unsubscribeRequests();
    };
  }, [user.uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Dashboard.js - Logout successful');
      navigate('/auth');
    } catch (error) {
      console.error('Dashboard.js - Logout error:', error.message);
    }
  };

  const handleProfileClick = () => {
    console.log('Dashboard.js - User button clicked, navigating to /profile');
    navigate('/profile');
    console.log('Dashboard.js - Navigation to /profile attempted');
  };

  const handleRequest = async (resourceId) => {
    try {
      const request = {
        userId: user.uid,
        resourceId,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
      await push(dbRef(db, 'requests'), request);
      setNotifications(prev => [...prev, { id: resourceId, message: 'Request pending...' }]);
      setResources(prev => prev.map(r => r.id === resourceId ? { ...r, status: 'pending' } : r));
    } catch (error) {
      console.error('Error requesting resource:', error);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1 className="title">Resource Dashboard</h1>
        <div className="user-info">
          <h2>Welcome, {user.name}!</h2>
          <p>Role: {user.role}</p>
        </div>
        <div className="user-controls">
          <button className="notification-button"><Bell size={24} /></button>
          <button className="user-button" onClick={handleProfileClick}>
            <User size={24} /> {user.name}
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Resources</Link></li>
          
        </ul>
      </nav>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="resources-table">
        <h2>Available Resources</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              <th>File</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.title}</td>
                <td>{resource.description}</td>
                <td>{resource.type}</td>
                <td>{resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}</td>
                <td>
                  {resource.fileUrl ? (
                    <a href={resource.fileUrl} download={resource.title} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  ) : 'No file'}
                </td>
                <td>
                  <button
                    className="action-button"
                    disabled={resource.status === 'pending'}
                    onClick={() => handleRequest(resource.id)}
                  >
                    {resource.status === 'available' ? 'Request' : resource.status === 'pending' ? 'Pending' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="notifications">
        {notifications.map(notif => (
          <div key={notif.id} className="notification">{notif.message}</div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;