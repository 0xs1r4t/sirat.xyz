"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { sampleHeight } from "@/lib/garden/terrain";
import {
  GARDEN,
  getGardenTerrain,
  layoutFlowers,
  type GardenPost,
} from "@/lib/garden/meadow";
import { flowerHeads, pickFlower } from "@/lib/garden/picking";
import { useGardenTheme } from "@graphics/Garden/useGardenTheme";
import Terrain from "@graphics/Garden/Terrain";
import { Grass, Flowers } from "@graphics/Garden/Foliage";

export interface GardenSceneProps {
  posts: GardenPost[];
  immersive: boolean;
  reducedMotion: boolean;
  /** DOM tooltip inside the stage container; Scene drives its transform */
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  /** fires when the hovered flower changes (post | null) */
  onHoverPost: (post: GardenPost | null) => void;
}

const HIT_RADIUS = 0.55; // ≈ 44px at flower-band distance from the strip camera

function GardenRig({
  posts,
  immersive,
  reducedMotion,
  tooltipRef,
  onHoverPost,
}: GardenSceneProps) {
  const palette = useGardenTheme();
  const router = useRouter();
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);

  // ── Deterministic world data ───────────────────────────────────────────────
  const terrainData = useMemo(() => getGardenTerrain(), []);
  const { heads, eye, target } = useMemo(() => {
    const placements = layoutFlowers(posts, terrainData);
    const heads = flowerHeads(placements, GARDEN.flower.height);

    // The strip camera stands ON the terrain at eye level.
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

  // ── Camera: eye-level strip framing; snap back when immersive exits ───────
  useEffect(() => {
    if (!immersive) {
      camera.position.copy(eye);
      camera.lookAt(target);
    }
  }, [immersive, camera, eye, target]);

  useFrame(({ clock }) => {
    if (immersive) return; // OrbitControls owns the camera in immersive mode
    const drift = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.08) * 0.7;
    camera.position.set(eye.x + drift, eye.y, eye.z);
    camera.lookAt(target);
  });

  // ── Picking: pointermove (desktop hover) + pointerdown (mobile tap
  //    resolves hover before click — plan §7/§10.5) + click-to-navigate ──────
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
      const hit = pickAt(e.clientX, e.clientY);
      setHover(hit ? hit.index : null);
    };
    const onPointerDown = (e: PointerEvent) => {
      const hit = pickAt(e.clientX, e.clientY);
      setHover(hit ? hit.index : null);
      downAt = { x: e.clientX, y: e.clientY, index: hit ? hit.index : null };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!downAt || downAt.index === null) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const hit = pickAt(e.clientX, e.clientY);
      // A tap/click (not an orbit drag) on the same flower → navigate.
      if (moved < 8 && hit && hit.index === downAt.index) {
        router.push(`/garden/${hit.slug}`);
      }
      downAt = null;
    };
    const onPointerLeave = () => setHover(null);

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
  }, [gl, camera, heads, posts, onHoverPost, router]);

  // ── Tooltip tracking: world → screen each frame, clamped to the stage ─────
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const tip = tooltipRef.current;
    if (!tip) return;
    const index = hoveredRef.current;
    if (index === null) return; // Garden hides it via state

    const head = heads[index];
    worldPos.set(head.x, head.y + 0.25, head.z).project(camera);

    const rect = gl.domElement.getBoundingClientRect();
    const behind = worldPos.z > 1;
    let px = (worldPos.x * 0.5 + 0.5) * rect.width;
    let py = (-worldPos.y * 0.5 + 0.5) * rect.height;

    // Clamp so the card never clips outside the stage (plan §7).
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
      <Terrain terrainData={terrainData} palette={palette} />
      <Suspense fallback={null}>
        <Grass
          terrainData={terrainData}
          palette={palette}
          windStrength={reducedMotion ? 0 : GARDEN.wind.strength}
        />
        <Flowers
          posts={posts}
          terrainData={terrainData}
          palette={palette}
          hoveredIndex={hoveredIndex}
          windStrength={reducedMotion ? 0 : GARDEN.wind.strength}
        />
      </Suspense>
      {immersive && (
        <OrbitControls
          target={[target.x, target.y, target.z]}
          minDistance={3}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2 - 0.04}
          enableDamping
          dampingFactor={0.05}
        />
      )}
    </>
  );
}

export default function Scene(props: GardenSceneProps) {
  return (
    <Canvas
      // Transparent canvas + NoToneMapping: the fog color comes straight
      // from --color-background, so distant terrain melts into the page
      // pixel-for-pixel. ACES would shift that and reintroduce a seam.
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      dpr={[1, 2]}
      camera={{ fov: GARDEN.camera.fov, near: 0.1, far: 150 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <GardenRig {...props} />
    </Canvas>
  );
}
