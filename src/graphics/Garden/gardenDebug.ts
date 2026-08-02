"use client";

/**
 * Debug-only bridge for deterministic screenshot capture (see
 * docs/garden-screenshot-harness.md). Wired onto `window.__gardenDebug` by
 * GardenRig in debug mode only (Scene.tsx's `debug` gate — same one Leva
 * uses) — everything else in the render loop is wall-clock/interaction
 * driven, which is exactly what a pixel-diff harness can't tolerate.
 *
 * Terrain's animated moon is the one remaining non-deterministic input once
 * `reducedMotion` zeroes wind: `fixedTime` lets an external script pin the
 * clock value Terrain's useFrame uses for the moon-angle calc instead of
 * `clock.elapsedTime`, without touching the rest of the frame loop.
 */
export interface GardenDebugState {
  fixedTime: number | null;
}

export const gardenDebugState: GardenDebugState = { fixedTime: null };

export interface GardenDebugApi {
  /** True once GardenRig has mounted and set the camera's resting pose. */
  ready: boolean;
  /** Pin (or release, with `null`) the night light's clock for a deterministic frame. */
  setFixedTime: (seconds: number | null) => void;
  /**
   * `renderer.info.render` — logging/debugging aid only, NOT reliable for
   * readiness checks (see docs/garden-perf-benchmark.md's draws=0/tris=0
   * gotcha). Use `getMeshCount` to know when the scene has finished mounting.
   */
  getRenderInfo: () => { drawCalls: number; triangles: number };
  /** Count of mounted THREE.Mesh objects in the scene graph — the reliable "is everything mounted yet" signal. */
  getMeshCount: () => number;
}

declare global {
  interface Window {
    __gardenDebug?: GardenDebugApi;
  }
}
