/**
 * Deterministic value-noise / fBm stack.
 * Ported verbatim from web-terrain-generator `lib/noise.ts` (itself ported
 * from the original OpenGL/C++ terrain generator) — hash-based, no RNG state,
 * so the terrain is identical on every build and every client.
 */

const fract = (n: number): number => n - Math.floor(n);
const mix = (a: number, b: number, t: number): number => a + t * (b - a);
const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

const hash2D = (px: number, py: number): number =>
  fract(Math.sin(px * 12.9898 + py * 78.233) * 43758.5453123);

const noise2D = (px: number, py: number): number => {
  const ix = Math.floor(px),
    iy = Math.floor(py);
  let fx = fract(px),
    fy = fract(py);
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash2D(ix, iy),
    b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1),
    d = hash2D(ix + 1, iy + 1);
  return mix(mix(a, b, fx), mix(c, d, fx), fy);
};

/** Fractal Brownian motion: layered octaves of value noise. */
export const fbm = (
  px: number,
  py: number,
  octaves = 6,
  lacunarity = 2.0,
  gain = 0.5,
): number => {
  let amplitude = 0.5,
    frequency = 1.0,
    value = 0.0,
    maxValue = 0.0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(px * frequency, py * frequency);
    maxValue += amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }
  return value / maxValue;
};

/** Domain-warped {@link fbm} — feeds fbm's own output back in as offsets for organic, non-grid-aligned terrain. */
export const warpedFBM = (px: number, py: number, octaves = 6): number => {
  const qx = fbm(px, py, octaves);
  const qy = fbm(px + 5.2, py + 1.3, octaves);
  const rx = fbm(px + 4 * qx + 1.7, py + 4 * qy + 9.2, octaves);
  const ry = fbm(px + 4 * qx + 8.3, py + 4 * qy + 2.8, octaves);
  return fbm(px + 4 * rx, py + 4 * ry, octaves);
};

/** Ridged multifractal noise — sharp ridgelines instead of {@link fbm}'s smooth hills. */
export const ridgedNoise = (px: number, py: number, octaves = 6): number => {
  let amplitude = 0.5,
    frequency = 1.0,
    value = 0.0,
    weight = 1.0;
  for (let i = 0; i < octaves; i++) {
    let n = noise2D(px * frequency, py * frequency);
    n = 1.0 - Math.abs(n * 2.0 - 1.0);
    n = n * n * weight;
    weight = clamp(n * 2.0, 0.0, 1.0);
    value += n * amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
};

/** Deterministic PRNG, ported from web-terrain `Foliage.tsx` (mulberry32). */
export const mulberry32 = (seed: number): (() => number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
