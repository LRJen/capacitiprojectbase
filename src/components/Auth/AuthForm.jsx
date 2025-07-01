import React, { useState, useEffect } from 'react';
import AuthToggle from './AuthToggle';
import AuthInputFields from './AuthInputFields';
import ForgotPasswordForm from './ForgotPassword';
import Layout from '../Layout';
import Navbar from '../Landing/Navbar';
import '../../styles/AuthForm.css';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="auth-container">
      <Navbar />

      {!showForgotPassword ? (
        <>
          <AuthToggle isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
          <AuthInputFields
            isSignUp={isSignUp}
            isAdmin={isAdmin}
            setIsSignUp={setIsSignUp}
            setShowForgotPassword={setShowForgotPassword}
          />
        </>
      ) : (
        <ForgotPasswordForm setShowForgotPassword={setShowForgotPassword} />
      )}

    </div>
  );
};

export default AuthForm;
