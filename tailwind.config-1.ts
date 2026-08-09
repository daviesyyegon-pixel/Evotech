import type { Config } from "tailwindcss";

// EvoTech AI design tokens.
// Palette avoids the generic "cream + terracotta" AI look: dark ink base,
// deep indigo panels, savanna-gold primary accent, emerald growth accent.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        indigo: {
          DEFAULT: "#1B2A4A",
          light: "#243758",
          dark: "#121F38",
        },
        gold: {
          DEFAULT: "#E8A33D",
          light: "#F2BC6B",
          dark: "#C6852A",
        },
        emerald: {
          DEFAULT: "#1F8A70",
          light: "#28B18E",
          dark: "#166154",
        },
        paper: "#F5F3EE",
        slate: {
          DEFAULT: "#8B94A7",
          dark: "#5A6478",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
