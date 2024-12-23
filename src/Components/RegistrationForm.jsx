import React, { useState } from "react";
import { auth } from "../firebaseConfig"; // Import your Firebase config
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const db = getFirestore(); // Initialize Firestore

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    console.log(auth);
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullName, email, password, confirmPassword, phoneNumber } =
      formData;

    // Validate the form
    if (!fullName || !email || !password || !confirmPassword || !phoneNumber) {
      toast.error("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      // Register the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save additional user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        phoneNumber,
        createdAt: new Date().toISOString(),
      });

      toast.success("Registration successful! You can now sign in.");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
      });
      setTimeout(() => {
        navigate("/login"); // Replace "/signin" with your actual sign-in route
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4 relative overflow-hidden">
        <div className="absolute top-[-70px] left-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute top-[-20px] left-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />
        <div className="absolute bottom-[-70px] right-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute bottom-[-20px] right-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />
        <div className="absolute bottom-[-70px] left-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />
        <div className="absolute top-[-70px] right-[-70px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-green-300 rounded-full opacity-100" />

        <div className="max-w-sm md:max-w-lg w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-2xl font-bold text-gray-800 mb-5 flex flex-col ">
            <h1 className="text-center"> Welcome to</h1>
            <h1 className="text-green-600 text-[48px]">GreenBin</h1>
          </div>
          <p className="text-center text-lg text-gray-600 mb-4">
            How you manage your waste? If not, then start from now.
          </p>
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 mb-4 text-lg border rounded-md text-black placeholder-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Email Field */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 mb-4 text-lg border rounded-md text-black placeholder-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Password Field */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="**********"
              className="w-full px-4 py-2 mb-4 text-lg border rounded-md text-black placeholder-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Confirm Password Field */}
            <input
              placeholder="**********"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 mb-4 text-lg border rounded-md text-black placeholder-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Address Field */}
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 mb-4 text-lg border rounded-md text-black placeholder-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-center mb-4 justify-center">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 text-lg text-gray-600 text-center"
              >
                I accept the terms & conditions
              </label>
            </div>

            {/* Register Button */}
            <button
              className="w-full  bg-green-600 text-white text-lg font-medium  hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 py-3 px-10 rounded-lg "
              type="submit"
            >
              Register
            </button>
          </form>
          {/* Sign In Link */}
          <p className="text-center text-lg text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              className="text-green-600 font-medium hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
