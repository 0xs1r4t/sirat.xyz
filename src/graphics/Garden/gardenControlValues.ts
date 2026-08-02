import { GARDEN } from "@/lib/garden/meadow";

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
  scale: number;
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
  fogNear: number;
  fogFar: number;
}

// Production visitors never load Leva (see Scene.tsx's lazy import) — this
// is what they get instead, straight from the tuned GARDEN constants.
export const GARDEN_CONTROL_DEFAULTS: GardenControlValues = {
  gridWidth: GARDEN.terrain.gridWidth,
  gridHeight: GARDEN.terrain.gridHeight,
  scale: GARDEN.terrain.scale,
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
  fogNear: GARDEN.fog.near,
  fogFar: GARDEN.fog.far,
};
