import plugin from "tailwindcss/plugin";

const config = {
  safelist: ["bg-background", "text-foreground"],
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
    // spacing: {},
    // fontSize: {},
    fontFamily: {
      normal: ["var(--font-authentic-sans)", "sans-serif"],
      name: ["var(--font-that-that-new-pixel)", "serif"],
      heading: ["var(--font-authentic-sans-condensed)", "sans-serif"],
      code: ["var(--font-monaco)"],
    },
    extend: {
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(50%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        container: {
          center: true,
        },
        colors: {
          background: "rgba(var(--background-rgba))",
          foreground: "rgba(var(--foreground-rgba))",
          "muted-100": "rgba(var(--muted-100-rgba))",
          "muted-200": "rgba(var(--muted-200-rgba))",
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
  variants: { extend: {} },
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

export default config;
