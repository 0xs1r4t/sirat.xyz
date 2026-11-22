"use client";

import { useEffect, useMemo } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

import type { FlowerHead } from "@/lib/garden/picking";
import type { GardenFocusPose } from "@graphics/Garden/useGardenWorld";

const FOCUS_LERP = 0.06; // camera easing per frame toward focus pose

interface UseGardenCameraOptions {
  camera: RootState["camera"];
  gl: RootState["gl"];
  invalidate: RootState["invalidate"];
  tooltipRef: RefObject<HTMLDivElement | null>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  eye: THREE.Vector3;
  target: THREE.Vector3;
  heads: FlowerHead[];
  focusPoses: GardenFocusPose[];
  hoveredRef: RefObject<number | null>;
  focusedRef: RefObject<number | null>;
}

/**
 * Camera ownership after mount: sets the resting eye-level pose once, then
 * per frame either eases toward a focused flower or positions the hover
 * tooltip over the flower under the pointer.
 */
export const useGardenCamera = ({
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
}: UseGardenCameraOptions) => {
  // Set the initial eye-level pose once; OrbitControls owns it after.
  useEffect(() => {
    camera.position.copy(eye);
    camera.lookAt(target);
    if (controlsRef.current) {
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    }
  }, [camera, eye, target, controlsRef]);

  // Per-frame: lerp camera toward focus pose, or track the hovered flower.
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const lookAtScratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const index = focusedRef.current;

    if (index !== null) {
      const pose = focusPoses[index];
      camera.position.lerp(pose.eyePos, FOCUS_LERP);
      lookAtScratch.lerp(pose.lookAt, FOCUS_LERP);
      camera.lookAt(lookAtScratch);

      // Tooltip is centered via CSS when focused; the scene doesn't drive its transform.
      const tip = tooltipRef.current;
      if (tip) {
        tip.style.transform = "";
        tip.style.visibility = "visible";
      }
      invalidate(); // keep easing toward the focus pose under frameloop="demand"
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
    invalidate(); // keep the tooltip tracking the flower under frameloop="demand"
  });
};
