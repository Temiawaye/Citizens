/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        surface: "#ffffff",
        canvas: "#f8fafc",
        ink: "#0f172a",
        muted: "#475569",
        outline: "#cbd5e1",
        danger: { 50: "#fef2f2", 600: "#dc2626", 700: "#b91c1c" },
        success: { 50: "#ecfdf5", 700: "#047857" },
        warning: { 50: "#fffbeb", 800: "#92400e" },
      },
      borderRadius: { control: "12px", card: "16px" },
    },
  },
  plugins: [],
};
