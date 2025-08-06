// firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDefXftbk3Ib3MK0Ohq6CgTAtPKfHyF4M",
  authDomain: "digital-resource-system.firebaseapp.com",
  projectId: "digital-resource-system",
  storageBucket: "digital-resource-system.firebasestorage.app",
  messagingSenderId: "937020358229",
  appId: "1:937020358229:web:7f5466bddccea8a9449edc",
  measurementId: "G-PR1QZHR7E8",
  databaseURL: "https://digital-resource-system-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, analytics, storage }; // Export analytics if you plan to use it later