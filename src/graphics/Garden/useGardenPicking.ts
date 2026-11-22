"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { RootState } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

import type { GardenPost } from "@/lib/garden/meadow";
import { pickFlower, type FlowerHead } from "@/lib/garden/picking";

const HIT_RADIUS = 0.55; // ≈ 44px at flower-band distance from the camera
const TAP_SLOP_PX = 8;

interface UseGardenPickingOptions {
  gl: RootState["gl"];
  camera: RootState["camera"];
  heads: FlowerHead[];
  posts: GardenPost[];
  onHoverPost: (post: GardenPost | null) => void;
  onFocusPost: (post: GardenPost | null) => void;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}

/**
 * Flower hover/focus interaction: pointer picking, tap-to-focus, and Escape
 * to clear. Owns the hovered/focused refs so the camera hook can follow them
 * without re-rendering the scene on every pointer move.
 */
export const useGardenPicking = ({
  gl,
  camera,
  heads,
  posts,
  onHoverPost,
  onFocusPost,
  controlsRef,
}: UseGardenPickingOptions) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const focusedRef = useRef<number | null>(null);

  const clearFocus = useCallback(() => {
    focusedRef.current = null;
    setFocusedIndex(null);
    onFocusPost(null);
    if (controlsRef.current) controlsRef.current.enabled = true;
  }, [onFocusPost, controlsRef]);

  const setFocus = useCallback(
    (index: number) => {
      focusedRef.current = index;
      setFocusedIndex(index);
      onFocusPost(posts[index]);
      if (controlsRef.current) controlsRef.current.enabled = false;
    },
    [onFocusPost, posts, controlsRef],
  );

  // Picking: pointermove (desktop hover) + pointerdown/up (tap resolves hover
  // before click) + click-to-focus (no more router navigation).
  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downAt: { x: number; y: number } | null = null;

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
      downAt = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
      const isTap = moved < TAP_SLOP_PX;

      if (isTap) {
        const hit =
          pickFlower(
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

  // Escape key clears focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusedRef.current !== null) clearFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearFocus]);

  return { hoveredIndex, focusedIndex, hoveredRef, focusedRef };
};
