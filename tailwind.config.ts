import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f4f4f5",
        muted: "#18181b",
        border: "#27272a",
        card: "#111114",
        accent: "#d4d4d8",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      boxShadow: {
        panel: "0 18px 60px rgba(0, 0, 0, 0.32)",
      },
      backgroundImage: {
        "panel-gradient":
          "radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 45%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
