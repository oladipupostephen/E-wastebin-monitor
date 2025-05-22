/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Sun, Moon, ArrowLeft } from "lucide-react";

export default function Weight() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme, colors } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const [weightData, setWeightData] = useState([]);
  const [currentWeight, setCurrentWeight] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6h");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchWeightData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.thingspeak.com/channels/2792309/feeds.json?results=200"
      );
      const data = await response.json();

      if (data.feeds && data.feeds.length > 0) {
        const now = new Date();
        const filteredData = data.feeds.filter((feed) => {
          const feedTime = new Date(feed.created_at);
          switch (timeRange) {
            case "1h":
              return now - feedTime <= 60 * 60 * 1000;
            case "6h":
              return now - feedTime <= 6 * 60 * 60 * 1000;
            case "24h":
              return now - feedTime <= 24 * 60 * 60 * 1000;
            case "7d":
              return now - feedTime <= 7 * 24 * 60 * 60 * 1000;
            default:
              return true;
          }
        });

        const graphData = filteredData
          .map((feed) => {
            const weight = parseFloat(feed.field6);
            if (isNaN(weight)) return null;

            return {
              time: new Date(feed.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              fullTime: new Date(feed.created_at).toLocaleString(),
              weight: weight,
              rawTime: new Date(feed.created_at),
            };
          })
          .filter((item) => item !== null)
          .sort((a, b) => a.rawTime - b.rawTime);

        setWeightData(graphData);
        setCurrentWeight(
          parseFloat(data.feeds[data.feeds.length - 1]?.field6) || null
        );

        if (data.feeds.length > 0) {
          setLastUpdated(data.feeds[data.feeds.length - 1].created_at);
        }

        setError(null);
      } else {
        setWeightData([]);
        setError("No data available from the sensor.");
      }
    } catch (err) {
      console.error("Error fetching weight data:", err);
      setError(
        "Failed to fetch weight data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightData();
    const interval = setInterval(fetchWeightData, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-md p-3 shadow-lg border"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: isDark ? "#374151" : "#D1D5DB",
            color: themeColors.text.primary,
          }}>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Time: {label}
          </p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              Weight: {entry.value} kg
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getWeightStatus = (weight) => {
    if (weight === null || weight === undefined)
      return { status: "Unknown", color: "#666666" };
    if (weight >= 15) return { status: "Heavy Load", color: "#EF4444" };
    if (weight >= 10) return { status: "Moderate Load", color: "#F59E0B" };
    if (weight >= 5) return { status: "Light Load", color: "#10B981" };
    return { status: "Very Light", color: "#06B6D4" };
  };

  const weightStatus = getWeightStatus(currentWeight);

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: themeColors.background }}>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header Section with Theme Toggle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: themeColors.cardBg,
                color: themeColors.text.primary,
                border: `1px solid ${themeColors.text.secondary}`,
              }}>
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDark
                  ? "bg-yellow-500 text-yellow-900 hover:bg-yellow-400"
                  : "bg-gray-800 text-yellow-400 hover:bg-gray-700"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: themeColors.text.accent }}>
            Weight Monitoring
          </h1>
          <p className="text-lg" style={{ color: themeColors.text.primary }}>
            Real-time weight tracking and analytics
          </p>

          {lastUpdated && (
            <p
              className="text-sm mt-2"
              style={{ color: themeColors.text.secondary }}>
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-md shadow-md transition-all duration-300"
            style={{
              backgroundColor: themeColors.cardBg,
              color: themeColors.text.primary,
              border: `1px solid ${isDark ? "#374151" : "#D1D5DB"}`,
            }}>
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        {loading ? (
          <div
            className="text-center py-20"
            style={{ color: themeColors.text.primary }}>
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4"
              style={{
                borderColor: themeColors.sensor?.weight || "#F59E0B",
              }}></div>
            <p className="text-lg">Loading weight data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div
              className="text-lg mb-4"
              style={{ color: themeColors.sensor?.weight || "#F59E0B" }}>
              {error}
            </div>
            <button
              onClick={fetchWeightData}
              className="px-6 py-3 rounded-md transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: themeColors.sensor?.weight || "#F59E0B",
                color: themeColors.text.primary,
              }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Current Weight Display */}
            <div className="flex justify-center mb-8">
              <div
                className="p-8 rounded-lg shadow-lg text-center transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: themeColors.cardBg,
                  borderLeft: `6px solid ${
                    themeColors.sensor?.weight || "#F59E0B"
                  }`,
                  boxShadow: isDark
                    ? `0 8px 25px rgba(0, 0, 0, 0.4), 0 0 8px ${
                        themeColors.sensor?.weight || "#F59E0B"
                      }30`
                    : `0 8px 25px rgba(0, 0, 0, 0.1), 0 0 8px ${
                        themeColors.sensor?.weight || "#F59E0B"
                      }20`,
                  minWidth: "300px",
                }}>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{ color: themeColors.text.primary }}>
                  Current Weight
                </h2>
                <div
                  className="text-5xl font-bold mb-4"
                  style={{ color: themeColors.sensor?.weight || "#F59E0B" }}>
                  {currentWeight !== null ? `${currentWeight} kg` : "--"}
                </div>
                <div
                  className="text-sm font-medium px-3 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: `${weightStatus.color}20`,
                    color: weightStatus.color,
                    border: `1px solid ${weightStatus.color}40`,
                  }}>
                  {weightStatus.status}
                </div>
              </div>
            </div>

            {/* Weight Chart */}
            {weightData.length > 0 ? (
              <div
                className="p-6 rounded-lg shadow-lg mb-8"
                style={{
                  backgroundColor: themeColors.cardBg,
                  boxShadow: isDark
                    ? "0 8px 25px rgba(0, 0, 0, 0.4)"
                    : "0 8px 25px rgba(0, 0, 0, 0.1)",
                }}>
                <h2
                  className="text-2xl font-semibold mb-6"
                  style={{ color: themeColors.text.primary }}>
                  Weight Trend Analysis
                </h2>

                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <defs>
                        <linearGradient
                          id="weightGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor={themeColors.sensor?.weight || "#F59E0B"}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={themeColors.sensor?.weight || "#F59E0B"}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={
                          themeColors.charts?.grid ||
                          (isDark ? "#333333" : "#E5E7EB")
                        }
                        vertical={false}
                      />
                      <XAxis
                        dataKey="time"
                        stroke={themeColors.text.secondary}
                        tick={{
                          fill: themeColors.text.secondary,
                          fontSize: 12,
                        }}
                        axisLine={{
                          stroke:
                            themeColors.charts?.grid ||
                            (isDark ? "#333333" : "#E5E7EB"),
                        }}
                      />
                      <YAxis
                        stroke={themeColors.text.secondary}
                        tick={{
                          fill: themeColors.text.secondary,
                          fontSize: 12,
                        }}
                        axisLine={{
                          stroke:
                            themeColors.charts?.grid ||
                            (isDark ? "#333333" : "#E5E7EB"),
                        }}
                        domain={["dataMin - 1", "dataMax + 1"]}
                        label={{
                          value: "Weight (kg)",
                          angle: -90,
                          position: "insideLeft",
                          style: {
                            textAnchor: "middle",
                            fill: themeColors.text.secondary,
                          },
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke={themeColors.sensor?.weight || "#F59E0B"}
                        strokeWidth={3}
                        fill="url(#weightGradient)"
                        dot={{
                          r: 4,
                          fill: themeColors.sensor?.weight || "#F59E0B",
                        }}
                        activeDot={{
                          r: 6,
                          fill: themeColors.sensor?.weight || "#F59E0B",
                          stroke: themeColors.cardBg,
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-md text-center"
                    style={{
                      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                      border: `1px solid ${isDark ? "#374151" : "#D1D5DB"}`,
                    }}>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "#06B6D4" }}>
                      {weightData.length > 0
                        ? Math.min(...weightData.map((d) => d.weight)).toFixed(
                            1
                          )
                        : "--"}
                      kg
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Minimum Weight
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-md text-center"
                    style={{
                      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                      border: `1px solid ${isDark ? "#374151" : "#D1D5DB"}`,
                    }}>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "#10B981" }}>
                      {weightData.length > 0
                        ? (
                            weightData.reduce((sum, d) => sum + d.weight, 0) /
                            weightData.length
                          ).toFixed(1)
                        : "--"}
                      kg
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Average Weight
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-md text-center"
                    style={{
                      backgroundColor: isDark ? "#1F2937" : "#F3F4F6",
                      border: `1px solid ${isDark ? "#374151" : "#D1D5DB"}`,
                    }}>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "#EF4444" }}>
                      {weightData.length > 0
                        ? Math.max(...weightData.map((d) => d.weight)).toFixed(
                            1
                          )
                        : "--"}
                      kg
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Maximum Weight
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col justify-center items-center py-20 rounded-lg"
                style={{
                  backgroundColor: themeColors.cardBg,
                  color: themeColors.text.secondary,
                  border: `1px solid ${isDark ? "#374151" : "#D1D5DB"}`,
                }}>
                <div className="w-24 h-24 mb-4 opacity-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M6 6h12l-1 6H7L6 6z" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                  </svg>
                </div>
                <p className="text-xl mb-2">No Weight Data Available</p>
                <p className="text-sm">
                  No data available for the selected time range. Try selecting a
                  different time period.
                </p>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={fetchWeightData}
                className="px-8 py-3 rounded-md font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: themeColors.sensor?.weight || "#F59E0B",
                  color: themeColors.text.primary,
                }}>
                Refresh Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
