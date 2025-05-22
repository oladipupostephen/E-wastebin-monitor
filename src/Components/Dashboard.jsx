/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
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
} from "recharts";
import { Sun, Moon, LogOut } from "lucide-react";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.name || "User";
  const [currentData, setCurrentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [binLocation, setBinLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Use theme context instead of local state
  const { isDark, toggleTheme, colors } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const wasteBins = [
    { id: 1, name: "Bin A" },
    { id: 2, name: "Bin B" },
    { id: 3, name: "Bin C" },
  ];

  const [selectedBin, setSelectedBin] = useState(wasteBins[0]);

  // Sign out function
  const handleSignOut = () => {
    // Add any cleanup here if needed
    navigate("/login");
  };

  // Function to fetch and process location data
  const fetchLocationData = async () => {
    try {
      const response = await fetch(
        "https://api.thingspeak.com/channels/2792309/feeds.json?results=100"
      );
      const data = await response.json();

      const validLocation = getLastValidLocation(data.feeds);
      if (validLocation) {
        const address = await fetchAddress(
          validLocation.latitude,
          validLocation.longitude
        );
        setBinLocation({ ...validLocation, address });
        setLocationError(null);
      } else {
        setLocationError("No valid location data found.");
      }
    } catch (err) {
      console.error("Error fetching location data:", err);
      setLocationError("Failed to fetch location data.");
    }
  };

  const getLastValidLocation = (feeds) => {
    for (let i = feeds.length - 1; i >= 0; i--) {
      const feed = feeds[i];
      const latitude = parseFloat(feed.field4);
      const longitude = parseFloat(feed.field5);

      if (
        latitude &&
        longitude &&
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude !== 0 &&
        longitude !== 0
      ) {
        return {
          latitude,
          longitude,
          timestamp: feed.created_at,
        };
      }
    }
    return null;
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || "Address not found";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Failed to fetch address";
    }
  };

  // Function to find last valid value in feeds array
  const getLastValidValue = (feeds, fieldName) => {
    if (!feeds) return null;

    const fieldNumber =
      fieldName === "temperature"
        ? "field1"
        : fieldName === "humidity"
        ? "field2"
        : fieldName === "distance"
        ? "field3"
        : fieldName === "weight"
        ? "field6"
        : null;

    if (!fieldNumber) return null;

    for (let i = feeds.length - 1; i >= 0; i--) {
      const value = parseFloat(feeds[i][fieldNumber]);
      if (!isNaN(value)) return value;
    }
    return null;
  };

  // Fetch all current sensor data (except location)
  const fetchCurrentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.thingspeak.com/channels/2792309/feeds.json?results=100"
      );
      const data = await response.json();

      if (data.feeds) {
        const latestFeed = data.feeds[data.feeds.length - 1] || {};
        setCurrentData({
          temperature: getLastValidValue(data.feeds, "temperature"),
          humidity: getLastValidValue(data.feeds, "humidity"),
          distance: getLastValidValue(data.feeds, "distance"),
          weight: getLastValidValue(data.feeds, "weight"),
          timestamp: latestFeed.created_at || "No timestamp",
        });
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentData();
    fetchLocationData();
    const interval = setInterval(() => {
      fetchCurrentData();
      fetchLocationData();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const navigateToDetail = (parameter) => {
    navigate(`/${parameter}`, {
      state: { bin: selectedBin, parameter },
    });
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="border rounded-md p-2 text-sm shadow-lg"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: isDark ? "#374151" : "#D1D5DB",
            color: themeColors.text.primary,
          }}>
          <p
            style={{ color: themeColors.text.secondary }}>{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Mini chart component for dashboard
  const MiniChart = ({ dataKey, title, color, unit }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
      const fetchChartData = async () => {
        try {
          const response = await fetch(
            "https://api.thingspeak.com/channels/2792309/feeds.json?results=20"
          );
          const data = await response.json();

          if (data.feeds) {
            const validData = data.feeds
              .map((feed) => ({
                time: new Date(feed.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                value: parseFloat(
                  feed[
                    dataKey === "temperature"
                      ? "field1"
                      : dataKey === "humidity"
                      ? "field2"
                      : dataKey === "distance"
                      ? "field3"
                      : dataKey === "weight"
                      ? "field6"
                      : "field1"
                  ]
                ),
              }))
              .filter((item) => !isNaN(item.value));

            setChartData(validData);
          }
        } catch (err) {
          console.error(`Error fetching ${title} data:`, err);
        }
      };
      fetchChartData();
    }, [dataKey, title]);

    const currentValue = currentData[dataKey];
    const hasData =
      currentValue !== null &&
      currentValue !== undefined &&
      !isNaN(currentValue);

    return (
      <div
        className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
        style={{
          backgroundColor: themeColors.cardBg,
          borderLeft: `4px solid ${color}`,
          boxShadow: isDark
            ? `0 8px 25px rgba(0, 0, 0, 0.4), 0 0 8px ${color}30`
            : `0 8px 25px rgba(0, 0, 0, 0.1), 0 0 8px ${color}20`,
        }}
        onClick={() => navigateToDetail(title)}>
        <h3
          className="text-xl font-bold mb-3"
          style={{ color: themeColors.text.primary }}>
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold" style={{ color: color }}>
            {hasData ? `${currentValue} ${unit}` : "No data"}
          </div>
          <div className="w-32 h-20">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    dot={false}
                    strokeWidth={3}
                    activeDot={{
                      r: 6,
                      fill: color,
                      stroke: themeColors.cardBg,
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center h-full text-sm"
                style={{ color: themeColors.text.secondary }}>
                No trend
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Function to get combined chart data
  const getCombinedChartData = async () => {
    try {
      const response = await fetch(
        "https://api.thingspeak.com/channels/2792309/feeds.json?results=20"
      );
      const data = await response.json();

      if (!data.feeds) return [];

      return data.feeds
        .map((feed) => ({
          time: new Date(feed.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: parseFloat(feed.field1),
          humidity: parseFloat(feed.field2),
          distance: parseFloat(feed.field3),
          weight: parseFloat(feed.field6),
        }))
        .filter(
          (item) =>
            !isNaN(item.temperature) ||
            !isNaN(item.humidity) ||
            !isNaN(item.distance) ||
            !isNaN(item.weight)
        );
    } catch (err) {
      console.error("Error fetching combined chart data:", err);
      return [];
    }
  };

  const [combinedChartData, setCombinedChartData] = useState([]);

  useEffect(() => {
    const fetchCombinedData = async () => {
      const data = await getCombinedChartData();
      setCombinedChartData(data);
    };
    fetchCombinedData();
  }, []);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: themeColors.background }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1
              className="text-5xl font-bold mb-2"
              style={{ color: themeColors.text.accent }}>
              Welcome, {userName}!
            </h1>
            <p className="text-xl" style={{ color: themeColors.text.primary }}>
              Overview of all sensor data for{" "}
              {selectedBin?.name || "selected bin"}
            </p>
            {currentData.timestamp &&
              currentData.timestamp !== "No timestamp" && (
                <p
                  className="text-sm mt-2"
                  style={{ color: themeColors.text.secondary }}>
                  Last updated:{" "}
                  {new Date(currentData.timestamp).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
          </div>

          {/* Theme toggle and Sign out buttons */}
          <div className="flex gap-4">
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

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
              title="Sign Out">
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Bin Selection */}
        <div className="flex justify-center gap-4 mb-8">
          {wasteBins.map((bin) => (
            <button
              key={bin.id}
              className="px-6 py-3 rounded-lg shadow-md font-semibold transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor:
                  selectedBin?.id === bin.id
                    ? themeColors.text.accent
                    : isDark
                    ? "#374151"
                    : "#E5E7EB",
                color:
                  selectedBin?.id === bin.id
                    ? "#FFFFFF"
                    : themeColors.text.primary,
                border:
                  selectedBin?.id === bin.id
                    ? "none"
                    : `2px solid ${isDark ? "#4B5563" : "#D1D5DB"}`,
              }}
              onClick={() => setSelectedBin(bin)}>
              {bin.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            className="text-center py-20"
            style={{ color: themeColors.text.primary }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-400 mb-4"></div>
            <p className="text-xl">Loading data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            <p className="text-xl">{error}</p>
          </div>
        ) : (
          <>
            {/* Data Overview Grid - Fixed layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <MiniChart
                dataKey="temperature"
                title="Temperature"
                color={themeColors.sensor?.temperature || "#EF4444"}
                unit="°C"
              />
              <MiniChart
                dataKey="humidity"
                title="Humidity"
                color={themeColors.sensor?.humidity || "#06B6D4"}
                unit="%"
              />
              <MiniChart
                dataKey="distance"
                title="Waste Volume"
                color={themeColors.sensor?.distance || "#3B82F6"}
                unit="%"
              />
              <MiniChart
                dataKey="weight"
                title="Weight"
                color={themeColors.sensor?.weight || "#F59E0B"}
                unit="kg"
              />
            </div>

            {/* Location Details Card - Full width, separate row */}
            <div className="w-full mb-8">
              {locationError ? (
                <div className="text-center text-red-400 py-6 text-lg">
                  {locationError}
                </div>
              ) : binLocation ? (
                <div
                  className="w-full p-8 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
                  style={{
                    backgroundColor: themeColors.cardBg,
                    boxShadow: isDark
                      ? "0 10px 30px rgba(0, 0, 0, 0.4)"
                      : "0 10px 30px rgba(0, 0, 0, 0.1)",
                    borderTop: `4px solid ${themeColors.text.accent}`,
                  }}
                  onClick={() => navigateToDetail("Location")}>
                  <h2
                    className="text-3xl font-bold mb-6"
                    style={{ color: themeColors.text.primary }}>
                    📍 Location Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p style={{ color: themeColors.text.secondary }}>
                        <span
                          className="font-bold text-lg"
                          style={{ color: themeColors.text.primary }}>
                          Latitude:
                        </span>{" "}
                        {binLocation.latitude}
                      </p>
                      <p style={{ color: themeColors.text.secondary }}>
                        <span
                          className="font-bold text-lg"
                          style={{ color: themeColors.text.primary }}>
                          Longitude:
                        </span>{" "}
                        {binLocation.longitude}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p style={{ color: themeColors.text.secondary }}>
                        <span
                          className="font-bold text-lg"
                          style={{ color: themeColors.text.primary }}>
                          Last Updated:
                        </span>{" "}
                        {new Date(binLocation.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p style={{ color: themeColors.text.secondary }}>
                        <span
                          className="font-bold text-lg"
                          style={{ color: themeColors.text.primary }}>
                          Address:
                        </span>{" "}
                        {binLocation.address}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="text-center py-6 text-lg"
                  style={{ color: themeColors.text.secondary }}>
                  Loading location data...
                </div>
              )}
            </div>

            {/* Combined Chart */}
            <div
              className="w-full p-8 rounded-xl shadow-lg mb-8"
              style={{
                backgroundColor: themeColors.cardBg,
                boxShadow: isDark
                  ? "0 10px 30px rgba(0, 0, 0, 0.4)"
                  : "0 10px 30px rgba(0, 0, 0, 0.1)",
              }}>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: themeColors.text.primary }}>
                📊 Recent Waste Bin data
              </h2>
              <div className="h-80">
                {combinedChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedChartData}>
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
                        tick={{ fill: themeColors.text.secondary }}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke={themeColors.text.secondary}
                        tick={{ fill: themeColors.text.secondary }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke={themeColors.text.secondary}
                        tick={{ fill: themeColors.text.secondary }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="temperature"
                        stroke={themeColors.sensor?.temperature || "#EF4444"}
                        name="Temperature(°C)"
                        dot={false}
                        strokeWidth={3}
                        activeDot={{
                          r: 6,
                          fill: themeColors.sensor?.temperature || "#EF4444",
                          stroke: themeColors.cardBg,
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="humidity"
                        stroke={themeColors.sensor?.humidity || "#06B6D4"}
                        name="Humidity(%)"
                        dot={false}
                        strokeWidth={3}
                        activeDot={{
                          r: 6,
                          fill: themeColors.sensor?.humidity || "#06B6D4",
                          stroke: themeColors.cardBg,
                        }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="distance"
                        stroke={themeColors.sensor?.distance || "#3B82F6"}
                        name="Waste Volume(%)"
                        dot={false}
                        strokeWidth={3}
                        activeDot={{
                          r: 6,
                          fill: themeColors.sensor?.distance || "#3B82F6",
                          stroke: themeColors.cardBg,
                        }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="weight"
                        stroke={themeColors.sensor?.weight || "#F59E0B"}
                        name="Weight(kg)"
                        dot={false}
                        strokeWidth={3}
                        activeDot={{
                          r: 6,
                          fill: themeColors.sensor?.weight || "#F59E0B",
                          stroke: themeColors.cardBg,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="flex items-center justify-center h-full text-lg"
                    style={{ color: themeColors.text.secondary }}>
                    No combined trend data available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
