import { GARDEN } from "@/lib/garden/meadow";
import { computeTreeCount, DEFAULT_TREE_SIZE } from "@/lib/garden/trees";

/**
 * Live-tunable garden parameters exposed via Leva's debug panel. Split out
 * from Controls.tsx (which imports "leva") so Scene.tsx can pull the
 * production defaults without statically importing leva's module graph — ES
 * module imports always evaluate the whole target file, so importing
 * anything from a leva-importing module drags leva along even if unused.
 */
export interface GardenControlValues {
  gridWidth: number;
  gridHeight: number;
  heightScale: number;
  octaves: number;
  frequency: number;
  grassDensity: number;
  tuftWidth: number;
  tuftHeight: number;
  slopeThreshold: number;
  windSpeed: number;
  windStrength: number;
  flowerWindSpeed: number;
  flowerWindStrength: number;
  flowerWidth: number;
  flowerHeight: number;
  fogNear: number;
  fogFar: number;
  treeCount: number;
  treeSize: number;
}

// Production visitors never load Leva (see Scene.tsx's lazy import) — this
// is what they get instead, straight from the tuned GARDEN constants.
export const GARDEN_CONTROL_DEFAULTS: GardenControlValues = {
  gridWidth: GARDEN.terrain.gridWidth,
  gridHeight: GARDEN.terrain.gridHeight,
  heightScale: GARDEN.terrain.heightScale,
  octaves: GARDEN.terrain.octaves,
  frequency: GARDEN.terrain.frequency,
  grassDensity: GARDEN.grass.density,
  tuftWidth: GARDEN.grass.tuftWidth,
  tuftHeight: GARDEN.grass.tuftHeight,
  slopeThreshold: GARDEN.grass.slopeThreshold,
  windSpeed: GARDEN.wind.speed,
  windStrength: GARDEN.wind.strength,
  flowerWindSpeed: GARDEN.wind.flowerSpeed,
  flowerWindStrength: GARDEN.wind.flowerStrength,
  flowerWidth: GARDEN.flower.width,
  flowerHeight: GARDEN.flower.height,
  fogNear: GARDEN.fog.near,
  fogFar: GARDEN.fog.far,
  // Density-derived, not a flat constant (see trees.ts's computeTreeCount) —
  // production visitors never resize the terrain, so this is just that
  // formula computed once against the fixed GARDEN.terrain/trees config.
  treeCount: computeTreeCount(
    GARDEN.terrain.gridWidth,
    GARDEN.terrain.gridHeight,
    GARDEN.trees.density,
  ),
  treeSize: DEFAULT_TREE_SIZE,
};
