import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../firebase'; // Import from firebase.js
import { onSnapshot, collection, getDocs, updateDoc, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ... rest of your code remains unchanged ...

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const AdminDashboard = ({ user }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [resourceDetails, setResourceDetails] = useState('');
  const [resourceType, setResourceType] = useState('pdf');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // Added for navigation after logout

  useEffect(() => {
    const fetchData = async () => {
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const resourcesSnapshot = await getDocs(collection(db, 'resources'));
      setPendingRequests(requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setResources(resourcesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'requests', id), { status: 'approved' });
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleReject = async (id) => {
    await deleteDoc(doc(db, 'requests', id));
    setPendingRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleAddResource = async () => {
    let fileUrl = '';
    if (file) {
      const storageRef = ref(storage, `resources/${file.name}`); // Create a reference in Storage
      await uploadBytes(storageRef, file); // Upload the file
      fileUrl = await getDownloadURL(storageRef); // Get the download URL
    }

    const newResource = {
      title: resourceName,
      description: resourceDetails,
      type: resourceType,
      status: 'available',
      fileUrl: fileUrl || '', // Include file URL if uploaded
    };

    const docRef = await addDoc(collection(db, 'resources'), newResource);
    setResources([...resources, { id: docRef.id, ...newResource }]);
    setResourceName('');
    setResourceDetails('');
    setFile(null); // Reset file input
    fileInputRef.current.value = null; // Clear the input field
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to landing page after logout
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

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
      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/admin-dashboard">Resources</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/" onClick={handleLogout}>Logout</Link></li> {/* Updated logout */}
        </ul>
      </nav>

      <div className="user-greeting">
        <h1>Welcome, {user.name} (Admin)!</h1>
      </div>

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
          accept=".pdf,.doc,.docx" // Restrict to common file types
        />
        <button onClick={handleAddResource}>Add Resource</button>
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