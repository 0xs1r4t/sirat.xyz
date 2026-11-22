"use client";

import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Canvas, extend, useThree } from "@react-three/fiber";
import type { ConstructorRepresentation } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
// The webgpu entry point is a superset of "three" (same core classes —
// Vector3, Color, Raycaster, etc. — plus WebGPURenderer and the Node
// material system). Only this file needs it, since it's the only place
// that constructs the renderer; Terrain/Grass/Flowers/etc. keep importing
// plain "three" for the shared core classes.
import * as THREE from "three/webgpu";

// Registers the webgpu-flavoured THREE namespace (WebGPURenderer, Node
// materials, ...) as JSX intrinsics for the reconciler — required once we
// stop using the plain "three" catalog r3f ships by default.
extend(THREE as unknown as Record<string, ConstructorRepresentation>);

import { GARDEN, type GardenPost } from "@/lib/garden/meadow";
import { useGardenTheme } from "@graphics/Garden/useGardenTheme";
import Terrain from "@graphics/Garden/Terrain";
import { Grass } from "@graphics/Garden/Grass";
import { Flowers } from "@graphics/Garden/Flowers";
import Trees from "@graphics/Garden/Trees";
import type { GardenControlValues } from "@graphics/Garden/gardenControlValues";
import {
  DEVICE_TIER_PARAMS,
  demoteTier,
  getInitialTier,
  type DeviceTier,
} from "@graphics/Garden/deviceTier";
import { useGardenCamera } from "@graphics/Garden/useGardenCamera";
import { useGardenDebugBridge } from "@graphics/Garden/useGardenDebugBridge";
import { useGardenPicking } from "@graphics/Garden/useGardenPicking";
import { useGardenWorld } from "@graphics/Garden/useGardenWorld";

// Same reasoning the old LevaGardenControls lazy-import used to have — keep
// GPU-timestamp instrumentation (docs/garden-perf-benchmark.md) out of the
// eager bundle. Plain React.lazy (not next/dynamic) on purpose —
// next/dynamic's compiler adds a webpackPrefetch hint that fetches the
// chunk eagerly regardless of whether the lazy component ever renders,
// defeating the point of gating it.
const GpuTimer = lazy(() => import("@graphics/Garden/GpuTimer"));

/** Props for {@link Scene} (and the rig/controls it renders internally). */
export interface GardenSceneProps {
  posts: GardenPost[];
  reducedMotion: boolean;
  /** DOM tooltip inside the stage container; Scene drives its transform */
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  /** fires when the hovered flower changes (post | null) */
  onHoverPost: (post: GardenPost | null) => void;
  /** fires when a flower is clicked/focused, or null when focus is cleared */
  onFocusPost: (post: GardenPost | null) => void;
  /** Live values from the public controls sidebar (Garden.tsx's useGardenControls) — replaces the old debug-only Leva panel. */
  controls: GardenControlValues;
}

