/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Purple-Blue Theme
        primary: {
          purple: "#8B5CF6",
          blue: "#3B82F6",
          DEFAULT: "#8B5CF6",
        },
        accent: {
          pink: "#EC4899",
          cyan: "#06B6D4",
        },
        dark: {
          DEFAULT: "#0F172A",
          darker: "#020617",
        },
        // Keep surface colors for compatibility
        surface: {
          50: "#F8F9FA",
          100: "#F1F3F4",
          200: "#E8EAED",
          300: "#DADCE0",
          400: "#BDC1C6",
        },
        // Legacy Google colors (for gradual migration)
        google: {
          blue: "#3B82F6", // Updated to match new theme
          red: "#EA4335",
          yellow: "#FBBC04",
          green: "#34A853",
          gray: "#5F6368",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 15px rgba(139, 92, 246, 0.3)',
        'hover': '0 8px 25px rgba(139, 92, 246, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer-gradient 3s ease infinite',
      }
    },
  },
  plugins: [],
}
