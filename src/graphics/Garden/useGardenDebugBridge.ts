"use client";

import { useEffect } from "react";
import type { RootState } from "@react-three/fiber";
import * as THREE from "three";

import { gardenDebugState } from "@graphics/Garden/gardenDebug";

interface UseGardenDebugBridgeOptions {
  debug: boolean;
  gl: RootState["gl"];
  scene: RootState["scene"];
  invalidate: RootState["invalidate"];
}

/**
 * Publishes the screenshot-harness bridge on `window.__gardenDebug` in debug
 * mode only (docs/garden-screenshot-harness.md). Call after the camera hook
 * so `ready` only flips true once the resting pose has been set.
 */
export const useGardenDebugBridge = ({
  debug,
  gl,
  scene,
  invalidate,
}: UseGardenDebugBridgeOptions) => {
  useEffect(() => {
    if (!debug || typeof window === "undefined") return;

    window.__gardenDebug = {
      ready: true,
      setFixedTime: (seconds) => {
        gardenDebugState.fixedTime = seconds;
        invalidate();
      },
      getRenderInfo: () => ({
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      }),
      // renderer.info above is known-unreliable for readiness checks (see
      // docs/garden-perf-benchmark.md's draws=0/tris=0 gotcha — r3f drives
      // its own render loop instead of calling setAnimationLoop, so three's
      // per-frame info.reset() never fires). Counting actual mounted Mesh
      // objects reflects what the React reconciler has committed instead,
      // regardless of whether/when a GPU render call has run yet.
      getMeshCount: () => {
        let count = 0;
        scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) count++;
        });
        return count;
      },
    };

    return () => {
      delete window.__gardenDebug;
    };
  }, [debug, gl, scene, invalidate]);
};
