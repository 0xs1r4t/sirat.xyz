"use client";

import { useControls, folder } from "leva";
import { GARDEN } from "@/lib/garden/meadow";
import type { GardenControlValues } from "@graphics/Garden/gardenControlValues";

/** Leva debug-panel bindings for every tunable garden parameter. */
export const useGardenControls = (): GardenControlValues =>
  useControls({
    Terrain: folder({
      gridWidth: {
        value: GARDEN.terrain.gridWidth,
        min: 16,
        max: 128,
        step: 2,
      },
      gridHeight: {
        value: GARDEN.terrain.gridHeight,
        min: 16,
        max: 128,
        step: 2,
      },
      scale: { value: GARDEN.terrain.scale, min: 0.2, max: 2, step: 0.1 },
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
    Grass: folder({
      // instances/m² — actual instance count follows terrain area (width×scale
      // × height×scale), so this stays meaningful as the Terrain sliders above
      // change the terrain's size (docs/features.md #2).
      grassDensity: {
        value: GARDEN.grass.density,
        min: 0,
        max: 60,
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
