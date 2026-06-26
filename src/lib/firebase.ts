import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config parsed from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBy_O7HUKve_gidBKrMIeo3uWS0tHaotAo",
  authDomain: "bubbly-ward-l18qq.firebaseapp.com",
  projectId: "bubbly-ward-l18qq",
  storageBucket: "bubbly-ward-l18qq.firebasestorage.app",
  messagingSenderId: "307588942286",
  appId: "1:307588942286:web:a2a2c724de8deed284039f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
