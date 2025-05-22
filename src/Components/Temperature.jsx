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

export default function TemperatureGraph() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme, colors } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const [temperatureData, setTemperatureData] = useState([]);
  const [currentTemperature, setCurrentTemperature] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6h");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTemperatureData = async () => {
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
            const temp = parseFloat(feed.field1);
            if (isNaN(temp)) return null;

            return {
              time: new Date(feed.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              fullTime: new Date(feed.created_at).toLocaleString(),
              temperature: temp,
              rawTime: new Date(feed.created_at),
            };
          })
          .filter((item) => item !== null)
          .sort((a, b) => a.rawTime - b.rawTime);

        setTemperatureData(graphData);
        setCurrentTemperature(
          parseFloat(data.feeds[data.feeds.length - 1]?.field1) || null
        );

        if (data.feeds.length > 0) {
          setLastUpdated(data.feeds[data.feeds.length - 1].created_at);
        }

        setError(null);
      } else {
        setTemperatureData([]);
        setError("No data available from the sensor.");
      }
    } catch (err) {
      console.error("Error fetching temperature data:", err);
      setError(
        "Failed to fetch temperature data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemperatureData();
    const interval = setInterval(fetchTemperatureData, 60000);
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
              Temperature: {entry.value}°C
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTemperatureStatus = (temp) => {
    if (temp === null || temp === undefined)
      return { status: "Unknown", color: "#666666" };
    if (temp >= 40) return { status: "Critical - Very Hot", color: "#EF4444" };
    if (temp >= 30) return { status: "High - Hot", color: "#F59E0B" };
    if (temp >= 20) return { status: "Moderate - Warm", color: "#10B981" };
    return { status: "Low - Cool", color: "#06B6D4" };
  };

  const temperatureStatus = getTemperatureStatus(currentTemperature);

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
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300">
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
            Temperature Monitoring
          </h1>
          <p className="text-lg" style={{ color: themeColors.text.primary }}>
            Real-time temperature tracking and analytics
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
                borderColor: themeColors.sensor?.temperature || "#EF4444",
              }}></div>
            <p className="text-lg">Loading temperature data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div
              className="text-lg mb-4"
              style={{ color: themeColors.sensor?.temperature || "#EF4444" }}>
              {error}
            </div>
            <button
              onClick={fetchTemperatureData}
              className="px-6 py-3 rounded-md transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: themeColors.sensor?.temperature || "#EF4444",
                color: themeColors.text.primary,
              }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Current Temperature Display */}
            <div className="flex justify-center mb-8">
              <div
                className="p-8 rounded-lg shadow-lg text-center transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: themeColors.cardBg,
                  borderLeft: `6px solid ${
                    themeColors.sensor?.temperature || "#EF4444"
                  }`,
                  boxShadow: isDark
                    ? `0 8px 25px rgba(0, 0, 0, 0.4), 0 0 8px ${
                        themeColors.sensor?.temperature || "#EF4444"
                      }30`
                    : `0 8px 25px rgba(0, 0, 0, 0.1), 0 0 8px ${
                        themeColors.sensor?.temperature || "#EF4444"
                      }20`,
                  minWidth: "300px",
                }}>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{ color: themeColors.text.primary }}>
                  Current Temperature
                </h2>
                <div
                  className="text-5xl font-bold mb-4"
                  style={{
                    color: themeColors.sensor?.temperature || "#EF4444",
                  }}>
                  {currentTemperature !== null
                    ? `${currentTemperature}°C`
                    : "--"}
                </div>
                <div
                  className="text-sm font-medium px-3 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: `${temperatureStatus.color}20`,
                    color: temperatureStatus.color,
                    border: `1px solid ${temperatureStatus.color}40`,
                  }}>
                  {temperatureStatus.status}
                </div>
              </div>
            </div>

            {/* Temperature Chart */}
            {temperatureData.length > 0 ? (
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
                  Temperature Trend Analysis
                </h2>

                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={temperatureData}>
                      <defs>
                        <linearGradient
                          id="tempGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor={
                              themeColors.sensor?.temperature || "#EF4444"
                            }
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              themeColors.sensor?.temperature || "#EF4444"
                            }
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
                        domain={["dataMin - 5", "dataMax + 5"]}
                        label={{
                          value: "Temperature (°C)",
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
                        dataKey="temperature"
                        stroke={themeColors.sensor?.temperature || "#EF4444"}
                        strokeWidth={3}
                        fill="url(#tempGradient)"
                        dot={{
                          r: 4,
                          fill: themeColors.sensor?.temperature || "#EF4444",
                        }}
                        activeDot={{
                          r: 6,
                          fill: themeColors.sensor?.temperature || "#EF4444",
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
                      {temperatureData.length > 0
                        ? Math.min(
                            ...temperatureData.map((d) => d.temperature)
                          ).toFixed(1)
                        : "--"}
                      °C
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Minimum Temperature
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
                      {temperatureData.length > 0
                        ? (
                            temperatureData.reduce(
                              (sum, d) => sum + d.temperature,
                              0
                            ) / temperatureData.length
                          ).toFixed(1)
                        : "--"}
                      °C
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Average Temperature
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
                      {temperatureData.length > 0
                        ? Math.max(
                            ...temperatureData.map((d) => d.temperature)
                          ).toFixed(1)
                        : "--"}
                      °C
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Maximum Temperature
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
                    <path d="M13 16a3 3 0 1 1 0 6H7a5 5 0 1 1 4.9-6zM12 3v3" />
                    <path d="M12 6v2" />
                    <path d="M12 12v2" />
                    <path d="M12 18v2" />
                  </svg>
                </div>
                <p className="text-xl mb-2">No Temperature Data Available</p>
                <p className="text-sm">
                  No data available for the selected time range. Try selecting a
                  different time period.
                </p>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={fetchTemperatureData}
                className="px-8 py-3 rounded-md font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: themeColors.sensor?.temperature || "#EF4444",
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
