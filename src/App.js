import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import WelcomePage from './components/WelcomePage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase'; // Import from firebase.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// ... rest of your code remains unchanged ...

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/welcome');
  return <LandingPage onGetStarted={handleGetStarted} />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUser({ ...currentUser, ...userDoc.data() });
          } else {
            setUser(currentUser); // Fallback if no Firestore doc exists
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null); // Handle error gracefully
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <LandingPageWrapper />} />
        <Route
          path="/admin-dashboard"
          element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <LandingPageWrapper />}
        />
      </Routes>
    </Router>
  );
};

export default App;
