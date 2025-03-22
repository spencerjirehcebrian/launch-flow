/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./src/renderer/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with class
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: {
          light: "#ffb6c1", // Light Pink (Pink Lemonade)
          DEFAULT: "#ff69b4", // Hot Pink
          dark: "#db7093", // PaleVioletRed
        },
        secondary: {
          light: "#f8f8ff", // GhostWhite
          DEFAULT: "#ffffff", // White
          dark: "#f0f8ff", // AliceBlue
        },
        success: "#2ecc71",
        danger: "#e74c3c",
        warning: "#f39c12",
        info: "#9b59b6",

        // Dark mode specific colors (These are more muted versions)
        darkPrimary: "#e6a8b5", // Muted Light Pink
        darkSecondary: "#e8e8e8", // Muted White
        darkBg: "#222222", // Dark Grey
        darkCard: "#333333", // Slightly Lighter Dark Grey
        darkAccent: "#444444", // An even lighter shade
      },
      borderRadius: {
        bubble: "24px", // Bubble-like radius
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #ffb6c1 0%, #ff69b4 50%, #ff1493 100%)", // Three-step hot pink gradient
        "gradient-secondary":
          "linear-gradient(135deg, #ffffff 0%, #ffc0cb 50%, #ffe4e1 100%)", // White to Light Pink and misty rose
        "gradient-primary-dark":
          "linear-gradient(135deg, #e6a8b5 0%, #ffdde1 50%, #fcd4d9 100%)", // Muted pink shades and rose quartz
        "gradient-secondary-dark":
          "linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 50%, #d3d3d3 100%)", // Muted greys and light grey
        "gradient-pink-bubble":
          "linear-gradient(135deg, #ffb6c1 0%, #f06292 50%, #e91e63 100%)", // bubble gradient
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        slideIn: "slideIn 0.3s ease-out forwards",
        slideInDown: "slideInDown 0.5s ease-out forwards",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideIn: {
          from: {
            transform: "translateX(100%)",
            opacity: 0,
          },
          to: {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
        slideInDown: {
          from: {
            transform: "translateY(-100%)",
            opacity: 0,
          },
          to: {
            transform: "translateY(0)",
            opacity: 1,
          },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      boxShadow: {
        bubble: "0 4px 20px rgba(255, 105, 180, 0.2)", // Hot Pink shadow
        "bubble-hover": "0 8px 25px rgba(255, 105, 180, 0.3)",
        "bubble-dark": "0 4px 20px rgba(230, 168, 181, 0.3)", // Muted Pink
        "bubble-hover-dark": "0 8px 25px rgba(230, 168, 181, 0.4)",
      },
    },
  },
  plugins: [],
};
