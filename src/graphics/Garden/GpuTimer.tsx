"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three/webgpu";

const MAX_SAMPLES = 3600; // ~60s at 60fps, generous cap on the ring buffer

const percentile = (sorted: number[], p: number): number => {
  if (sorted.length === 0) return NaN;
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return sorted[idx];
};

// Dev-only instrumentation for docs/garden-perf-benchmark.md. Only ever
// mounted behind the same `debug` gate as Leva (see Scene.tsx) — never
// reaches production visitors. Press "g" to print median/p95 frame time
// over the samples collected since the last press (or mount), plus the
// latest GPU timestamp, draw call count, and triangle count; the window
// resets after each print so consecutive benchmark runs don't bleed together.
const GpuTimer = () => {
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  const frameSamplesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number | null>(null);

  useFrame(() => {
    const now = performance.now();
    if (lastTimeRef.current !== null) {
      const samples = frameSamplesRef.current;
      samples.push(now - lastTimeRef.current);
      if (samples.length > MAX_SAMPLES) samples.shift();
    }
    lastTimeRef.current = now;
    gl.resolveTimestampsAsync(THREE.TimestampQuery.RENDER);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "g") return;
      const sorted = [...frameSamplesRef.current].sort((a, b) => a - b);
      const median = percentile(sorted, 0.5);
      const p95 = percentile(sorted, 0.95);
      const { timestamp, drawCalls, triangles } = gl.info.render;
      console.log(
        `[garden-perf] n=${sorted.length} frame ms median=${median.toFixed(2)} p95=${p95.toFixed(2)} | gpu=${timestamp !== undefined ? timestamp.toFixed(2) : "n/a"}ms | draws=${drawCalls} tris=${triangles}`,
      );
      frameSamplesRef.current = [];
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gl]);

  return null;
};

export default GpuTimer;
