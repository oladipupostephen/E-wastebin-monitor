// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDixzp4IOIrZlFwC3c-SHs9VxFwlDx1VKQ",
  authDomain: "e-wastebin.firebaseapp.com",
  projectId: "e-wastebin",
  storageBucket: "e-wastebin.firebasestorage.app",
  messagingSenderId: "911854985989",
  appId: "1:911854985989:web:db6aba706866bddf6d8d6c",
  measurementId: "G-TWPMF8XRLZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
