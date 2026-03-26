import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDCalwKGP6F6SEP7lvg1jmMazgNx6VVGM",
  authDomain: "glitched-technitude.firebaseapp.com",
  projectId: "glitched-technitude",
  storageBucket: "glitched-technitude.firebasestorage.app",
  messagingSenderId: "232957702727",
  appId: "1:232957702727:web:51e84ba55502593e73b762",
  measurementId: "G-M4N60Y6633"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
