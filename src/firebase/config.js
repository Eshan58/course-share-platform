import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use hardcoded values to test (replace with your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyD2lf5Eu6Wft1peRnGabaGYHKydNyX8sy4",
  authDomain: "client-share-platform-auth.firebaseapp.com",
  projectId: "client-share-platform-auth",
  storageBucket: "client-share-platform-auth.firebasestorage.app",
  messagingSenderId: "479625917781",
  appId: "1:479625917781:web:bcbf911d2b52571a26ebdc",
  // apiKey: "AIzaSyAqzfoAvQeA9p0qqyJvOihYGxODQky_vB8",
  // authDomain: "course-share-platform.firebaseapp.com",
  // projectId: "course-share-platform",
  // storageBucket: "course-share-platform.firebasestorage.app",
  // messagingSenderId: "1082710178100",
  // appId: "1:1082710178100:web:daab092fda8b8a7d244d61",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Optional: Add custom parameters to Google Auth
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
