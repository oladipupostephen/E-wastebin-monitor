/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet marker icons
import markerIconUrl from "leaflet/dist/images/marker-icon.png"; // Path to the default marker icon

const Location = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const channelID = "2792309"; // Replace with your actual Channel ID
  const readAPIKey = "ZCUCI1MYCAWO8G9N"; // Replace with your actual Read API Key
  const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=100`;

  const fetchLocationData = async () => {
    try {
      const response = await fetch(url);
      const data = await response.json();

      const validLocation = getLastValidLocation(data.feeds);
      if (validLocation) {
        const address = await fetchAddress(
          validLocation.latitude,
          validLocation.longitude
        );
        setLocation({ ...validLocation, address });
      } else {
        setError("No valid location data found.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch location data.");
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
    const interval = setInterval(fetchLocationData, 30000); // Refetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container p-10 flex flex-col items-center bg-gradient-to-b from-green-50 to-green-100 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-green-600">
          Live Waste Bin Location Tracker
        </h1>
        <p className="text-lg mt-4 text-gray-700">
          Stay updated with the most accurate location of the waste bin.
        </p>
      </div>

      {/* Location Details */}
      {error ? (
        <div className="text-center mb-10 text-red-500">{error}</div>
      ) : (
        location && (
          <div className="w-full max-w-3xl bg-white p-6 border border-gray-200 rounded-lg shadow-md mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Location Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p className="text-gray-600">
                <span className="font-bold">Latitude:</span> {location.latitude}
              </p>
              <p className="text-gray-600">
                <span className="font-bold">Longitude:</span>{" "}
                {location.longitude}
              </p>
              <p className="text-gray-600 sm:col-span-2">
                <span className="font-bold">Address:</span> {location.address}
              </p>
              <p className="text-gray-600 col-span-2">
                <span className="font-bold">Last Updated:</span>{" "}
                {new Date(location.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )
      )}

      {/* Map Section */}
      <div className="w-full max-w-3xl">
        {location ? (
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={15}
            className="h-[500px] w-full rounded-lg shadow-lg border border-green-300">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
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
                <div className="text-sm text-gray-700">
                  <p>Last valid location:</p>
                  <p>{new Date(location.timestamp).toLocaleString()}</p>
                  <p>{location.address}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="flex justify-center items-center h-[500px]">
            <p className="text-gray-500 text-lg">Loading map...</p>
          </div>
        )}
      </div>

      {/* Fetch Data Button */}
      <div className="text-center mt-10">
        <button
          onClick={fetchLocationData}
          className="px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-green-700">
          Refresh Location Data
        </button>
      </div>
    </div>
  );
};

export default Location;
