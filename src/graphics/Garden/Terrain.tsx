"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import type { TerrainData } from "@/lib/garden/terrain";
import { GARDEN } from "@/lib/garden/meadow";
import type { GardenPalette } from "@graphics/Garden/useGardenTheme";
import {
  DAY_LIGHT_POS,
  NIGHT_MOON_DISTANCE,
  NIGHT_MOON_SPEED,
} from "@graphics/Garden/constants";

import colorsGlsl from "@graphics/Garden/shaders/colors.glsl";
import fogGlsl from "@graphics/Garden/shaders/fog.glsl";
import terrainVert from "@graphics/Garden/shaders/terrain.vert";
import terrainFrag from "@graphics/Garden/shaders/terrain.frag";

const terrainFragFull = colorsGlsl + "\n" + fogGlsl + "\n" + terrainFrag;

interface TerrainProps {
  terrainData: TerrainData;
  palette: GardenPalette;
  fogDensity?: number;
}

const scratchMoonDir = new THREE.Vector3();

/** The rectangular plane the garden grows on — mesh data straight from the
 *  ported terrain generator, cel-shaded with the colors.glsl palette. */
export default function Terrain({
  terrainData,
  palette,
  fogDensity = GARDEN.fog.density,
}: TerrainProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { geo, mat } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(terrainData.positions, 3),
    );
    geo.setAttribute(
      "normal",
      new THREE.BufferAttribute(terrainData.normals, 3),
    );
    geo.setAttribute("color", new THREE.BufferAttribute(terrainData.colors, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(terrainData.uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(terrainData.indices, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: terrainVert,
      fragmentShader: terrainFragFull,
      uniforms: {
        lightPos: { value: DAY_LIGHT_POS.clone() },
        uHeightScale: { value: terrainData.heightScale },
        uFogColor: { value: palette.background },
        uFogDensity: { value: fogDensity },
      },
      vertexColors: true,
      side: THREE.FrontSide,
    });

    return { geo, mat };
    // fogDensity intentionally omitted: it's a live-mutated uniform (see
    // the useFrame below), not a material-rebuild dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terrainData, palette]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  // Theme-driven light preset: below-horizon animated moon for the dark
  // theme (ported from fairy-forest-glade's main.cpp), static overhead sun
  // for the light themes. A per-frame uniform mutation, not a material
  // rebuild, so switching themes never re-triggers shader compilation.
  useFrame(({ clock }) => {
    const uniforms = matRef.current?.uniforms;
    if (!uniforms) return;

    if (palette.isDark.current) {
      const angle = clock.elapsedTime * NIGHT_MOON_SPEED;
      scratchMoonDir
        .set(
          Math.cos(angle) * 0.5,
          0.6 + 0.2 * Math.sin(angle * 0.3),
          Math.sin(angle) * 0.5,
        )
        .normalize();
      uniforms.lightPos.value
        .copy(scratchMoonDir)
        .multiplyScalar(-NIGHT_MOON_DISTANCE);
    } else {
      uniforms.lightPos.value.copy(DAY_LIGHT_POS);
    }

    uniforms.uFogDensity.value = fogDensity;
  });

  return (
    <mesh
      geometry={geo}
      material={mat}
      ref={(m) => {
        if (m) matRef.current = m.material as THREE.ShaderMaterial;
      }}
    />
  );
}
