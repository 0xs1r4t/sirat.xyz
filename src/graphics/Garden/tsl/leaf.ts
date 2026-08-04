import {
  Fn,
  cameraViewMatrix,
  dot,
  length,
  mix,
  positionGeometry,
  smoothstep,
  time,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

import { LEAF_DARK, LEAF_MID, celShadeSmoothBands } from "@graphics/Garden/tsl/colors";
import { simplexNoise } from "@graphics/Garden/tsl/wind";

/**
 * Leaf wind, ported from leaf.vert. Packed as a single vec4 (offset.xyz,
 * influence in .w) so the caller computes it once and reuses the same node
 * for both the position offset and the fragment shimmer term below —
 * matches Foliage.tsx's grass `computeWind` pattern (avoids recomputing
 * the noise samples twice, and keeps vertex/fragment reading the exact
 * same values the way a GLSL varying would have).
 *
 * `instanceWorldPos` is already fully world-space here — unlike
 * branch instances, leaf instance positions are precomputed CPU-side in
 * Trees.tsx (shared per-type local cluster template × each tree's world
 * transform), so there's no per-instance rotation/scale left to do in the
 * shader, only wind.
 *
 * `windSpeed`/`windStrength` are uniform nodes (C++ original: hardcoded
 * 0.7/0.12) — see computeBranchPosition's note on why (Trees.tsx zeroes
 * them under `reducedMotion`, both for the reduced-motion feature itself
 * and because `time` isn't something the screenshot harness can freeze).
 * The secondary noise sample (`wind2`) deliberately scales its own time
 * term by `windSpeed` too, not the C++ original's separate hardcoded 0.4 —
 * otherwise `windSpeed=0` would freeze the position offset (which *is*
 * multiplied by `windStrength`) but leave `influence` (used below for the
 * fragment's shimmer/tint, *not* multiplied by windStrength) still quietly
 * animating.
 */
export const computeLeafWind = Fn(
  ([instanceWorldPos, windSpeed, windStrength]: [any, any, any]) => {
    const windUV: any = instanceWorldPos.xz
      .mul(0.3)
      .add(time.mul(windSpeed).mul(vec2(0.5, 0.3)));
    const wind1: any = simplexNoise(windUV).mul(0.5).add(0.5);
    const wind2: any = simplexNoise(
      windUV.mul(2.3).add(time.mul(windSpeed).mul(0.4 / 0.7)),
    )
      .mul(0.5)
      .add(0.5);
    const windNoise: any = wind1.add(wind2.mul(0.5)).sub(0.75);

    const heightFactor: any = smoothstep(0, 3, instanceWorldPos.y);

    const offset: any = vec3(
      windNoise.mul(windStrength).mul(heightFactor),
      windNoise.mul(windStrength).mul(0.2).mul(heightFactor),
      windNoise.mul(windStrength).mul(0.7).mul(heightFactor),
    );
    const influence: any = wind1.add(wind2).mul(0.5).mul(heightFactor);

    return vec4(offset.x, offset.y, offset.z, influence);
  },
);

/**
 * Spherical billboard (camera right *and* up, from the view matrix's
 * columns) — distinct from grass's ground-locked cylindrical billboard and
 * flowers' Y-locked one (see Foliage.tsx). `windCenter` is the leaf's
 * world position *after* `computeLeafWind`'s offset has already been
 * added.
 */
export const computeLeafPosition = Fn(([windCenter, instanceScale]: [any, any]) => {
  // `: any` — bracket-indexing a mat4 node needs the cast (confirmed against
  // three's own `billboarding()` TSL helper source during the Phase 2 flower
  // billboard port; see Foliage.tsx's identical pattern).
  const viewMatrix: any = cameraViewMatrix;
  const cameraRight: any = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  const cameraUp: any = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

  const vertexOffset: any = cameraRight
    .mul(positionGeometry.x)
    .add(cameraUp.mul(positionGeometry.y))
    .mul(instanceScale);

  return windCenter.add(vertexOffset);
});

/**
 * Leaf color, ported from leaf.frag: `celShadeSmoothBands` using the
 * precomputed `customNormal` attribute (not a computed surface normal —
 * the KodiakWhale trick's whole point), wind shimmer/tint, and a
 * distance-from-*world-origin* AO falloff. That last one is ported
 * verbatim from the C++ (`length(WorldPos)`, not distance from the tree or
 * cluster) — since every tree in this port sits well outside a ~2-unit
 * radius of the origin (camera-corridor exclusion alone guarantees
 * |x|>4), `aoFactor` saturates to 1.0 almost immediately and this term is
 * effectively a no-op here, same as it likely was for most of the
 * original's off-center trees. Kept as-is rather than "fixed" into a
 * cluster-relative distance the source never specified.
 */
export const getLeafColor = Fn(
  ([worldPos, customNormal, lightDir, windInfluence, bandMul]: [
    any,
    any,
    any,
    any,
    any,
  ]) => {
    const N: any = customNormal.normalize();
    const L: any = lightDir.negate().normalize();
    const NdotL: any = dot(N, L).mul(0.5).add(0.5);

    let shaded: any = celShadeSmoothBands(
      NdotL,
      LEAF_DARK.mul(bandMul.x),
      LEAF_MID.mul(bandMul.y),
      6,
    );

    const windShimmer: any = windInfluence.mul(0.1);
    shaded = shaded.add(
      vec3(windShimmer.mul(0.05), windShimmer.mul(0.08), windShimmer.mul(0.05)),
    );
    const windTint: any = vec3(0.1, 0.15, 0.05).mul(windInfluence).mul(0.15);
    shaded = mix(shaded, shaded.add(windTint), windInfluence.mul(0.3));

    const aoFactor: any = smoothstep(0, 2, length(worldPos));
    shaded = shaded.mul(mix(0.5, 1.0, aoFactor));

    return shaded;
  },
);
