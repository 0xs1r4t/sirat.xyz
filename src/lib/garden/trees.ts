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

// Bottom fraction of the branch model's own height that never gets a leaf
// cluster, so the trunk reads as a visible trunk instead of disappearing
// into the canopy — clusters used to be picked by striding through the
// mesh's vertex *index* order, which has no relationship to height (it's
// whatever order the .obj's sub-objects export in), so clusters could and
// did land right down at the base.
const LEAF_BASE_EXCLUSION_FRACTION = 0.5;

/**
 * Port of `TreeFoliage::GenerateLeafClusters` (tree_foliage.cpp). Picks
 * `clustersPerBranch` attach points from the branch geometry's vertices —
 * above the trunk's base, spaced apart from each other — then scatters
 * leaves in a spherical distribution around each one.
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

  let minY = Infinity,
    maxY = -Infinity;
  for (let i = 0; i < vertexCount; i++) {
    const y = branchPositions[i * 3 + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const baseExclusionY = minY + (maxY - minY) * LEAF_BASE_EXCLUSION_FRACTION;

  const candidates: number[] = [];
  for (let i = 0; i < vertexCount; i++) {
    if (branchPositions[i * 3 + 1] >= baseExclusionY) candidates.push(i);
  }

  // Farthest-point sampling: greedily pick whichever remaining candidate is
  // farthest from every already-chosen point. Always yields exactly
  // clustersPerBranch points (or all candidates, if fewer) with maximally
  // even coverage — attach points used to be picked by index stride alone,
  // so two could land close enough in *space* (regardless of index
  // distance) for their leaf spheres to overlap almost entirely, z-fighting
  // where the quads coincide. Mirrors an anime-tree Blender tutorial's
  // reasoning for picking a subdivided cube over a UV-sphere as its
  // particle emitter — even spacing, no clumping — applied here to our real
  // branch-mesh candidates instead of switching to synthetic emitter
  // geometry (which would risk decoupling leaf clusters from where the
  // branches actually are). Complements the polygon-offset fix on the leaf
  // material (Trees.tsx), which handles whatever near-overlap remains
  // (including within a single cluster, never spacing-checked here or in
  // either reference implementation).
  const attachPoints: [number, number, number][] = [];
  if (candidates.length <= clustersPerBranch) {
    for (const idx of candidates) {
      attachPoints.push([
        branchPositions[idx * 3],
        branchPositions[idx * 3 + 1],
        branchPositions[idx * 3 + 2],
      ]);
    }
  } else {
    const pool = candidates.map(
      (idx): [number, number, number] => [
        branchPositions[idx * 3],
        branchPositions[idx * 3 + 1],
        branchPositions[idx * 3 + 2],
      ],
    );
    const seedIdx = Math.floor(rng() * pool.length);
    attachPoints.push(pool[seedIdx]);
    pool.splice(seedIdx, 1);

    while (attachPoints.length < clustersPerBranch && pool.length > 0) {
      let bestIdx = 0;
      let bestMinDist = -Infinity;
      for (let i = 0; i < pool.length; i++) {
        const [px, py, pz] = pool[i];
        let minDist = Infinity;
        for (const [cx, cy, cz] of attachPoints) {
          const d = Math.hypot(px - cx, py - cy, pz - cz);
          if (d < minDist) minDist = d;
        }
        if (minDist > bestMinDist) {
          bestMinDist = minDist;
          bestIdx = i;
        }
      }
      attachPoints.push(pool[bestIdx]);
      pool.splice(bestIdx, 1);
    }
  }

  const leaves: LocalLeafInstance[] = [];

  for (const [ax, ay, az] of attachPoints) {
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

// The user-facing "tree density" Leva dial always runs 0-10 — this is its
// fixed ceiling, not a config knob.
const MAX_TREE_DENSITY = 10;

/**
 * Tree count derived from terrain area and a 0-10 density dial, replacing a
 * flat constant so it scales with `gridWidth`/`gridHeight` instead of
 * needing to be re-picked by hand every time the terrain footprint changes.
 * `floor((area / 50) * (density / 10))` — e.g. a 36×50 terrain at density 4
 * gives floor((1800/50) * 0.4) = 14 trees.
 *
 * Floored at 1 (not 0) whenever density is actually turned on — the raw
 * formula rounds all the way down to 0 for small terrain/density
 * combinations (e.g. the smallest terrain, 5×5, gives floor(0.5)=0 even at
 * density=10), which reads as "the density dial does nothing" rather than
 * "there's just not much room". density=0 still means 0 trees.
 */
export const computeTreeCount = (
  gridWidth: number,
  gridHeight: number,
  density: number,
): number => {
  if (density <= 0) return 0;
  return Math.max(
    1,
    Math.floor(((gridWidth * gridHeight) / 50) * (density / MAX_TREE_DENSITY)),
  );
};

// Same 0-10 dial style as tree density. Default sits at the midpoint (5) so
// the unmoved slider reproduces today's tuned scaleRange/clustersPerBranch/
// leavesPerCluster exactly (multiplier 1.0); dragging it scales trunk size
// and canopy fullness together in the same direction, per-tree.
export const MAX_TREE_SIZE = 10;
export const DEFAULT_TREE_SIZE = 5;

