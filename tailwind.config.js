/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0EAFE",
          100: "#E4D7FB",
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
        },
        heading: "#16324F",
        location: "#087F8C",
        "bottom-nav": "#191B20",
        surface: "#FFFFFF",
        canvas: "#F5F7FA",
        ink: "#172B4D",
        muted: "#526277",
        outline: "#DCE3EB",
        danger: { 50: "#FEF2F2", 600: "#B91C1C", 700: "#991B1B" },
        success: { 50: "#F0FDF4", 700: "#15803D" },
        warning: { 50: "#fffbeb", 800: "#92400e" },
      },
      borderRadius: { control: "12px", card: "16px" },
    },
  },
  plugins: [],
};
