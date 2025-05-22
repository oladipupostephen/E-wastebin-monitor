/* eslint-disable no-unused-vars */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAD6B3PDLCBfdiWw61v5C-u3UKhwoOVLT0",
  authDomain: "wastebin-10e26.firebaseapp.com",
  projectId: "wastebin-10e26",
  storageBucket: "wastebin-10e26.firebasestorage.app",
  messagingSenderId: "1045150315",
  appId: "1:1045150315:web:7601f24a283c3910afcf2e",
  measurementId: "G-B9HG30728E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
