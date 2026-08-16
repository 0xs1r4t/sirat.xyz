"use client";

import { useCallback, useMemo, useState } from "react";

import { GARDEN } from "@/lib/garden/meadow";
import {
  computeTreeCount,
  DEFAULT_TREE_SIZE,
  MAX_TREE_SIZE,
} from "@/lib/garden/trees";
import {
  DEVICE_TIER_PARAMS,
  detectDeviceTier,
  getTierOverride,
} from "@graphics/Garden/deviceTier";
import type { GardenControlValues } from "@graphics/Garden/gardenControlValues";

// The grass density slider used to run 0-60 (raw instances/m², fed straight
// into computeInstanceCount). Widened to a 0-100 display range with more
// headroom for denser grass than was previously reachable — the old max
// (60) is remapped to 85 on the new scale so an existing look at "60" reads
// the same, just relabeled; 85-100 is genuinely denser than the old max.
// Same remap `Controls.tsx` (the Leva-based hook this replaces) used.
const GRASS_DENSITY_LEGACY_MAX = 60;
const GRASS_DENSITY_DISPLAY_AT_LEGACY_MAX = 85;
const GRASS_DENSITY_DISPLAY_MAX = 100;

const rawToDisplayGrassDensity = (raw: number) =>
  Math.round(
    raw * (GRASS_DENSITY_DISPLAY_AT_LEGACY_MAX / GRASS_DENSITY_LEGACY_MAX),
  );

const displayToRawGrassDensity = (display: number) =>
  (display * GRASS_DENSITY_LEGACY_MAX) / GRASS_DENSITY_DISPLAY_AT_LEGACY_MAX;

/** Every slider the sidebar renders. Superset of `GardenControlValues` — it
 * also tracks `treeDensity` (raw dial) and `grassDensity` in *display*
 * units, neither of which `GardenControlValues` carries (it only carries
 * the derived `treeCount`, and raw grassDensity instances/m²). */
export type GardenControlKey =
  | "gridWidth"
  | "gridHeight"
  | "heightScale"
  | "octaves"
  | "frequency"
  | "treeDensity"
  | "treeSize"
  | "grassDensity"
  | "tuftWidth"
  | "tuftHeight"
  | "slopeThreshold"
  | "flowerWidth"
  | "flowerHeight"
  | "windSpeed"
  | "windStrength"
  | "flowerWindSpeed"
  | "flowerWindStrength"
  | "fogNear"
  | "fogFar";

export type GardenSliderState = Record<GardenControlKey, number>;

