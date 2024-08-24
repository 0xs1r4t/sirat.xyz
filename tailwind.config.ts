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
    container: {
      center: true,
    },
    colors: {
      background: "rgba(var(--background-rgba))",
      foreground: "rgba(var(--foreground-rgba))",
      "muted-100": "rgba(var(--muted-100-rgba))",
      "muted-200": "rgba(var(--muted-200-rgba))",
      "bright-100": "rgba(var(--bright-100-rgba))",
      "music-pink": "rgba(var(--pink-music-rgba))",
      "music-purple": "rgba(var(--purple-music-rgba))",
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
          fontSize: theme("fontSize.3xl"),
          fontFamily: theme("fontFamily.heading"),
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
