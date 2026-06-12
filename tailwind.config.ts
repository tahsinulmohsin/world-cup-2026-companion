import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: "#eefcf4",
          100: "#d6f5e3",
          200: "#b0eacb",
          300: "#7cd8ac",
          400: "#46bf88",
          500: "#22a46d",
          600: "#158457",
          700: "#116a48",
          800: "#10543b",
          900: "#0e4532",
          950: "#06271c"
        },
        trophy: {
          300: "#ecd9a0",
          400: "#e0c172",
          500: "#d4a437",
          600: "#b8862a",
          700: "#936822"
        },
        night: {
          800: "#16202e",
          900: "#0e1622",
          950: "#0a101a"
        },
        live: "#e23d3d"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,16,26,0.06), 0 8px 24px -12px rgba(10,16,26,0.18)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.4), 0 10px 30px -12px rgba(0,0,0,0.6)"
      },
      keyframes: {
        pulseLive: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" }
        }
      },
      animation: { pulseLive: "pulseLive 1.6s ease-in-out infinite" }
    }
  },
  plugins: []
};
export default config;
