"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three/webgpu";
import {
  attribute,
  cameraViewMatrix,
  float,
  positionGeometry,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";

import { layoutFlowers, GARDEN, type GardenPost } from "@/lib/garden/meadow";
import type { TerrainData } from "@/lib/garden/terrain";
import type { GardenPalette } from "@graphics/Garden/useGardenTheme";
import { DAY_FLOWER_BRIGHTNESS, TEXTURES } from "@graphics/Garden/constants";
import { applyGardenFog } from "@graphics/Garden/tsl/fog";
import { computeWind, computeWindLowTier } from "@graphics/Garden/tsl/wind";
import { makeQuad } from "@graphics/Garden/geometry";

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
  width?: number;
  height?: number;
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
  width = GARDEN.flower.width,
  height = GARDEN.flower.height,
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
    brightnessUniform,
    fogNearUniform,
    fogFarUniform,
  } = useMemo(() => {
    const placements = layoutFlowers(posts, terrainData);
    const count = placements.length;

    const geo = makeQuad(width, height);
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
    const brightnessUniform = uniform(1.0);
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
    const finalColor: any = texColor.rgb
      .mul(float(1).add(windShimmer).add(instanceHover.mul(0.15)))
      .mul(brightnessUniform);

    mat.colorNode = applyGardenFog(finalColor, fragPos, fogColorUniform, fogNearUniform, fogFarUniform);
    mat.opacityNode = texColor.a;

    return {
      geo,
      mat,
      slugs: placements.map((p) => p.slug),
      windSpeedUniform,
      windStrengthUniform,
      brightnessUniform,
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
    width,
    height,
  ]);

  useEffect(() => () => {
      geo.dispose();
      mat.dispose();
    }, [geo, mat]);

  useFrame((_, delta) => {
    windSpeedUniform.value = windSpeed;
    windStrengthUniform.value = windStrength;
    brightnessUniform.value = palette.isDark.current ? 1.0 : DAY_FLOWER_BRIGHTNESS;
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
