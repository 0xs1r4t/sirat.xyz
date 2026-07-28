"use client";

import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// The webgpu entry point is a superset of "three" (same core classes —
// Vector3, Color, Raycaster, etc. — plus WebGPURenderer and the Node
// material system). Only this file needs it, since it's the only place
// that constructs the renderer; Terrain/Foliage/etc. keep importing
// plain "three" for the shared core classes.
import * as THREE from "three/webgpu";

// Registers the webgpu-flavoured THREE namespace (WebGPURenderer, Node
// materials, ...) as JSX intrinsics for the reconciler — required once we
// stop using the plain "three" catalog r3f ships by default.
extend(THREE as any);

import { sampleHeight, generateTerrain } from "@/lib/garden/terrain";
import { GARDEN, layoutFlowers, type GardenPost } from "@/lib/garden/meadow";
import {
  flowerHeads,
  pickFlower,
  pickFlowerOnClick,
} from "@/lib/garden/picking";
import { useGardenTheme } from "@graphics/Garden/useGardenTheme";
import Terrain from "@graphics/Garden/Terrain";
import { Grass, Flowers } from "@graphics/Garden/Foliage";
import {
  GARDEN_CONTROL_DEFAULTS,
  type GardenControlValues,
} from "@graphics/Garden/gardenControlValues";

// Dev-only: Leva's panel + bundle only loads for visitors who are actually
// in debug mode (see the `debug` state in Scene below), not every hero load.
// Plain React.lazy (not next/dynamic) on purpose — next/dynamic's compiler
// adds a webpackPrefetch hint that fetches the chunk eagerly regardless of
// whether the lazy component ever renders, defeating the point of gating it.
const LevaGardenControls = lazy(
  () => import("@graphics/Garden/LevaGardenControls"),
);

// Same reasoning as LevaGardenControls above — keep GPU-timestamp
// instrumentation (docs/garden-perf-benchmark.md) out of the eager bundle.
const GpuTimer = lazy(() => import("@graphics/Garden/GpuTimer"));

export interface GardenSceneProps {
  posts: GardenPost[];
  reducedMotion: boolean;
  /** DOM tooltip inside the stage container; Scene drives its transform */
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  /** fires when the hovered flower changes (post | null) */
  onHoverPost: (post: GardenPost | null) => void;
  /** fires when a flower is clicked/focused, or null when focus is cleared */
  onFocusPost: (post: GardenPost | null) => void;
}

const HIT_RADIUS = 0.55; // ≈ 44px at flower-band distance from the camera
const FOCUS_LERP = 0.06; // camera easing per frame toward focus pose
const FOCUS_DISTANCE = 3.2; // how far back the camera stands from a focused flower
const FOCUS_HEIGHT = 1.3; // eye height above the flower's ground point when focused

