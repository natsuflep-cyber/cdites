import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0813",
        surface: "#140F1F",
        surface2: "#1C1526",
        border: "#2A2035",
        primary: {
          DEFAULT: "#7C3AED",
          light: "#A855F7",
          dark: "#5B21B6",
        },
        muted: "#9089A3",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(168, 85, 247, 0.45)",
        "neon-sm": "0 0 10px rgba(124, 58, 237, 0.4)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse-glow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(168,85,247,0.35)" },
          "50%": { boxShadow: "0 0 25px rgba(168,85,247,0.7)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.35s ease-out",
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
