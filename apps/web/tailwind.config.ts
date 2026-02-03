import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        sand: "#f6f2ec",
        clay: "#c57b57",
        moss: "#6c8a5b",
      },
    },
  },
  plugins: [],
};

export default config;
