// Composites flower_1.png + flower_2.png (each 512x512 RGBA) side-by-side
// into one 1024x512 atlas — plan item 5.3. Single texture, single sample in
// the shader (Foliage.tsx picks the left/right half via `textureIndex`
// instead of a `select()` between two bound textures). Re-run if either
// source image changes.
//
//   node scripts/generate-flower-atlas.mjs
import sharp from "sharp";

const DIR = "public/images/textures";
const TILE = 512;

const [flower1, flower2] = await Promise.all([
  sharp(`${DIR}/flower_1.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  sharp(`${DIR}/flower_2.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
]);

await sharp({
  create: {
    width: TILE * 2,
    height: TILE,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: flower1.data, raw: flower1.info, left: 0, top: 0 },
    { input: flower2.data, raw: flower2.info, left: TILE, top: 0 },
  ])
  .png()
  .toFile(`${DIR}/flowers_atlas.png`);

console.log(`wrote ${DIR}/flowers_atlas.png (${TILE * 2}x${TILE})`);
