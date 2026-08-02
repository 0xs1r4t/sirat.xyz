#!/usr/bin/env node
// Diff half of the garden A/B harness (garden-webgpu-plan.md §6, plan
// docs/garden-screenshot-harness.md). Numeric mismatch-percentage threshold,
// not eyeballing.
//
// Usage:
//   node scripts/garden-diff.mjs <imageA> <imageB> [options]
//
// Options:
//   --out <path>          Diff image output path (default alongside imageA, "*-diff.png")
//   --threshold <0-1>      pixelmatch's own per-pixel color-distance threshold (default 0.1)
//   --max-mismatch <pct>   Max allowed mismatched-pixel percentage before exit 1 (default 0.5)

import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

if (positional.length < 2) {
  console.error(
    "Usage: node scripts/garden-diff.mjs <imageA> <imageB> [--out <path>] [--threshold <0-1>] [--max-mismatch <pct>]",
  );
  process.exit(2);
}

const [pathA, pathB] = positional;
const pixelThreshold = Number(getArg("threshold", "0.1"));
const maxMismatchPct = Number(getArg("max-mismatch", "0.5"));
const outPath =
  getArg("out", null) ??
  path.join(
    path.dirname(pathA),
    `${path.basename(pathA, ".png")}__vs__${path.basename(pathB, ".png")}-diff.png`,
  );

const loadPng = (p) => PNG.sync.read(readFileSync(p));

const a = loadPng(pathA);
const b = loadPng(pathB);

if (a.width !== b.width || a.height !== b.height) {
  console.error(
    `Size mismatch: ${pathA} is ${a.width}x${a.height}, ${pathB} is ${b.width}x${b.height} — ` +
      `capture both at the same --width/--height to make this diff meaningful.`,
  );
  process.exit(2);
}

const { width, height } = a;
const diff = new PNG({ width, height });

const mismatchedPixels = pixelmatch(a.data, b.data, diff.data, width, height, {
  threshold: pixelThreshold,
});

const totalPixels = width * height;
const mismatchPct = (mismatchedPixels / totalPixels) * 100;

writeFileSync(outPath, PNG.sync.write(diff));

console.log(`${pathA}`);
console.log(`  vs ${pathB}`);
console.log(
  `  mismatch: ${mismatchedPixels}/${totalPixels} px = ${mismatchPct.toFixed(4)}%`,
);
console.log(`  diff image: ${outPath}`);

if (mismatchPct > maxMismatchPct) {
  console.error(
    `  FAIL: mismatch ${mismatchPct.toFixed(4)}% exceeds --max-mismatch ${maxMismatchPct}%`,
  );
  process.exit(1);
}

console.log(`  PASS: within --max-mismatch ${maxMismatchPct}%`);
