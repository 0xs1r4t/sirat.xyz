"use client";

import { useMemo } from "react";
import * as THREE from "three";

import { GARDEN, layoutFlowers, type GardenPost } from "@/lib/garden/meadow";
import { flowerHeads } from "@/lib/garden/picking";
import { generateTerrain, sampleHeight } from "@/lib/garden/terrain";
import type { GardenControlValues } from "@graphics/Garden/gardenControlValues";

const FOCUS_DISTANCE = 3.2; // how far back the camera stands from a focused flower
const FOCUS_HEIGHT = 1.3; // eye height above the flower's ground point when focused

/** A focused flower's camera pose. */
export interface GardenFocusPose {
  eyePos: THREE.Vector3;
  lookAt: THREE.Vector3;
}

/**
 * Deterministic world data for the garden: terrain mesh data, flower hit
 * spheres, the resting camera pose, and per-flower focus poses. Pure
 * derivations of posts + live controls — no per-frame work.
 */
export const useGardenWorld = (
  posts: GardenPost[],
  controls: GardenControlValues,
) => {
  const { gridWidth, gridHeight, heightScale, octaves, frequency } = controls;

  const terrainData = useMemo(
    () =>
      generateTerrain(gridWidth, gridHeight, heightScale, octaves, frequency),
    [gridWidth, gridHeight, heightScale, octaves, frequency],
  );

  const { heads, eye, target } = useMemo(() => {
    const placements = layoutFlowers(posts, terrainData);
    const heads = flowerHeads(placements);

    // The camera stands ON the terrain at eye level as its initial (resting) pose.
    const c = GARDEN.camera;
    const eyeGround = sampleHeight(terrainData, 0, c.stripZ);
    const targetGround = sampleHeight(terrainData, 0, c.targetZ);
    const eye = new THREE.Vector3(
      0,
      (eyeGround <= -999 ? 0 : eyeGround) + c.eyeHeight,
      c.stripZ,
    );
    const target = new THREE.Vector3(
      0,
      (targetGround <= -999 ? 0 : targetGround) + c.targetHeight,
      c.targetZ,
    );
    return { heads, eye, target };
  }, [posts, terrainData]);

  // Focus poses: computed once per heads/terrain change.
  const focusPoses = useMemo<GardenFocusPose[]>(
    () =>
      heads.map((head) => {
        const dirFromCenter = new THREE.Vector3(head.x, 0, head.z);
        const len = dirFromCenter.length();
        const backDir =
          len > 0.001
            ? dirFromCenter.clone().normalize()
            : new THREE.Vector3(0, 0, 1);

        const eyePos = new THREE.Vector3(
          head.x + backDir.x * FOCUS_DISTANCE,
          head.y + FOCUS_HEIGHT,
          head.z + backDir.z * FOCUS_DISTANCE,
        );
        const lookAt = new THREE.Vector3(head.x, head.y, head.z);
        return { eyePos, lookAt };
      }),
    [heads],
  );

  return { terrainData, heads, eye, target, focusPoses };
};
