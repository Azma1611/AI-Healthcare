import { initializeApp } from "firebase/app";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

/*
========================================
PASTE YOUR FIREBASE CONFIG BELOW
========================================
Go to:
Firebase Console
→ Project Settings ⚙️
→ General
→ Your apps
→ SDK setup and configuration
→ Config
========================================
*/

const firebaseConfig = {
  apiKey: "AIzaSyDXQcwW1SJTA5QvVcgJorczMLtIf5Dh90w",
  authDomain: "asu-yaso-dashboard.firebaseapp.com",
  projectId: "asu-yaso-dashboard",
  storageBucket: "asu-yaso-dashboard.firebasestorage.app",
  messagingSenderId: "177506245622",
  appId: "1:177506245622:web:632d490a42c305f05885d7",
  measurementId: "G-0M47XQ5J43"
};

/*
========================================
INITIALIZE FIREBASE
========================================
*/

const app = initializeApp(firebaseConfig);

/*
========================================
AUTHENTICATION
========================================
*/

const auth = getAuth(app);

/*
========================================
FIRESTORE DATABASE
========================================
*/

const db = getFirestore(app);

/*
========================================
EXPORT EVERYTHING
========================================
*/

export {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
};

/*
========================================
ENABLE FIREBASE
========================================
*/

export const firebaseEnabled = true;