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
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        mist: "rgb(var(--mist-rgb) / <alpha-value>)"
      },
      boxShadow: {
        neon: "0 24px 60px rgb(var(--neon-rgb) / 0.16)",
        pulse: "0 24px 60px rgb(var(--pulse-rgb) / 0.16)"
      },
      backgroundImage: {
        "cyber-grid":
          "radial-gradient(circle at 20% 20%, rgba(94, 234, 212, 0.14), transparent 30%), radial-gradient(circle at 80% 0%, rgba(125, 211, 252, 0.14), transparent 25%), linear-gradient(135deg, rgba(8, 17, 31, 0.96), rgba(6, 10, 20, 1))"
      },
      fontFamily: {
        display: ["Bahnschrift", "\"Segoe UI Variable Display\"", "\"Segoe UI\"", "sans-serif"],
        body: ["Aptos", "\"Segoe UI Variable Text\"", "\"Segoe UI\"", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
