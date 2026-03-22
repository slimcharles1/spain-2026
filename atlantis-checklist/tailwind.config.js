/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        ocean: {
          950: "#0a0e1a",
          900: "#0d1526",
          800: "#132038",
          700: "#1a2d4d",
          600: "#243d66",
        },
        coral: "#FF6B6B",
        gold: "#FFD93D",
        mint: "#7ECBA1",
        pink: "#FF8FA3",
      },
    },
  },
  plugins: [],
};
