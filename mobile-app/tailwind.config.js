/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        background: "#F8FAFC",
        text: "#0F172A",
        success: "#16A34A",
        warning: "#EA580C",
        danger: "#DC2626",
        border: "#E2E8F0"
      }
    },
  },
  plugins: [],
}
