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
        navy: {
          DEFAULT: "#0b192c", // Deep premium navy
          light: "#1e3e62",   // Mid-tone navy blue
          dark: "#000b18",    // Extra deep navy
          50: "#f4f7fa",      // Soft bluish off-white
        },
        gold: {
          DEFAULT: "#c5a880", // Premium champagne gold
          light: "#faf6f0",   // Warm background gold tint
          dark: "#8c6a3e",    // Dark gold/bronze
        },
        skyblue: {
          DEFAULT: "#0ea5e9", // Sky blue accent
          light: "#e0f2fe",   // Very light sky blue
          dark: "#0369a1",    // Deep sky blue
        },
      },
      fontFamily: {
        serif: ["var(--font-montserrat)", "sans-serif"],
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        typing: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        blink: {
          "50%": { borderColor: "transparent" },
        },
        marqueeLeft: {
          "0%": { transform: "translateX(100vw)" },
          "100%": { transform: "translateX(-100vw)" },
        },
        marqueeRight: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s infinite linear",
        typing: "typing 2s steps(40, end)",
        blink: "blink .75s step-end infinite",
        marqueeLeft: "marqueeLeft 25s linear infinite",
        marqueeRight: "marqueeRight 25s linear infinite",
        fadeIn: "fadeIn 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
