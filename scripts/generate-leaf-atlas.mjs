// Composites Leaves1-4.PNG (each 620x620 RGBA) into one 2x2 atlas — plan
// Phase 3 item 4.1. Single texture, single sample in the shader (Trees.tsx
// picks one of 4 quadrants via `textureIndex` instead of 4 bound samplers +
// branching), same idea as generate-flower-atlas.mjs's 1x2 version. The
// mapping from textureIndex (0-3) to quadrant is arbitrary — every leaf
// texture is an interchangeable random silhouette mask, not a meaningful
// choice — it just has to agree with Trees.tsx's atlasUV computation.
//
//   node scripts/generate-leaf-atlas.mjs
import sharp from "sharp";

const DIR = "public/images/textures";
const TILE = 620;

const [leaf1, leaf2, leaf3, leaf4] = await Promise.all(
  [1, 2, 3, 4].map((n) =>
    sharp(`${DIR}/Leaves${n}.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ),
);

await sharp({
  create: {
    width: TILE * 2,
    height: TILE * 2,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: leaf1.data, raw: leaf1.info, left: 0, top: 0 },
    { input: leaf2.data, raw: leaf2.info, left: TILE, top: 0 },
    { input: leaf3.data, raw: leaf3.info, left: 0, top: TILE },
    { input: leaf4.data, raw: leaf4.info, left: TILE, top: TILE },
  ])
  .png()
  .toFile(`${DIR}/leaves_atlas.png`);

console.log(`wrote ${DIR}/leaves_atlas.png (${TILE * 2}x${TILE * 2})`);
