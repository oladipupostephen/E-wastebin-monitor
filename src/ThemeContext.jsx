/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true; // Default to dark theme
  });

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      // Dark theme colors
      dark: {
        background: "#121212",
        cardBg: "#1E1E1E",
        text: {
          primary: "#FFFFFF",
          secondary: "#AAAAAA",
          accent: "#00E676",
        },
        charts: {
          grid: "#333333",
        },
        sensor: {
          temperature: "#FF5F6D",
          humidity: "#38FFDD",
          distance: "#5D87FF",
          weight: "#FFC048",
        },
      },
      // Light theme colors
      light: {
        background: "#FFFFFF",
        cardBg: "#F8F9FA",
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          accent: "#059669",
        },
        charts: {
          grid: "#E5E7EB",
        },
        sensor: {
          temperature: "#EF4444",
          humidity: "#3B82F6",
          distance: "#10B981",
          weight: "#F59E0B",
        },
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