/** 0.5x (size=0) to 1.5x (size=10) — half the dial shrinks, half grows, centered on today's tuned default. */
export const computeTreeSizeMultiplier = (size: number): number =>
  0.5 + (size / MAX_TREE_SIZE) * 1.0;

// Trunk radius (local X/Z) scales as sizeMultiplier^RADIAL_EXPONENT instead
// of linearly with height (local Y, sizeMultiplier^1) — uniform scaling
// preserves proportions, so without this a bigger tree was just a zoomed-in
// copy of a smaller one (same trunk width : height ratio) and never read as
// "thicker". Squaring gives 0.25x-2.25x, noticeably chunkier/spindlier than
// the 0.5x-1.5x height range, while still reproducing exactly 1.0x (no
// change) at the size=5 default.
export const RADIAL_EXPONENT = 2;
/** Trunk/branch radial (X/Z) scale — grows faster than height so bigger trees read as thicker, not just uniformly bigger. */
export const computeTreeRadialMultiplier = (size: number): number =>
  computeTreeSizeMultiplier(size) ** RADIAL_EXPONENT;

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
  scaleRange: [number, number] = GARDEN.trees.scaleRange,
): TreePlacement[] => {
  if (count <= 0) return [];

  const rng = mulberry32(seed);
  const halfWidth = (terrain.width * terrain.scale) / 2;
  const halfHeight = (terrain.height * terrain.scale) / 2;
  const { heightScale } = terrain;
  const t = GARDEN.trees;
  // These exclusion radii are flat constants — on a terrain small enough
  // for one of them to cover most/all of it, they'd reject every candidate
  // and silently place nothing, contradicting computeTreeCount's "at least
  // 1 tree" floor. Capped relative to the terrain's own extent so there's
  // always room outside them; unchanged at the default 20×20 size (every
  // cap below is already looser than its flat constant there).
  const corridorHalfWidth = Math.min(t.corridorHalfWidth, halfWidth * 0.5);
  const flowerExclusionRadius = Math.min(t.flowerExclusionRadius, halfWidth * 0.3);
  const minSpacing = Math.min(t.minSpacing, Math.max(halfWidth, halfHeight) * 0.5);

  const flowerHeads = layoutFlowers(posts, terrain);
  const placements: TreePlacement[] = [];

  // Small terrain + several rejection criteria means attempts need more
  // headroom than the C++ original's `count * 3` to reliably hit `count` —
  // and at low counts (the minimum-terrain "1 tree" case) `count * 20` is
  // too few tries against a valid region that can be a sliver of the
  // terrain once corridor + flower exclusion both apply, so it's floored.
  const maxAttempts = Math.max(count * 20, 200);

  for (let i = 0; i < maxAttempts && placements.length < count; i++) {
    const x = (rng() * 2 - 1) * halfWidth;
    const z = (rng() * 2 - 1) * halfHeight;
    const scale = scaleRange[0] + rng() * (scaleRange[1] - scaleRange[0]);

    const centerY = sampleHeight(terrain, x, z);
    if (centerY <= -999) continue; // off the heightmap

    const [, ny] = sampleNormal(terrain, x, z);
    if (ny <= t.slopeThreshold) continue;
    if (centerY <= -heightScale * 0.2 || centerY >= heightScale * 0.8) continue;

    if (Math.abs(x) < corridorHalfWidth) continue;

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
      if (Math.hypot(x - head.x, z - head.z) < flowerExclusionRadius) {
        tooCloseToFlower = true;
        break;
      }
    }
    if (tooCloseToFlower) continue;

    let tooCloseToTree = false;
    for (const existing of placements) {
      if (
        Math.hypot(x - existing.position[0], z - existing.position[2]) <
        minSpacing
      ) {
        tooCloseToTree = true;
        break;
      }
    }
    if (tooCloseToTree) continue;

    // Tether to the *lowest* point under the trunk's footprint, not just
    // the center — on a sloped patch, only sampling the center still lets
    // the uphill side of the ground rise above the trunk's base (visibly
    // poking through) while the downhill side floats. Sampling a small
    // ring around the center and keeping the minimum means the whole
    // footprint sits on or below ground, at the cost of a small
    // (invisible, grass-covered) gap on the downhill side instead of a
    // visible clip on the uphill side.
    const footprintRadius = scale * 0.5;
    let y = centerY;
    for (const [dx, dz] of [
      [footprintRadius, 0],
      [-footprintRadius, 0],
      [0, footprintRadius],
      [0, -footprintRadius],
    ] as const) {
      const h = sampleHeight(terrain, x + dx, z + dz);
      if (h > -999) y = Math.min(y, h);
    }

    placements.push({
      position: [x, y, z],
      scale,
      rotationY: rng() * Math.PI * 2,
      treeType: rng() < 0.5 ? "normal" : "thick",
    });
  }

  return placements;
};
