"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

import type { TerrainData } from "@/lib/garden/terrain";
import type { GardenPalette } from "@graphics/Garden/useGardenTheme";
import { GARDEN_FOG_DENSITY, LIGHT_POS } from "@graphics/Garden/constants";

import colorsGlsl from "@graphics/Garden/shaders/colors.glsl";
import fogGlsl from "@graphics/Garden/shaders/fog.glsl";
import terrainVert from "@graphics/Garden/shaders/terrain.vert";
import terrainFrag from "@graphics/Garden/shaders/terrain.frag";

const terrainFragFull = colorsGlsl + "\n" + fogGlsl + "\n" + terrainFrag;

interface TerrainProps {
  terrainData: TerrainData;
  palette: GardenPalette;
}

/** The rectangular plane the garden grows on — mesh data straight from the
 *  ported terrain generator, cel-shaded with the colors.glsl palette. */
export default function Terrain({ terrainData, palette }: TerrainProps) {
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
        lightPos: { value: LIGHT_POS.clone() },
        uHeightScale: { value: terrainData.heightScale },
        uFogColor: { value: palette.background },
        uFogDensity: { value: GARDEN_FOG_DENSITY },
      },
      vertexColors: true,
      side: THREE.FrontSide,
    });

    return { geo, mat };
  }, [terrainData, palette]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  return <mesh geometry={geo} material={mat} />;
}
