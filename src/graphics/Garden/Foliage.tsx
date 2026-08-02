"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three/webgpu";
import {
  and,
  attribute,
  cameraPosition,
  cameraViewMatrix,
  cross,
  dot,
  float,
  greaterThanEqual,
  length,
  mix,
  positionGeometry,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";

import {
  computeInstanceCount,
  sampleHeight,
  sampleNormal,
  type TerrainData,
} from "@/lib/garden/terrain";
import { mulberry32 } from "@/lib/garden/noise";
import { layoutFlowers, GARDEN, type GardenPost } from "@/lib/garden/meadow";
import type { GardenPalette } from "@graphics/Garden/useGardenTheme";
import { FOLIAGE_LIGHT_DIR, TEXTURES } from "@graphics/Garden/constants";
import { GRASS_DARK, GRASS_MID, GRASS_TIP, celShadeSmoothBands } from "@graphics/Garden/tsl/colors";
import { applyGardenFog } from "@graphics/Garden/tsl/fog";
import { computeWind, computeWindLowTier } from "@graphics/Garden/tsl/wind";

// ── Grass scatter — port of web-terrain's generatePositions ─────────────────
// Slope-checked random scatter across the terrain slab, bucketed into
// CHUNK_SIZE world-unit cells so each chunk becomes its own draw call with
// its own bounding sphere (plan item 5.1 — chunked frustum culling).
const CHUNK_SIZE = 8;

interface GrassChunk {
  positions: Float32Array;
  windPhases: Float32Array;
  count: number;
}

const generateGrassChunks = (
  count: number,
  td: TerrainData,
  seed: number,
  slopeThreshold: number,
): GrassChunk[] => {
  const rng = mulberry32(seed);
  const hw = (td.width * td.scale) / 2;
  const hh = (td.height * td.scale) / 2;
  const buckets = new Map<
    string,
    { positions: number[]; phases: number[] }
  >();

  let placed = 0;
  for (let i = 0; i < count * 2 && placed < count; i++) {
    const wx = rng() * td.width * td.scale - hw;
    const wz = rng() * td.height * td.scale - hh;
    const wy = sampleHeight(td, wx, wz);
    if (wy <= -999) continue;

    const [, ny] = sampleNormal(td, wx, wz);
    if (ny <= slopeThreshold) continue;

    const key = `${Math.floor(wx / CHUNK_SIZE)},${Math.floor(wz / CHUNK_SIZE)}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { positions: [], phases: [] };
      buckets.set(key, bucket);
    }
    bucket.positions.push(wx, wy, wz);
    bucket.phases.push(rng() * Math.PI * 2);
    placed++;
  }

  return Array.from(buckets.values()).map((b) => ({
    positions: new Float32Array(b.positions),
    windPhases: new Float32Array(b.phases),
    count: b.positions.length / 3,
  }));
};

/**
 * A chunk's `InstancedBufferGeometry` only stores the shared quad's tiny
 * local-space corners in its `position` attribute — three's automatic
 * `computeBoundingSphere()` has no idea the real per-instance offsets (a
 * separate `InstancedBufferAttribute`, not the standard `instanceMatrix`
 * three's own culling logic knows about) spread instances across the whole
 * chunk. Build the real one by hand from the actual scattered root
 * positions, padded for blade height and wind sway, or frustum culling
 * either does nothing or culls chunks that are still on screen.
 */
const computeChunkBoundingSphere = (
  chunk: GrassChunk,
  tuftWidth: number,
  tuftHeight: number,
): THREE.Sphere => {
  const box = new THREE.Box3();
  for (let i = 0; i < chunk.count; i++) {
    box.expandByPoint(
      new THREE.Vector3(
        chunk.positions[i * 3],
        chunk.positions[i * 3 + 1],
        chunk.positions[i * 3 + 2],
      ),
    );
  }
  const windMargin = 1; // generous fixed pad for wind sway
  box.min.x -= tuftWidth / 2 + windMargin;
  box.max.x += tuftWidth / 2 + windMargin;
  box.min.z -= tuftWidth / 2 + windMargin;
  box.max.z += tuftWidth / 2 + windMargin;
  box.max.y += tuftHeight + windMargin * 0.3; // blades grow upward from root
  return box.getBoundingSphere(new THREE.Sphere());
};

/** Shared billboard quad, anchored at its base. */
const makeQuad = (
  width: number,
  height: number,
): THREE.InstancedBufferGeometry => {
  const hw = width / 2;
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(
      // prettier-ignore
      new Float32Array([
        -hw, 0, 0,
         hw, 0, 0,
         hw, height, 0,
        -hw, height, 0,
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

// ═════════════════════════════════════════════════════════════════════════════
// Grass — TSL port of grass.vert/grass.frag (docs/garden-webgpu-plan.md 3.5)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Full 4-tier LOD density carpet (plan item 5.2): 100% under 8 units
 * (ultra-near), fading 1.0→0.7 out to 15 (near), 0.7→0.35 out to 35 (mid),
 * then 0.35→0 out to `farDist` (60 by default; device tiers pass a lower
 * value — e.g. 40 for the low tier — to thin the carpet further out).
 * Ultra-near/near/mid breakpoints stay fixed; only farDist is tier-tunable,
 * matching the plan's "expose farDistance per tier".
 */
const computeDensityThreshold = (dist: any, farDist: any) => {
  const ultraNear = float(8);
  const near = float(15);
  const mid = float(35);

  const tNear: any = dist.sub(ultraNear).div(near.sub(ultraNear)).clamp(0, 1);
  const nearVal: any = mix(1, 0.7, tNear);

  const tMid: any = dist.sub(near).div(mid.sub(near)).clamp(0, 1);
  const midVal: any = mix(0.7, 0.35, tMid);

  const tFar: any = dist.sub(mid).div(float(farDist).sub(mid).max(0.001)).clamp(0, 1);
  const farVal: any = mix(0.35, 0, tFar);

  return dist
    .lessThan(ultraNear)
    .select(1, dist.lessThan(near).select(nearVal, dist.lessThan(mid).select(midVal, farVal)));
};

/**
 * Deterministic hash matching the GLSL original's bitwise position hash
 * (`uint(pos.x * 73856093.0) ^ uint(pos.z * 19349663.0)`).
 */
const densityHash = (pos: any) => {
  const hx: any = pos.x.abs().mul(73856093).toUint();
  const hz: any = pos.z.abs().mul(19349663).toUint();
  const h: any = hx.bitXor(hz);
  return h.mod(1000).toFloat().div(1000);
};

/** Matches the GLSL original's distance-scale falloff (1.0 -> 0.7 over 15-45 units). */
const computeDistanceScale = (dist: any) => {
  const t: any = dist.sub(15).div(30).clamp(0, 1);
  return dist.lessThanEqual(15).select(1, mix(1, 0.7, t));
};

interface GrassProps {
  terrainData: TerrainData;
  palette: GardenPalette;
  windSpeed?: number;
  windStrength?: number;
  /** instances/m² — actual instance count is derived from this × terrain area (docs/features.md #2). */
  density?: number;
  tuftWidth?: number;
  tuftHeight?: number;
  slopeThreshold?: number;
  fogNear?: number;
  fogFar?: number;
  /** LOD cull distance (plan 5.2) — device tiers (5.4) pass a lower value. */
  farDistance?: number;
  /** Wind octave count (plan 5.4) — low tier passes 2 instead of 3. */
  windOctaves?: 2 | 3;
}

/** Instanced grass carpet: scattered, wind-animated blades over the terrain slab. */
export const Grass = ({
  terrainData,
  palette,
  windSpeed = GARDEN.wind.speed,
  windStrength = GARDEN.wind.strength,
  density = GARDEN.grass.density,
  tuftWidth = GARDEN.grass.tuftWidth,
  tuftHeight = GARDEN.grass.tuftHeight,
  slopeThreshold = GARDEN.grass.slopeThreshold,
  fogNear = GARDEN.fog.near,
  fogFar = GARDEN.fog.far,
  farDistance = 60,
  windOctaves = 3,
}: GrassProps) => {
  const grassTex = useTexture(TEXTURES.grass);

  const {
    geometries,
    mat,
    windSpeedUniform,
    windStrengthUniform,
    fogNearUniform,
    fogFarUniform,
    farDistUniform,
  } = useMemo(() => {
    const g = GARDEN.grass;
    const count = computeInstanceCount(terrainData, density);
    const chunks = generateGrassChunks(count, terrainData, g.seed, slopeThreshold);

    // One InstancedBufferGeometry per chunk, sharing the single material
    // built below — O(chunks) draw calls (~dozens), each with a real
    // boundingSphere so three culls whole chunks that are off-screen
    // instead of running every instance's vertex shader every frame.
    const geometries = chunks.map((chunk) => {
      const geo = makeQuad(tuftWidth, tuftHeight);
      geo.instanceCount = chunk.count;
      geo.setAttribute(
        "instanceOffset",
        new THREE.InstancedBufferAttribute(chunk.positions, 3),
      );
      geo.setAttribute(
        "windPhase",
        new THREE.InstancedBufferAttribute(chunk.windPhases, 1),
      );
      geo.boundingSphere = computeChunkBoundingSphere(
        chunk,
        tuftWidth,
        tuftHeight,
      );
      return geo;
    });

    const windSpeedUniform = uniform(windSpeed);
    const windStrengthUniform = uniform(windStrength);
    const lightDirUniform = uniform(FOLIAGE_LIGHT_DIR.clone());
    const farDistUniform = uniform(farDistance);
    const fogColorUniform = uniform(palette.background);
    const fogNearUniform = uniform(fogNear);
    const fogFarUniform = uniform(fogFar);

    const mat = new THREE.MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = true;
    mat.side = THREE.DoubleSide;
    // The GLSL original had two alpha cutoffs — an explicit `discard` at
    // 0.2 inside the fragment shader, and a separate material `alphaTest`
    // of 0.01. Since both compared the same value (the mask's red
    // channel), the 0.2 discard always dominated; collapsing them into one
    // `alphaTest = 0.2` keeps identical behaviour through the simpler,
    // well-supported mechanism instead of hand-rolling a Discard() node.
    mat.alphaTest = 0.2;

    const instanceOffset: any = attribute("instanceOffset", "vec3");
    const windPhase: any = attribute("windPhase", "float");

    const distFromCamera: any = length(cameraPosition.sub(instanceOffset));
    const densityThreshold = computeDensityThreshold(
      distFromCamera,
      farDistUniform,
    );
    const culled = greaterThanEqual(densityHash(instanceOffset), densityThreshold);

    const heightFactor: any = positionGeometry.y;
    const heightInfluence: any = heightFactor.mul(heightFactor);
    const windFn = windOctaves >= 3 ? computeWind : computeWindLowTier;
    const windPacked: any = windFn(
      instanceOffset,
      windSpeedUniform,
      windStrengthUniform,
      heightInfluence,
      windPhase,
    );
    const windOffset3: any = vec3(windPacked.x, 0, windPacked.y);
    const windInfluence: any = windPacked.z;
    const instancePosWithWind: any = instanceOffset.add(windOffset3);

    // Per-instance cylindrical billboard: each blade fans toward the
    // camera individually (Phase 1 item 1.8).
    const toCameraFlat: any = vec3(
      cameraPosition.sub(instancePosWithWind).x,
      0,
      cameraPosition.sub(instancePosWithWind).z,
    ).normalize();
    const cameraRight: any = cross(vec3(0, 1, 0), toCameraFlat).normalize();
    const cameraUp = vec3(0, 1, 0);

    const distScale = computeDistanceScale(distFromCamera);
    const scale: any = culled.select(float(0), distScale);

    const fragPos: any = instancePosWithWind
      .add(cameraRight.mul(positionGeometry.x.mul(scale)))
      .add(cameraUp.mul(positionGeometry.y.mul(scale)));

    mat.positionNode = fragPos;

    // ── Fragment ──────────────────────────────────────────────────────────
    const texColor = texture(grassTex, uv());
    const alpha = texColor.r;

    const safeLight: any = lightDirUniform.negate().normalize();
    let lightIntensity: any = dot(safeLight, vec3(0, 1, 0)).mul(0.5).add(0.5);
    lightIntensity = lightIntensity.add(windInfluence.mul(heightFactor).mul(0.15));

    const windTint: any = vec3(0.1, 0.15, 0.05)
      .mul(windInfluence)
      .mul(heightFactor)
      .mul(0.2);

    let baseColor: any = mix(GRASS_DARK, GRASS_MID, heightFactor.mul(0.5));
    const tipColor: any = mix(GRASS_MID, GRASS_TIP, heightFactor.sub(0.7).div(0.3));
    baseColor = heightFactor.greaterThan(0.7).select(tipColor, baseColor);
    baseColor = baseColor.add(windTint);

    let color: any = celShadeSmoothBands(
      lightIntensity,
      baseColor.mul(0.7),
      baseColor.mul(1.2),
      4,
    );

    const highlightCond = and(heightFactor.greaterThan(0.8), windInfluence.greaterThan(0.6));
    const highlight: any = vec3(0.1, 0.12, 0.08).mul(heightFactor.sub(0.8)).mul(2);
    color = color.add(highlightCond.select(highlight, vec3(0, 0, 0)));

    color = applyGardenFog(color, fragPos, fogColorUniform, fogNearUniform, fogFarUniform);

    mat.colorNode = color;
    mat.opacityNode = alpha;

    return {
      geometries,
      mat,
      windSpeedUniform,
      windStrengthUniform,
      fogNearUniform,
      fogFarUniform,
      farDistUniform,
    };
    // fogNear/fogFar intentionally omitted: they're live-mutated uniforms
    // (see the useFrame below), not material-rebuild dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    terrainData,
    palette,
    grassTex,
    windSpeed,
    windStrength,
    density,
    tuftWidth,
    tuftHeight,
    slopeThreshold,
    farDistance,
    windOctaves,
  ]);

  useEffect(() => () => {
      for (const geo of geometries) geo.dispose();
      mat.dispose();
    }, [geometries, mat]);

  useFrame(() => {
    windSpeedUniform.value = windSpeed;
    windStrengthUniform.value = windStrength;
    fogNearUniform.value = fogNear;
    fogFarUniform.value = fogFar;
    farDistUniform.value = farDistance;
  });

  return (
    <>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={mat} frustumCulled={true} />
      ))}
    </>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Flowers — one per published post. TSL port of flower.vert/flower.frag.
// ═════════════════════════════════════════════════════════════════════════════
interface FlowersProps {
  posts: GardenPost[];
  terrainData: TerrainData;
  palette: GardenPalette;
  /** index of the currently hovered flower, or null (owned by Scene picking) */
  hoveredIndex: number | null;
  windSpeed?: number;
  windStrength?: number;
  fogNear?: number;
  fogFar?: number;
  /** Wind octave count (plan 5.4) — low tier passes 2 instead of 3. */
  windOctaves?: 2 | 3;
}

/** One billboarded, wind-animated flower instance per published post. */
export const Flowers = ({
  posts,
  terrainData,
  palette,
  hoveredIndex,
  windSpeed = GARDEN.wind.flowerSpeed,
  windStrength = GARDEN.wind.flowerStrength,
  fogNear = GARDEN.fog.near,
  fogFar = GARDEN.fog.far,
  windOctaves = 3,
}: FlowersProps) => {
  const hoverAttrRef = useRef<THREE.InstancedBufferAttribute | null>(null);
  // Under frameloop="demand" (plan 5.5, reduced-motion) r3f only
  // auto-invalidates when a prop change flows through the reconciler onto
  // an intrinsic object — the hover-scale lerp below mutates a buffer
  // attribute directly, which the reconciler never sees, so it has to
  // request its own frames while the transition is still moving.
  const invalidate = useThree((s) => s.invalidate);

  const flowersAtlas = useTexture(TEXTURES.flowersAtlas);
  // NodeMaterial output IS auto-encoded (linear -> display), so the
  // texture needs its normal sRGB decode back — the Phase 1 NoColorSpace
  // workaround (for the raw-output ShaderMaterial pipeline) is reverted.
  flowersAtlas.colorSpace = THREE.SRGBColorSpace;

  const {
    geo,
    mat,
    slugs,
    windSpeedUniform,
    windStrengthUniform,
    fogNearUniform,
    fogFarUniform,
  } = useMemo(() => {
    const placements = layoutFlowers(posts, terrainData);
    const count = placements.length;

    const geo = makeQuad(GARDEN.flower.width, GARDEN.flower.height);
    geo.instanceCount = count;

    const offsets = new Float32Array(count * 3);
    const rands = new Float32Array(count);
    const texIdx = new Float32Array(count);
    placements.forEach((p, i) => {
      offsets[i * 3] = p.x;
      // Sink the stem base slightly so it always roots in the terrain.
      offsets[i * 3 + 1] = p.y - 0.05;
      offsets[i * 3 + 2] = p.z;
      rands[i] = p.rand;
      texIdx[i] = p.textureIndex;
    });

    geo.setAttribute(
      "instanceOffset",
      new THREE.InstancedBufferAttribute(offsets, 3),
    );
    geo.setAttribute(
      "instanceRand",
      new THREE.InstancedBufferAttribute(rands, 1),
    );
    geo.setAttribute(
      "textureIndex",
      new THREE.InstancedBufferAttribute(texIdx, 1),
    );
    const hoverAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(count),
      1,
    );
    hoverAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("instanceHover", hoverAttr);
    hoverAttrRef.current = hoverAttr;

    const windSpeedUniform = uniform(windSpeed);
    const windStrengthUniform = uniform(windStrength);
    const fogColorUniform = uniform(palette.background);
    const fogNearUniform = uniform(fogNear);
    const fogFarUniform = uniform(fogFar);

    const mat = new THREE.MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.depthWrite = true;
    mat.side = THREE.DoubleSide;
    mat.alphaTest = 0.01;

    const instanceOffset: any = attribute("instanceOffset", "vec3");
    const instanceRand: any = attribute("instanceRand", "float");
    const instanceHover: any = attribute("instanceHover", "float");
    const textureIndexAttr: any = attribute("textureIndex", "float");

    const heightFactor: any = positionGeometry.y;
    const heightInfluence: any = heightFactor.mul(heightFactor);
    const variationSeed: any = instanceRand.mul(6.2831853);
    const windFn = windOctaves >= 3 ? computeWind : computeWindLowTier;
    const windPacked: any = windFn(
      instanceOffset,
      windSpeedUniform,
      windStrengthUniform,
      heightInfluence,
      variationSeed,
    );
    const windOffset3: any = vec3(windPacked.x, 0, windPacked.y);
    const windInfluence: any = windPacked.z;
    const instancePosWithWind: any = instanceOffset.add(windOffset3);

    // Hover gently scales the whole flower up from its root.
    const scale: any = float(1).add(instanceHover.mul(0.18));

    // Y-locked billboard sharing one right-vector across all instances
    // (matches the C++ original's flower.vert — flowers don't get the
    // per-instance cylindrical treatment grass does).
    const viewMatrix: any = cameraViewMatrix;
    const cameraRight: any = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    const cameraUp = vec3(0, 1, 0);

    const fragPos: any = instancePosWithWind
      .add(cameraRight.mul(positionGeometry.x.mul(scale)))
      .add(cameraUp.mul(positionGeometry.y.mul(scale)));

    mat.positionNode = fragPos;

    // ── Fragment ──────────────────────────────────────────────────────────
    // Single atlas sample (plan 5.3) instead of sampling two bound textures
    // and select()-ing between them: flower_1 occupies the left half of the
    // atlas (u in [0, 0.5]), flower_2 the right half ([0.5, 1]).
    const atlasUV: any = vec2(
      uv().x.mul(0.5).add(textureIndexAttr.mul(0.5)),
      uv().y,
    );
    const texColor: any = texture(flowersAtlas, atlasUV);

    const windShimmer: any = windInfluence.mul(heightFactor).mul(0.1);
    const finalColor: any = texColor.rgb.mul(
      float(1).add(windShimmer).add(instanceHover.mul(0.15)),
    );

    mat.colorNode = applyGardenFog(finalColor, fragPos, fogColorUniform, fogNearUniform, fogFarUniform);
    mat.opacityNode = texColor.a;

    return {
      geo,
      mat,
      slugs: placements.map((p) => p.slug),
      windSpeedUniform,
      windStrengthUniform,
      fogNearUniform,
      fogFarUniform,
    };
    // fogNear/fogFar intentionally omitted: they're live-mutated uniforms
    // (see the useFrame below), not material-rebuild dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    posts,
    terrainData,
    palette,
    flowersAtlas,
    windSpeed,
    windStrength,
    windOctaves,
  ]);

  useEffect(() => () => {
      geo.dispose();
      mat.dispose();
    }, [geo, mat]);

  useFrame((_, delta) => {
    windSpeedUniform.value = windSpeed;
    windStrengthUniform.value = windStrength;
    fogNearUniform.value = fogNear;
    fogFarUniform.value = fogFar;

    // Ease each flower's hover value toward its target — the smooth
    // hover-scale animation from the plan (§5, instanceHover).
    const attr = hoverAttrRef.current;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    const speed = Math.min(1, delta * 10);
    let dirty = false;
    for (let i = 0; i < arr.length; i++) {
      const target = i === hoveredIndex ? 1 : 0;
      const next = arr[i] + (target - arr[i]) * speed;
      if (Math.abs(next - arr[i]) > 1e-4) {
        arr[i] = next;
        dirty = true;
      }
    }
    if (dirty) {
      attr.needsUpdate = true;
      invalidate();
    }
  });

  return (
    <mesh
      geometry={geo}
      material={mat}
      frustumCulled={false}
      renderOrder={1}
      userData={{ slugs }}
    />
  );
};
