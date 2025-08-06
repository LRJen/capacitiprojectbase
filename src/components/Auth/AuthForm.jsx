import React, { useState } from 'react';
import AuthToggle from './AuthToggle';
import AuthInputFields from './AuthInputFields';
import ForgotPasswordForm from './ForgotPassword';
import Layout from '../Layout';
import Navbar from '../Landing/Navbar';
import '../../styles/AuthForm.css';
import { handleGoogleSignIn } from '../../utils/authLogic.js'; // Make sure this path is correct

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

          <div className="google-signin-wrapper">
            <div className="divider">OR</div>
            <button className="google-signin-btn" onClick={handleGoogleSignIn}>
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
