/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"], // Example with Inter
        // You can add more font families here if necessary
      },
      textShadow: {
        DEFAULT: "2px 2px 4px rgba(0, 0, 0, 0.25)",
        md: "3px 3px 6px rgba(0, 0, 0, 0.3)", // Medium shadow
        lg: "4px 4px 8px rgba(0, 0, 0, 0.5)", // Larger shadow
      },
    },
  },
  plugins: [require("tailwindcss-textshadow")],
};
