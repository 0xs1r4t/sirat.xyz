import * as THREE from "three";

/**
 * Terrain directional light — two presets picked per theme by Terrain.tsx:
 *  - day: static high overhead light for the light themes (strawberry-matcha,
 *    neopolitan-ice-cream) — cel bands sit in the bright/highlight range.
 *  - night: animated moon below the horizon for the dark theme
 *    (blueberry-lemon), ported verbatim from fairy-forest-glade's main.cpp —
 *    the source of the original's moody, shadow-banded terrain.
 */
export const DAY_LIGHT_POS = new THREE.Vector3(20, 30, 10);
export const NIGHT_MOON_DISTANCE = 20;
export const NIGHT_MOON_SPEED = 0.05;

/**
 * Foliage (grass/flower) directional light — ported verbatim from
 * main.cpp's `grassShader.setVec3("lightDir", ...)`. Constant across themes
 * in the original (it isn't derived from the moon), so it stays constant
 * here too.
 */
export const FOLIAGE_LIGHT_DIR = new THREE.Vector3(0.3, -0.7, 0.5);

/** Texture locations, following the existing public/images/textures layout. */
export const TEXTURES = {
  grass: "/images/textures/Grass.png",
  flower0: "/images/textures/flower_1.png",
  flower1: "/images/textures/flower_2.png",
} as const;
