"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three/webgpu";
import { attribute, floor, mod, texture, uniform, uv, vec2, vec3 } from "three/tsl";
import { mergeBufferGeometries } from "three-stdlib";

import {
  placeTrees,
  generateLeafClusters,
  computeTreeCount,
  type TreeType,
} from "@/lib/garden/trees";
import { GARDEN, type GardenPost } from "@/lib/garden/meadow";
import type { TerrainData } from "@/lib/garden/terrain";
import type { GardenPalette } from "@graphics/Garden/useGardenTheme";
import {
  DAY_BARK_BAND,
  DAY_LEAF_BAND,
  FOLIAGE_LIGHT_DIR,
  MODELS,
  NIGHT_BARK_BAND,
  NIGHT_LEAF_BAND,
  TEXTURES,
} from "@graphics/Garden/constants";
import {
  computeBranchNormal,
  computeBranchPosition,
  getBranchColor,
} from "@graphics/Garden/tsl/branch";
import { computeLeafWind, computeLeafPosition, getLeafColor } from "@graphics/Garden/tsl/leaf";
import { applyGardenFog } from "@graphics/Garden/tsl/fog";

const TREE_TYPES: TreeType[] = ["normal", "thick"];

/**
 * Merges every Mesh in a loaded glTF scene into one geometry, each baked
 * with its own node transform first.
 *
 * Two real gotchas found by actually inspecting the converted assets rather
 * than assuming a single mesh:
 * - Plain `obj2gltf` output has **10 separate mesh nodes** per tree (the
 *   source .obj has 10 named sub-objects/branch segments), all at identity
 *   transform — grabbing only the first one (an earlier version of this
 *   function did) silently used ~1/10th of the branch.
 * - Running the result through `gltf-transform optimize` collapses those
 *   into one mesh, but its quantization step re-encodes `position` as
 *   normalized Int16 with a compensating node transform — and manually
 *   baking that via `geometry.applyMatrix4(mesh.matrixWorld)` does *not*
 *   correctly dequantize it (confirmed by reading the raw attribute array
 *   afterward: values still sat at ±32700, exactly the Int16 range). Rather
 *   than fight three's quantized-attribute handling, `optimize` is skipped
 *   entirely — it was only ever a nice-to-have for file size (plan item
 *   4.1's own framing), and correctness matters more than ~85KB.
 *
 * The C++ original read raw OBJ vertices straight from `mesh.vertices` with
 * no wrapping transform at all, so baking each node's (here: identity)
 * transform and merging is the closest equivalent — and stays correct even
 * if a future re-export introduces real per-node transforms.
 */
const extractMergedGeometry = (gltf: { scene: THREE.Object3D }): THREE.BufferGeometry => {
  gltf.scene.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  gltf.scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      const baked = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld).toNonIndexed();
      // Only position/normal survive the merge — branches have no texture
      // (bark color is 100% procedural, confirmed via the source .mtl
      // having no texture map), so UV isn't needed downstream.
      parts.push(
        new THREE.BufferGeometry().setAttribute("position", baked.getAttribute("position")).setAttribute("normal", baked.getAttribute("normal")),
      );
    }
  });
  if (parts.length === 0) throw new Error("Trees.tsx: no mesh found in loaded tree model");
  const merged = mergeBufferGeometries(parts, false);
  if (!merged) throw new Error("Trees.tsx: failed to merge tree branch sub-meshes");
  return merged;
};

/** Bounding sphere from a flat list of world positions, padded for the tree's own extent + wind sway. */
const computeInstancedBoundingSphere = (
  positions: Float32Array,
  pad: number,
): THREE.Sphere => {
  const box = new THREE.Box3();
  for (let i = 0; i < positions.length; i += 3) {
    box.expandByPoint(
      new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]),
    );
  }
  box.expandByScalar(pad);
  return box.getBoundingSphere(new THREE.Sphere());
};

/** Small quad centered at its origin (-0.5..0.5), matching tree_foliage.cpp's `setupQuadMesh` — distinct from Foliage.tsx's base-anchored grass/flower quad. */
const makeCenteredQuad = (): THREE.InstancedBufferGeometry => {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(
      // prettier-ignore
      new Float32Array([
        -0.5, -0.5, 0,
         0.5, -0.5, 0,
         0.5,  0.5, 0,
        -0.5,  0.5, 0,
      ]),
      3,
    ),
  );
  geo.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2),
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  return geo;
};

