"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Live bridge from the site's CSS custom properties to shader uniforms.
 *
 * THREE.Color instances are created once and mutated in place — the same
 * object references live inside every ShaderMaterial's uniforms, so when
 * next-themes swaps the class on <html>, a MutationObserver re-reads the
 * computed variables and the scene's fog/atmosphere recolors on the next
 * frame. No material rebuild, no scene rebuild.
 *
 * Note: per design decision, the grass/terrain greens come from the
 * fairy-forest-glade colors.glsl palette and stay constant across themes;
 * the theme drives fog (--color-background) and the DOM chrome.
 */
export interface GardenPalette {
  /** --color-background — fog; the page the garden dissolves into */
  background: THREE.Color;
  /** --color-foreground */
  foreground: THREE.Color;
  /** --color-muted-100 */
  muted100: THREE.Color;
  /** --color-muted-200 */
  muted200: THREE.Color;
  /**
   * True for the dark theme (blueberry-lemon). A plain mutable box (not
   * React state) so per-frame consumers like Terrain's light-preset switch
   * can read it without triggering a material rebuild — mutated in place
   * the same way the Color instances above are.
   */
  isDark: { current: boolean };
}

const VAR_NAMES = [
  "--color-background",
  "--color-foreground",
  "--color-muted-100",
  "--color-muted-200",
] as const;

/** The dark theme's html class (see ThemeSwitcherButton.tsx / layout.tsx). */
const DARK_THEME_CLASS = "blueberry-lemon";

/**
 * Parses "rgb(232 241 216)" / "rgb(232, 241, 216)" / "#aabbcc" into `out`
 * WITHOUT an sRGB→linear decode. The garden's ShaderMaterials write raw,
 * undecoded output (same as the original C++ pipeline), so the fog colour
 * must carry the same raw 0–255 values the CSS declares — decoding it into
 * three's linear working space here would silently darken/desaturate it
 * before it ever reaches the shader.
 */
function parseCssColor(raw: string, out: THREE.Color): void {
  const value = raw.trim();
  if (!value) return;
  if (value.startsWith("#")) {
    out.setStyle(value, THREE.LinearSRGBColorSpace);
    return;
  }
  const nums = value.match(/[\d.]+/g);
  if (nums && nums.length >= 3) {
    out.setRGB(
      Number(nums[0]) / 255,
      Number(nums[1]) / 255,
      Number(nums[2]) / 255,
      THREE.LinearSRGBColorSpace,
    );
  }
}

export function createGardenPalette(): GardenPalette {
  return {
    background: new THREE.Color("#e8f1d8"),
    foreground: new THREE.Color("#273821"),
    muted100: new THREE.Color("#f3c6fc"),
    muted200: new THREE.Color("#de7ef9"),
    isDark: { current: false },
  };
}

function refreshPalette(palette: GardenPalette): void {
  const style = getComputedStyle(document.documentElement);
  const [bg, fg, m100, m200] = VAR_NAMES.map((name) =>
    style.getPropertyValue(name),
  );
  parseCssColor(bg, palette.background);
  parseCssColor(fg, palette.foreground);
  parseCssColor(m100, palette.muted100);
  parseCssColor(m200, palette.muted200);
  palette.isDark.current = document.documentElement.classList.contains(
    DARK_THEME_CLASS,
  );
}

/** Stable palette whose colors track the active theme. Client-only. */
export function useGardenTheme(): GardenPalette {
  const palette = useMemo(createGardenPalette, []);

  useEffect(() => {
    refreshPalette(palette);
    const observer = new MutationObserver(() => refreshPalette(palette));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [palette]);

  return palette;
}
