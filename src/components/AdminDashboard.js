import React from 'react';
import './Dashboard.css'; // We'll use the same CSS for consistency
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const AdminDashboard = ({ user }) => {
  // Sample data for charts
  const barData = {
    labels: ['Resource 1', 'Resource 2', 'Resource 3', 'Resource 4', 'Resource 5'],
    datasets: [
      {
        label: 'Number of Requests',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [
      {
        data: [300, 50],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Sample pending requests data
  const pendingRequests = [
    { id: 1, userName: 'Alice', requestedItem: 'Resource 1', status: 'Pending' },
    { id: 2, userName: 'Bob', requestedItem: 'Resource 2', status: 'Pending' },
    // Add more pending requests as needed
  ];

  const handleApprove = (id) => {
    console.log(`Approved request with ID: ${id}`);
  };

  const handleReject = (id) => {
    console.log(`Rejected request with ID: ${id}`);
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/resources">Resources</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/logout">Logout</a></li> {/* Sign out button */}
        </ul>
      </nav>

      {/* User Greeting */}
      <div className="user-greeting">
        <h1>Welcome, {user.name} (Admin)!</h1>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h2>Admin Quick Links</h2>
        <ul>
          <li><a href="/upload">Upload</a></li>
          <li><a href="/view-resources">View Available Resources</a></li>
          <div className="feature-cards">
        <div className="card">
          <h2>Effortless Resource Requests</h2>
          <p>Streamline your resource requests with our easy-to-use system.</p>
          <button className="read-more-button">Read More</button>
        </div>
        <div className="card">
          <h2>AI-Powered Recommendations</h2>
          <p>Get personalized resource recommendations based on your needs.</p>
          <button className="read-more-button">Read More</button>
        </div>
        <div className="card">
          <h2>Centralized Resource Management</h2>
          <p>Manage all your resources in one place efficiently and effectively.</p>
          <button className="read-more-button">Read More</button>
        </div>
      </div>
          <li><a href="/recent-activity">Recent Activity</a></li>
          <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Requested Item</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map(request => (
              <tr key={request.id}>
                <td>{request.userName}</td>
                <td>{request.requestedItem}</td>
                <td>{request.status}</td>
                <td>
                  <button onClick={() => handleApprove(request.id)}>Approve</button>
                  <button onClick={() => handleReject(request.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          <li><a href="/manage-users">Manage Users</a></li> {/* Admin-specific link */}
          <li><a href="/settings">Settings</a></li> {/* Additional admin link */}
        </ul>
      </div>

      {/* Pending Requests Table */}
      <div className="pending-requests">
        <h2>Pending Requests</h2>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Requested Item</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map(request => (
              <tr key={request.id}>
                <td>{request.userName}</td>
                <td>{request.requestedItem}</td>
                <td>{request.status}</td>
                <td>
                  <button onClick={() => handleApprove(request.id)}>Approve</button>
                  <button onClick={() => handleReject(request.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Visualization */}
      <div className="analytics-section">
        <h2>Analytics</h2>
        <div className="chart-container">
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="chart-container">
          <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;