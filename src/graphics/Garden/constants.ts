import * as THREE from "three";

/**
 * Exp²-fog density shared by every garden material.
 * Light enough that the terrain slab reads as an object when orbiting in
 * immersive mode, dense enough that the strip view melts into
 * --color-background before the far edge.
 */
export const GARDEN_FOG_DENSITY = 0.045;

/** Directional light position, matching web-terrain's default. */
export const LIGHT_POS = new THREE.Vector3(20, 30, 10);

/** Texture locations, following the existing public/images/textures layout. */
export const TEXTURES = {
  grass: "/images/textures/Grass.png",
  flower0: "/images/textures/flower_1.png",
  flower1: "/images/textures/flower_2.png",
} as const;
