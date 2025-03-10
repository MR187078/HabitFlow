import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDtr99HCDorp910aky73EYvkwknvNl8nBM",
    authDomain: "habitflow-742c3.firebaseapp.com",
    projectId: "habitflow-742c3",
    storageBucket: "habitflow-742c3.firebasestorage.app",
    messagingSenderId: "785728730736",
    appId: "1:785728730736:web:12f4d0800d4fb2d3dc66b5",
    measurementId: "G-Y8EMBPY938"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);