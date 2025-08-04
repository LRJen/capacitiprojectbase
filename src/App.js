import React, { useState, useEffect, useMemo } from 'react';
import './styles/App.css';
import LandingPage from './components/Landing/LandingPage';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/User Dashboard/Dashboard';
import AdminDashboard from './components/Admin Dashboard/AdminDashboard';
import Profile from './components/Profile';
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

// Wrapper for LandingPage to handle Get Started nav
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const path = location.pathname;

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

          if (path === '/auth') {
            const target = userObj.role === 'admin' ? '/admin-dashboard' : '/dashboard';
            navigate(target, { replace: true });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser(null);
        }
      } else {
        setUser(null);
        const isPublic = path === '/' || path === '/auth';
        if (!isPublic) {
          navigate('/', { replace: true }); // ⬅️ Redirect to Landing Page when logged out
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [location.pathname, navigate]);

  const memoizedUser = useMemo(() => {
    if (!user) return null;
    return { ...user };
  }, [user]);

  if (loading) return <div className="loading">Loading...</div>;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

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
          memoizedUser?.role === 'admin' ? (
            <AdminDashboard
              user={memoizedUser}
              handleLogout={handleLogout}
              handleProfileClick={handleProfileClick}
            />
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

// ✅ Set basename for subfolder deployment (like GitHub Pages or custom subpaths)
const AppWrapper = () => (
  <Router basename={process.env.PUBLIC_URL || '/'}>
    <App />
  </Router>
);

export default AppWrapper;
