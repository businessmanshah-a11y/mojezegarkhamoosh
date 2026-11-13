/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "rgba(255, 255, 255, 0.015)",
        gold: {
          400: "#E5C158",
          500: "#D4AF37",
          600: "#B89628",
        }
      },
      fontFamily: {
        sans: ['"PeydaWebFaNum"', 'system-ui', 'sans-serif'],
        serif: ['"PeydaWebFaNum"', 'system-ui', 'sans-serif'],
        peyda: ['"PeydaWebFaNum"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
