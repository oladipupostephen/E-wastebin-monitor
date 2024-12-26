import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig"; // Ensure this imports your Firebase config correctly
import { toast } from "react-hot-toast"; // Optional for user feedback
const db = getFirestore();
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (user) {
        console.log("User details:", user);
        const userName = user.displayName || "User"; // Use displayName if available, or a fallback
        const userData = userDoc.data();
        toast.success("Login successful");
        navigate("/dashboard", { state: { name: userData.fullName } });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container flex flex-col items-center h-screen justify-center relative overflow-hidden ">
        <div className="absolute top-[-70px] left-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute top-[-20px] left-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />
        <div className="absolute bottom-[-70px] right-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute bottom-[-20px] right-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />
        <div className="absolute bottom-[-70px] left-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />
        <div className="absolute top-[-70px] right-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />
        <h1 className="text-center text-2xl font-bold text-gray-800 mb-5 flex flex-col ">
          <h1 className="text-center"> Welcome to</h1>
          <h1 className="text-green-600 text-[48px]">GreenBin</h1>
        </h1>
        <p className="text-center text-lg text-[20px] text-gray-600 mb-4">
          Welcome Again <br /> Please Login
        </p>
        <div>
          <img src="./LoginImg.svg" alt="Logo 1" />
        </div>

        <div className="mx-4">
          {/* Email Field */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dhanaanjay33@gmail.com"
            className="w-full px-4 py-2 mb-4 text-lg border rounded-md text-black placeholder-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* Password Field */}
          <input
            type="password"
            name="password"
            placeholder="**********"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-lg border rounded-md text-black placeholder-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="text-lg font-bold text-white mt-2">
          <button
            className={`bg-green-500 py-4 px-10 rounded-lg w-full ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {/* Sign In Link */}
          <p className="text-left text-lg text-gray-600 mt-2">
            You do not have an account?{" "}
            <span
              className="text-green-600 font-medium hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
