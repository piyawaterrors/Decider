/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Kanit", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neo-sm": "4px 4px 0px 0px rgba(0, 0, 0, 1)",
        "neo-md": "6px 6px 0px 0px rgba(0, 0, 0, 1)",
        "neo-lg": "8px 8px 0px 0px rgba(0, 0, 0, 1)",
        "neo-xl": "12px 12px 0px 0px rgba(0, 0, 0, 1)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
