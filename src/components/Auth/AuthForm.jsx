import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthToggle from './AuthToggle';
import AuthInputFields from './AuthInputFields';
import ForgotPasswordForm from './ForgotPassword';
import Navbar from '../Landing/Navbar';
import '../../styles/AuthForm.css';
import { handleGoogleSignIn, handleAuthSubmission } from '../../utils/authLogic.js';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate(); // ✅ for programmatic navigation

  // Handle Google login
  const handleGoogleLogin = async () => {
    const role = await handleGoogleSignIn();
    if (role) {
      navigate(role === 'admin' ? `/admin-dashboard` : `/dashboard`);
    }
  };

  // Handle email/password login or signup
  const handleFormSubmit = async (formData) => {
    const role = await handleAuthSubmission(null, formData, isSignUp, isAdmin);
    if (role) {
      navigate(role === 'admin' ? `/admin-dashboard` : `/dashboard`);
    }
  };

  return (
    <div className="auth-container">
      <Navbar />

      {!showForgotPassword ? (
        <>
          {/* Toggle between Sign In / Sign Up */}
          <AuthToggle isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

          {/* Input fields handle submission via handleFormSubmit */}
          <AuthInputFields
            isSignUp={isSignUp}
            isAdmin={isAdmin}
            setIsSignUp={setIsSignUp}
            setShowForgotPassword={setShowForgotPassword}
            onSubmit={handleFormSubmit} // ✅ Pass submit handler
          />

          {/* Google login button */}
          <div className="google-signin-wrapper">
            <div className="divider">OR</div>
            <button className="google-signin-btn" onClick={handleGoogleLogin}>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="google-icon"
              />
              Continue with Google
            </button>
          </div>
        </>
      ) : (
        <ForgotPasswordForm setShowForgotPassword={setShowForgotPassword} />
      )}
    </div>
  );
};

export default AuthForm;
