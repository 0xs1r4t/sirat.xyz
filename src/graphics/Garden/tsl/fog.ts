import { Fn, cameraPosition, clamp, exp, length, mix } from "three/tsl";

/**
 * Theme-driven exp²-fog, ported from shaders/fog.glsl. `fogColor` and
 * `fogDensity` are passed in as uniform nodes rather than closed over, so
 * each material can own (and live-update) its own copy — matching the
 * per-material `uFogColor`/`uFogDensity` uniforms from the GLSL original.
 */
export const applyGardenFog = Fn(
  ([colorIn, fragPos, fogColor, fogDensity]: [any, any, any, any]) => {
    const dist: any = length(fragPos.sub(cameraPosition));
    const densitySq: any = fogDensity.mul(fogDensity);
    const fogFactor: any = exp(densitySq.mul(dist).mul(dist).negate())
      .oneMinus();

    return mix(colorIn, fogColor, clamp(fogFactor, 0, 1));
  },
);
