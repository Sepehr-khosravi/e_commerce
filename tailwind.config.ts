import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff5858",
        secondary: "#56b4d3",
        dark: "#1d1b20",
        gray: {
          50: "#f7f7f7",
          100: "#ece6f0",
          500: "#49454f",
          900: "#1d1b20",
        },
      },
      fontFamily: {
        lexend: ["Lexend", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.05)",
        "card-hover": "0 8px 20px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;