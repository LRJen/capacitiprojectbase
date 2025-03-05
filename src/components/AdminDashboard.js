import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import logo from '../assets/logo.png';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref as dbRef, onValue, push, update, remove } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { Bell, User } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const AdminDashboard = ({ user }) => {
  const [allRequests, setAllRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [resourceDetails, setResourceDetails] = useState('');
  const [resourceType, setResourceType] = useState('pdf');
  const [file, setFile] = useState(null);
  const [contentUrl, setContentUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editResourceId, setEditResourceId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    addLog('Component mounted');
    setLoading(true);

    // Fetch resources (real-time listener)
    const resourcesRef = dbRef(db, 'resources');
    const unsubscribeResources = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('AdminDashboard.js - Raw resources data from Firebase:', data);
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
      console.log('AdminDashboard.js - Processed resources:', resourceList);
      setResources(resourceList);
      checkLoadingComplete(resourceList, allRequests);
    }, (error) => {
      console.error('AdminDashboard.js - Error fetching resources:', error.code, error.message);
      setError('Failed to load resources: ' + error.message);
      setLoading(false);
    });

    // Fetch all requests (real-time listener)
    const requestsRef = dbRef(db, 'requests');
    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('AdminDashboard.js - Raw requests data from Firebase:', data);
      const requestList = data
        ? Object.entries(data).map(([id, value]) => ({
            id,
            userId: value.userId || 'Unknown User',
            resourceId: value.resourceId || 'Unknown Resource',
            status: value.status || 'pending',
            timestamp: value.timestamp || 'Unknown Time',
          }))
        : [];
      console.log('AdminDashboard.js - Processed all requests:', requestList);
      setAllRequests(requestList);
      checkLoadingComplete(resources, requestList);
    }, (error) => {
      console.error('AdminDashboard.js - Error fetching requests:', error.code, error.message);
      setError('Failed to load requests: ' + error.message);
      setLoading(false);
    });

    // Function to check if all data is loaded
    const checkLoadingComplete = (res, reqs) => {
      if (res.length > -1 && reqs.length > -1) {
        console.log('AdminDashboard.js - All data loaded:', { resources: res.length, requests: reqs.length });
        setLoading(false);
      }
    };

    return () => {
      unsubscribeResources();
      unsubscribeRequests();
    };
  }, []);

  const addLog = (message) => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message }]);
    console.log('AdminDashboard.js - Log:', message);
  };

  const addNotification = (message) => {
    setNotifications(prev => [...prev, { id: Date.now(), message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleApprove = async (id, userId, resourceId) => {
    try {
      console.log('AdminDashboard.js - Approving request:', { id, userId, resourceId });
      await update(dbRef(db, `requests/${id}`), { status: 'approved' });
      addLog(`Request ${id} approved for user ${userId}`);
      addNotification(`Request ${id} approved`);
    } catch (error) {
      console.error('AdminDashboard.js - Error approving request:', error.code, error.message);
      setError('Failed to approve request: ' + error.message);
    }
  };

  const handleReject = async (id, userId, resourceId) => {
    try {
      console.log('AdminDashboard.js - Rejecting request:', { id, userId, resourceId });
      await update(dbRef(db, `requests/${id}`), { status: 'rejected' });
      addLog(`Request ${id} rejected for user ${userId}`);
      addNotification(`Request ${id} rejected`);
    } catch (error) {
      console.error('AdminDashboard.js - Error rejecting request:', error.code, error.message);
      setError('Failed to reject request: ' + error.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setContentUrl('');
    if (selectedFile) {
      addLog(`File selected: ${selectedFile.name} (Size: ${selectedFile.size} bytes)`);
    } else {
      addLog('No file selected');
    }
  };

  const handleUrlChange = (e) => {
    setContentUrl(e.target.value);
    setFile(null);
    addLog(`URL entered: ${e.target.value}`);
  };

  const handleAddResource = async () => {
    addLog('Add Resource button clicked');
    if (!resourceName) {
      addLog('Error: Resource name is required');
      setError('Please enter a resource name');
      return;
    }

    try {
      let content = '';
      if (resourceType === 'pdf' && file) {
        const reader = new FileReader();
        content = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        addLog(`PDF Base64 generated for ${file.name}`);
      } else if ((resourceType === 'training' || resourceType === 'course') && contentUrl) {
        content = contentUrl;
        addLog(`URL set: ${contentUrl}`);
      } else {
        setError('Please provide a file for PDF or a URL for training/course');
        return;
      }

      const newResource = {
        title: resourceName,
        description: resourceDetails,
        type: resourceType,
        status: 'available',
        content,
        createdAt: new Date().toISOString(),
      };
      const resourcesRef = dbRef(db, 'resources');
      const newResourceRef = await push(resourcesRef, newResource);
      addLog(`Resource added with ID: ${newResourceRef.key}`);
      addNotification(`Resource "${resourceName}" added`);

      setResourceName('');
      setResourceDetails('');
      setFile(null);
      setContentUrl('');
    } catch (error) {
      console.error('AdminDashboard.js - Error adding resource:', error.code, error.message);
      setError('Failed to add resource: ' + error.message);
    }
  };

  const handleEditResource = (resource) => {
    setEditResourceId(resource.id);
    setResourceName(resource.title);
    setResourceDetails(resource.description);
    setResourceType(resource.type);
    setContentUrl(resource.type !== 'pdf' ? resource.content : '');
    setFile(null);
    addLog(`Editing resource ${resource.id}`);
  };

  const handleSaveEdit = async () => {
    if (!resourceName) {
      setError('Resource name is required');
      return;
    }

    try {
      let content = resources.find(r => r.id === editResourceId).content;
      if (resourceType === 'pdf' && file) {
        const reader = new FileReader();
        content = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        addLog(`New PDF Base64 generated for ${file.name}`);
      } else if ((resourceType === 'training' || resourceType === 'course') && contentUrl) {
        content = contentUrl;
        addLog(`New URL set: ${contentUrl}`);
      }

      const updatedResource = {
        title: resourceName,
        description: resourceDetails,
        type: resourceType,
        status: 'available',
        content,
        createdAt: resources.find(r => r.id === editResourceId).createdAt,
      };
      await update(dbRef(db, `resources/${editResourceId}`), updatedResource);
      addLog(`Resource ${editResourceId} updated`);
      addNotification(`Resource "${resourceName}" updated`);

      setEditResourceId(null);
      setResourceName('');
      setResourceDetails('');
      setFile(null);
      setContentUrl('');
    } catch (error) {
      console.error('AdminDashboard.js - Error editing resource:', error.code, error.message);
      setError('Failed to edit resource: ' + error.message);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await remove(dbRef(db, `resources/${id}`));
      addLog(`Resource ${id} deleted`);
      addNotification(`Resource ${id} deleted`);
    } catch (error) {
      console.error('AdminDashboard.js - Error deleting resource:', error.code, error.message);
      setError('Failed to delete resource: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('AdminDashboard.js - Logout successful');
      navigate('/auth');
    } catch (error) {
      addLog(`Logout error: ${error.message}`);
      setError('Logout failed: ' + error.message);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const barData = {
    labels: resources.map(r => r.title),
    datasets: [{
      label: 'Requests',
      data: resources.map(r => allRequests.filter(req => req.resourceId === r.id).length),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }],
  };

  const pieData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      data: [
        allRequests.filter(req => req.status === 'pending').length,
        allRequests.filter(req => req.status === 'approved').length,
        allRequests.filter(req => req.status === 'rejected').length,
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.5rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  console.log('AdminDashboard.js - Rendering with resources:', resources.length, 'allRequests:', allRequests.length);

  return (
    <div className="dashboard-container">
      <header className="header">


      <a href='LandingPage.js' className='logo-link'>
        <img src={logo} className="logo" alt="CAPACITI logo" />
        </a>


        <h1 className="title">Resource Hub Dashboard</h1>
        <div className="user-info">
          <h2>Welcome, {user.name}!</h2>
          <p>Role: {user.role}</p>
        </div>
        <div className="user-controls">
          <button className="notification-button" onClick={toggleNotifications}>
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <h3>Notifications</h3>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div key={notif.id} className="notification-item">{notif.message} - {notif.timestamp}</div>
                ))
              ) : (
                <div className="notification-item">No notifications</div>
              )}
            </div>
          )}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/admin-dashboard">Resources</Link></li>
          <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
        </ul>
      </nav>

      {error && <div className="error">{error}</div>}

      <div className="admin-controls">
        <h2>{editResourceId ? 'Edit Resource' : 'Manage Resources'}</h2>
        <input
          type="text"
          placeholder="Resource Name"
          value={resourceName}
          onChange={(e) => setResourceName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={resourceDetails}
          onChange={(e) => setResourceDetails(e.target.value)}
        />
        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="training">Training</option>
          <option value="course">Course</option>
        </select>
        {resourceType === 'pdf' ? (
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
          />
        ) : (
          <input
            type="text"
            placeholder="Enter URL"
            value={contentUrl}
            onChange={handleUrlChange}
          />
        )}
        <button onClick={editResourceId ? handleSaveEdit : handleAddResource}>
          {editResourceId ? 'Save Changes' : 'Add Resource'}
        </button>
        {editResourceId && (
          <button onClick={() => setEditResourceId(null)}>Cancel Edit</button>
        )}
      </div>

      <div className="resources-list">
        <h2>Resources ({resources.length} total)</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.title}</td>
                <td>{resource.type}</td>
                <td>{resource.status}</td>
                <td>
                  {resource.type === 'pdf' ? (
                    <a href={resource.content} download={`${resource.title}.pdf`}>Download</a>
                  ) : (
                    <a href={resource.content} target="_blank" rel="noopener noreferrer">Access</a>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEditResource(resource)}>Edit</button>
                  <button onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="log-table">
        <h2>Action Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.timestamp}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pending-requests">
        <h2>All Requests ({allRequests.length})</h2>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Resource ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allRequests.map(req => (
              <tr key={req.id}>
                <td>{req.userId}</td>
                <td>{req.resourceId}</td>
                <td>{req.status}</td>
                <td>
                  {req.status === 'pending' ? (
                    <>
                      <button onClick={() => handleApprove(req.id, req.userId, req.resourceId)}>Approve</button>
                      <button onClick={() => handleReject(req.id, req.userId, req.resourceId)}>Reject</button>
                    </>
                  ) : (
                    req.status // Display status if not pending
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="analytics-section">
        <h2>Analytics</h2>
        <div className="chart-container">
          <Bar data={barData} options={{ responsive: true }} />
        </div>
        <div className="chart-container">
          <Pie data={pieData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
