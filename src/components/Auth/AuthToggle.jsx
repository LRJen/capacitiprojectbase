import React from 'react';

const AuthToggle = ({ isAdmin, setIsAdmin }) => (
  <div className="auth-toggle-buttons">
    <button onClick={() => setIsAdmin(false)} className={!isAdmin ? 'active' : ''}>User</button>
    <button onClick={() => setIsAdmin(true)} className={isAdmin ? 'active' : ''}>Admin</button>
  </div>
);

export default AuthToggle;