export interface GardenControlFieldSchema {
  key: GardenControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface GardenControlSectionSchema {
  title: string;
  fields: GardenControlFieldSchema[];
}

/** Sidebar section/field schema — one source of truth for the labels,
 * ranges, and step sizes, mirroring the `folder()` calls Controls.tsx used
 * to encode via Leva. Section order drives the sidebar's section order. */
export const GARDEN_CONTROL_SECTIONS: GardenControlSectionSchema[] = [
  {
    title: "terrain",
    fields: [
      { key: "gridWidth", label: "grid width", min: 5, max: 100, step: 1 },
      { key: "gridHeight", label: "grid height", min: 5, max: 100, step: 1 },
      {
        key: "heightScale",
        label: "height scale",
        min: 0.5,
        max: 10,
        step: 0.1,
      },
      { key: "octaves", label: "octaves", min: 1, max: 8, step: 1 },
      // Original C++ default is 0.075/cell (terrain.h frequency=0.05,
      // sampled at *1.5). Values near 1.0+ make adjacent vertices sample
      // near-uncorrelated noise — jitter, not rolling hills.
      {
        key: "frequency",
        label: "frequency",
        min: 0.01,
        max: 0.5,
        step: 0.005,
      },
    ],
  },
  {
    title: "trees",
    fields: [
      { key: "treeDensity", label: "density", min: 0, max: 10, step: 1 },
      {
        key: "treeSize",
        label: "size",
        min: 0,
        max: MAX_TREE_SIZE,
        step: 1,
      },
    ],
  },
  {
    title: "grass",
    fields: [
      {
        key: "grassDensity",
        label: "density",
        min: 0,
        max: GRASS_DENSITY_DISPLAY_MAX,
        step: 1,
      },
      { key: "tuftWidth", label: "tuft width", min: 0.1, max: 1.5, step: 0.05 },
      {
        key: "tuftHeight",
        label: "tuft height",
        min: 0.1,
        max: 1.5,
        step: 0.05,
      },
      {
        key: "slopeThreshold",
        label: "slope threshold",
        min: 0,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    title: "flowers",
    fields: [
      { key: "flowerWidth", label: "width", min: 0.2, max: 1.5, step: 0.05 },
      { key: "flowerHeight", label: "height", min: 0.2, max: 1.5, step: 0.05 },
    ],
  },
  {
    title: "wind",
    fields: [
      { key: "windSpeed", label: "speed", min: 0, max: 5, step: 0.1 },
      { key: "windStrength", label: "strength", min: 0, max: 1, step: 0.05 },
      {
        key: "flowerWindSpeed",
        label: "flower speed",
        min: 0,
        max: 5,
        step: 0.1,
      },
      {
        key: "flowerWindStrength",
        label: "flower strength",
        min: 0,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    title: "fog",
    fields: [
      { key: "fogNear", label: "near", min: 0, max: 80, step: 1 },
      { key: "fogFar", label: "far", min: 1, max: 100, step: 1 },
    ],
  },
];

// Public sliders keep the same bounds debug mode always had (2026-08-16
// decision, docs/ui/leva-controls-ui-migration.md §7) — no bound-tightening
// for a general audience. PerformanceMonitor (Scene.tsx) is still the
// runtime safety net if a visitor's settings actually tank their FPS.
const buildDefaultState = (): GardenSliderState => {
  const tier = getTierOverride() ?? detectDeviceTier();
  return {
    gridWidth: GARDEN.terrain.gridWidth,
    gridHeight: GARDEN.terrain.gridHeight,
    heightScale: GARDEN.terrain.heightScale,
    octaves: GARDEN.terrain.octaves,
    frequency: GARDEN.terrain.frequency,
    treeDensity: GARDEN.trees.density,
    treeSize: DEFAULT_TREE_SIZE,
    // Only the *initial* value is tier-seeded — from here it's a normal
    // visitor-editable slider like every other control.
    grassDensity: rawToDisplayGrassDensity(DEVICE_TIER_PARAMS[tier].grassDensity),
    tuftWidth: GARDEN.grass.tuftWidth,
    tuftHeight: GARDEN.grass.tuftHeight,
    slopeThreshold: GARDEN.grass.slopeThreshold,
    flowerWidth: GARDEN.flower.width,
    flowerHeight: GARDEN.flower.height,
    windSpeed: GARDEN.wind.speed,
    windStrength: GARDEN.wind.strength,
    flowerWindSpeed: GARDEN.wind.flowerSpeed,
    flowerWindStrength: GARDEN.wind.flowerStrength,
    fogNear: GARDEN.fog.near,
    fogFar: GARDEN.fog.far,
  };
};

export interface UseGardenControlsResult {
  /** Slider-space state — what the sidebar reads/writes (incl. treeDensity
   * and display-unit grassDensity, neither of which GardenRig consumes directly). */
  sliderValues: GardenSliderState;
  setValue: (key: GardenControlKey, value: number) => void;
  /** `GardenRig`-shape values — same derivation Controls.tsx did (treeCount
   * from gridWidth/gridHeight/treeDensity, grassDensity converted to raw). */
  values: GardenControlValues;
}

/** Replaces the Leva-based `useGardenControls` in Controls.tsx — plain
 * React state driving the same schema, read/written by the sidebar instead
 * of Leva's own panel. */
export const useGardenControls = (): UseGardenControlsResult => {
  const [sliderValues, setSliderValues] = useState<GardenSliderState>(
    buildDefaultState,
  );

  const setValue = useCallback((key: GardenControlKey, value: number) => {
    setSliderValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const values = useMemo<GardenControlValues>(
    () => ({
      gridWidth: sliderValues.gridWidth,
      gridHeight: sliderValues.gridHeight,
      heightScale: sliderValues.heightScale,
      octaves: sliderValues.octaves,
      frequency: sliderValues.frequency,
      grassDensity: displayToRawGrassDensity(sliderValues.grassDensity),
      tuftWidth: sliderValues.tuftWidth,
      tuftHeight: sliderValues.tuftHeight,
      slopeThreshold: sliderValues.slopeThreshold,
      windSpeed: sliderValues.windSpeed,
      windStrength: sliderValues.windStrength,
      flowerWindSpeed: sliderValues.flowerWindSpeed,
      flowerWindStrength: sliderValues.flowerWindStrength,
      flowerWidth: sliderValues.flowerWidth,
      flowerHeight: sliderValues.flowerHeight,
      fogNear: sliderValues.fogNear,
      fogFar: sliderValues.fogFar,
      treeCount: computeTreeCount(
        sliderValues.gridWidth,
        sliderValues.gridHeight,
        sliderValues.treeDensity,
      ),
      treeSize: sliderValues.treeSize,
    }),
    [sliderValues],
  );

  return { sliderValues, setValue, values };
};
