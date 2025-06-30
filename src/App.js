import React, { useState, useEffect, useMemo } from 'react';
import './styles/App.css';
import LandingPage from './components/Landing/LandingPage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  useEffect(() => {
    console.log('App.js - useEffect triggered for auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('App.js - onAuthStateChanged fired, currentUser:', currentUser);
      console.log('App.js - Current location:', location.pathname);

      if (currentUser) {
        try {
          const userRef = dbRef(db, `users/${currentUser.uid}`);
          console.log('App.js - Fetching user data for UID:', currentUser.uid);
          const userSnapshot = await get(userRef);
          const userData = userSnapshot.val();
          console.log('App.js - Fetched user data from DB:', userData);

          const userObj = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: userData?.name || currentUser.email.split('@')[0],
            role: userData?.role || 'user',
          };
          console.log('App.js - Setting user object:', userObj);
          setUser(userObj);

          const protectedRoutes = ['/dashboard', '/admin-dashboard', '/profile'];
          const isOnProtectedRoute = protectedRoutes.includes(location.pathname);

          // ✅ Redirect only from /auth, NOT from /
          if (location.pathname === '/auth') {
            const target = userObj.role === 'admin' ? '/admin-dashboard' : '/dashboard';
            console.log('App.js - Redirecting from /auth to:', target);
            navigate(target, { replace: true });
          } else if (!isOnProtectedRoute) {
            console.log('App.js - Unprotected route, no redirect needed');
          }
        } catch (error) {
          console.error('App.js - Error fetching user data:', error.message);
          setUser(null);
        }
      } else {
        console.log('App.js - No user logged in');
        setUser(null);

        const publicRoutes = ['/', '/auth'];
        const isOnPublicRoute = publicRoutes.includes(location.pathname);

        if (!isOnPublicRoute) {
          console.log('App.js - Not on public route, redirecting to /auth');
          navigate('/auth', { replace: true });
        } else {
          console.log('App.js - On public route, staying put');
        }
      }

      setLoading(false);
    });

    return () => {
      console.log('App.js - Cleaning up auth listener');
      unsubscribe();
    };
  }, [navigate, location.pathname]);

  const memoizedUser = useMemo(() => {
    if (!user) return null;
    return { ...user };
  }, [user?.uid, user?.role, user?.name, user?.email]);

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
          memoizedUser && memoizedUser.role === 'admin'
            ? <AdminDashboard user={memoizedUser} />
            : <LandingPageWrapper />
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
