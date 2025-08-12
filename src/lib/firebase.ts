// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-UysT7J3MHICjG_gt2GZEcgYrVAxRs8A",
  authDomain: "adfleek.firebaseapp.com",
  projectId: "adfleek",
  storageBucket: "adfleek.appspot.com",
  messagingSenderId: "334866138024",
  appId: "1:334866138024:web:8ff8316658a23059bb939d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
