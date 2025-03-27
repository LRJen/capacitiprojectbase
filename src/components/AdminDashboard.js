import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import logo from '../assets/logo.png';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref as dbRef, onValue, push, update, remove } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { Bell, User, House } from 'lucide-react';

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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage-resources');

  const pageSize = 5;
  const [resourcePage, setResourcePage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [resourcesFetched, setResourcesFetched] = useState(false);
  const [requestsFetched, setRequestsFetched] = useState(false);
  const [logsFetched, setLogsFetched] = useState(false);

  useEffect(() => {
    addLog('Component mounted');
    setLoading(true);

    const resourcesRef = dbRef(db, 'resources');
    onValue(
      resourcesRef,
      (snapshot) => {
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
        console.log('AdminDashboard - All resources:', resourceList);
        setResources(resourceList);
        setResourcesFetched(true);
        checkLoadingComplete();
      },
      { onlyOnce: true },
      (error) => {
        console.error('AdminDashboard - Error fetching resources:', error);
        setError('Failed to fetch resources: ' + error.message);
        setResourcesFetched(true);
        checkLoadingComplete();
      }
    );

    const requestsRef = dbRef(db, 'requests');
    onValue(
      requestsRef,
      (snapshot) => {
        const data = snapshot.val();
        const requestList = data
          ? Object.entries(data).map(([id, value]) => ({
              id,
              userId: value.userId || 'Unknown User',
              resourceId: value.resourceId || 'Unknown Resource',
              status: value.status || 'pending',
              timestamp: value.timestamp || 'Unknown Time',
              rejectionReason: value.rejectionReason || '',
            }))
          : [];
        console.log('AdminDashboard - All requests:', requestList);
        setAllRequests(requestList);
        setRequestsFetched(true);
        checkLoadingComplete();
      },
      { onlyOnce: true },
      (error) => {
        console.error('AdminDashboard - Error fetching requests:', error);
        setError('Failed to fetch requests: ' + error.message);
        setRequestsFetched(true);
        checkLoadingComplete();
      }
    );

    setLogsFetched(true);
    checkLoadingComplete();

    const timeout = setTimeout(() => {
      console.log('AdminDashboard - Loading timeout triggered');
      setLoading(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  const checkLoadingComplete = () => {
    console.log('AdminDashboard - checkLoadingComplete:', {
      resourcesFetched,
      requestsFetched,
      logsFetched,
    });
    if (resourcesFetched && requestsFetched && logsFetched) {
      setLoading(false);
    }
  };

  const addLog = (message) => {
    const newLog = { timestamp: new Date().toLocaleTimeString(), message };
    setLogs((prev) => [...prev, newLog]);
  };

  const addNotification = (message) => {
    setNotifications((prev) => [
      ...prev,
      { id: Date.now(), message, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const handleApprove = async (id, userId, resourceId) => {
    try {
      await update(dbRef(db, `requests/${id}`), { status: 'approved' });
      addLog(`Request ${id} approved for user ${userId}`);
      addNotification(`Request ${id} approved`);
      setAllRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 'approved' } : req))
      );
    } catch (error) {
      setError('Failed to approve request: ' + error.message);
    }
  };

  const handleRejectClick = (id, userId, resourceId) => {
    setCurrentRequestId(id);
    setRejectionReason('');
    setShowRejectModal(true);
    addLog(`Initiated rejection for request ${id} by user ${userId}`);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      await update(dbRef(db, `requests/${currentRequestId}`), {
        status: 'rejected',
        rejectionReason: rejectionReason,
      });
      addLog(`Request ${currentRequestId} rejected with reason: ${rejectionReason}`);
      addNotification(`Request ${currentRequestId} rejected: ${rejectionReason}`);
      setAllRequests((prev) =>
        prev.map((req) =>
          req.id === currentRequestId ? { ...req, status: 'rejected', rejectionReason } : req
        )
      );
      setShowRejectModal(false);
      setRejectionReason('');
      setCurrentRequestId(null);
    } catch (error) {
      setError('Failed to reject request: ' + error.message);
    }
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setCurrentRequestId(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setContentUrl('');
    if (selectedFile) addLog(`File selected: ${selectedFile.name}`);
  };

  const handleUrlChange = (e) => {
    setContentUrl(e.target.value);
    setFile(null);
    addLog(`URL entered: ${e.target.value}`);
  };

  const handleAddResource = async () => {
    if (!resourceName) {
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
      } else if ((resourceType === 'training' || resourceType === 'course') && contentUrl) {
        content = contentUrl;
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
      setResources((prev) => [
        ...prev,
        { id: newResourceRef.key, ...newResource },
      ]);
      setResourceName('');
      setResourceDetails('');
      setFile(null);
      setContentUrl('');
    } catch (error) {
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
      let content = resources.find((r) => r.id === editResourceId).content;
      if (resourceType === 'pdf' && file) {
        const reader = new FileReader();
        content = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else if ((resourceType === 'training' || resourceType === 'course') && contentUrl) {
        content = contentUrl;
      }
      const updatedResource = {
        title: resourceName,
        description: resourceDetails,
        type: resourceType,
        status: 'available',
        content,
        createdAt: resources.find((r) => r.id === editResourceId).createdAt,
      };
      await update(dbRef(db, `resources/${editResourceId}`), updatedResource);
      addLog(`Resource ${editResourceId} updated`);
      addNotification(`Resource "${resourceName}" updated`);
      setResources((prev) =>
        prev.map((r) => (r.id === editResourceId ? { id: editResourceId, ...updatedResource } : r))
      );
      setEditResourceId(null);
      setResourceName('');
      setResourceDetails('');
      setFile(null);
      setContentUrl('');
    } catch (error) {
      setError('Failed to edit resource: ' + error.message);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await remove(dbRef(db, `resources/${id}`));
      addLog(`Resource ${id} deleted`);
      addNotification(`Resource ${id} deleted`);
      setResources((prev) => prev.filter((r) => r.id !== id));
      const totalFilteredResources = resources.filter((r) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
      ).length - 1;
      const newMaxPage = Math.ceil(totalFilteredResources / pageSize);
      if (resourcePage > newMaxPage && newMaxPage > 0) setResourcePage(newMaxPage);
      else if (newMaxPage === 0) setResourcePage(1);
    } catch (error) {
      setError('Failed to delete resource: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      setError('Logout failed: ' + error.message);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startResourceIndex = (resourcePage - 1) * pageSize;
  const endResourceIndex = startResourceIndex + pageSize;
  const paginatedResources = filteredResources.slice(startResourceIndex, endResourceIndex);

  const startRequestIndex = (requestPage - 1) * pageSize;
  const endRequestIndex = startRequestIndex + pageSize;
  const paginatedRequests = allRequests.slice(startRequestIndex, endRequestIndex);

  const startLogIndex = (logPage - 1) * pageSize;
  const endLogIndex = startLogIndex + pageSize;
  const paginatedLogs = logs.slice(startLogIndex, endLogIndex);

  const barData = {
    labels: resources.map((r) => r.title),
    datasets: [
      {
        label: 'Requests',
        data: resources.map((r) => allRequests.filter((req) => req.resourceId === r.id).length),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const pieData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          allRequests.filter((req) => req.status === 'pending').length,
          allRequests.filter((req) => req.status === 'approved').length,
          allRequests.filter((req) => req.status === 'rejected').length,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const openTab = (tabId) => {
    setActiveTab(tabId);
  };

  const handleProfileClick = () => {
    console.log('Dashboard.js - Navigating to profile');
    navigate('/profile');
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

  return (
    <div className="dashboard-container">
      <header className="header">
        <Link to="/" className="logo-link">
          <img src={logo} className="logo" alt="CAPACITI logo" />
        </Link>
        <h1 className="title">Resource Hub Dashboard</h1>
        <div className="user-controls">
          <button className="notification-button" onClick={() => navigate('/')}>
            <House size={24} />
          </button>
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
                notifications.map((notif) => (
                  <div key={notif.id} className="notification-item">
                    {notif.message} - {notif.timestamp}
                  </div>
                ))
              ) : (
                <div className="notification-item">No notifications</div>
              )}
            </div>
          )}
          <button className="user-button" onClick={handleProfileClick}>
            <User size={24} /> <p>Admin Name: {user.name}</p>
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="tabs-a">
        <div className={`tab-a ${activeTab === 'manage-resources' ? 'active' : ''}`} onClick={() => openTab('manage-resources')}>
          Manage Resource
        </div>
        <div className={`tab-a ${activeTab === 'pending-requests' ? 'active' : ''}`} onClick={() => openTab('pending-requests')}>
          Pending Requests
        </div>
        <div className={`tab-a ${activeTab === 'analytics-section' ? 'active' : ''}`} onClick={() => setActiveTab('analytics-section')}>
          Analytics Section
        </div>
      </div>

      <div className={`tab-content ${activeTab === 'manage-resources' ? 'active' : ''}`}>
        <div className="manage-resources">  
          <h2>{editResourceId ? 'Edit Resource' : 'Manage Resources'}</h2>
          <div className="admin-controls">
            <input type="text" placeholder="Resource Name" value={resourceName} onChange={(e) => setResourceName(e.target.value)} />
            <input type="text" placeholder="Description" value={resourceDetails} onChange={(e) => setResourceDetails(e.target.value)} />
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
              <option value="pdf">PDF</option><option value="training">Training</option><option value="course">Course</option>
            </select>
            {resourceType === 'pdf' ? (
              <input type="file" onChange={handleFileChange} accept=".pdf" />
            ) : (
              <input type="text" placeholder="Enter URL" value={contentUrl} onChange={handleUrlChange} />
            )}
            <button onClick={editResourceId ? handleSaveEdit : handleAddResource}>
              {editResourceId ? 'Save Changes' : 'Add Resource'}
            </button>
            {editResourceId && <button onClick={() => setEditResourceId(null)}>Cancel Edit</button>}
          </div>
        </div>

        <div className="resources-table"> 
          <h2>Resources ({filteredResources.length} total)</h2>
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Content</th><th>Actions</th></tr></thead>
            <tbody>
              {paginatedResources.map(resource => (
                <tr key={resource.id}>
                  <td>{resource.title}</td>
                  <td>{resource.type}</td>
                  <td>{resource.status}</td>
                  <td>{resource.type === 'pdf' ? (
                    <a href={resource.content} download={`${resource.title}.pdf`}>Download</a>
                  ) : (
                    <a href={resource.content} target="_blank" rel="noopener noreferrer">Access</a>
                  )}</td>
                  <td>
                    <div className="resource-actions">
                      <button onClick={() => handleEditResource(resource)}>Edit</button>
                      <button onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResources.length > pageSize && (
            <div className="pagination-controls">
              <button
                disabled={resourcePage === 1}
                onClick={() => setResourcePage(prev => prev - 1)}
              >
                Previous
              </button>
              <span>Page {resourcePage} of {Math.ceil(filteredResources.length / pageSize)}</span>
              <button
                disabled={endResourceIndex >= filteredResources.length}
                onClick={() => setResourcePage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="log-table">
          <h2>Action Logs</h2>
          <table>
            <thead><tr><th>Time</th><th>Message</th></tr></thead>
            <tbody>{paginatedLogs.map((log, index) => <tr key={index}><td>{log.timestamp}</td><td>{log.message}</td></tr>)}</tbody>
          </table>
          {logs.length > pageSize && (
            <div className="pagination-controls">
              <button
                disabled={logPage === 1}
                onClick={() => setLogPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span>Page {logPage} of {Math.ceil(logs.length / pageSize)}</span>
              <button
                disabled={endLogIndex >= logs.length}
                onClick={() => setLogPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`tab-content ${activeTab === 'pending-requests' ? 'active' : ''}`}>
        <div className="pending-requests">
          <h2>Pending Requests</h2>
          <table>
            <thead><tr><th>User</th><th>Resource</th><th>Status</th><th>Rejection Reason</th><th>Actions</th></tr></thead>
            <tbody>
              {paginatedRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.userId}</td>
                  <td>{req.resourceId}</td>
                  <td>{req.status}</td>
                  <td>{req.rejectionReason || '-'}</td>
                  <td>
                    <div className="resource-actions">
                      {req.status === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(req.id, req.userId, req.resourceId)}>Approve</button>
                          <button onClick={() => handleRejectClick(req.id, req.userId, req.resourceId)}>Reject</button>
                        </>
                      ) : req.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {allRequests.length > pageSize && (
            <div className="pagination-controls">
              <button
                disabled={requestPage === 1}
                onClick={() => setRequestPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span>Page {requestPage} of {Math.ceil(allRequests.length / pageSize)}</span>
              <button
                disabled={endRequestIndex >= allRequests.length}
                onClick={() => setRequestPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`tab-content ${activeTab === 'analytics-section' ? 'active' : ''}`}>
        <div className="pending-requests">
          <h2>Analytics</h2>
          <div className="chart-container"><Bar data={barData} options={{ responsive: true }} /></div>
          <div className="chart-container"><Pie data={pieData} options={{ responsive: true }} /></div>
        </div>
      </div>

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reject Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection"
            />
            <div className="modal-actions">
              <button onClick={handleRejectSubmit}>Submit</button>
              <button onClick={closeRejectModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;