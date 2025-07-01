import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

export const handleAuthSubmission = async (e, formData, isSignUp, isAdmin) => {
  const { email, password, username, adminCode } = formData;
  const adminCodeHardcoded = 'Adm1@';

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
    alert(err.message);
    console.error('Auth error:', err.code, err.message);
  }
};
