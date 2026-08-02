"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { dot, max, mix, normalWorld, positionWorld, uniform } from "three/tsl";

import type { TerrainData } from "@/lib/garden/terrain";
import { GARDEN } from "@/lib/garden/meadow";
import type { GardenPalette } from "@graphics/Garden/useGardenTheme";
import {
  DAY_LIGHT_POS,
  NIGHT_MOON_DISTANCE,
  NIGHT_MOON_SPEED,
} from "@graphics/Garden/constants";
import { celShade4Band } from "@graphics/Garden/tsl/colors";
import { applyGardenFog } from "@graphics/Garden/tsl/fog";
import { getTerrainColor } from "@graphics/Garden/tsl/terrain";
import { gardenDebugState } from "@graphics/Garden/gardenDebug";

interface TerrainProps {
  terrainData: TerrainData;
  palette: GardenPalette;
  fogNear?: number;
  fogFar?: number;
}

const scratchMoonDir = new THREE.Vector3();

/**
 * The rectangular plane the garden grows on — mesh data straight from the
 *  ported terrain generator, cel-shaded with the tsl/colors.ts palette.
 */
export default function Terrain({
  terrainData,
  palette,
  fogNear = GARDEN.fog.near,
  fogFar = GARDEN.fog.far,
}: TerrainProps) {
  const { geo, mat, lightPosUniform, fogNearUniform, fogFarUniform } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(terrainData.positions, 3),
    );
    geo.setAttribute(
      "normal",
      new THREE.BufferAttribute(terrainData.normals, 3),
    );
    geo.setAttribute("uv", new THREE.BufferAttribute(terrainData.uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(terrainData.indices, 1));
    // Note: terrain.frag never actually reads its VertexColor varying (the
    // fragment colour comes entirely from the height-band ramp below), so
    // unlike the Phase 1 port, the "color" attribute isn't uploaded here.

    const lightPosUniform = uniform(DAY_LIGHT_POS.clone());
    const heightScaleUniform = uniform(terrainData.heightScale);
    const fogColorUniform = uniform(palette.background);
    const fogNearUniform = uniform(fogNear);
    const fogFarUniform = uniform(fogFar);

    const mat = new THREE.MeshBasicNodeMaterial();
    // DoubleSide: at higher terrain frequencies the surface folds back on
    // itself enough that a side-on camera sees the "underside" of a face —
    // FrontSide left that as a hole (background showing through). TSL's
    // normalWorld already negates itself on backfaces here (three's
    // negateOnBackSide/faceDirection, keyed off this same material.side),
    // so the NdotL lighting below stays correct instead of inverting.
    mat.side = THREE.DoubleSide;

    // No positionNode override — terrain has no vertex displacement, so the
    // material's default local→world→clip pipeline (position/normal
    // attributes straight through) already matches terrain.vert exactly.
    const norm = normalWorld.normalize();
    const lightDir = lightPosUniform.sub(positionWorld).normalize();
    const NdotL = dot(norm, lightDir).mul(0.5).add(0.5); // half-lambert

    const heightRatio = positionWorld.y.div(max(heightScaleUniform, 0.001));
    const baseColor = getTerrainColor(heightRatio);

    const shaded = celShade4Band(
      NdotL,
      baseColor.mul(0.4),
      baseColor.mul(0.65),
      baseColor.mul(0.85),
      baseColor.mul(1.0),
    );

    const slope = norm.y; // 1.0 = flat, 0.0 = cliff
    const slopeDarkened = shaded.mul(mix(0.5, 1.0, slope));

    mat.colorNode = applyGardenFog(
      slopeDarkened,
      positionWorld,
      fogColorUniform,
      fogNearUniform,
      fogFarUniform,
    );

    return { geo, mat, lightPosUniform, fogNearUniform, fogFarUniform };
    // fogNear/fogFar intentionally omitted: they're live-mutated uniforms
    // (see the useFrame below), not material-rebuild dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrainData, palette]);

  useEffect(() => () => {
      geo.dispose();
      mat.dispose();
    }, [geo, mat]);

  // Theme-driven light preset: below-horizon animated moon for the dark
  // theme (ported from fairy-forest-glade's main.cpp), static overhead sun
  // for the light themes. A per-frame uniform mutation, not a material
  // rebuild, so switching themes never re-triggers shader compilation.
  useFrame(({ clock }) => {
    if (palette.isDark.current) {
      const elapsed = gardenDebugState.fixedTime ?? clock.elapsedTime;
      const angle = elapsed * NIGHT_MOON_SPEED;
      scratchMoonDir
        .set(
          Math.cos(angle) * 0.5,
          0.6 + 0.2 * Math.sin(angle * 0.3),
          Math.sin(angle) * 0.5,
        )
        .normalize();
      lightPosUniform.value
        .copy(scratchMoonDir)
        .multiplyScalar(-NIGHT_MOON_DISTANCE);
    } else {
      lightPosUniform.value.copy(DAY_LIGHT_POS);
    }

    fogNearUniform.value = fogNear;
    fogFarUniform.value = fogFar;
  });

  return <mesh geometry={geo} material={mat} />;
}