interface TreesProps {
  terrainData: TerrainData;
  palette: GardenPalette;
  posts: GardenPost[];
  count?: number;
  fogNear?: number;
  fogFar?: number;
  /** Zeroes branch/leaf wind, matching Foliage.tsx's grass/flowers — also required for screenshot-harness determinism, see computeLeafWind's note. */
  reducedMotion?: boolean;
}

// Wind constants ported verbatim from branch.vert/leaf.vert (not
// Leva-tunable, matching the C++ original — grass/flowers have user-facing
// wind sliders, trees never did).
const BRANCH_WIND_SPEED = 0.5;
const BRANCH_WIND_STRENGTH = 0.04;
const LEAF_WIND_SPEED = 0.7;
const LEAF_WIND_STRENGTH = 0.12;

/** Scattered trees: branches + leaf-cluster canopies, both instanced by type (plan Phase 3). */
export default function Trees({
  terrainData,
  palette,
  posts,
  count = computeTreeCount(
    terrainData.width,
    terrainData.height,
    GARDEN.trees.density,
  ),
  fogNear = GARDEN.fog.near,
  fogFar = GARDEN.fog.far,
  reducedMotion = false,
}: TreesProps) {
  const normalGltf = useGLTF(MODELS.normalTreeBranch);
  const thickGltf = useGLTF(MODELS.thickTreeBranch);
  const leavesAtlas = useTexture(TEXTURES.leavesAtlas);
  leavesAtlas.colorSpace = THREE.SRGBColorSpace;

  // Baked branch geometry per type — depends only on the loaded models, not
  // on placement/posts, so it's its own memo (avoids re-extracting on every
  // treeCount/posts change).
  const branchGeometryByType = useMemo(
    () => ({
      normal: extractMergedGeometry(normalGltf),
      thick: extractMergedGeometry(thickGltf),
    }),
    [normalGltf, thickGltf],
  );

  // Leaf-cluster templates, one per type, generated once from that type's
  // branch geometry — GenerateLeafClusters(clustersPerBranch, leavesPerCluster)
  // from tree_foliage.cpp. Shared by every tree instance of that type.
  const leafTemplateByType = useMemo(() => {
    const positionAttr = (t: TreeType) =>
      branchGeometryByType[t].getAttribute("position").array as Float32Array;
    return {
      normal: generateLeafClusters(
        positionAttr("normal"),
        GARDEN.trees.normal.clustersPerBranch,
        GARDEN.trees.normal.leavesPerCluster,
        GARDEN.trees.leafSeed,
      ),
      thick: generateLeafClusters(
        positionAttr("thick"),
        GARDEN.trees.thick.clustersPerBranch,
        GARDEN.trees.thick.leavesPerCluster,
        GARDEN.trees.leafSeed,
      ),
    };
  }, [branchGeometryByType]);

  const placements = useMemo(
    () => placeTrees(terrainData, posts, count, GARDEN.trees.placementSeed),
    [terrainData, posts, count],
  );

  const {
    branchGeometries,
    leafGeometries,
    branchMat,
    leafMat,
    branchBandMulUniform,
    leafBandMulUniform,
    branchFogNearUniform,
    branchFogFarUniform,
    leafFogNearUniform,
    leafFogFarUniform,
    branchWindSpeedUniform,
    branchWindStrengthUniform,
    leafWindSpeedUniform,
    leafWindStrengthUniform,
  } = useMemo(() => {
    const lightDirUniform = uniform(FOLIAGE_LIGHT_DIR.clone());
    const fogColorUniform = uniform(palette.background);

    // ── Branch material (shared by both types' geometries) ────────────────
    const branchBandMulUniform = uniform(NIGHT_BARK_BAND.clone());
    const branchFogNearUniform = uniform(fogNear);
    const branchFogFarUniform = uniform(fogFar);
    const branchWindSpeedUniform = uniform(BRANCH_WIND_SPEED);
    const branchWindStrengthUniform = uniform(BRANCH_WIND_STRENGTH);

    const branchMat = new THREE.MeshBasicNodeMaterial();
    branchMat.side = THREE.FrontSide;

    const branchWorldPos: any = computeBranchPosition(
      branchWindSpeedUniform,
      branchWindStrengthUniform,
    );
    const branchWorldNormal: any = computeBranchNormal();
    branchMat.positionNode = branchWorldPos;
    branchMat.colorNode = applyGardenFog(
      getBranchColor(branchWorldPos, branchWorldNormal, lightDirUniform, branchBandMulUniform),
      branchWorldPos,
      fogColorUniform,
      branchFogNearUniform,
      branchFogFarUniform,
    );

    // ── Leaf material (shared by both types' geometries) ──────────────────
    const leafBandMulUniform = uniform(NIGHT_LEAF_BAND.clone());
    const leafFogNearUniform = uniform(fogNear);
    const leafFogFarUniform = uniform(fogFar);
    const leafWindSpeedUniform = uniform(LEAF_WIND_SPEED);
    const leafWindStrengthUniform = uniform(LEAF_WIND_STRENGTH);

    const leafMat = new THREE.MeshBasicNodeMaterial();
    leafMat.transparent = true;
    leafMat.depthWrite = true;
    leafMat.side = THREE.DoubleSide;
    leafMat.alphaTest = 0.3; // matches leaf.frag's `alpha < 0.3 discard`

    const instanceOffset: any = attribute("instanceOffset", "vec3");
    const customNormalAttr: any = attribute("customNormal", "vec3");
    const instanceScaleAttr: any = attribute("instanceScale", "float");
    const textureIndexAttr: any = attribute("textureIndex", "float");

    const windPacked: any = computeLeafWind(
      instanceOffset,
      leafWindSpeedUniform,
      leafWindStrengthUniform,
    );
    const windCenter: any = instanceOffset.add(windPacked.xyz);
    const leafWorldPos: any = computeLeafPosition(windCenter, instanceScaleAttr);
    leafMat.positionNode = leafWorldPos;

    const col: any = mod(textureIndexAttr, 2);
    const row: any = floor(textureIndexAttr.div(2));
    const atlasUV: any = uv().mul(0.5).add(vec2(col.mul(0.5), row.mul(0.5)));
    const texColor: any = texture(leavesAtlas, atlasUV);

    const shaded: any = getLeafColor(
      leafWorldPos,
      customNormalAttr,
      lightDirUniform,
      windPacked.w,
      leafBandMulUniform,
    );
    leafMat.colorNode = applyGardenFog(
      shaded,
      leafWorldPos,
      fogColorUniform,
      leafFogNearUniform,
      leafFogFarUniform,
    );
    leafMat.opacityNode = texColor.r; // atlas red channel is the mask, matches grass/leaf.frag convention

    // ── Per-type instanced geometries ──────────────────────────────────────
    const branchGeometries: Record<TreeType, THREE.InstancedBufferGeometry> = {
      normal: new THREE.InstancedBufferGeometry(),
      thick: new THREE.InstancedBufferGeometry(),
    };
    const leafGeometries: Record<TreeType, THREE.InstancedBufferGeometry> = {
      normal: makeCenteredQuad(),
      thick: makeCenteredQuad(),
    };

    for (const type of TREE_TYPES) {
      const treesOfType = placements.filter((p) => p.treeType === type);

      // Branches: base geometry's attributes carried over from the loaded
      // model (set individually, not `.copy()` — InstancedBufferGeometry's
      // `copy()` is typed to only accept another InstancedBufferGeometry),
      // plus one instance entry per tree of this type.
      const branchGeo = branchGeometries[type];
      const source = branchGeometryByType[type];
      branchGeo.setAttribute("position", source.getAttribute("position"));
      branchGeo.setAttribute("normal", source.getAttribute("normal"));
      const sourceUv = source.getAttribute("uv");
      if (sourceUv) branchGeo.setAttribute("uv", sourceUv);
      if (source.index) branchGeo.setIndex(source.index);
      branchGeo.instanceCount = treesOfType.length;

      const offsets = new Float32Array(treesOfType.length * 3);
      const rotations = new Float32Array(treesOfType.length);
      const scales = new Float32Array(treesOfType.length);
      treesOfType.forEach((tree, i) => {
        offsets[i * 3] = tree.position[0];
        offsets[i * 3 + 1] = tree.position[1];
        offsets[i * 3 + 2] = tree.position[2];
        rotations[i] = tree.rotationY;
        scales[i] = tree.scale;
      });
      branchGeo.setAttribute("instanceOffset", new THREE.InstancedBufferAttribute(offsets, 3));
      branchGeo.setAttribute("instanceRotationY", new THREE.InstancedBufferAttribute(rotations, 1));
      branchGeo.setAttribute("instanceScale", new THREE.InstancedBufferAttribute(scales, 1));
      branchGeo.boundingSphere = computeInstancedBoundingSphere(offsets, 6);

      // Leaves: for every tree of this type, transform that type's shared
      // local leaf-cluster template by the tree's world transform (rotateY
      // + uniform scale + translate) and pack into one big instance buffer
      // — same precompute-once-per-scene approach Foliage.tsx uses for
      // grass chunks, keyed by tree instead of spatial chunk.
      const template = leafTemplateByType[type];
      const leafCount = treesOfType.length * template.length;
      const leafOffsets = new Float32Array(leafCount * 3);
      const leafNormals = new Float32Array(leafCount * 3);
      const leafScales = new Float32Array(leafCount);
      const leafTexIdx = new Float32Array(leafCount);

      let w = 0;
      for (const tree of treesOfType) {
        const cosR = Math.cos(tree.rotationY);
        const sinR = Math.sin(tree.rotationY);
        for (const leaf of template) {
          const [lx, ly, lz] = leaf.localPosition;
          const rx = lx * cosR + lz * sinR;
          const rz = lz * cosR - lx * sinR;
          leafOffsets[w * 3] = rx * tree.scale + tree.position[0];
          leafOffsets[w * 3 + 1] = ly * tree.scale + tree.position[1];
          leafOffsets[w * 3 + 2] = rz * tree.scale + tree.position[2];

          const [nx, ny, nz] = leaf.customNormal;
          leafNormals[w * 3] = nx * cosR + nz * sinR;
          leafNormals[w * 3 + 1] = ny;
          leafNormals[w * 3 + 2] = nz * cosR - nx * sinR;

          leafScales[w] = leaf.scale * tree.scale;
          leafTexIdx[w] = leaf.textureIndex;
          w++;
        }
      }

      const leafGeo = leafGeometries[type];
      leafGeo.instanceCount = leafCount;
      leafGeo.setAttribute("instanceOffset", new THREE.InstancedBufferAttribute(leafOffsets, 3));
      leafGeo.setAttribute("customNormal", new THREE.InstancedBufferAttribute(leafNormals, 3));
      leafGeo.setAttribute("instanceScale", new THREE.InstancedBufferAttribute(leafScales, 1));
      leafGeo.setAttribute("textureIndex", new THREE.InstancedBufferAttribute(leafTexIdx, 1));
      leafGeo.boundingSphere = computeInstancedBoundingSphere(leafOffsets, 3);
    }

    return {
      branchGeometries,
      leafGeometries,
      branchMat,
      leafMat,
      branchBandMulUniform,
      leafBandMulUniform,
      branchFogNearUniform,
      branchFogFarUniform,
      leafFogNearUniform,
      leafFogFarUniform,
      branchWindSpeedUniform,
      branchWindStrengthUniform,
      leafWindSpeedUniform,
      leafWindStrengthUniform,
    };
    // fogNear/fogFar intentionally omitted: live-mutated uniforms, see the
    // useFrame below — matches Foliage.tsx's Grass/Flowers pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placements, branchGeometryByType, leafTemplateByType, palette, leavesAtlas]);

  useEffect(
    () => () => {
      for (const type of TREE_TYPES) {
        branchGeometries[type].dispose();
        leafGeometries[type].dispose();
      }
      branchMat.dispose();
      leafMat.dispose();
    },
    [branchGeometries, leafGeometries, branchMat, leafMat],
  );

  useFrame(() => {
    const branchBand = palette.isDark.current ? NIGHT_BARK_BAND : DAY_BARK_BAND;
    const leafBand = palette.isDark.current ? NIGHT_LEAF_BAND : DAY_LEAF_BAND;
    branchBandMulUniform.value.copy(branchBand);
    leafBandMulUniform.value.copy(leafBand);
    branchFogNearUniform.value = fogNear;
    branchFogFarUniform.value = fogFar;
    leafFogNearUniform.value = fogNear;
    leafFogFarUniform.value = fogFar;
    branchWindSpeedUniform.value = reducedMotion ? 0 : BRANCH_WIND_SPEED;
    branchWindStrengthUniform.value = reducedMotion ? 0 : BRANCH_WIND_STRENGTH;
    leafWindSpeedUniform.value = reducedMotion ? 0 : LEAF_WIND_SPEED;
    leafWindStrengthUniform.value = reducedMotion ? 0 : LEAF_WIND_STRENGTH;
  });

  return (
    <>
      {TREE_TYPES.map((type) => (
        <mesh
          key={`branch-${type}`}
          geometry={branchGeometries[type]}
          material={branchMat}
          frustumCulled={true}
        />
      ))}
      {TREE_TYPES.map((type) => (
        <mesh
          key={`leaf-${type}`}
          geometry={leafGeometries[type]}
          material={leafMat}
          frustumCulled={true}
        />
      ))}
    </>
  );
}

useGLTF.preload(MODELS.normalTreeBranch);
useGLTF.preload(MODELS.thickTreeBranch);
