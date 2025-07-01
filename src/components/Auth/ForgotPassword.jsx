import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

const ForgotPasswordForm = ({ setShowForgotPassword }) => {
  const [email, setEmail] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent.');
      setShowForgotPassword(false);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <form onSubmit={handleReset} className="auth-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">Reset Password</button>
      </form>

      {/* Back to Login as text link */}
      <p
        className="back-to-login-text"
        onClick={() => setShowForgotPassword(false)}
      >
        Back to Login
      </p>
    </>
  );
};

export default ForgotPasswordForm;
