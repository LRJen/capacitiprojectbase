import React, { useState, useEffect, useMemo } from 'react';
import './styles/App.css';
import LandingPage from './components/Landing/LandingPage';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/User Dashboard/Dashboard';
import AdminDashboard from './components/Admin Dashboard/AdminDashboard';
import Profile from './components/Profile';
import Layout from '../src/components/Layout';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { auth, db } from './firebase';
import { ref as dbRef, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

// 🔑 One source of truth for your subfolder
const BASENAME = '/capacitiprojectbase';

// Small helper to strip the basename when comparing paths
const stripBase = (p) => (p.startsWith(BASENAME) ? p.slice(BASENAME.length) || '/' : p);

// Wrapper for LandingPage to handle "Get Started" button navigation
const LandingPageWrapper = () => {
  const navigate = useNavigate();
  // Navigate to /capacitiprojectbase/auth (no more accidental root redirect)
  const handleGetStarted = () => navigate(`${BASENAME}/auth`);
  return <LandingPage onGetStarted={handleGetStarted} />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const rawPath = location.pathname;      // e.g. "/capacitiprojectbase/auth"
      const path = stripBase(rawPath);        // e.g. "/auth"

      if (currentUser) {
        try {
          const userRef = dbRef(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val();

          const userObj = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: userData?.name || currentUser.email.split('@')[0],
            role: userData?.role || 'user',
          };

          setUser(userObj);

          // If coming from /auth, push them to the correct dashboard
          if (path === '/auth') {
            const target = userObj.role === 'admin' ? 'admin-dashboard' : 'dashboard';
            navigate(`/${target}`, { replace: true });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser(null);
        }
      } else {
        setUser(null);
        // Only "/" and "/auth" are public
        const isPublic = path === '/' || path === '/auth';
        if (!isPublic) {
          navigate(`${BASENAME}/`, { replace: true });
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [location.pathname, navigate]);

  const memoizedUser = useMemo(() => (user ? { ...user } : null), [user]);

  if (loading) return <div className="loading">Loading...</div>;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate(`${BASENAME}/`);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleProfileClick = () => {
    navigate(`${BASENAME}/profile`);
  };

  return (
    <Routes>
      {/* Index/Landing */}
      <Route
        path="/"
        element={
          <Layout user={memoizedUser}>
            <LandingPageWrapper />
          </Layout>
        }
      />

      {/* Auth */}
      <Route
        path="auth"
        element={
          <Layout user={memoizedUser}>
            <AuthForm />
          </Layout>
        }
      />

      {/* User Dashboard */}
      <Route
        path="dashboard"
        element={
          memoizedUser ? (
            <Layout user={memoizedUser} handleLogout={handleLogout}>
              <Dashboard user={memoizedUser} />
            </Layout>
          ) : (
            <Layout>
              <LandingPageWrapper />
            </Layout>
          )
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="admin-dashboard"
        element={
          memoizedUser?.role === 'admin' ? (
            <Layout user={memoizedUser} handleLogout={handleLogout}>
              <AdminDashboard
                user={memoizedUser}
                handleLogout={handleLogout}
                handleProfileClick={handleProfileClick}
              />
            </Layout>
          ) : (
            <Layout>
              <LandingPageWrapper />
            </Layout>
          )
        }
      />

      {/* Profile */}
      <Route
        path="profile"
        element={
          memoizedUser ? (
            <Layout user={memoizedUser} handleLogout={handleLogout}>
              <Profile user={memoizedUser} />
            </Layout>
          ) : (
            <Layout>
              <LandingPageWrapper />
            </Layout>
          )
        }
      />
    </Routes>
  );
};

// ✅ Router with basename — keeps the URL under /capacitiprojectbase/...
const AppWrapper = () => (
  <Router basename={BASENAME}>
    <App />
  </Router>
);

export default AppWrapper;
