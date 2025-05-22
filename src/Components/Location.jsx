/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useTheme } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet marker icons
import markerIconUrl from "leaflet/dist/images/marker-icon.png";

const Location = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme, colors } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const channelID = "2792309";
  const readAPIKey = "ZCUCI1MYCAWO8G9N";
  const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=100`;

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();

      const validLocation = getLastValidLocation(data.feeds);
      if (validLocation) {
        const address = await fetchAddress(
          validLocation.latitude,
          validLocation.longitude
        );
        setLocation({ ...validLocation, address });
        setError(null);
      } else {
        setError("No valid location data found.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch location data.");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchLocationData();
    const interval = setInterval(fetchLocationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: themeColors.background }}>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header Section */}
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
            Live Waste Bin Location Tracker
          </h1>
          <p className="text-lg" style={{ color: themeColors.text.primary }}>
            Real-time location tracking and analytics
          </p>
        </div>

        {/* Location Details Card */}
        {error ? (
          <div
            className="text-center mb-10 p-4 rounded-lg"
            style={{
              backgroundColor: themeColors.cardBg,
              color: themeColors.text.primary,
            }}>
            {error}
          </div>
        ) : (
          location && (
            <div
              className="w-full p-6 rounded-xl shadow-lg mb-10 transition-all duration-300 hover:shadow-xl"
              style={{
                backgroundColor: themeColors.cardBg,
                borderTop: `4px solid ${themeColors.text.accent}`,
                boxShadow: isDark
                  ? "0 10px 30px rgba(0, 0, 0, 0.4)"
                  : "0 10px 30px rgba(0, 0, 0, 0.1)",
              }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: themeColors.text.primary }}>
                Location Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p style={{ color: themeColors.text.secondary }}>
                  <span className="font-bold">Latitude:</span>{" "}
                  {location.latitude}
                </p>
                <p style={{ color: themeColors.text.secondary }}>
                  <span className="font-bold">Longitude:</span>{" "}
                  {location.longitude}
                </p>
                <p
                  className="sm:col-span-2"
                  style={{ color: themeColors.text.secondary }}>
                  <span className="font-bold">Address:</span> {location.address}
                </p>
                <p
                  className="col-span-2"
                  style={{ color: themeColors.text.secondary }}>
                  <span className="font-bold">Last Updated:</span>{" "}
                  {new Date(location.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )
        )}

        {/* Map Section */}
        <div className="w-full">
          {loading ? (
            <div
              className="flex justify-center items-center h-96 rounded-xl"
              style={{ backgroundColor: themeColors.cardBg }}>
              <div
                className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 mb-4"
                style={{ borderColor: themeColors.text.accent }}></div>
            </div>
          ) : location ? (
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={15}
              className="h-[500px] w-full rounded-xl shadow-lg"
              style={{ border: `1px solid ${themeColors.text.secondary}` }}>
              <TileLayer
                url={
                  isDark
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[location.latitude, location.longitude]}
                icon={L.icon({
                  iconUrl: markerIconUrl,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })}>
                <Popup>
                  <div
                    className="text-sm"
                    style={{
                      color: themeColors.text.primary,
                      backgroundColor: themeColors.cardBg,
                    }}>
                    <p>
                      Last updated:{" "}
                      {new Date(location.timestamp).toLocaleString()}
                    </p>
                    <p>{location.address}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div
              className="flex justify-center items-center h-96 rounded-xl"
              style={{ backgroundColor: themeColors.cardBg }}>
              <p style={{ color: themeColors.text.secondary }}>
                No location data available
              </p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-10">
          <button
            onClick={fetchLocationData}
            className="px-8 py-3 rounded-md font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            style={{
              backgroundColor: themeColors.text.accent,
              color: themeColors.text.primary,
            }}>
            Refresh Location Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Location;
