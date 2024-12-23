import React from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
export default function Homepage() {
  const navigate = useNavigate();
  return (
    <>
      <div className="container flex flex-col items-center h-screen justify-center relative overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-green-300 rounded-full opacity-50" />
        <div className="text-3xl font-bold text-[48px]">
          <h1 className="text-[48px]">GreenBin</h1>
        </div>
        <div>
          <img src="./StartImg.svg" alt="Logo 1" />
        </div>
        <div className="text-2xl font-semibold text-gray-600 ">
          <h2>Manage your waste effectively!</h2>
        </div>
        <div className="text-lg font-bold text-white mt-6">
          <button
            className="bg-green-500 py-4 px-10 rounded-lg "
            onClick={() => navigate("/register")}
          >
            Getting Started
          </button>
        </div>
      </div>
    </>
  );
}
