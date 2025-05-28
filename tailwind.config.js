const plugin = require("tailwindcss/plugin");

module.exports = {
  safelist: [
    "bg-background",
    "text-foreground",
    "bg-muted-100",
    "text-muted-100",
    "bg-muted-200",
    "text-muted-200",
    "font-name",
    "font-normal",
    "font-heading",
    "font-code",
  ],
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
    fontFamily: {
      normal: ["var(--font-authentic-sans)", "sans-serif"],
      name: ["var(--font-that-that-new-pixel)", "serif"],
      heading: ["var(--font-authentic-sans-condensed)", "sans-serif"],
      code: ["var(--font-monaco)"],
    },
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        "muted-100": "rgb(var(--color-muted-100) / <alpha-value>)",
        "muted-200": "rgb(var(--color-muted-200) / <alpha-value>)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(50%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        marquee: "marquee 20s linear infinite",
      },
      zoom: {
        large: { transform: "scale(1.2)" },
      },
      typography: {
        DEFAULT: {
          css: {
            pre: {
              fontFamily: "var(--font-monaco), monospace !important",
            },
            code: {
              fontFamily: "var(--font-monaco), monospace !important",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@designbycode/tailwindcss-text-stroke"),
    plugin(function ({ addBase, theme }) {
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
