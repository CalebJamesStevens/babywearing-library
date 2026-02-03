import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        slate: "#e7eef6",
        lake: "#1d4ed8",
        ember: "#b45309",
      },
    },
  },
  plugins: [],
};

export default config;
