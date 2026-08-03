import {
  Fn,
  attribute,
  cameraPosition,
  cos,
  dot,
  max,
  mix,
  pow,
  positionGeometry,
  normalGeometry,
  sin,
  smoothstep,
  time,
  vec2,
  vec3,
} from "three/tsl";

import { BARK_DARK, BARK_LIGHT, BARK_MID, celShadeQuantized } from "@graphics/Garden/tsl/colors";
import { simplexNoise } from "@graphics/Garden/tsl/wind";

/**
 * Rotates a vec3 around Y by `rotationY` (radians) — used for both position
 * and normal (uniform per-instance scale means normals don't need the
 * inverse-transpose treatment, just the same rotation).
 */
const rotateY = Fn(([v, rotationY]: [any, any]) => {
  const c: any = cos(rotationY);
  const s: any = sin(rotationY);
  return vec3(v.x.mul(c).add(v.z.mul(s)), v.y, v.z.mul(c).sub(v.x.mul(s)));
});

/**
 * Branch instance world position, ported from branch.vert. Manual
 * instancing (matching Foliage.tsx's grass/flower pattern, not
 * THREE.InstancedMesh) — `instanceOffset`/`instanceRotationY`/
 * `instanceScale` are per-tree attributes, one entry per placed tree of
 * this branch type.
 *
 * Wind: gentle noise-scroll sway on upper branches only. `heightFactor`
 * deliberately uses *local* (pre-scale/rotate) geometry Y, matching the
 * C++ original's `aPos.y` exactly (not a bug — same asymmetry as the
 * source). `windSpeed`/`windStrength` are uniform nodes rather than the
 * C++ original's hardcoded 0.5/0.04 — Trees.tsx zeroes them under
 * `reducedMotion`, matching how Foliage.tsx's grass/flowers zero their own
 * wind amplitude (that path also matters for the screenshot harness: `time`
 * isn't something `window.__gardenDebug.setFixedTime` freezes, so
 * leaving tree wind always-on made captures non-deterministic — confirmed
 * via a real capture-twice-diff showing mismatches concentrated exactly on
 * leaf-cluster silhouettes).
 */
export const computeBranchPosition = Fn(
  ([windSpeed, windStrength]: [any, any]) => {
    const instanceOffset: any = attribute("instanceOffset", "vec3");
    const instanceRotationY: any = attribute("instanceRotationY", "float");
    const instanceScale: any = attribute("instanceScale", "float");

    const scaled: any = positionGeometry.mul(instanceScale);
    const rotated: any = rotateY(scaled, instanceRotationY);
    const worldPos: any = rotated.add(instanceOffset);

    const windUV: any = worldPos.xz
      .mul(0.15)
      .add(time.mul(windSpeed).mul(vec2(0.5, 0.3)));
    const windNoise: any = simplexNoise(windUV);
    const heightFactor: any = smoothstep(0, 2.5, positionGeometry.y);

    const windOffset: any = vec3(
      windNoise.mul(windStrength).mul(heightFactor),
      0,
      windNoise.mul(windStrength).mul(0.6).mul(heightFactor),
    );

    return worldPos.add(windOffset);
  },
);

/** World-space normal for a branch instance — same rotation as position, no wind (matches C++: Normal ignores wind). */
export const computeBranchNormal = Fn(() => {
  const instanceRotationY: any = attribute("instanceRotationY", "float");
  return rotateY(normalGeometry, instanceRotationY).normalize();
});

/**
 * Bark color, ported from branch.frag: height-based dark→mid bark mix,
 * quantized cel-shading toward `LIGHT_BARK`, rim light. `bandMul` is a
 * (dark, light) pair — day/night lift uniform, same pattern
 * Terrain.tsx/grass use (NIGHT_BARK_BAND/DAY_BARK_BAND in constants.ts).
 */
export const getBranchColor = Fn(
  ([worldPos, worldNormal, lightDir, bandMul]: [any, any, any, any]) => {
    const N: any = worldNormal;
    const L: any = lightDir.negate().normalize();
    const V: any = cameraPosition.sub(worldPos).normalize();

    const NdotL: any = dot(N, L).mul(0.5).add(0.5);
    const height: any = worldPos.y.mul(0.2).add(0.5).clamp(0, 1);

    const baseColor: any = mix(BARK_DARK, BARK_MID, height);
    const branchColor: any = celShadeQuantized(
      NdotL,
      baseColor.mul(bandMul.x),
      BARK_LIGHT.mul(bandMul.y),
      6,
    );

    const rim: any = pow(max(dot(V, N), 0).oneMinus(), 3).mul(0.3);
    return branchColor.add(vec3(rim));
  },
);
