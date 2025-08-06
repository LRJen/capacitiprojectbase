import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const adminCodeHardcoded = 'Adm1@';

export const handleAuthSubmission = async (e, formData, isSignUp, isAdmin) => {
  const { email, password, username, adminCode } = formData;

  try {
    if (isSignUp) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const role = isAdmin && adminCode === adminCodeHardcoded ? 'admin' : 'user';
      await sendEmailVerification(user);

      const userData = {
        name: username,
        role,
        email,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      };

      await set(ref(db, `users/${user.uid}`), userData);
      await set(ref(db, `userDownloads/${user.uid}`), {});
      alert('Registered! Please verify your email.');
      await auth.signOut();
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await auth.signOut();
        alert('Verify your email before logging in.');
        return;
      }

      const snap = await get(ref(db, `users/${user.uid}`));
      const userData = snap.val();
      const role = userData?.role || 'user';
      window.location.href = role === 'admin' ? '/admin-dashboard' : '/dashboard';
    }
  } catch (err) {
    if (err.code === 'auth/account-exists-with-different-credential') {
      alert('This email is linked to a different sign-in method. Try signing in with Google.');
    } else {
      alert(err.message);
    }
    console.error('Auth error:', err.code, err.message);
  }
};

export const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const snap = await get(ref(db, `users/${user.uid}`));
    if (!snap.exists()) {
      await set(ref(db, `users/${user.uid}`), {
        name: user.displayName || 'No name',
        email: user.email,
        role: 'user',
        createdAt: new Date().toISOString(),
        emailVerified: user.emailVerified,
      });
      await set(ref(db, `userDownloads/${user.uid}`), {});
    }

    const userData = (await get(ref(db, `users/${user.uid}`))).val();
    const role = userData?.role || 'user';
    window.location.href = role === 'admin' ? '/admin-dashboard' : '/dashboard';
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      alert('Popup closed before completing sign in.');
    } else {
      alert(error.message);
    }
    console.error('Google Sign-In Error:', error.code, error.message);
  }
};
