// Regenerates public/icons/pixel/{NAME}/{NAME}-{size}px.PNG from the 64x64
// master PNGs in src/assets/icon-sources/, using nearest-neighbor resampling
// so the pixel-art stays crisp and (critically) renders byte-identical
// across every browser — the whole reason these are pre-generated raster
// sizes instead of scaled SVGs. The masters live outside public/ so they're
// not shipped as a redundant, un-suffixed web asset; the matching .svg
// (vector original, not sharp-rasterized — see note below) stays alongside
// the generated sizes in each icon's public folder. Run after adding a new
// icon to ICONS below, or changing SIZES.
//
//   node scripts/generate-pixel-icon-sizes.mjs
//
// Deliberately resizes from the master PNG, not the sibling .svg: rendering
// straight from the SVG (sharp can do this) measurably differs from the
// original PNG at pixel edges (~38/16384 bytes off, up to 127/255 on one
// channel, likely from the viewBox's `-0.5` y-offset) — small, but a real
// fidelity loss the PNG-sourced path avoids entirely.
import sharp from "sharp";
import { existsSync } from "fs";

const ICONS = [
  "HOUSE",
  "DIGIGARDEN",
  "PALETTE",
  "MATCHA",
  "ICECREAM",
  "CHEESECAKE",
  "LINK",
];
const SIZES = [20, 32, 40, 48, 64, 96, 128];
const SOURCE_DIR = "src/assets/icon-sources";
const OUT_DIR = "public/icons/pixel";

for (const icon of ICONS) {
  const srcPath = `${SOURCE_DIR}/${icon}.PNG`;
  if (!existsSync(srcPath)) {
    console.error(`missing source: ${srcPath}`);
    continue;
  }
  for (const size of SIZES) {
    const outPath = `${OUT_DIR}/${icon}/${icon}-${size}px.PNG`;
    await sharp(srcPath)
      .resize(size, size, { kernel: "nearest" })
      .png()
      .toFile(outPath);
    console.log(`wrote ${outPath}`);
  }
}
