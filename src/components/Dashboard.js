import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase'; // Import from firebase.js
import { useNavigate, Link } from 'react-router-dom';
import { Book, Calendar, FileText, Bell, Search, User } from 'lucide-react';
import './Dashboard.css';
//import { onSnapshot,  } from 'firebase/firestore';
import { collection, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import logo from '../assets/Logo.jpg';



const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pdf');
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const resourcesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(resourcesData);
    }, (error) => {
      console.error('Error fetching resources:', error);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleRequest = async (resourceId) => {
    const requestRef = await addDoc(collection(db, 'requests'), {
      userId: user.uid,
      resourceId,
      status: 'pending',
      timestamp: new Date(),
    });
    await updateDoc(doc(db, 'resources', resourceId), { status: 'pending' });
    setNotifications([...notifications, { id: requestRef.id, message: 'Request pending...' }]);
    setResources(prev =>
      prev.map(r => (r.id === resourceId ? { ...r, status: 'pending' } : r))
    );
  };

  const filteredResources = resources.filter(
    resource =>
      resource.type === activeTab &&
      resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header className="header">
        <img src={logo} className="logo" alt="CAPACITI logo"/>
        <h1 className="title">Resource Hub Dashboard</h1>
        <div className="user-info">
          <h2>Welcome, {user.name}!</h2>
          <p>Role: {user.role}</p>
        </div>
        <div className="user-controls">
          <button className="notification-button"><Bell size={24} /></button>
          <button className="user-button"><User size={24} /> {user.name}</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Resources</Link></li>
          <li><Link to="/profile">Profile</Link></li>
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

      <div className="tabs">
        {['pdf', 'training', 'course'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
          >
            {tab === 'pdf' && <FileText size={20} />}
            {tab === 'training' && <Calendar size={20} />}
            {tab === 'course' && <Book size={20} />}
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}s</span>
          </button>
        ))}
      </div>

      <div className="grid">
        {filteredResources.map(resource => (
          <div key={resource.id} className="card">
            <div className="card-header">
              <div className="card-content">
                <h3 className="card-title">{resource.title}</h3>
                <p className="card-description">{resource.description}</p>
              </div>
              {resource.type === 'pdf' && <FileText size={24} />}
              {resource.type === 'training' && <Calendar size={24} />}
              {resource.type === 'course' && <Book size={24} />}
            </div>
            <div className="card-footer">
              <span className={`status status-${resource.status}`}>
                {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
              </span>
              {resource.fileUrl && resource.status !== 'pending' && (
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button"
                >
                  Download
                </a>
              )}
              <button
                className="action-button"
                disabled={resource.status === 'pending'}
                onClick={() => handleRequest(resource.id)}
              >
                {resource.status === 'available' ? 'Request' : resource.status === 'pending' ? 'Pending' : 'View'}
              </button>
            </div>
          </div>
        ))}
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