import React, { useState } from 'react';
import { handleAuthSubmission } from '../../utils/authLogic';
import PasswordStrengthBar from './PasswordStrength';

const AuthInputFields = ({ isSignUp, isAdmin, setIsSignUp, setShowForgotPassword }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    adminCode: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuthSubmission(e, formData, isSignUp, isAdmin);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        {isSignUp && (
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="password-input"
          />
          <span
            className="toggle-password-icon"
            onClick={togglePasswordVisibility}
            role="button"
            aria-label="Toggle password visibility"
          ></span>
        </div>

        <PasswordStrengthBar password={formData.password} />

        {isAdmin && (
          <input
            type="text"
            name="adminCode"
            placeholder="Admin Code"
            value={formData.adminCode}
            onChange={handleChange}
          />
        )}

        <button type="submit" className="auth-button">
          {isSignUp ? 'Register' : 'Login'}
        </button>

        <p
          className="toggle-form-text"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Login' : 'Don’t have an account? Register'}
        </p>
      </form>

      {!isSignUp && (
        <p
          className="forgot-password-text"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </p>
      )}
    </>
  );
};

export default AuthInputFields;
