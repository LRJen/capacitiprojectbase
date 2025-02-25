// firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwBgGhU6w080DW_XP_cIByvz7ctZA-hKY",
  authDomain: "my-app-6b118.firebaseapp.com",
  projectId: "my-app-6b118",
  storageBucket: "my-app-6b118.firebasestorage.app",
  messagingSenderId: "402071573813",
  appId: "1:402071573813:web:0abd6bc08753d8dc44e87c",
  measurementId: "G-CRQKK5JDH9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, analytics, storage }; // Export analytics if you plan to use it later