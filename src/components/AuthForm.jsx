import React, { useState, useEffect } from 'react';
import '../styles/AuthForm.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { ref as dbRef, set, get } from 'firebase/database';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification 
} from 'firebase/auth';
import Layout from './Layout';
//import LandbotChat from './LandbotChat';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    letters: false,
    capital: false,
    digits: false,
    special: false,
  });
  const [adminCodeValidations, setAdminCodeValidations] = useState({
    letters: false,
    digit: false,
    special: false,
  });
  const navigate = useNavigate();
  const adminCodeHardcoded = 'Adm1@';

  useEffect(() => {
    resetForm();
  }, []);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setAdminCode('');
    setResetEmail('');
    setIsAdmin(false);
    setIsSignUp(false);
    setShowForgotPassword(false);
    setPasswordValidations({
      length: false,
      letters: false,
      capital: false,
      digits: false,
      special: false,
    });
    setAdminCodeValidations({
      letters: false,
      digit: false,
      special: false,
    });
    console.log('AuthForm.js - Form reset');
  };

  const validatePassword = (value) => {
    const lengthValid = value.length === 8;
    const lettersValid = (value.match(/[a-zA-Z]/g) || []).length >= 5;
    const capitalValid = /[A-Z]/.test(value);
    const digitsValid = (value.match(/\d/g) || []).length >= 2;
    const specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    setPasswordValidations({
      length: lengthValid,
      letters: lettersValid,
      capital: capitalValid,
      digits: digitsValid,
      special: specialValid,
    });

    return lengthValid && lettersValid && capitalValid && digitsValid && specialValid;
  };

  const validateAdminCode = (value) => {
    const lettersValid = (value.match(/[a-zA-Z]/g) || []).length === 3;
    const digitValid = (value.match(/\d/g) || []).length === 1;
    const specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    setAdminCodeValidations({
      letters: lettersValid,
      digit: digitValid,
      special: specialValid,
    });

    return lettersValid && digitValid && specialValid;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleAdminCodeChange = (e) => {
    const value = e.target.value;
    setAdminCode(value);
    validateAdminCode(value);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        if (!validatePassword(password)) {
          alert('Password must be 8 characters with 5 letters (1 capital), 2 digits, and 1 special character');
          return;
        }
        if (isAdmin && !validateAdminCode(adminCode)) {
          alert('Admin code must have 3 letters, 1 digit, and 1 special character');
          return;
        }

        // Step 1: Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const role = isAdmin && adminCode === adminCodeHardcoded ? 'admin' : 'user';
        console.log('AuthForm.js - Signup - Assigned role:', role);
        console.log('AuthForm.js - Signup - Step 1: User created in Firebase Auth with UID:', user.uid);

        // Step 2: Send email verification
        await sendEmailVerification(user);
        console.log('AuthForm.js - Signup - Step 2: Verification email sent to:', email);

        // Step 3: Initialize user data in Realtime Database
        const userData = {
          name: username,
          role,
          email,
          createdAt: new Date().toISOString(),
          emailVerified: false, // Optional: Store verification status
        };
        await set(dbRef(db, `users/${user.uid}`), userData);
        console.log('AuthForm.js - Signup - Step 3: User data initialized in users/', user.uid, ':', userData);

        // Step 4: Initialize userDownloads for the user (empty)
        await set(dbRef(db, `userDownloads/${user.uid}`), {});
        console.log('AuthForm.js - Signup - Step 4: userDownloads/', user.uid, ' initialized as empty');

        // Step 5: Verify data was saved
        const userSnapshot = await get(dbRef(db, `users/${user.uid}`));
        const savedData = userSnapshot.val();
        console.log('AuthForm.js - Signup - Verified saved data:', savedData);

        const downloadsSnapshot = await get(dbRef(db, `userDownloads/${user.uid}`));
        const savedDownloads = downloadsSnapshot.val();
        console.log('AuthForm.js - Signup - Verified userDownloads:', savedDownloads);

        // Inform user to verify email and sign out
        alert('Registration successful! Please check your email to verify your account before logging in.');
        await auth.signOut(); // Sign out after registration to enforce verification
        resetForm();
      } else {
        // Login flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if email is verified
        if (!user.emailVerified) {
          await auth.signOut(); // Sign out if not verified
          alert('Please verify your email before logging in. Check your inbox for the verification link.');
          return;
        }

        const userSnapshot = await get(dbRef(db, `users/${user.uid}`));
        const userData = userSnapshot.val();
        console.log('AuthForm.js - Login - Fetched user data:', userData);

        if (!userData) {
          const role = 'user';
          await set(dbRef(db, `users/${user.uid}`), {
            name: email.split('@')[0],
            role,
            email,
            createdAt: new Date().toISOString(),
            emailVerified: true, // Set to true since they’ve logged in
          });
          await set(dbRef(db, `userDownloads/${user.uid}`), {});
          console.log('AuthForm.js - Login - No data found, set default user role and downloads for UID:', user.uid);
          navigate('/dashboard');
        } else {
          const role = userData.role || 'user';
          console.log('AuthForm.js - Login - Role from DB:', role);
          // Optionally update emailVerified in DB
          if (!userData.emailVerified) {
            await set(dbRef(db, `users/${user.uid}/emailVerified`), true);
            console.log('AuthForm.js - Login - Updated emailVerified to true in DB');
          }
          navigate(role === 'admin' ? '/admin-dashboard' : '/dashboard');
        }
        resetForm();
      }
    } catch (error) {
      console.error('AuthForm.js - Authentication error:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already in use. Please use a different email.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email format.');
      } else if (error.code === 'auth/wrong-password') {
        alert('Incorrect password.');
      } else if (error.code === 'auth/user-not-found') {
        alert('No account found with this email. Please sign up.');
      } else {
        alert(`Authentication failed: ${error.message}`);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      if (!resetEmail || !resetEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      await sendPasswordResetEmail(auth, resetEmail);
      console.log('AuthForm.js - Password reset email sent to:', resetEmail);
      alert('Password reset email sent! Please check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('AuthForm.js - Password reset error:', error.code, error.message);
      if (error.code === 'auth/invalid-email') {
        alert('Invalid email format.');
      } else if (error.code === 'auth/user-not-found') {
        alert('This email is not registered. Please sign up first.');
      } else {
        alert(`Password reset failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">RESOURCE HUB</h1>
      
      {!showForgotPassword ? (
        <>
          <div className="auth-toggle-buttons">
            <button onClick={() => setIsAdmin(false)} className={!isAdmin ? 'active' : ''}>User</button>
            <button onClick={() => setIsAdmin(true)} className={isAdmin ? 'active' : ''}>Admin</button>
          </div>
          <form onSubmit={handleAuth} className="auth-form">
            {isSignUp && (
              <input
                type="text"
                placeholder="Enter your user name...."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Enter your email...."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (8 chars: 5 letters, 2 digits, 1 special)"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <div class="dropdown">
              <span>Password Constraints</span>
                <div className="validation-feedback">
                  <span className={passwordValidations.length ? 'valid' : 'invalid'}>
                    Exactly 8 characters: {passwordValidations.length ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidations.letters ? 'valid' : 'invalid'}>
                    5+ letters: {passwordValidations.letters ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidations.capital ? 'valid' : 'invalid'}>
                    1 capital: {passwordValidations.capital ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidations.digits ? 'valid' : 'invalid'}>
                    2+ digits: {passwordValidations.digits ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidations.special ? 'valid' : 'invalid'}>
                    1 special: {passwordValidations.special ? '✓' : '✗'}
                  </span>
                </div>
            </div>  
            {isAdmin && (
              <>
                <input
                  type="text"
                  placeholder="Admin Code (3 letters, 1 digit, 1 special)"
                  value={adminCode}
                  onChange={handleAdminCodeChange}
                />
                <div class="dropdown">
                  <span>Admin Code Constraints</span>
                    <div className="validation-feedback">
                      <span className={adminCodeValidations.letters ? 'valid' : 'invalid'}>
                        3 letters: {adminCodeValidations.letters ? '✓' : '✗'}
                      </span>
                      <span className={adminCodeValidations.digit ? 'valid' : 'invalid'}>
                        1 digit: {adminCodeValidations.digit ? '✓' : '✗'}
                      </span>
                      <span className={adminCodeValidations.special ? 'valid' : 'invalid'}>
                        1 special: {adminCodeValidations.special ? '✓' : '✗'}
                      </span>
                    </div>
                </div>
              </>
            )}
            <button type="submit" className="auth-button">{isSignUp ? 'Register' : 'Login'}</button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-form-button">
            {isSignUp ? 'Switch to Login' : 'Switch to Register'}
          </button>
          {!isSignUp && (
            <button 
              onClick={() => setShowForgotPassword(true)} 
              className="forgot-password-button"
            >
              Forgot Password?
            </button>
          )}
        </>
      ) : (
        <form onSubmit={handleForgotPassword} className="auth-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">Reset Password</button>
          <button 
            onClick={() => setShowForgotPassword(false)} 
            className="toggle-form-button"
          >
            Back to Login
          </button>
        </form>
      )}

      <Layout user={null}>
      <footer className="auth-footer">
        <img src={logo} className="landing-logo" alt="logo" />
      </footer>
    
    </Layout>
    {/* <LandbotChat 
          configUrl="https://chats.landbot.io/v3/YOUR_BOT_ID/index.json" // Replace with your Landbot config URL
          embedType="livechat" // Or 'popup', 'fullpage'
          showOnlyForNewUsers={true}
        /> */}
    </div>
  );
};

export default AuthForm;