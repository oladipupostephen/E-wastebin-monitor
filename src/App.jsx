import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Homepage from "./Components/Homepage";
import RegistrationForm from "./Components/RegistrationForm";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Distance from "./Components/Distance";
import Weight from "./Components/Weight";
import Location from "./Components/Location";
import Temperature from "./Components/Temperature";
import "./App.css";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Distance" element={<Distance />} />
          <Route path="/Weight" element={<Weight />} />
          <Route path="/Location" element={<Location />} />
          <Route path="/Temperature" element={<Temperature />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
