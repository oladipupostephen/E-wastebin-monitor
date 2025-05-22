/* eslint-disable no-unused-vars */
//* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Weight() {
  const [weightData, setWeightData] = useState([]);
  const [currentWeight, setCurrentWeight] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("6h"); // Default time range

  const fetchWeightData = async () => {
    try {
      const response = await fetch(
        "https://api.thingspeak.com/channels/2792309/feeds.json"
      );
      const data = await response.json();

      if (data.feeds) {
        const now = new Date();
        const filteredData = data.feeds.filter((feed) => {
          const feedTime = new Date(feed.created_at);
          switch (timeRange) {
            case "1h":
              return now - feedTime <= 60 * 60 * 1000; // Last 1 hour
            case "6h":
              return now - feedTime <= 6 * 60 * 60 * 1000; // Last 6 hours
            case "24h":
              return now - feedTime <= 24 * 60 * 60 * 1000; // Last 24 hours
            case "7d":
              return now - feedTime <= 7 * 24 * 60 * 60 * 1000; // Last 7 days
            default:
              return true;
          }
        });

        const graphData = filteredData.map((feed) => ({
          time: new Date(feed.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          weight: parseFloat(feed.field6), // Weight data from field6
        }));

        setWeightData(graphData);
        setCurrentWeight(
          parseFloat(data.feeds[data.feeds.length - 1]?.field6) || null
        ); // Set the latest weight
      } else {
        setWeightData([]);
      }
    } catch (err) {
      setError("Failed to fetch weight data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchWeightData(); // Initial fetch

    const interval = setInterval(fetchWeightData, 60000); // Refetch every 60 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [timeRange]); // Refetch whenever the time range changes

  const isDataEmpty = weightData.length === 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Weight Dashboard
      </h1>

      {/* Time Range Selector */}
      <div className="flex justify-center mb-4">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-md">
          <option value="1h">Last 1 Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      {/* Digital Display for Current Weight */}
      <div className="flex justify-center items-center mb-6">
        <div className="p-4 bg-purple-100 text-purple-700 rounded-lg shadow-md w-64 text-center">
          <h2 className="text-lg font-semibold">Current Weight</h2>
          <p className="text-4xl font-bold mt-2">
            {currentWeight !== null ? `${currentWeight} kg` : "--"}
          </p>
        </div>
      </div>

      {/* Line Chart or Fallback UI */}
      {error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : isDataEmpty ? (
        <div className="flex flex-col justify-center items-center h-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="none"
            className="w-32 h-32">
            <path
              fill="#E5E7EB"
              d="M256 0C114.62 0 0 114.62 0 256s114.62 256 256 256 256-114.62 256-256S397.38 0 256 0zm0 472c-119.1 0-216-96.9-216-216S136.9 40 256 40s216 96.9 216 216-96.9 216-216 216z"
            />
            <path
              fill="#9CA3AF"
              d="M370.1 141.9c-12.5-12.5-32.76-12.5-45.25 0L256 210.7l-68.85-68.8c-12.5-12.5-32.76-12.5-45.25 0s-12.5 32.76 0 45.25L210.7 256l-68.8 68.85c-12.5 12.5-12.5 32.76 0 45.25s32.76 12.5 45.25 0L256 301.3l68.85 68.8c12.5 12.5 32.76 12.5 45.25 0s12.5-32.76 0-45.25L301.3 256l68.8-68.85c12.5-12.5 12.5-32.76 0-45.25z"
            />
          </svg>
          <p className="text-gray-600 text-lg">
            No data available for the selected time range.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              label={{
                value: "Time",
                position: "insideBottomRight",
                offset: -5,
                dx: -20,
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={["dataMin - 1", "dataMax + 1"]} // Dynamic Y-axis
              label={{
                value: "Weight (kg)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip formatter={(value) => `${value} kg`} />
            <Line type="monotone" dataKey="weight" stroke="#8B5CF6" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