const GardenRig = ({
  posts,
  reducedMotion,
  tooltipRef,
  onHoverPost,
  onFocusPost,
  controls,
  farDistance,
  windOctaves,
  debug,
}: GardenSceneProps & {
  /** LOD cull distance (plan 5.2), device-tier-driven (plan 5.4). */
  farDistance: number;
  /** Wind octave count (plan 5.4) — low tier passes 2 instead of 3. */
  windOctaves: 2 | 3;
  /** Gates the window.__gardenDebug bridge (screenshot harness) — same flag Leva uses. */
  debug: boolean;
}) => {
  const palette = useGardenTheme();
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  // Same reasoning as Flowers.tsx: under frameloop="demand" (plan
  // 5.5) the camera focus-lerp and tooltip DOM positioning below mutate
  // things the reconciler never sees, so they have to request their own
  // frames while there's still per-frame work to do.
  const invalidate = useThree((s) => s.invalidate);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const { terrainData, heads, eye, target, focusPoses } = useGardenWorld(
    posts,
    controls,
  );

  const { hoveredIndex, focusedIndex, hoveredRef, focusedRef } =
    useGardenPicking({
      gl,
      camera,
      heads,
      posts,
      onHoverPost,
      onFocusPost,
      controlsRef,
    });

  // Registered before the debug bridge so its `ready` flag flips only after
  // the camera hook's initial-pose effect has run.
  useGardenCamera({
    camera,
    gl,
    invalidate,
    tooltipRef,
    controlsRef,
    eye,
    target,
    heads,
    focusPoses,
    hoveredRef,
    focusedRef,
  });

  useGardenDebugBridge({ debug, gl, scene, invalidate });

  const {
    grassDensity,
    tuftWidth,
    tuftHeight,
    slopeThreshold,
    windSpeed,
    windStrength,
    flowerWindSpeed,
    flowerWindStrength,
    flowerWidth,
    flowerHeight,
    fogNear,
    fogFar,
    treeCount,
    treeSize,
  } = controls;

  return (
    <>
      <Terrain
        terrainData={terrainData}
        palette={palette}
        fogNear={fogNear}
        fogFar={fogFar}
      />
      <Suspense fallback={null}>
        <Grass
          terrainData={terrainData}
          palette={palette}
          windSpeed={reducedMotion ? 0 : windSpeed}
          windStrength={reducedMotion ? 0 : windStrength}
          density={grassDensity}
          tuftWidth={tuftWidth}
          tuftHeight={tuftHeight}
          slopeThreshold={slopeThreshold}
          fogNear={fogNear}
          fogFar={fogFar}
          farDistance={farDistance}
          windOctaves={windOctaves}
        />
        <Flowers
          posts={posts}
          terrainData={terrainData}
          palette={palette}
          hoveredIndex={focusedIndex ?? hoveredIndex}
          windSpeed={reducedMotion ? 0 : flowerWindSpeed}
          windStrength={reducedMotion ? 0 : flowerWindStrength}
          width={flowerWidth}
          height={flowerHeight}
          fogNear={fogNear}
          fogFar={fogFar}
          windOctaves={windOctaves}
        />
        <Trees
          terrainData={terrainData}
          palette={palette}
          posts={posts}
          count={treeCount}
          treeSize={treeSize}
          fogNear={fogNear}
          fogFar={fogFar}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        target={[target.x, target.y, target.z]}
        minDistance={3}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2 - 0.04}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
};

// Debug mode: always on in dev, opt-in via `?debug` in production. Read once
// per mount (lazy initializer) — it never changes for the component's
// lifetime, so branching on it below doesn't touch hook call order.
const isGardenDebugMode = () => {
  if (process.env.NODE_ENV !== "production") return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debug");
};

/** WebGPU canvas root: sets up the renderer, then mounts the garden rig. */
export default function Scene(props: GardenSceneProps) {
  const [debug] = useState(isGardenDebugMode);

  // Device tiers (plan 5.4): heuristic guess on mount, demoted at runtime by
  // PerformanceMonitor below if FPS actually sags — the heuristic doesn't
  // need to be perfect, it just needs a reasonable starting point. Debug-only
  // `?tier=` pins it instead, for reproducible perf/screenshot runs.
  const [tier, setTier] = useState<DeviceTier>(getInitialTier);
  const tierParams = DEVICE_TIER_PARAMS[tier];

  // Plan 5.5 — don't render what nobody sees. Tab hidden → stop the
  // frameloop entirely ("never"); reduced-motion (wind already zeroed
  // elsewhere) → only re-render on camera/hover changes ("demand") instead
  // of a continuous 60fps loop for an otherwise-static scene. Tab-hidden
  // wins over reduced-motion since there's nothing to render either way.
  const [tabHidden, setTabHidden] = useState(false);
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const frameloop: "always" | "demand" | "never" = tabHidden
    ? "never"
    : props.reducedMotion
      ? "demand"
      : "always";

  return (
    <Canvas
      gl={async (defaultProps) => {
        const renderer = new THREE.WebGPURenderer({
          ...(defaultProps as unknown as THREE.WebGPURendererParameters),
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          // GPU timestamp queries (docs/garden-perf-benchmark.md) have a
          // small overhead — only pay it in debug mode, never for visitors.
          trackTimestamp: debug,
          // forceWebGL: true, // fallback to WebGL if WebGPU isn't available
        });
        await renderer.init();
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        return renderer;
      }}
      dpr={tierParams.dpr}
      frameloop={frameloop}
      camera={{ fov: GARDEN.camera.fov, near: 0.1, far: 150 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {/* Runtime safety net (plan 5.4): demote a tier if FPS sags. Skipped
          in debug mode so manual Leva tuning stays deterministic instead of
          fighting an automatic demotion mid-session. */}
      {!debug && <PerformanceMonitor onDecline={() => setTier(demoteTier)} />}
      <GardenRig
        {...props}
        farDistance={tierParams.farDistance}
        windOctaves={tierParams.windOctaves}
        debug={debug}
      />
      {debug && (
        <Suspense fallback={null}>
          <GpuTimer />
        </Suspense>
      )}
    </Canvas>
  );
}
