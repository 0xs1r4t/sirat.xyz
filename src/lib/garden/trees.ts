import { sampleHeight, sampleNormal, type TerrainData } from "@/lib/garden/terrain";
import { mulberry32 } from "@/lib/garden/noise";
import { GARDEN, layoutFlowers, type GardenPost } from "@/lib/garden/meadow";

export type TreeType = "normal" | "thick";

/** One placed tree — world position + the transform Trees.tsx instances the branch/leaf geometry with. */
export interface TreePlacement {
  position: [number, number, number];
  scale: number;
  rotationY: number; // radians
  treeType: TreeType;
}

/** One leaf, in branch-local space (pre tree world-transform) — shared by every tree of a given type. */
export interface LocalLeafInstance {
  localPosition: [number, number, number];
  customNormal: [number, number, number];
  scale: number;
  textureIndex: 0 | 1 | 2 | 3;
}

/**
 * Port of `TreeFoliage::GenerateLeafClusters` (tree_foliage.cpp). Samples
 * attach points by striding through the branch geometry's vertices, then
 * scatters leaves in a spherical distribution around each attach point.
 *
 * The KodiakWhale trick, verbatim from the original: `emitterNormal =
 * normalize(attachPoint)` treats the *whole branch model's local origin* as
 * a sphere center (not a proper per-attach-point local sphere), and each
 * leaf's shading normal blends 70% toward that outward-from-center
 * direction, 30% toward its own local offset direction. This is what makes
 * the canopy shade like a rounded blob instead of confetti — losing it
 * would be a real regression, not a cosmetic simplification.
 *
 * Run once per tree *type* (the result only depends on the branch mesh,
 * shared by every tree instance of that type), not per placed tree.
 */
export const generateLeafClusters = (
  branchPositions: Float32Array, // flat xyz triples, branch-local space
  clustersPerBranch: number,
  leavesPerCluster: number,
  seed: number,
): LocalLeafInstance[] => {
  const rng = mulberry32(seed);
  const vertexCount = branchPositions.length / 3;
  const step = Math.max(1, Math.floor(vertexCount / clustersPerBranch));

  const leaves: LocalLeafInstance[] = [];

  for (let i = 0; i < vertexCount; i += step) {
    const ax = branchPositions[i * 3];
    const ay = branchPositions[i * 3 + 1];
    const az = branchPositions[i * 3 + 2];

    const radius = 0.8 + rng() * 0.4; // 0.8-1.2 units, matching C++

    const aLen = Math.hypot(ax, ay, az) || 1;
    const enx = ax / aLen;
    const eny = ay / aLen;
    const enz = az / aLen;

    for (let j = 0; j < leavesPerCluster; j++) {
      const theta = rng() * 2 * Math.PI;
      const phi = Math.acos(2 * rng() - 1);
      const r = radius * Math.cbrt(rng()); // uniform sphere distribution

      const ox = r * Math.sin(phi) * Math.cos(theta);
      const oy = r * Math.sin(phi) * Math.sin(theta);
      const oz = r * Math.cos(phi);

      const oLen = Math.hypot(ox, oy, oz) || 1;
      const lnx = ox / oLen;
      const lny = oy / oLen;
      const lnz = oz / oLen;

      let cnx = 0.7 * enx + 0.3 * lnx;
      let cny = 0.7 * eny + 0.3 * lny;
      let cnz = 0.7 * enz + 0.3 * lnz;
      const cLen = Math.hypot(cnx, cny, cnz) || 1;
      cnx /= cLen;
      cny /= cLen;
      cnz /= cLen;

      leaves.push({
        localPosition: [ax + ox, ay + oy, az + oz],
        customNormal: [cnx, cny, cnz],
        scale: 1 + rng() * 0.5,
        textureIndex: Math.floor(rng() * 4) as 0 | 1 | 2 | 3,
      });
    }
  }

  return leaves;
};

/**
 * Port of `TreeManager::generateTreePositions` (tree_manager.cpp):
 * rejection-sample positions across the terrain, checking slope/height
 * suitability, the exclusion zone, and spacing from already-placed trees.
 *
 * Exclusion zone deliberately replaces the C++ original's fairy-exclusion
 * (plan item 4.4's own recommendation, no fairy in this port) with a
 * **camera-corridor + flower-band exclusion**: the strip camera looks
 * straight down -z from a fixed x≈0, so any tree near the center line at
 * any depth would sit in view — a full-depth center-strip exclusion,
 * not a C++-style bounded wedge, is what actually keeps the hero view
 * clear. Flower heads get their own small radius on top, since a
 * post's flower can sit near the edge of the corridor.
 */
export const placeTrees = (
  terrain: TerrainData,
  posts: GardenPost[],
  count: number,
  seed: number,
): TreePlacement[] => {
  if (count <= 0) return [];

  const rng = mulberry32(seed);
  const halfWidth = (terrain.width * terrain.scale) / 2;
  const halfHeight = (terrain.height * terrain.scale) / 2;
  const { heightScale } = terrain;
  const t = GARDEN.trees;

  const flowerHeads = layoutFlowers(posts, terrain);
  const placements: TreePlacement[] = [];

  // Small terrain + several rejection criteria means attempts need more
  // headroom than the C++ original's `count * 3` to reliably hit `count`.
  const maxAttempts = count * 20;

  for (let i = 0; i < maxAttempts && placements.length < count; i++) {
    const x = (rng() * 2 - 1) * halfWidth;
    const z = (rng() * 2 - 1) * halfHeight;

    const y = sampleHeight(terrain, x, z);
    if (y <= -999) continue; // off the heightmap

    const [, ny] = sampleNormal(terrain, x, z);
    if (ny <= t.slopeThreshold) continue;
    if (y <= -heightScale * 0.2 || y >= heightScale * 0.8) continue;

    if (Math.abs(x) < t.corridorHalfWidth) continue;

    // The corridor check above only excludes a center strip — a tree just
    // outside it can still sit right next to the camera and loom
    // disproportionately large in frame (confirmed visually: a tree at
    // x≈6.5, z≈3 with the camera standing at (0, GARDEN.camera.stripZ)
    // dominated most of one side of the resting view). A simple radius
    // around the camera's own position catches that the corridor's
    // x-only check misses.
    if (Math.hypot(x, z - GARDEN.camera.stripZ) < t.cameraExclusionRadius) continue;

    let tooCloseToFlower = false;
    for (const head of flowerHeads) {
      if (Math.hypot(x - head.x, z - head.z) < t.flowerExclusionRadius) {
        tooCloseToFlower = true;
        break;
      }
    }
    if (tooCloseToFlower) continue;

    let tooCloseToTree = false;
    for (const existing of placements) {
      if (
        Math.hypot(x - existing.position[0], z - existing.position[2]) <
        t.minSpacing
      ) {
        tooCloseToTree = true;
        break;
      }
    }
    if (tooCloseToTree) continue;

    placements.push({
      position: [x, y, z],
      scale: t.scaleRange[0] + rng() * (t.scaleRange[1] - t.scaleRange[0]),
      rotationY: rng() * Math.PI * 2,
      treeType: rng() < 0.5 ? "normal" : "thick",
    });
  }

  return placements;
};
