import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#111118",
          card: "#18181f",
          "card-hover": "#1f1f28",
        },
        border: "#2a2a35",
        text: {
          primary: "#f0f0f5",
          secondary: "#a0a0b0",
          muted: "#606070",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
        },
        status: {
          open: "#3b82f6",
          in_progress: "#f59e0b",
          done: "#22c55e",
          cancelled: "#6b7280",
        },
        source: {
          action: "#3b82f6",
          activity: "#a855f7",
          important_date: "#ef4444",
          maintenance: "#fb7185",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
