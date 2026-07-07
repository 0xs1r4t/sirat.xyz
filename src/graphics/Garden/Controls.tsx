"use client";

import { useControls, folder } from "leva";
import { GARDEN } from "@/lib/garden/meadow";

export function useGardenControls() {
  return useControls({
    Terrain: folder({
      gridWidth: {
        value: GARDEN.terrain.gridWidth,
        min: 16,
        max: 128,
        step: 4,
      },
      gridHeight: {
        value: GARDEN.terrain.gridHeight,
        min: 16,
        max: 128,
        step: 4,
      },
      scale: { value: GARDEN.terrain.scale, min: 0.2, max: 2, step: 0.1 },
      heightScale: {
        value: GARDEN.terrain.heightScale,
        min: 0.5,
        max: 10,
        step: 0.1,
      },
      octaves: { value: GARDEN.terrain.octaves, min: 1, max: 8, step: 1 },
      frequency: {
        value: GARDEN.terrain.frequency,
        min: 0.1,
        max: 5,
        step: 0.1,
      },
    }),
    Grass: folder({
      grassCount: { value: GARDEN.grass.count, min: 0, max: 60000, step: 1000 },
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
    }),
  });
}
