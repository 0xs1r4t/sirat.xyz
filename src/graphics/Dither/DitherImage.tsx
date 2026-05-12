"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ImageProps } from "next/image";
import vertexShader from "@graphics/Dither/dither.vert";
import fragmentShader from "@graphics/Dither/dither.frag";

// Constants

const VALID_THEMES = [
  "strawberry-matcha",
  "blueberry-lemon",
  "neopolitan-ice-cream",
] as const;
const DEFAULT_THEME = "strawberry-matcha";
type Theme = (typeof VALID_THEMES)[number];

const PATTERN_INDEX: Record<"2x2" | "4x4" | "8x8", number> = {
  "2x2": 0,
  "4x4": 1,
  "8x8": 2,
};

const THEME_TINTS: Record<Theme, { tint: THREE.Vector3; contrast: number }> = {
  "strawberry-matcha": {
    tint: new THREE.Vector3(0.9, 1.0, 0.93),
    contrast: 1.0,
  },
  "blueberry-lemon": {
    tint: new THREE.Vector3(0.87, 0.95, 0.84),
    contrast: 1.2,
  },
  "neopolitan-ice-cream": {
    tint: new THREE.Vector3(1.0, 0.96, 0.88),
    contrast: 1.1,
  },
};

// Helpers

function getActiveTheme(): Theme {
  const found = Array.from(document.documentElement.classList).find(
    (cls): cls is Theme => (VALID_THEMES as readonly string[]).includes(cls),
  );
  return found ?? DEFAULT_THEME;
}

function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  useEffect(() => {
    setTheme(getActiveTheme());
    const obs = new MutationObserver(() => setTheme(getActiveTheme()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return theme;
}

// Props

export interface DitherImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  pattern?: "2x2" | "4x4" | "8x8";
  intensity?: number;
  useTint?: boolean;
  className?: string;
  style?: React.CSSProperties;
  unoptimized?: boolean;
  loading?: "lazy" | "eager";
}

// DitherImage
export default function DitherImage({
  src,
  alt,
  width,
  height,
  pattern = "4x4",
  intensity = 1.0,
  useTint = false,
  className,
  style,
}: DitherImageProps) {
  const theme = useTheme();
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  // Preload image; re-trigger if src changes
  useEffect(() => {
    setReady(false);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (imgRef.current) setReady(true);
    };
    img.onerror = () => console.warn("DitherImage: failed to load", src);
    img.src = src;
    // Assign to the hidden img so the Canvas texture can read it
    if (imgRef.current) {
      imgRef.current.src = src;
      imgRef.current.crossOrigin = "anonymous";
    }
  }, [src]);

  return (
    // Wrapper sized to the image — Canvas fills it exactly
    <div
      className={className}
      style={{
        position: "relative",
        width,
        height,
        display: "inline-block",
        ...style,
      }}
      role="img"
      aria-label={alt}
    >
      {/* Hidden img drives texture loading */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        width={width}
        height={height}
        crossOrigin="anonymous"
        style={{ display: "none" }}
        onLoad={() => setReady(true)}
      />

      {ready && (
        <Canvas
          orthographic
          camera={{
            position: [0, 0, 1],
            near: 0,
            far: 2,
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
          }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          frameloop="demand"
          onCreated={({ gl }) => {
            gl.setPixelRatio(1);
            gl.setSize(width, height);
          }}
        >
          <DitherMesh
            imgEl={imgRef.current!}
            pattern={pattern}
            intensity={intensity}
            useTint={useTint}
            theme={theme}
            width={width}
            height={height}
          />
        </Canvas>
      )}
    </div>
  );
}

// DitherMesh

interface DitherMeshProps {
  imgEl: HTMLImageElement;
  pattern: "2x2" | "4x4" | "8x8";
  intensity: number;
  useTint: boolean;
  theme: Theme;
  width: number;
  height: number;
}

function DitherMesh({
  imgEl,
  pattern,
  intensity,
  useTint,
  theme,
  width,
  height,
}: DitherMeshProps) {
  const { invalidate } = useThree();

  const texture = useMemo(() => {
    const tex = new THREE.Texture(imgEl);
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [imgEl]);

  const material = useMemo(() => {
    const { tint, contrast } = THEME_TINTS[theme];
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uIntensity: { value: intensity },
        uResolution: { value: new THREE.Vector2(width, height) }, // pass width/height down
        uPattern: { value: PATTERN_INDEX[pattern] },
        uTint: { value: tint },
        uContrast: { value: contrast },
        uUseTint: { value: useTint ? 1.0 : 0.0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [texture, pattern, intensity, useTint, theme]);

  useEffect(() => {
    material.uniforms.uIntensity.value = intensity;
    material.uniforms.uPattern.value = PATTERN_INDEX[pattern];
    material.uniforms.uUseTint.value = useTint ? 1.0 : 0.0;
    const { tint, contrast } = THEME_TINTS[theme];
    material.uniforms.uTint.value = tint;
    material.uniforms.uContrast.value = contrast;
    invalidate();
  }, [material, pattern, intensity, useTint, theme, invalidate]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
