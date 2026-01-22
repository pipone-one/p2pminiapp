/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0C",
        surface: "rgba(22, 22, 26, 0.7)",
        shark: {
          cyan: "#00F0FF",
        },
        soft: {
          gold: "#FFD700",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
      }
    },
  },
  plugins: [],
}
