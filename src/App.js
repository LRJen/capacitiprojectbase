import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { ref as dbRef, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const LandingPageWrapper = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/auth');
  return <LandingPage onGetStarted={handleGetStarted} />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('App.js - useEffect triggered');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('App.js - onAuthStateChanged fired, currentUser:', currentUser);
      if (currentUser) {
        const userRef = dbRef(db, `users/${currentUser.uid}`);
        console.log('App.js - Fetching user data for UID:', currentUser.uid);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        console.log('App.js - Fetched user data from DB:', userData);
        const userObj = {
          ...currentUser,
          name: userData?.name || currentUser.email.split('@')[0],
          role: userData?.role || 'user',
        };
        console.log('App.js - Setting user object:', userObj);
        setUser(userObj);
        const target = userObj.role === 'admin' ? '/admin-dashboard' : '/dashboard';
        console.log('App.js - Navigating to:', target);
        navigate(target);
      } else {
        setUser(null);
        console.log('App.js - No user logged in, redirecting to /auth');
        navigate('/auth');
      }
      setLoading(false);
    });
    return () => {
      console.log('App.js - Cleaning up auth listener');
      unsubscribe();
    };
  }, [navigate]); // Removed user from dependencies

  // Memoize user to prevent re-renders unless uid or role changes
  const memoizedUser = useMemo(() => user, [user?.uid, user?.role]);

  if (loading) {
    console.log('App.js - Loading state active');
    return <div className="loading">Loading...</div>;
  }

  console.log('App.js - Rendering routes with user:', memoizedUser);

  return (
    <Routes>
      <Route path="/" element={<LandingPageWrapper />} />
      <Route path="/auth" element={<AuthForm />} />
      <Route
        path="/dashboard"
        element={memoizedUser ? <Dashboard user={memoizedUser} /> : <LandingPageWrapper />}
      />
      <Route
        path="/admin-dashboard"
        element={
          memoizedUser && memoizedUser.role === 'admin' ? (
            <AdminDashboard user={memoizedUser} />
          ) : (
            <LandingPageWrapper />
          )
        }
      />
      <Route
        path="/profile"
        element={memoizedUser ? <Profile user={memoizedUser} /> : <LandingPageWrapper />}
      />
    </Routes>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;