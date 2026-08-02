import { Fn } from "three/tsl";
import { GRASS_DARK, GRASS_MID } from "@graphics/Garden/tsl/colors";
import { srgbRGB } from "@graphics/Garden/tsl/colorSpace";

const VALLEY = srgbRGB(0.2, 0.3, 0.15);
const HIGHLANDS = srgbRGB(0.45, 0.5, 0.35);
const PEAK = srgbRGB(0.5, 0.5, 0.45);

/**
 * Height-band terrain colour ramp, ported from terrain.frag's
 * getTerrainColor(). Thresholds 0.3/0.8/1.4/2.0 are the original C++
 * absolutes (1.5/4/7/10) divided by its heightScale of 5, so the top two
 * bands (brown highlands, grey peaks) stay unreachable by the normalized
 * [0,1] noise output — exactly like the original (docs/garden-webgpu-plan.md
 * item 1.4).
 */
export const getTerrainColor = Fn(([heightRatio]: [any]) => heightRatio
    .lessThan(0.3)
    .select(
      VALLEY,
      heightRatio
        .lessThan(0.8)
        .select(
          GRASS_DARK,
          heightRatio
            .lessThan(1.4)
            .select(GRASS_MID, heightRatio.lessThan(2.0).select(HIGHLANDS, PEAK)),
        ),
    ));
