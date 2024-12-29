import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.name || "User";

  // Sample waste bins (replace with dynamic data)
  const wasteBins = [
    { id: 1, name: "Bin A" },
    { id: 2, name: "Bin B" },
    { id: 3, name: "Bin C" },
  ];

  // State for selected waste bin and data parameter
  const [selectedBin, setSelectedBin] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState("");

  const handleFetchData = () => {
    if (!selectedBin || !selectedParameter) {
      alert("Please select a waste bin and a parameter.");
      return;
    }

    if (selectedBin && selectedParameter) {
      navigate(`/${selectedParameter}`, {
        state: { bin: selectedBin, parameter: selectedParameter },
      });
    } else {
      alert("Please select a bin and a parameter.");
    }
  };

  return (
    <div className="container  p-10 flex flex-col h-auto justify-center items-center  break-words whitespace-normal">
      {/* Welcome Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-green-600">
          Welcome, {userName}!
        </h1>
        <p className="text-lg mt-4 text-gray-700">
          Select a waste bin and parameter to monitor its data.
        </p>
      </div>

      {/* Waste Bin Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {wasteBins.map((bin) => (
          <div
            key={bin.id}
            className={`p-6 border rounded-lg shadow-md cursor-pointer ${
              selectedBin?.id === bin.id
                ? "border-green-500 bg-green-100"
                : "border-gray-300"
            }`}
            onClick={() => setSelectedBin(bin)}
          >
            <h3 className="text-xl font-semibold text-gray-800">{bin.name}</h3>
          </div>
        ))}
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Select Data Parameter
        </h2>
        <div className="flex justify-center flex-wrap gap-4 break-words whitespace-normal">
          {["Temperature", "Distance", "Location", "Weight"].map(
            (parameter) => (
              <button
                key={parameter}
                className={`px-6 py-3 rounded-md text-white font-medium ${
                  selectedParameter === parameter
                    ? "bg-green-600"
                    : "bg-gray-500 hover:bg-green-600"
                }`}
                onClick={() => setSelectedParameter(parameter)}
              >
                {parameter}
              </button>
            )
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleFetchData}
          className="px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-green-700"
        >
          Fetch Data
        </button>
      </div>
    </div>
  );
}
