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

export default function TemperatureGraph() {
  const [temperatureData, setTemperatureData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch(
          "https://api.thingspeak.com/channels/2792309/feeds.json" // Fetch all entries
        );
        const data = await response.json();

        if (data.feeds) {
          // Map data to the required format for the graph
          const graphData = data.feeds.map((feed) => ({
            time: new Date(feed.created_at).toLocaleDateString(), // Format timestamp
            temperature: parseFloat(feed.field1), // Convert temperature to a number
          }));

          setTemperatureData(graphData);
        } else {
          setTemperatureData([]);
        }
      } catch (err) {
        setError("Failed to fetch temperature data");
      }
    };

    fetchAllData();
  }, []);

  return (
    <div>
      <h1>All Historical Temperatures</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{
                value: "Time",
                position: "insideBottomRight",
                offset: -10,
              }}
            />
            <YAxis
              label={{
                value: "Temperature (°C)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
