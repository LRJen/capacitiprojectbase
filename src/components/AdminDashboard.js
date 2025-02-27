import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { ref as dbRef, onValue, push, update, remove } from 'firebase/database';
import { signOut } from 'firebase/auth';
<<<<<<< HEAD
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
=======
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import logo from '../assets/Logo.jpg';


// ... rest of your code remains unchanged ...
>>>>>>> 3e37f0b4354019a78dd0027eb9239cae5429a323

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const AdminDashboard = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [resourceDetails, setResourceDetails] = useState('');
  const [resourceType, setResourceType] = useState('pdf');
  const [file, setFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    addLog('Component mounted');
    const resourcesRef = dbRef(db, 'resources');
    const requestsRef = dbRef(db, 'requests');

    const unsubscribeResources = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const resourceList = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setResources(resourceList);
        addLog('Resources fetched successfully from Realtime Database');
      } else {
        setResources([]);
        addLog('No resources found');
      }
    }, (error) => {
      addLog(`Resources fetch error: ${error.message}`);
    });

    const unsubscribeRequests = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestList = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setPendingRequests(requestList);
        addLog('Requests fetched successfully from Realtime Database');
      } else {
        setPendingRequests([]);
        addLog('No pending requests found');
      }
    }, (error) => {
      addLog(`Requests fetch error: ${error.message}`);
    });

    return () => {
      unsubscribeResources();
      unsubscribeRequests();
    };
  }, []);

  const addLog = (message) => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message }]);
    console.log(message);
  };

  const handleApprove = async (id) => {
    try {
      await update(dbRef(db, `requests/${id}`), { status: 'approved' });
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      setResources(prev => prev.map(res => res.id === id ? { ...res, status: 'approved' } : res));
      addLog(`Request ${id} approved`);
    } catch (error) {
      addLog(`Approve error: ${error.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await remove(dbRef(db, `requests/${id}`));
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      addLog(`Request ${id} rejected`);
    } catch (error) {
      addLog(`Reject error: ${error.message}`);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      addLog(`File selected: ${selectedFile.name} (Size: ${selectedFile.size} bytes)`);
    } else {
      addLog('No file selected or file input cleared');
    }
  };

  const handleAddResource = async () => {
    addLog('Add Resource button clicked');
    if (!resourceName) {
      addLog('Error: Resource name is required');
      alert('Please enter a resource name');
      return;
    }

    try {
      let fileUrl = '';
      if (file) {
        addLog(`Uploading file to Firebase Storage: ${file.name}`);
        const fileRef = storageRef(storage, `resources/${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
        addLog(`File uploaded successfully, URL: ${fileUrl}`);
      } else {
        addLog('No file to upload');
      }

      const newResource = {
        title: resourceName,
        description: resourceDetails,
        type: resourceType,
        status: 'available',
        fileUrl: fileUrl || '',
        createdAt: new Date().toISOString(),
      };
      addLog(`Adding resource to Realtime Database: ${JSON.stringify(newResource)}`);
      const resourcesRef = dbRef(db, 'resources');
      const newResourceRef = await push(resourcesRef, newResource);
      addLog(`Resource added with ID: ${newResourceRef.key}`);

      setResources(prev => [...prev, { id: newResourceRef.key, ...newResource }]);
      setResourceName('');
      setResourceDetails('');
      setFile(null);
      fileInputRef.current.value = null;
      addLog('Form reset');
      alert('Resource added successfully!');
    } catch (error) {
      addLog(`Error adding resource: ${error.message}`);
      alert(`Failed to add resource: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      addLog('Logged out successfully');
    } catch (error) {
      addLog(`Logout error: ${error.message}`);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const barData = {
    labels: resources.map(r => r.title),
    datasets: [{ label: 'Requests', data: resources.map(() => Math.floor(Math.random() * 20)), backgroundColor: 'rgba(75, 192, 192, 0.2)' }],
  };

  const pieData = {
    labels: ['Pending', 'Approved'],
    datasets: [{ data: [pendingRequests.length, resources.length - pendingRequests.length], backgroundColor: ['#FF6384', '#36A2EB'] }],
  };

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
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/admin-dashboard">Resources</Link></li>
<<<<<<< HEAD
          
          <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
=======
          <li><Link to="/profile">Profile</Link></li>
>>>>>>> 3e37f0b4354019a78dd0027eb9239cae5429a323
        </ul>
      </nav>

      <div className="admin-controls">
        <h2>Manage Resources</h2>
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
        />
        <button onClick={handleAddResource}>Add Resource</button>
      </div>

      <div className="resources-list">
        <h2>Resources</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(resource => (
              <tr key={resource.id}>
                <td>{resource.title}</td>
                <td>{resource.type}</td>
                <td>{resource.status}</td>
                <td>
                  {resource.fileUrl ? (
                    <a href={resource.fileUrl} download={resource.title} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  ) : 'No file'}
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
        <h2>Pending Requests</h2>
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
            {pendingRequests.map(req => (
              <tr key={req.id}>
                <td>{req.userId}</td>
                <td>{req.resourceId}</td>
                <td>{req.status}</td>
                <td>
                  <button onClick={() => handleApprove(req.id)}>Approve</button>
                  <button onClick={() => handleReject(req.id)}>Reject</button>
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