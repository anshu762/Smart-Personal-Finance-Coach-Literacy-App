/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#208AEF",
          dark: "#1B76CC",
        },
        background: "#0F172A",
        surface: "#1E293B",
        border: "#334155",
        muted: "#94A3B8",
        danger: "#EF4444",
        success: "#22C55E",
        warning: "#D97706",
      },
    },
  },
  plugins: [],
};