function GardenRig({
  posts,
  reducedMotion,
  tooltipRef,
  onHoverPost,
  onFocusPost,
  controls,
}: GardenSceneProps & { controls: GardenControlValues }) {
  const palette = useGardenTheme();
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const focusedRef = useRef<number | null>(null);

  const controlsRef = useRef<any>(null);

  const {
    gridWidth,
    gridHeight,
    scale,
    heightScale,
    octaves,
    frequency,
    grassCount,
    tuftWidth,
    tuftHeight,
    slopeThreshold,
    windSpeed,
    windStrength,
    flowerWindSpeed,
    flowerWindStrength,
    fogDensity,
  } = controls;

  // ── Deterministic world data ───────────────────────────────────────────────
  const terrainData = useMemo(
    () =>
      generateTerrain(
        gridWidth,
        gridHeight,
        scale,
        heightScale,
        octaves,
        frequency,
      ),
    [gridWidth, gridHeight, scale, heightScale, octaves, frequency],
  );

  const { heads, eye, target } = useMemo(() => {
    const placements = layoutFlowers(posts, terrainData);
    const heads = flowerHeads(placements);

    // The camera stands ON the terrain at eye level as its initial (resting) pose.
    const c = GARDEN.camera;
    const eyeGround = sampleHeight(terrainData, 0, c.stripZ);
    const targetGround = sampleHeight(terrainData, 0, c.targetZ);
    const eye = new THREE.Vector3(
      0,
      (eyeGround <= -999 ? 0 : eyeGround) + c.eyeHeight,
      c.stripZ,
    );
    const target = new THREE.Vector3(
      0,
      (targetGround <= -999 ? 0 : targetGround) + c.targetHeight,
      c.targetZ,
    );
    return { heads, eye, target };
  }, [posts, terrainData]);

  // ── Camera: set initial eye-level pose once; OrbitControls owns it after ──
  useEffect(() => {
    camera.position.copy(eye);
    camera.lookAt(target);
    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  }, [camera, eye, target]);

  // ── Focus poses: computed once per heads/terrain change ────────────────────
  const focusPoses = useMemo(() => {
    return heads.map((head) => {
      const dirFromCenter = new THREE.Vector3(head.x, 0, head.z);
      const len = dirFromCenter.length();
      const backDir =
        len > 0.001
          ? dirFromCenter.clone().normalize()
          : new THREE.Vector3(0, 0, 1);

      const eyePos = new THREE.Vector3(
        head.x + backDir.x * FOCUS_DISTANCE,
        head.y + FOCUS_HEIGHT,
        head.z + backDir.z * FOCUS_DISTANCE,
      );
      const lookAt = new THREE.Vector3(head.x, head.y, head.z);
      return { eyePos, lookAt };
    });
  }, [heads]);

  const clearFocus = useCallback(() => {
    focusedRef.current = null;
    setFocusedIndex(null);
    onFocusPost(null);
    if (controlsRef.current) controlsRef.current.enabled = true;
  }, [onFocusPost]);

  const setFocus = useCallback(
    (index: number) => {
      focusedRef.current = index;
      setFocusedIndex(index);
      onFocusPost(posts[index]);
      if (controlsRef.current) controlsRef.current.enabled = false;
    },
    [onFocusPost, posts],
  );

  // ── Picking: pointermove (desktop hover) + pointerdown/up (tap resolves
  //    hover before click) + click-to-focus (no more router navigation) ─────
  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downAt: { x: number; y: number; index: number | null } | null = null;

    const pickAt = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const { origin, direction } = raycaster.ray;
      return pickFlower(origin, direction, heads, HIT_RADIUS);
    };

    const setHover = (index: number | null) => {
      if (hoveredRef.current === index) return;
      hoveredRef.current = index;
      setHoveredIndex(index);
      onHoverPost(index === null ? null : posts[index]);
      el.style.cursor = index === null ? "" : "pointer";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (focusedRef.current !== null) return; // freeze hover while focused
      const hit = pickAt(e.clientX, e.clientY);
      setHover(hit ? hit.index : null);
    };
    const onPointerDown = (e: PointerEvent) => {
      const hit = pickAt(e.clientX, e.clientY);
      if (focusedRef.current === null) setHover(hit ? hit.index : null);
      downAt = { x: e.clientX, y: e.clientY, index: hit ? hit.index : null };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const isTap = moved < 8;

      if (isTap) {
        const hit =
          pickFlowerOnClick(
            raycaster.ray.origin,
            raycaster.ray.direction,
            heads,
            HIT_RADIUS,
          ) ?? pickAt(e.clientX, e.clientY);

        if (hit) {
          // Tapping the already-focused flower again clears focus.
          if (focusedRef.current === hit.index) {
            clearFocus();
          } else {
            setFocus(hit.index);
          }
        } else if (focusedRef.current !== null) {
          // Tapping empty ground while focused clears focus.
          clearFocus();
        }
      }
      downAt = null;
    };
    const onPointerLeave = () => {
      if (focusedRef.current === null) setHover(null);
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.style.cursor = "";
    };
  }, [gl, camera, heads, posts, onHoverPost, clearFocus, setFocus]);

  // ── Escape key clears focus ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusedRef.current !== null) clearFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearFocus]);

  // ── Per-frame: lerp camera toward focus pose, or tooltip tracking ─────────
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const lookAtScratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const index = focusedRef.current;

    if (index !== null) {
      const pose = focusPoses[index];
      camera.position.lerp(pose.eyePos, FOCUS_LERP);
      lookAtScratch.lerp(pose.lookAt, FOCUS_LERP);
      camera.lookAt(lookAtScratch);

      // Tooltip is centered via CSS when focused; Scene doesn't drive its transform.
      const tip = tooltipRef.current;
      if (tip) {
        tip.style.transform = "";
        tip.style.visibility = "visible";
      }
      return;
    }

    // Not focused: reset lookAt scratch to the resting target so re-focus starts clean.
    lookAtScratch.copy(target);

    const tip = tooltipRef.current;
    if (!tip) return;
    const hoverIdx = hoveredRef.current;
    if (hoverIdx === null) return; // Garden hides it via state

    const head = heads[hoverIdx];
    worldPos.set(head.x, head.y + 0.25, head.z).project(camera);

    const rect = gl.domElement.getBoundingClientRect();
    const behind = worldPos.z > 1;
    let px = (worldPos.x * 0.5 + 0.5) * rect.width;
    let py = (-worldPos.y * 0.5 + 0.5) * rect.height;

    const w = tip.offsetWidth || 240;
    const h = tip.offsetHeight || 120;
    const margin = 8;
    px = Math.min(Math.max(px, w / 2 + margin), rect.width - w / 2 - margin);
    py = Math.min(Math.max(py - h - 16, margin), rect.height - h - margin);

    tip.style.transform = `translate(${px - w / 2}px, ${py}px)`;
    tip.style.visibility = behind ? "hidden" : "visible";
  });

  return (
    <>
      <Terrain
        terrainData={terrainData}
        palette={palette}
        fogDensity={fogDensity}
      />
      <Suspense fallback={null}>
        <Grass
          terrainData={terrainData}
          palette={palette}
          windSpeed={reducedMotion ? 0 : windSpeed}
          windStrength={reducedMotion ? 0 : windStrength}
          count={grassCount}
          tuftWidth={tuftWidth}
          tuftHeight={tuftHeight}
          slopeThreshold={slopeThreshold}
          fogDensity={fogDensity}
        />
        <Flowers
          posts={posts}
          terrainData={terrainData}
          palette={palette}
          hoveredIndex={focusedIndex ?? hoveredIndex}
          windSpeed={reducedMotion ? 0 : flowerWindSpeed}
          windStrength={reducedMotion ? 0 : flowerWindStrength}
          fogDensity={fogDensity}
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
}

// Debug mode: always on in dev, opt-in via `?debug` in production. Read once
// per mount (lazy initializer) — it never changes for the component's
// lifetime, so branching on it below doesn't touch hook call order.
function isGardenDebugMode() {
  if (process.env.NODE_ENV !== "production") return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debug");
}

export default function Scene(props: GardenSceneProps) {
  const [debug] = useState(isGardenDebugMode);

  return (
    <Canvas
      gl={async (defaultProps) => {
        const renderer = new THREE.WebGPURenderer({
          ...(defaultProps as any),
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          // GPU timestamp queries (docs/garden-perf-benchmark.md) have a
          // small overhead — only pay it in debug mode, never for visitors.
          trackTimestamp: debug,
        });
        await renderer.init();
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        return renderer;
      }}
      dpr={[1, 2]}
      camera={{ fov: GARDEN.camera.fov, near: 0.1, far: 150 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      {debug ? (
        <Suspense fallback={null}>
          <LevaGardenControls
            render={(controls) => <GardenRig {...props} controls={controls} />}
          />
          <GpuTimer />
        </Suspense>
      ) : (
        <GardenRig {...props} controls={GARDEN_CONTROL_DEFAULTS} />
      )}
    </Canvas>
  );
}
