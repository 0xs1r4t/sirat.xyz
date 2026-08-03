"use client";

import { useControls, folder } from "leva";
import { GARDEN } from "@/lib/garden/meadow";
import { computeTreeCount } from "@/lib/garden/trees";
import type { GardenControlValues } from "@graphics/Garden/gardenControlValues";

// The grass density slider used to run 0-60 (raw instances/m², fed straight
// into computeInstanceCount). Widened to a 0-100 display range with more
// headroom for denser grass than was previously reachable — the old max
// (60) is remapped to 85 on the new scale so an existing look at "60" reads
// the same, just relabeled; 85-100 is genuinely denser than the old max.
const GRASS_DENSITY_LEGACY_MAX = 60;
const GRASS_DENSITY_DISPLAY_AT_LEGACY_MAX = 85;
const GRASS_DENSITY_DISPLAY_MAX = 100;

/** Leva debug-panel bindings for every tunable garden parameter. */
export const useGardenControls = (): GardenControlValues => {
  // Resolved first, on its own, so Trees below can read live gridWidth/
  // gridHeight as plain numbers (a control's schema can't reference
  // another control's live value from within the same useControls() call —
  // they don't exist yet at that point).
  const terrain = useControls({
    Terrain: folder({
      gridWidth: {
        value: GARDEN.terrain.gridWidth,
        min: 5,
        max: 100,
        step: 1,
      },
      gridHeight: {
        value: GARDEN.terrain.gridHeight,
        min: 5,
        max: 100,
        step: 1,
      },
      heightScale: {
        value: GARDEN.terrain.heightScale,
        min: 0.5,
        max: 10,
        step: 0.1,
      },
      octaves: { value: GARDEN.terrain.octaves, min: 1, max: 8, step: 1 },
      // Original C++ default is 0.075/cell (terrain.h frequency=0.05,
      // sampled at *1.5). Values near 1.0+ make adjacent vertices sample
      // near-uncorrelated noise — jitter, not rolling hills.
      frequency: {
        value: GARDEN.terrain.frequency,
        min: 0.01,
        max: 0.5,
        step: 0.005,
      },
    }),
  });

  // Tree count is fully derived (area × density/10, see trees.ts's
  // computeTreeCount) from two plain numbers that are already live every
  // render — gridWidth/gridHeight above and this density dial — so it just
  // recomputes inline. No reset-on-terrain-change plumbing needed here.
  const { treeDensity } = useControls({
    Trees: folder({
      treeDensity: {
        value: GARDEN.trees.density,
        min: 0,
        max: 10,
        step: 1,
      },
    }),
  });
  const treeCount = computeTreeCount(
    terrain.gridWidth,
    terrain.gridHeight,
    treeDensity,
  );

  const rest = useControls({
    Grass: folder({
      // Display value (0-100) — converted to the actual instances/m² fed
      // into computeInstanceCount below, after this useControls() call.
      grassDensity: {
        value: Math.round(
          GARDEN.grass.density *
            (GRASS_DENSITY_DISPLAY_AT_LEGACY_MAX / GRASS_DENSITY_LEGACY_MAX),
        ),
        min: 0,
        max: GRASS_DENSITY_DISPLAY_MAX,
        step: 1,
      },
      tuftWidth: {
        value: GARDEN.grass.tuftWidth,
        min: 0.1,
        max: 1.5,
        step: 0.05,
      },
      tuftHeight: {
        value: GARDEN.grass.tuftHeight,
        min: 0.1,
        max: 1.5,
        step: 0.05,
      },
      slopeThreshold: {
        value: GARDEN.grass.slopeThreshold,
        min: 0,
        max: 1,
        step: 0.05,
      },
    }),
    Flowers: folder({
      flowerWidth: {
        value: GARDEN.flower.width,
        min: 0.2,
        max: 1.5,
        step: 0.05,
      },
      flowerHeight: {
        value: GARDEN.flower.height,
        min: 0.2,
        max: 1.5,
        step: 0.05,
      },
    }),
    Wind: folder({
      windSpeed: { value: GARDEN.wind.speed, min: 0, max: 5, step: 0.1 },
      windStrength: { value: GARDEN.wind.strength, min: 0, max: 1, step: 0.05 },
      flowerWindSpeed: {
        value: GARDEN.wind.flowerSpeed,
        min: 0,
        max: 5,
        step: 0.1,
      },
      flowerWindStrength: {
        value: GARDEN.wind.flowerStrength,
        min: 0,
        max: 1,
        step: 0.05,
      },
    }),
    Fog: folder({
      fogNear: {
        value: GARDEN.fog.near,
        min: 0,
        max: 80,
        step: 1,
      },
      fogFar: {
        value: GARDEN.fog.far,
        min: 1,
        max: 100,
        step: 1,
      },
    }),
  });

  return {
    ...terrain,
    // No longer Leva-adjustable (see the Terrain folder above) — always 1.0.
    scale: GARDEN.terrain.scale,
    treeCount,
    ...rest,
    grassDensity:
      (rest.grassDensity * GRASS_DENSITY_LEGACY_MAX) /
      GRASS_DENSITY_DISPLAY_AT_LEGACY_MAX,
  };
};
