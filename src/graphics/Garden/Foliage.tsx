"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  lessThanEqual,
  mix,
  positionGeometry,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";

import {
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
import { computeWind } from "@graphics/Garden/tsl/wind";

// ── Grass scatter — port of web-terrain's generatePositions ─────────────────
// Slope-checked random scatter across the terrain slab.
function generateGrassPositions(
  count: number,
  td: TerrainData,
  seed: number,
  slopeThreshold: number,
) {
  const rng = mulberry32(seed);
  const hw = (td.width * td.scale) / 2;
  const hh = (td.height * td.scale) / 2;
  const pos: number[] = [];
  const phases: number[] = [];

  for (let i = 0; i < count * 2 && pos.length / 3 < count; i++) {
    const wx = rng() * td.width * td.scale - hw;
    const wz = rng() * td.height * td.scale - hh;
    const wy = sampleHeight(td, wx, wz);
    if (wy <= -999) continue;

    const [, ny] = sampleNormal(td, wx, wz);
    if (ny <= slopeThreshold) continue;

    pos.push(wx, wy, wz);
    phases.push(rng() * Math.PI * 2);
  }

  return {
    positions: new Float32Array(pos),
    windPhases: new Float32Array(phases),
    count: pos.length / 3,
  };
}

/** Shared billboard quad, anchored at its base. */
function makeQuad(
  width: number,
  height: number,
): THREE.InstancedBufferGeometry {
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
}

// ═════════════════════════════════════════════════════════════════════════════
// Grass — TSL port of grass.vert/grass.frag (docs/garden-webgpu-plan.md 3.5)
// ═════════════════════════════════════════════════════════════════════════════

/** Matches C++ LODConfig density carpet: 100% under 8 units, smooth falloff to farDist. */
const computeDensityThreshold = (dist: any, nearDist: any, farDist: any) => {
  const ultraNear = float(8);
  const tNear: any = dist.sub(ultraNear).div(float(nearDist).sub(ultraNear).max(0.001));
  const nearVal: any = mix(1, 0.6, tNear);
  const tFar: any = dist
    .sub(nearDist)
    .div(float(farDist).sub(nearDist).max(0.001))
    .clamp(0, 1);
  const farVal: any = mix(0.6, 0, tFar);
  return dist.lessThan(ultraNear).select(1, dist.lessThan(nearDist).select(nearVal, farVal));
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
  count?: number;
  tuftWidth?: number;
  tuftHeight?: number;
  slopeThreshold?: number;
  fogDensity?: number;
}

export function Grass({
  terrainData,
  palette,
  windSpeed = GARDEN.wind.speed,
  windStrength = GARDEN.wind.strength,
  count = GARDEN.grass.count,
  tuftWidth = GARDEN.grass.tuftWidth,
  tuftHeight = GARDEN.grass.tuftHeight,
  slopeThreshold = GARDEN.grass.slopeThreshold,
  fogDensity = GARDEN.fog.density,
}: GrassProps) {
  const grassTex = useTexture(TEXTURES.grass);

  const {
    geo,
    mat,
    windSpeedUniform,
    windStrengthUniform,
    fogDensityUniform,
  } = useMemo(() => {
    const g = GARDEN.grass;
    const geo = makeQuad(tuftWidth, tuftHeight);
    const data = generateGrassPositions(
      count,
      terrainData,
      g.seed,
      slopeThreshold,
    );
    geo.instanceCount = data.count;
    geo.setAttribute(
      "instanceOffset",
      new THREE.InstancedBufferAttribute(data.positions, 3),
    );
    geo.setAttribute(
      "windPhase",
      new THREE.InstancedBufferAttribute(data.windPhases, 1),
    );

    const windSpeedUniform = uniform(windSpeed);
    const windStrengthUniform = uniform(windStrength);
    const lightDirUniform = uniform(FOLIAGE_LIGHT_DIR.clone());
    const nearDistUniform = uniform(14);
    const farDistUniform = uniform(26);
    const fogColorUniform = uniform(palette.background);
    const fogDensityUniform = uniform(fogDensity);

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
      nearDistUniform,
      farDistUniform,
    );
    const culled = greaterThanEqual(densityHash(instanceOffset), densityThreshold);

    const heightFactor: any = positionGeometry.y;
    const heightInfluence: any = heightFactor.mul(heightFactor);
    const windPacked: any = computeWind(
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

    color = applyGardenFog(color, fragPos, fogColorUniform, fogDensityUniform);

    mat.colorNode = color;
    mat.opacityNode = alpha;

    return {
      geo,
      mat,
      windSpeedUniform,
      windStrengthUniform,
      fogDensityUniform,
    };
    // fogDensity intentionally omitted: it's a live-mutated uniform (see
    // the useFrame below), not a material-rebuild dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    terrainData,
    palette,
    grassTex,
    windSpeed,
    windStrength,
    count,
    tuftWidth,
    tuftHeight,
    slopeThreshold,
  ]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  useFrame(() => {
    windSpeedUniform.value = windSpeed;
    windStrengthUniform.value = windStrength;
    fogDensityUniform.value = fogDensity;
  });

  return <mesh geometry={geo} material={mat} frustumCulled={false} />;
}

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
  fogDensity?: number;
}

export function Flowers({
  posts,
  terrainData,
  palette,
  hoveredIndex,
  windSpeed = GARDEN.wind.flowerSpeed,
  windStrength = GARDEN.wind.flowerStrength,
  fogDensity = GARDEN.fog.density,
}: FlowersProps) {
  const hoverAttrRef = useRef<THREE.InstancedBufferAttribute | null>(null);

  const flowerTex0 = useTexture(TEXTURES.flower0);
  const flowerTex1 = useTexture(TEXTURES.flower1);
  // NodeMaterial output IS auto-encoded (linear -> display), so the
  // texture needs its normal sRGB decode back — the Phase 1 NoColorSpace
  // workaround (for the raw-output ShaderMaterial pipeline) is reverted.
  flowerTex0.colorSpace = THREE.SRGBColorSpace;
  flowerTex1.colorSpace = THREE.SRGBColorSpace;

  const {
    geo,
    mat,
    slugs,
    windSpeedUniform,
    windStrengthUniform,
    fogDensityUniform,
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
    const fogDensityUniform = uniform(fogDensity);

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
    const windPacked: any = computeWind(
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
    const tex0 = texture(flowerTex0, uv());
    const tex1 = texture(flowerTex1, uv());
    const texColor: any = lessThanEqual(textureIndexAttr, 0.5).select(tex0, tex1);

    const windShimmer: any = windInfluence.mul(heightFactor).mul(0.1);
    const finalColor: any = texColor.rgb.mul(
      float(1).add(windShimmer).add(instanceHover.mul(0.15)),
    );

    mat.colorNode = applyGardenFog(finalColor, fragPos, fogColorUniform, fogDensityUniform);
    mat.opacityNode = texColor.a;

    return {
      geo,
      mat,
      slugs: placements.map((p) => p.slug),
      windSpeedUniform,
      windStrengthUniform,
      fogDensityUniform,
    };
    // fogDensity intentionally omitted: it's a live-mutated uniform (see
    // the useFrame below), not a material-rebuild dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    posts,
    terrainData,
    palette,
    flowerTex0,
    flowerTex1,
    windSpeed,
    windStrength,
  ]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  useFrame((_, delta) => {
    windSpeedUniform.value = windSpeed;
    windStrengthUniform.value = windStrength;
    fogDensityUniform.value = fogDensity;

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
    if (dirty) attr.needsUpdate = true;
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
}
