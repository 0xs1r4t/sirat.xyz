const plugin = require("tailwindcss/plugin");

module.exports = {
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
