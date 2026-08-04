import * as THREE from "three";

/**
 * Terrain directional light — two presets picked per theme by Terrain.tsx:
 *  - day: static, low-elevation (~26°) light for the light themes
 *    (strawberry-matcha, neopolitan-ice-cream) — deliberately *not* overhead.
 *    A near-vertical light barely changes angle across gentle rolling
 *    slopes (cos(θ) is flat near its peak), which is exactly why the old
 *    (20, 30, 10) value read as flat/uniformly bright instead of banded —
 *    see garden-webgpu-plan.md's diagnosis table, row B. An oblique angle
 *    sits nearer the sensitive part of the cosine curve, so slope
 *    variation actually crosses celShade4Band's thresholds.
 *  - night: animated moon below the horizon for the dark theme
 *    (blueberry-lemon), ported verbatim from fairy-forest-glade's main.cpp —
 *    the source of the original's moody, shadow-banded terrain.
 * Open Decision #1 (garden-webgpu-plan.md §7): day is intentionally static,
 * not a mirrored/animated sun — day and night only need to *read* as a
 * coherent pair, not share a literal light rig.
 */
export const DAY_LIGHT_POS = new THREE.Vector3(14, 9, 11);
export const NIGHT_MOON_DISTANCE = 20;
export const NIGHT_MOON_SPEED = 0.05;

/**
 * celShade4Band's (shadow, dark, mid, light) multipliers on the terrain's
 * height-band base color — night keeps the original C++ ratios; day is a
 * separately hand-tuned, brighter set (not a flat post-multiply) so the
 * lift is concentrated in the shadow/dark bands rather than pushing the
 * already-bright light band toward clipping. Packed as vec4 so Terrain.tsx
 * can swap the whole set with one uniform mutation per theme, matching
 * DAY_LIGHT_POS/moon's no-material-rebuild pattern.
 */
export const NIGHT_BAND_MULTIPLIERS = new THREE.Vector4(0.4, 0.65, 0.85, 1.0);
export const DAY_BAND_MULTIPLIERS = new THREE.Vector4(0.6, 0.8, 0.95, 1.0);

/**
 * Grass's celShadeSmoothBands (dark, light) multipliers — same day/night
 * split as the terrain bands above, for the same reason (Open Decision #1
 * covers foliage too, not just terrain).
 */
export const NIGHT_GRASS_BAND = new THREE.Vector2(0.7, 1.2);
export const DAY_GRASS_BAND = new THREE.Vector2(0.9, 1.4);

/**
 * Flowers have no directional-lighting model at all (item J: textures are
 * sampled and written raw, matching the C++ original exactly) — so their
 * day lift is a flat brightness multiplier on the sampled atlas color
 * rather than a band retune. Night is implicitly 1.0 (untouched).
 */
export const DAY_FLOWER_BRIGHTNESS = 1.15;

/**
 * Foliage (grass/flower/tree) directional light — ported verbatim from
 * main.cpp's `grassShader.setVec3("lightDir", ...)` (branch/leaf shaders
 * get the exact same value passed to them in tree_foliage.cpp's `Draw`).
 * Constant across themes in the original (it isn't derived from the moon),
 * so it stays constant here too.
 */
export const FOLIAGE_LIGHT_DIR = new THREE.Vector3(0.3, -0.7, 0.5);

/**
 * Branch's celShadeQuantized (dark, light) multipliers — night is the
 * original C++ ratio (`baseColor*0.6`, `LIGHT_BARK` unmultiplied); day is
 * a separately hand-tuned brighter pair, same day/night split as
 * NIGHT_GRASS_BAND/DAY_GRASS_BAND above and for the same reason.
 */
export const NIGHT_BARK_BAND = new THREE.Vector2(0.6, 1.0);
export const DAY_BARK_BAND = new THREE.Vector2(0.8, 1.2);

/**
 * Leaf's celShadeSmoothBands (dark, light) multipliers — night is the
 * original C++ ratio (both colors unmultiplied, i.e. `1.0`/`1.0`); day
 * lifts both.
 */
export const NIGHT_LEAF_BAND = new THREE.Vector2(1.0, 1.0);
export const DAY_LEAF_BAND = new THREE.Vector2(1.15, 1.3);

/** Texture/model locations, following the existing public/ layout. */
export const TEXTURES = {
  grass: "/images/textures/Grass.png",
  // Single 1024x512 atlas (flower_1.png | flower_2.png side-by-side, see
  // scripts/generate-flower-atlas.mjs) — plan 5.3: one sample, no select
  // between two bound textures.
  flowersAtlas: "/images/textures/flowers_atlas.png",
  // 2x2 atlas (Leaves1-4.png, see scripts/generate-leaf-atlas.mjs).
  leavesAtlas: "/images/textures/leaves_atlas.png",
} as const;

export const MODELS = {
  normalTreeBranch: "/models/normal-tree-branch.glb",
  thickTreeBranch: "/models/thick-tree-branch.glb",
} as const;
