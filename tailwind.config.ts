import type { Config } from "tailwindcss";
import { PluginUtils, PluginAPI } from "tailwindcss/types/config";

const plugin = require("tailwindcss/plugin");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: [
    "variant",
    [
      "@media (prefers-color-scheme: dark) { &:not(.light *) }",
      "&:is(.dark *)",
    ],
  ],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      background: "rgb(var(--background-rgb))",
      foreground: "rgb(var(--foreground-rgb))",
      "muted-100": "rgb(var(--search-bar-background-rgb))",
      "muted-200": "rgb(var(--search-bar-border-rgb))",
      scroll: "rgba(var(--scroll-rgba))",
    },
    // spacing: {},
    // fontSize: {},
    fontFamily: {
      heading: ["var(--font-authentic-sans-condensed)", "sans-serif"],
      serif: ["serif"],
    },
    extend: {},
  },
  variants: { extend: {} },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    plugin(function ({ addBase, theme }: PluginAPI & PluginUtils) {
      addBase({
        h1: {
          fontSize: theme("fontSize.5xl"),
          fontFamily: theme("fontFamily.heading"),
          textTransform: "uppercase",
          textAlign: "center",
          fontWeight: "700",
        },
        h2: {
          fontSize: theme("fontSize.2xl"),
          fontFamily: theme("fontFamily.heading"),
          fontWeight: "700",
        },
        h3: {
          fontSize: theme("fontSize.xl"),
          fontFamily: theme("fontFamily.heading"),
          fontWeight: "700",
        },
      });
    }),
  ],
};
export default config;
