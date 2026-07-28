import * as THREE from "three";
import { color } from "three/tsl";

/**
 * The garden's color-management contract for TSL materials (see
 * docs/garden-webgpu-plan.md §3.3).
 *
 * The C++ original and the Phase 1 GLSL ShaderMaterials both write *raw*
 * values — colors authored in sRGB, displayed as sRGB, no decode/encode
 * anywhere in the pipeline. TSL NodeMaterials don't have that option:
 * WebGPURenderer's node pipeline always encodes its output (linear working
 * space → display color space) on the way out. Feed it a palette constant
 * that was authored as sRGB bytes without first converting it to the linear
 * working space, and the result comes out visibly brighter/washed relative
 * to the original — a silent, easy-to-miss regression.
 *
 * `srgb()`/`srgbRGB()` are the fix for *static* constants (the cel-shading
 * palette, fixed light colors, ...): convert once, at authoring time, into
 * a color node holding the correct linear working-space value. For values
 * that change at runtime (e.g. the fog color read live from
 * --color-background), prefer
 * `colorSpaceToWorking(color(...), THREE.SRGBColorSpace)` from "three/tsl"
 * instead, so the conversion happens in the node graph itself rather than
 * needing to be redone by hand on every update.
 */
export function srgb(hex: string | number) {
  return color(new THREE.Color().set(hex));
}

export function srgbRGB(r: number, g: number, b: number) {
  return color(new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace));
}
