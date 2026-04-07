import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        neon: "rgb(var(--neon-rgb) / <alpha-value>)",
        pulse: "rgb(var(--pulse-rgb) / <alpha-value>)",
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        warning: "rgb(var(--warning-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        mist: "rgb(var(--mist-rgb) / <alpha-value>)"
      },
      boxShadow: {
        neon:
          "0 0 0 1px rgb(var(--neon-rgb) / 0.16), 0 18px 44px rgb(var(--neon-rgb) / 0.18)",
        pulse:
          "0 0 0 1px rgb(var(--pulse-rgb) / 0.16), 0 18px 44px rgb(var(--pulse-rgb) / 0.16)",
        glow: "0 0 28px rgb(var(--neon-rgb) / 0.2)",
        panel: "0 24px 80px rgba(3, 8, 24, 0.42)",
        "glass-sm": "0 14px 40px rgba(4, 10, 24, 0.28)",
        "glass-md": "0 28px 80px rgba(3, 8, 24, 0.42)"
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
        aurora:
          "radial-gradient(circle at top left, rgb(var(--neon-rgb) / 0.16), transparent 32%), radial-gradient(circle at top right, rgb(var(--pulse-rgb) / 0.14), transparent 28%), linear-gradient(160deg, rgba(6, 9, 22, 0.96), rgba(12, 18, 38, 0.92))",
        grid:
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Segoe UI Variable Display", "Aptos Display", "sans-serif"],
        body: ["var(--font-body)", "Segoe UI Variable Text", "Aptos", "sans-serif"]
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "grid-drift": "grid-drift 24s linear infinite",
        "halo-pulse": "halo-pulse 5s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "grid-drift": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(48px, 48px, 0)" }
        },
        "halo-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(0.96)" },
          "50%": { opacity: "0.95", transform: "scale(1.04)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
