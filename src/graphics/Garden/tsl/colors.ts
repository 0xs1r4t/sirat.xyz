import { Fn, abs, float, mix, mod, select, smoothstep } from "three/tsl";
import { srgbRGB } from "@graphics/Garden/tsl/colorSpace";

// Ported from shaders/colors.glsl. Only the palette entries the terrain and
// grass materials actually reference — the rest of the original palette
// (bark/sky/flower/neutral swatches) belongs to the tree port in Phase 3.
export const GRASS_DARK = srgbRGB(0.15, 0.3, 0.1);
export const GRASS_MID = srgbRGB(0.3, 0.6, 0.2);
export const GRASS_TIP = srgbRGB(0.7, 0.85, 0.4);

// ===== CEL-SHADING FUNCTIONS =====
// Intermediate values are pinned to `: any` — see the note in tsl/wind.ts
// on why fighting TSL's overload inference here isn't worth it for a
// mechanical port.

/** Quantize lighting to N discrete bands. */
export const celQuantize = Fn(([value, bands]: [any, any]) => {
  const inverseN: any = float(1).div(bands);
  const difference: any = mod(value, inverseN);
  return value.sub(difference).add(inverseN);
});

/** Simple quantized cel-shading. */
export const celShadeQuantized = Fn(
  ([NdotL, darkColor, lightColor, bands]: [any, any, any, any]) => {
    const quantized: any = celQuantize(NdotL, bands);
    return mix(darkColor, lightColor, quantized);
  },
);

/** Smooth cel-shading to reduce harsh transitions. */
export const celShadeSmoothBands = Fn(
  ([NdotL, darkColor, lightColor, bands]: [any, any, any, any]) => {
    const quantized: any = celQuantize(NdotL, bands);
    const inverseN: any = float(1).div(bands);
    const edgeSmoothness = float(0.02);

    const distToEdge: any = abs(mod(NdotL, inverseN).sub(inverseN.mul(0.5)));
    const smoothFactor: any = smoothstep(
      inverseN.mul(0.5).sub(edgeSmoothness),
      inverseN.mul(0.5),
      distToEdge,
    );

    return mix(darkColor, lightColor, quantized.mul(smoothFactor));
  },
);

/** Cel-shade with an explicit 3-band colour ramp. */
export const celShade3Band = Fn(
  ([NdotL, darkColor, midColor, lightColor]: [any, any, any, any]) => select(
      NdotL.greaterThan(0.7),
      lightColor,
      select(NdotL.greaterThan(0.3), midColor, darkColor),
    ),
);

/** Cel-shade with an explicit 4-band colour ramp. */
export const celShade4Band = Fn(
  (
    [NdotL, shadowColor, darkColor, midColor, lightColor]: [
      any,
      any,
      any,
      any,
      any,
    ],
  ) => select(
      NdotL.greaterThan(0.8),
      lightColor,
      select(
        NdotL.greaterThan(0.5),
        midColor,
        select(NdotL.greaterThan(0.2), darkColor, shadowColor),
      ),
    ),
);
