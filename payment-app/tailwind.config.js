/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polygon: {
          purple: '#8247E5',
          dark: '#1a1a2e',
          card: '#16213e',
          border: '#0f3460',
        }
      }
    },
  },
  plugins: [],
}