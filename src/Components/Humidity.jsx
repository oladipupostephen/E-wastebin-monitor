/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext"; // Import theme context
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
import { Sun, Moon } from "lucide-react"; // Import theme toggle icons

export default function Humidity() {
  const location = useLocation();
  const navigate = useNavigate();
  const [humidityData, setHumidityData] = useState([]);
  const [currentHumidity, setCurrentHumidity] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6h");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Use theme context instead of hardcoded colors
  const { isDark, toggleTheme, colors } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const fetchHumidityData = async () => {
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
            const humidity = parseFloat(feed.field2);
            if (isNaN(humidity)) return null;

            return {
              time: new Date(feed.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              fullTime: new Date(feed.created_at).toLocaleString(),
              humidity: humidity,
              rawTime: new Date(feed.created_at),
            };
          })
          .filter((item) => item !== null)
          .sort((a, b) => a.rawTime - b.rawTime);

        setHumidityData(graphData);

        // Get the most recent valid humidity reading
        const latestValidHumidity = getLastValidValue(data.feeds, "humidity");
        setCurrentHumidity(latestValidHumidity);

        if (data.feeds.length > 0) {
          setLastUpdated(data.feeds[data.feeds.length - 1].created_at);
        }

        setError(null);
      } else {
        setHumidityData([]);
        setError("No data available from the sensor.");
      }
    } catch (err) {
      console.error("Error fetching humidity data:", err);
      setError(
        "Failed to fetch humidity data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to find last valid value similar to Dashboard
  const getLastValidValue = (feeds, fieldName) => {
    if (!feeds) return null;

    const fieldNumber = fieldName === "humidity" ? "field2" : null;
    if (!fieldNumber) return null;

    for (let i = feeds.length - 1; i >= 0; i--) {
      const value = parseFloat(feeds[i][fieldNumber]);
      if (!isNaN(value)) return value;
    }
    return null;
  };

  useEffect(() => {
    fetchHumidityData();
    const interval = setInterval(fetchHumidityData, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Custom tooltip using theme colors
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
              Humidity: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Humidity status indicator
  const getHumidityStatus = (humidity) => {
    if (humidity === null || humidity === undefined)
      return { status: "Unknown", color: "#666666" };
    if (humidity >= 80)
      return { status: "Very High - Excessive", color: "#EF4444" };
    if (humidity >= 60) return { status: "High - Humid", color: "#F59E0B" };
    if (humidity >= 40)
      return { status: "Moderate - Comfortable", color: "#10B981" };
    if (humidity >= 20) return { status: "Low - Dry", color: "#06B6D4" };
    return { status: "Very Low - Arid", color: "#8B5CF6" };
  };

  const humidityStatus = getHumidityStatus(currentHumidity);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: themeColors.background }}>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header Section with Theme Toggle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300">
              ← Back to Dashboard
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
            Humidity Monitoring
          </h1>
          <p className="text-lg" style={{ color: themeColors.text.primary }}>
            Real-time environmental humidity tracking and analytics
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
                borderColor: themeColors.sensor?.humidity || "#60A5FA",
              }}></div>
            <p className="text-lg">Loading humidity data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-400 text-lg mb-4">{error}</div>
            <button
              onClick={fetchHumidityData}
              className="px-6 py-3 rounded-md transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: themeColors.sensor?.humidity || "#60A5FA",
                color: themeColors.text.primary,
              }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Current Humidity Display */}
            <div className="flex justify-center mb-8">
              <div
                className="p-8 rounded-lg shadow-lg text-center transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: themeColors.cardBg,
                  borderLeft: `6px solid ${
                    themeColors.sensor?.humidity || "#60A5FA"
                  }`,
                  boxShadow: isDark
                    ? `0 8px 25px rgba(0, 0, 0, 0.4), 0 0 8px ${
                        themeColors.sensor?.humidity || "#60A5FA"
                      }30`
                    : `0 8px 25px rgba(0, 0, 0, 0.1), 0 0 8px ${
                        themeColors.sensor?.humidity || "#60A5FA"
                      }20`,
                  minWidth: "300px",
                }}>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{ color: themeColors.text.primary }}>
                  Current Humidity
                </h2>
                <div
                  className="text-5xl font-bold mb-4"
                  style={{ color: themeColors.sensor?.humidity || "#60A5FA" }}>
                  {currentHumidity !== null ? `${currentHumidity}%` : "--"}
                </div>
                <div
                  className="text-sm font-medium px-3 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: `${humidityStatus.color}20`,
                    color: humidityStatus.color,
                    border: `1px solid ${humidityStatus.color}40`,
                  }}>
                  {humidityStatus.status}
                </div>
              </div>
            </div>

            {/* Humidity Chart */}
            {humidityData.length > 0 ? (
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
                  Humidity Trend Analysis
                </h2>

                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={humidityData}>
                      <defs>
                        <linearGradient
                          id="humidityGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor={
                              themeColors.sensor?.humidity || "#60A5FA"
                            }
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={
                              themeColors.sensor?.humidity || "#60A5FA"
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
                        domain={[0, 100]}
                        label={{
                          value: "Humidity (%)",
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
                        dataKey="humidity"
                        stroke={themeColors.sensor?.humidity || "#60A5FA"}
                        strokeWidth={3}
                        fill="url(#humidityGradient)"
                        dot={{
                          r: 4,
                          fill: themeColors.sensor?.humidity || "#60A5FA",
                        }}
                        activeDot={{
                          r: 6,
                          fill: themeColors.sensor?.humidity || "#60A5FA",
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
                      style={{ color: "#10B981" }}>
                      {humidityData.length > 0
                        ? Math.min(
                            ...humidityData.map((d) => d.humidity)
                          ).toFixed(1)
                        : "--"}
                      %
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Minimum Humidity
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
                      style={{ color: "#F59E0B" }}>
                      {humidityData.length > 0
                        ? (
                            humidityData.reduce(
                              (sum, d) => sum + d.humidity,
                              0
                            ) / humidityData.length
                          ).toFixed(1)
                        : "--"}
                      %
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Average Humidity
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
                      {humidityData.length > 0
                        ? Math.max(
                            ...humidityData.map((d) => d.humidity)
                          ).toFixed(1)
                        : "--"}
                      %
                    </div>
                    <div style={{ color: themeColors.text.secondary }}>
                      Maximum Humidity
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
                    <path d="M12 2v6l3-3-3-3z" />
                    <path d="M12 8v6l3-3-3-3z" />
                    <path d="M12 14v6l3-3-3-3z" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <p className="text-xl mb-2">No Humidity Data Available</p>
                <p className="text-sm">
                  No data available for the selected time range. Try selecting a
                  different time period.
                </p>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={fetchHumidityData}
                className="px-8 py-3 rounded-md font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: themeColors.sensor?.humidity || "#60A5FA",
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
