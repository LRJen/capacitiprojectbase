import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import WelcomePage from './components/WelcomePage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard'; // Import the AdminDashboard component
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Wrapper component for the landing page to handle navigation
const LandingPageWrapper = () => {
  const navigate = useNavigate();

  // Handle navigation to the welcome page
  const handleGetStarted = () => {
    navigate('/welcome');
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
};

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleUserRegister = () => {
    setIsAdmin(false);
  };

  const handleAdminRegister = () => {
    setIsAdmin(true);
  };

  // Example user data (replace with actual user data as needed)
  const user = {
    name: 'John Doe',
    role: isAdmin ? 'admin' : 'user'
  };

  return (
    <Router>
      <Routes>
        {/* Route for the landing page */}
        <Route path="/" element={<LandingPageWrapper />} />
        {/* Route for the welcome page with registration handlers */}
        <Route path="/welcome" element={<WelcomePage onUserRegister={handleUserRegister} onAdminRegister={handleAdminRegister} />} />
        {/* Route for the auth form, passing isAdmin as a prop */}
        <Route path="/auth" element={<AuthForm isAdmin={isAdmin} />} />
        {/* Route for the dashboard, passing user data as a prop */}
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        {/* Route for the admin dashboard, passing user data as a prop */}
        <Route path="/admin-dashboard" element={<AdminDashboard user={user} />} />
      </Routes>
    </Router>
  );
};

export default App;
