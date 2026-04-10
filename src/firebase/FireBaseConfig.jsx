// src/firebase/FireBaseConfig.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ REPLACE THESE WITH YOUR ACTUAL FIREBASE CONFIG VALUES
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAN7ceEduNlj7-u7bLoyNsWxlSkYW_UGoc",
  authDomain: "campus-freelance-hub.firebaseapp.com",
  projectId: "campus-freelance-hub",
  storageBucket:"campus-freelance-hub.appspot.com",
  messagingSenderId: "347395065516",
  appId: "1:347395065516:web:4675c895140183ca824109",
  measurementId: "G-308FFEPXNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;