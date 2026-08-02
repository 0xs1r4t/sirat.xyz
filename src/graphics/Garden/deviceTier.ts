// Plan item 5.4 — device tiers. Heuristic-based (navigator.deviceMemory /
// hardwareConcurrency / pointer:coarse) rather than the `detect-gpu`
// package the plan also allows: zero extra dependency/bundle weight, and
// "good enough" is the goal here — the runtime PerformanceMonitor-driven
// demotion (see Scene.tsx) is the real safety net if the heuristic guesses
// wrong.
export type DeviceTier = "high" | "mid" | "low";

export interface DeviceTierParams {
  /** Grass instances/m² — scales with terrain size/scale (docs/features.md #2), unlike a flat count. */
  grassDensity: number;
  dpr: [number, number];
  /** LOD cull distance (plan 5.2's farDistance) — lower thins the carpet sooner. */
  farDistance: number;
  /** Wind octave count (plan 5.4's "2 octaves instead of 3" for low tier). */
  windOctaves: 2 | 3;
}

// Densities preserve the original per-tier instance counts (75000/40000/15000)
// on the default 50×50 terrain (2500m²): 30/16/6 instances/m².
export const DEVICE_TIER_PARAMS: Record<DeviceTier, DeviceTierParams> = {
  high: { grassDensity: 30, dpr: [1, 2], farDistance: 60, windOctaves: 3 },
  mid: { grassDensity: 16, dpr: [1, 1.5], farDistance: 60, windOctaves: 3 },
  low: { grassDensity: 6, dpr: [1, 1], farDistance: 40, windOctaves: 2 },
};

const TIER_ORDER: DeviceTier[] = ["low", "mid", "high"];

/** One step down; clamps at "low". Used by PerformanceMonitor's onDecline. */
export const demoteTier = (tier: DeviceTier): DeviceTier =>
  TIER_ORDER[Math.max(0, TIER_ORDER.indexOf(tier) - 1)];

/** Heuristic device-capability probe, run once on mount. */
export const detectDeviceTier = (): DeviceTier => {
  if (typeof navigator === "undefined") return "high";

  const mem = (navigator as unknown as { deviceMemory?: number })
    .deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const coarsePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  // deviceMemory/hardwareConcurrency are undefined on browsers that don't
  // expose them (notably Safari) — treat "unknown" as capable rather than
  // penalizing those visitors, since coarsePointer alone already catches
  // most touch devices worth demoting.
  if ((mem !== undefined && mem <= 2) || (cores !== undefined && cores <= 2)) {
    return "low";
  }
  if (
    (mem !== undefined && mem <= 4) ||
    (cores !== undefined && cores <= 4) ||
    coarsePointer
  ) {
    return "mid";
  }
  return "high";
};
