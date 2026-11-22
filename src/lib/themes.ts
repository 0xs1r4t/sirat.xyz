/**
 * Every theme the site supports. Add one here and TypeScript flags the
 * maps that still need an entry (icons, shader tints, dark-theme checks).
 */
export const THEMES = [
  "strawberry-matcha",
  "neopolitan-ice-cream",
  "blueberry-lemon",
] as const;

export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "strawberry-matcha";

/** The one dark theme; drives the garden's below-horizon moon lighting. */
export const DARK_THEME: Theme = "blueberry-lemon";

/** Narrows next-themes' string/undefined to a known theme. */
export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value);
