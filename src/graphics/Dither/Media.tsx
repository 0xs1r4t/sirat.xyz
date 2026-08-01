// DitherMedia.tsx
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
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

// Media type detection

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov|gif)$/i;

export const isVideoSrc = (src: string): boolean =>
  VIDEO_EXTENSIONS.test(src);

// Helpers

const getActiveTheme = (): Theme => {
  const found = Array.from(document.documentElement.classList).find(
    (cls): cls is Theme => (VALID_THEMES as readonly string[]).includes(cls),
  );
  return found ?? DEFAULT_THEME;
};

const useTheme = (): Theme => {
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
};

const useContainerSize = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return size;
};

// Props

export interface DitherMediaProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  pattern?: "2x2" | "4x4" | "8x8";
  intensity?: number;
  useTint?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Override auto-detection from file extension if needed */
  isVideo?: boolean;
  isDecorative?: boolean;
}

// DitherMedia

export default function DitherMedia({
  src,
  alt,
  width,
  height,
  pattern = "4x4",
  intensity = 1.0,
  useTint = false,
  className,
  style,
  isVideo,
  isDecorative,
}: DitherMediaProps) {
  const theme = useTheme();
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mediaReady, setMediaReady] = useState(false);
  // Natural dimensions of the mediam, used for correct UV mapping
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const measured = useContainerSize(wrapperRef);
  const w = width ?? measured.width;
  const h = height ?? measured.height;

  const treatAsVideo = isVideo ?? isVideoSrc(src);
  const ready = mediaReady && w > 0 && h > 0;

  // Force repaint after Canvas mounts so CSS filter is re-evaluated
  useEffect(() => {
    if (ready && wrapperRef.current) {
      wrapperRef.current.style.display = "none";
      void wrapperRef.current.offsetHeight; // trigger reflow
      wrapperRef.current.style.display = "";
    }
  }, [ready]);

  useEffect(() => {
    setMediaReady(false);
    setNaturalSize({ width: 0, height: 0 });

    if (treatAsVideo) {
      const v = videoRef.current;
      if (!v) return;

      const onCanPlay = () => {
        setNaturalSize({ width: v.videoWidth, height: v.videoHeight });
        setMediaReady(true);
      };

      if (v.readyState >= 3) {
        setNaturalSize({ width: v.videoWidth, height: v.videoHeight });
        setMediaReady(true);
        return;
      }

      v.addEventListener("canplay", onCanPlay);
      return () => v.removeEventListener("canplay", onCanPlay);
    } else {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        if (imgRef.current) setMediaReady(true);
      };
      img.onerror = () => console.warn("DitherMedia: failed to load", src);
      img.src = src;
      if (imgRef.current) {
        imgRef.current.src = src;
        imgRef.current.crossOrigin = "anonymous";
      }
    }
  }, [src, treatAsVideo]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        width: width ?? "100%",
        height: height ?? "100%",
        ...style,
      }}
      role={isDecorative ? "presentation" : "img"}
      aria-label={isDecorative ? undefined : alt}
      aria-hidden={isDecorative ? true : undefined}
    >
      {treatAsVideo ? (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          style={{ display: "none" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- hidden texture source for WebGL, not a displayed image
        <img
          ref={imgRef}
          src={src}
          alt=""
          width={w || undefined}
          height={h || undefined}
          crossOrigin="anonymous"
          style={{ display: "none" }}
          onLoad={() => setMediaReady(true)}
        />
      )}

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
          style={{ width: "100%", height: "100%", display: "block" }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          frameloop={treatAsVideo ? "always" : "demand"}
          onCreated={({ gl }) => {
            gl.setPixelRatio(1);
            gl.setSize(w, h);
          }}
        >
          <DitherMesh
            mediaEl={treatAsVideo ? videoRef.current! : imgRef.current!}
            pattern={pattern}
            intensity={intensity}
            useTint={useTint}
            theme={theme}
            canvasWidth={w}
            canvasHeight={h}
            mediaWidth={naturalSize.width}
            mediaHeight={naturalSize.height}
            isVideo={treatAsVideo}
            isDecorative={isDecorative}
          />
        </Canvas>
      )}
    </div>
  );
}

// DitherMesh

interface DitherMeshProps {
  mediaEl: HTMLImageElement | HTMLVideoElement;
  pattern: "2x2" | "4x4" | "8x8";
  intensity: number;
  useTint: boolean;
  theme: Theme;
  canvasWidth: number;
  canvasHeight: number;
  mediaWidth: number;
  mediaHeight: number;
  isVideo: boolean;
  isDecorative?: boolean;
}

const DitherMesh = ({
  mediaEl,
  pattern,
  intensity,
  useTint,
  theme,
  canvasWidth,
  canvasHeight,
  mediaWidth,
  mediaHeight,
  isVideo,
}: DitherMeshProps) => {
  const { invalidate } = useThree();

  // Compute object-cover UV scale so the video fills the canvas without stretching
  const uvScale = useMemo((): [number, number] => {
    if (!mediaWidth || !mediaHeight) return [1, 1];
    const canvasAspect = canvasWidth / canvasHeight;
    const mediaAspect = mediaWidth / mediaHeight;
    if (canvasAspect > mediaAspect) {
      return [1, mediaAspect / canvasAspect];
    } else {
      return [canvasAspect / mediaAspect, 1];
    }
  }, [canvasWidth, canvasHeight, mediaWidth, mediaHeight]);

  const texture = useMemo(() => {
    const tex = isVideo
      ? new THREE.VideoTexture(mediaEl as HTMLVideoElement)
      : new THREE.Texture(mediaEl as HTMLImageElement);
    if (!isVideo) tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [mediaEl, isVideo]);

  const material = useMemo(() => {
    const { tint, contrast } = THEME_TINTS[theme];
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uIntensity: { value: intensity },
        uResolution: { value: new THREE.Vector2(canvasWidth, canvasHeight) },
        uPattern: { value: PATTERN_INDEX[pattern] },
        uTint: { value: tint },
        uContrast: { value: contrast },
        uUseTint: { value: useTint ? 1.0 : 0.0 },
        // object-cover UV correction
        uUVScale: { value: new THREE.Vector2(...uvScale) },
        uUVOffset: {
          value: new THREE.Vector2((1 - uvScale[0]) / 2, (1 - uvScale[1]) / 2),
        },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [
    texture,
    pattern,
    intensity,
    useTint,
    theme,
    canvasWidth,
    canvasHeight,
    uvScale,
  ]);

  useEffect(() => {
    material.uniforms.uIntensity.value = intensity;
    material.uniforms.uPattern.value = PATTERN_INDEX[pattern];
    material.uniforms.uUseTint.value = useTint ? 1.0 : 0.0;
    const { tint, contrast } = THEME_TINTS[theme];
    material.uniforms.uTint.value = tint;
    material.uniforms.uContrast.value = contrast;
    material.uniforms.uUVScale.value.set(...uvScale);
    material.uniforms.uUVOffset.value.set(
      (1 - uvScale[0]) / 2,
      (1 - uvScale[1]) / 2,
    );
    if (!isVideo) invalidate();
  }, [
    material,
    pattern,
    intensity,
    useTint,
    theme,
    isVideo,
    uvScale,
    invalidate,
  ]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
