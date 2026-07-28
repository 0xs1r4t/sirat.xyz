"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import {
  sampleHeight,
  sampleNormal,
  type TerrainData,
} from "@/lib/garden/terrain";
import { mulberry32 } from "@/lib/garden/noise";
import { layoutFlowers, GARDEN, type GardenPost } from "@/lib/garden/meadow";
import type { GardenPalette } from "@graphics/Garden/useGardenTheme";
import {
  FOLIAGE_LIGHT_DIR,
  GARDEN_FOG_DENSITY,
  TEXTURES,
} from "@graphics/Garden/constants";

import colorsGlsl from "@graphics/Garden/shaders/colors.glsl";
import fogGlsl from "@graphics/Garden/shaders/fog.glsl";
import grassVert from "@graphics/Garden/shaders/grass.vert";
import grassFrag from "@graphics/Garden/shaders/grass.frag";
import flowerVert from "@graphics/Garden/shaders/flower.vert";
import flowerFrag from "@graphics/Garden/shaders/flower.frag";

const grassFragFull = colorsGlsl + "\n" + fogGlsl + "\n" + grassFrag;
const flowerFragFull = fogGlsl + "\n" + flowerFrag;

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
// Grass
// ═════════════════════════════════════════════════════════════════════════════
interface GrassProps {
  terrainData: TerrainData;
  palette: GardenPalette;
  windSpeed?: number;
  windStrength?: number;
  count?: number;
  tuftWidth?: number;
  tuftHeight?: number;
  slopeThreshold?: number;
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
}: GrassProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const grassTex = useTexture(TEXTURES.grass);

  const { geo, mat } = useMemo(() => {
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

    const mat = new THREE.ShaderMaterial({
      vertexShader: grassVert,
      fragmentShader: grassFragFull,
      uniforms: {
        time: { value: 0 },
        windSpeed: { value: windSpeed },
        windStrength: { value: windStrength },
        lightDir: { value: FOLIAGE_LIGHT_DIR.clone() },
        nearDist: { value: 14 },
        farDist: { value: 26 },
        grassTexture: { value: grassTex },
        uFogColor: { value: palette.background },
        uFogDensity: { value: GARDEN_FOG_DENSITY },
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
      alphaTest: 0.01,
    });

    return { geo, mat };
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

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.time.value = clock.elapsedTime;
    matRef.current.uniforms.windSpeed.value = windSpeed;
    matRef.current.uniforms.windStrength.value = windStrength;
  });

  return (
    <mesh
      geometry={geo}
      material={mat}
      frustumCulled={false}
      ref={(m) => {
        if (m) matRef.current = m.material as THREE.ShaderMaterial;
      }}
    />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Flowers — one per published post
// ═════════════════════════════════════════════════════════════════════════════
interface FlowersProps {
  posts: GardenPost[];
  terrainData: TerrainData;
  palette: GardenPalette;
  /** index of the currently hovered flower, or null (owned by Scene picking) */
  hoveredIndex: number | null;
  windSpeed?: number;
  windStrength?: number;
}

export function Flowers({
  posts,
  terrainData,
  palette,
  hoveredIndex,
  windSpeed = GARDEN.wind.flowerSpeed,
  windStrength = GARDEN.wind.flowerStrength,
}: FlowersProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const hoverAttrRef = useRef<THREE.InstancedBufferAttribute | null>(null);

  const flowerTex0 = useTexture(TEXTURES.flower0);
  const flowerTex1 = useTexture(TEXTURES.flower1);
  // ShaderMaterial writes raw, undecoded output (matching the C++
  // pipeline), so the texture must be sampled raw too — an sRGB decode here
  // with no re-encode on write darkens/oversaturates the flowers relative
  // to the source PNGs. Revisited under the TSL migration (Phase 2, where
  // NodeMaterial output IS auto-encoded and this flips back to SRGB).
  flowerTex0.colorSpace = THREE.NoColorSpace;
  flowerTex1.colorSpace = THREE.NoColorSpace;

  const { geo, mat, slugs } = useMemo(() => {
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

    const mat = new THREE.ShaderMaterial({
      vertexShader: flowerVert,
      fragmentShader: flowerFragFull,
      uniforms: {
        time: { value: 0 },
        windSpeed: { value: windSpeed },
        windStrength: { value: windStrength },
        flowerTexture0: { value: flowerTex0 },
        flowerTexture1: { value: flowerTex1 },
        uFogColor: { value: palette.background },
        uFogDensity: { value: GARDEN_FOG_DENSITY },
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
      alphaTest: 0.01,
    });

    return { geo, mat, slugs: placements.map((p) => p.slug) };
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

  useFrame(({ clock }, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = clock.elapsedTime;
      matRef.current.uniforms.windSpeed.value = windSpeed;
      matRef.current.uniforms.windStrength.value = windStrength;
    }

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
      ref={(m) => {
        if (m) matRef.current = m.material as THREE.ShaderMaterial;
      }}
    />
  );
}
