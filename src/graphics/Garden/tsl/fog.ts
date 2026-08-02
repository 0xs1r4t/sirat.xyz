import { Fn, cameraPosition, length, mix, smoothstep } from "three/tsl";

/**
 * Theme-driven linear near/far fog, ported from shaders/fog.glsl. `fogColor`,
 * `fogNear` and `fogFar` are passed in as uniform nodes rather than closed
 * over, so each material can own (and live-update) its own copy — matching
 * the per-material `uFogColor`/`uFogNear`/`uFogFar` uniforms from the GLSL
 * original. No fog before `fogNear`; ramps smoothly to fully fogColor by
 * `fogFar` — replaces the original exp²-density curve, which had no way to
 * keep nearby geometry fog-free (see docs/features.md #1).
 */
export const applyGardenFog = Fn(
  ([colorIn, fragPos, fogColor, fogNear, fogFar]: [any, any, any, any, any]) => {
    const dist: any = length(fragPos.sub(cameraPosition));
    const fogFactor: any = smoothstep(fogNear, fogFar, dist);

    return mix(colorIn, fogColor, fogFactor);
  },
);
