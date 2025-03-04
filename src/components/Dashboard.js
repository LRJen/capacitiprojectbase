import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, User, X } from 'lucide-react';
import './Dashboard.css';
import logo from '../assets/logo.png';
import { ref as dbRef, onValue, push, remove, set } from 'firebase/database';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (!user || !user.uid) {
      console.log('Dashboard.js - No user UID available yet');
      return;
    }
    console.log('Dashboard.js - useEffect triggered for UID:', user.uid);
    setLoading(true);

    // Fetch resources (real-time listener)
    const resourcesRef = dbRef(db, 'resources');
    const unsubscribeResources = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      const resourceList = data
        ? Object.entries(data).map(([id, value]) => ({
            id,
            title: value.title || 'Untitled',
            description: value.description || '',
            type: value.type || 'unknown',
            content: value.content || '',
            status: value.status || 'available',
            createdAt: value.createdAt || '',
          }))
        : [];
      console.log('Dashboard.js - Resources fetched:', resourceList);
      setResources(resourceList);
      checkLoadingComplete(resourceList, notifications, downloads);
    }, (error) => {
      console.error('Dashboard.js - Error fetching resources:', error.code, error.message);
      setError('Failed to load resources: ' + error.message);
      setLoading(false);
    });

    // Fetch user's requests (real-time listener)
    const requestsRef = dbRef(db, 'requests');
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Dashboard.js - Raw requests data from Firebase:', data);
      const requestList = data
        ? Object.entries(data)
            .filter(([_, value]) => value.userId === user.uid)
            .map(([id, value]) => {
              const resource = resources.find(r => r.id === value.resourceId) || { title: value.resourceId };
              const baseMessage = `Request for "${resource.title}"`;
              let message = baseMessage;
              if (value.status === 'approved') message = `${baseMessage} approved`;
              else if (value.status === 'rejected') message = `${baseMessage} rejected`;
              else message = `User requested "${resource.title}"`;
              return {
                id,
                resourceId: value.resourceId,
                message: `${message} (${new Date(value.timestamp).toLocaleTimeString()})`,
                status: value.status,
                dismissible: true,
                unread: !notifications.some(n => n.id === id && n.status === value.status), // Unread if new or status changed
              };
            })
        : [];
      console.log('Dashboard.js - Processed user requests:', requestList);

      // Update notifications with status changes
      requestList.forEach(req => {
        const prevReq = notifications.find(n => n.id === req.id);
        if (!prevReq || prevReq.status !== req.status) {
          setNotifications(prev => {
            const updated = prev.filter(n => n.id !== req.id).concat({ ...req, unread: true });
            console.log('Dashboard.js - Updated notifications with new/change:', updated);
            return updated;
          });
          setUnreadCount(prev => prev + 1); // Increment for every new or changed request
        }
      });
      setNotifications(requestList);
      setUnreadCount(requestList.filter(notif => notif.unread).length);
      checkLoadingComplete(resources, requestList, downloads);
    }, (error) => {
      console.error('Dashboard.js - Error fetching requests:', error.code, error.message);
      setError('Failed to load requests: ' + error.message);
      setLoading(false);
    });

    // Fetch user's downloads (real-time listener)
    const downloadsRef = dbRef(db, `userDownloads/${user.uid}`);
    const unsubscribeDownloads = onValue(downloadsRef, (snapshot) => {
      const data = snapshot.val();
      const downloadList = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
      console.log('Dashboard.js - Downloads fetched:', downloadList);
      setDownloads(downloadList);
      checkLoadingComplete(resources, notifications, downloadList);
    }, (error) => {
      console.error('Dashboard.js - Error fetching downloads:', error.code, error.message);
      setError('Failed to load downloads: ' + error.message);
      setLoading(false);
    });

    // Check if all data is loaded
    const checkLoadingComplete = (res, notifs, downs) => {
      if (res.length > -1 && notifs.length > -1 && downs.length > -1) {
        console.log('Dashboard.js - All data loaded:', { resources: res.length, notifications: notifs.length, downloads: downs.length });
        setLoading(false);
      }
    };

    return () => {
      console.log('Dashboard.js - Cleaning up listeners');
      unsubscribeResources();
      unsubscribeRequests();
      unsubscribeDownloads();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Dashboard.js - Logout successful');
      navigate('/auth');
    } catch (error) {
      console.error('Dashboard.js - Logout error:', error.message);
      setError('Logout failed: ' + error.message);
    }
  };

  const handleProfileClick = () => {
    console.log('Dashboard.js - Navigating to profile');
    navigate('/profile');
  };

  const handleRequest = async (resourceId) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      const request = {
        userId: user.uid,
        resourceId,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
      const newRequestRef = await push(dbRef(db, 'requests'), request);
      console.log('Dashboard.js - Resource requested:', resourceId);
      
      //X code.. to be deleted
    
      ////////////////////////////
      setNotifications(prev => [
        ...prev,
        { 
          id: newRequestRef.key, 
          resourceId, 
          message: `User requested "${resource ? resource.title : resourceId}" (${new Date().toLocaleTimeString()})`, 
          status: 'pending', 
          dismissible: true, 
          unread: true 
        },
      ]);
      setUnreadCount(prev => prev + 1);


    } catch (error) {
      console.error('Dashboard.js - Error requesting resource:', error.code, error.message);
      setError('Failed to request resource: ' + error.message);
    }
  };

  const handleCancelRequest = async (requestId, resourceId) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      await remove(dbRef(db, `requests/${requestId}`));
      console.log('Dashboard.js - Request cancelled:', requestId);
      setNotifications(prev => [
        ...prev.filter(notif => notif.id !== requestId),
        { 
          id: Date.now(), 
          message: `User cancelled "${resource ? resource.title : resourceId}" (${new Date().toLocaleTimeString()})`, 
          dismissible: true, 
          unread: true 
        },
      ]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Dashboard.js - Error cancelling request:', error.code, error.message);
      setError('Failed to cancel request: ' + error.message);
    }
  };

  const handleDownloadOrAccess = async (resource) => {
    try {
      if (resource.type === 'pdf') {
        const link = document.createElement('a');
        link.href = resource.content;
        link.download = `${resource.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Dashboard.js - PDF downloaded:', resource.title);
      } else {
        window.open(resource.content, '_blank');
        console.log('Dashboard.js - Link/Course accessed:', resource.content);
      }
      const downloadData = {
        title: resource.title,
        type: resource.type,
        content: resource.content,
        downloadedAt: new Date().toISOString(),
      };
      await set(dbRef(db, `userDownloads/${user.uid}/${resource.id}`), downloadData);
      console.log('Dashboard.js - Resource added to downloads:', resource.id);
      // Remove from notifications once downloaded
      setNotifications(prev => prev.filter(notif => notif.resourceId !== resource.id));
    } catch (error) {
      console.error('Dashboard.js - Error downloading/accessing resource:', error.code, error.message);
      setError('Failed to download/access resource: ' + error.message);
    }
  };

  const dismissNotification = (notifId) => {
    setNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== notifId);
      console.log('Dashboard.js - Notification dismissed:', notifId, 'Remaining:', updated);
      return updated;
    });
    setUnreadCount(prev => prev - (notifications.find(n => n.id === notifId && n.unread) ? 1 : 0));
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    if (!showNotifications) {
      setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
      setUnreadCount(0);
    }
    console.log('Dashboard.js - Notifications dropdown toggled:', !showNotifications);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
    console.log('Dashboard.js - Notifications dropdown closed');
  };

  const filteredAvailableResources = resources.filter(resource =>
    resource.status === 'available' &&
    !notifications.some(notif => notif.resourceId === resource.id && (notif.status === 'pending' || notif.status === 'approved')) &&
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPendingResources = resources.filter(resource =>
    notifications.some(notif => notif.resourceId === resource.id && notif.status === 'pending') &&
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApprovedResources = resources.filter(resource =>
    notifications.some(notif => notif.resourceId === resource.id && notif.status === 'approved') &&
    !downloads.some(download => download.id === resource.id) &&
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLibraryResources = downloads.filter(download =>
    download.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRejectedResources = resources.filter(resource =>
    notifications.some(notif => notif.resourceId === resource.id && notif.status === 'rejected') &&
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.5rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  console.log('Dashboard.js - Rendering with resources:', resources.length, 'notifications:', notifications.length, 'downloads:', downloads.length);

  return (
    <div className="dashboard-container">
      <header className="header">
        <a href='LandingPage.js' className='logo'>
        <img src={logo} className="logo" alt="CAPACITI logo" />
        </a>
        <h1 className="title">Resource Hub Dashboard</h1>
        <div className="user-controls">
          <button className="notification-button" onClick={toggleNotifications}>
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="close-card-button" onClick={closeNotifications}>
                  <X size={16} />
                </button>
              </div>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div key={notif.id} className="notification-item">
                    <span>{notif.message}</span>
                    {notif.dismissible && (
                      <button
                        className="dismiss-button"
                        onClick={() => dismissNotification(notif.id)}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="notification-item">No notifications</div>
              )}
            </div>
          )}
          <button className="user-button" onClick={handleProfileClick}>
            <User size={24} /> <p>Username: {user.name}</p>
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      
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

      {error && <div className="error">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'available' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          All Available Resources ({filteredAvailableResources.length})
        </button>
        <button
          className={`tab ${activeTab === 'myResources' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('myResources')}
        >
          My Resources ({filteredPendingResources.length + filteredApprovedResources.length + filteredRejectedResources.length})
        </button>
        <button
          className={`tab ${activeTab === 'myLibrary' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('myLibrary')}
        >
          My Library ({filteredLibraryResources.length})
        </button>
      </div>

      <div className="resources-table">
        <h2>
          {activeTab === 'available' ? 'Available Resources' : 
           activeTab === 'myResources' ? 'My Resources' : 'My Library'}
        </h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Type</th>
              <th>Status</th>
              {activeTab !== 'available' && <th>File/Action</th>}
              {(activeTab === 'available' || activeTab === 'myResources') && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'available' ? filteredAvailableResources : 
              activeTab === 'myResources' ? [...filteredPendingResources, ...filteredApprovedResources, ...filteredRejectedResources] : filteredLibraryResources).map(resource => {
              const pendingRequest = notifications.find(notif => notif.resourceId === resource.id && notif.status === 'pending');
              const approvedRequest = notifications.find(notif => notif.resourceId === resource.id && notif.status === 'approved');
              const rejectedRequest = notifications.find(notif => notif.resourceId === resource.id && notif.status === 'rejected');
              return (
                <tr key={resource.id}>
                  <td>{resource.title}</td>
                  <td>{resource.description}</td>
                  <td>{resource.type}</td>
                  <td>
                    {activeTab === 'myResources' && pendingRequest ? 'Pending' : 
                     activeTab === 'myResources' && approvedRequest ? 'Approved' : 
                     activeTab === 'myResources' && rejectedRequest ? 'Rejected' :
                     activeTab === 'myLibrary' ? 'Downloaded' : 
                     resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                  </td>
                  {activeTab !== 'available' && (
                    <td>
                      {(approvedRequest || activeTab === 'myLibrary') ? (
                        <button
                          className="action-button"
                          onClick={() => handleDownloadOrAccess(resource)}
                        >
                          {resource.type === 'pdf' ? 'Download' : 'Access'}
                        </button>
                      ) : '-'}
                    </td>
                  )}
                  {(activeTab === 'available' || activeTab === 'myResources') && (
                    <td>
                      {pendingRequest ? (
                        <button
                          className="action-button cancel-button"
                          onClick={() => handleCancelRequest(pendingRequest.id, resource.id)}
                        >
                          Cancel
                        </button>
                      ) : activeTab === 'available' ? (
                        <button
                          className="action-button"
                          disabled={resource.status !== 'available'}
                          onClick={() => handleRequest(resource.id)}
                        >
                          Request
                        </button>
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;