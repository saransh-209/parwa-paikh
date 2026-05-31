import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApUGM0oIqZjoLbTIt5_Jg18q2LyB0oRTk",
  authDomain: "parwa-paikh.firebaseapp.com",
  projectId: "parwa-paikh",
  storageBucket: "parwa-paikh.firebasestorage.app",
  messagingSenderId: "993761963808",
  appId: "1:993761963808:web:aa1032d745839e41c23145",
  measurementId: "G-P05PXF2G9L"
};

const app          = initializeApp(firebaseConfig);
export const auth  = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
