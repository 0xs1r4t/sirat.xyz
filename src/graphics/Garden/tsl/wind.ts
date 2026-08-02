import { Fn, dot, float, floor, max, select, sin, time, vec2, vec3, vec4 } from "three/tsl";

/**
 * Simplex-ish hash/noise pair ported verbatim from grass.vert/flower.vert
 * (copy-pasted 3x in the GLSL originals — collapsed into one place here
 * per docs/garden-webgpu-plan.md item 3.4).
 *
 * Intermediate values are pinned to `: any` throughout this file. TSL's
 * node types are heavily overloaded by vector width (vec2/vec3/float, ...),
 * and calling an overloaded function with an `any` argument makes
 * TypeScript silently pick the *first* matching overload rather than
 * propagating `any` — so a vec2 result can get mistyped as a float a few
 * lines later. Since this is a mechanical GLSL→TSL port with no meaningful
 * static guarantees to preserve (a real type mismatch fails loudly at
 * three's node-builder stage), keeping every intermediate as `any` avoids
 * fighting that inference rather than adding real safety.
 */
const hash2 = Fn(([p]: [any]) => {
  const pp: any = vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3)),
  );
  // Cast to `any`: sin() on an `any`-typed vec2 input resolves to its first
  // (scalar) overload, so without this hash2's inferred return type would
  // be Node<"float"> even though it's actually a vec2 at runtime.
  return sin(pp).mul(43758.5453123).fract().mul(2).sub(1) as any;
});

const simplexNoise = Fn(([p]: [any]) => {
  const K1 = float(0.366025404);
  const K2 = float(0.211324865);

  const i: any = floor(p.add(p.x.add(p.y).mul(K1)));
  const a: any = p.sub(i).add(i.x.add(i.y).mul(K2));
  const o: any = select(a.x.greaterThan(a.y), vec2(1, 0), vec2(0, 1));
  const b: any = a.sub(o).add(K2);
  const c: any = a.sub(1).add(K2.mul(2));

  const h: any = max(
    vec3(0.5).sub(vec3(dot(a, a), dot(b, b), dot(c, c))),
    0,
  );
  const h4: any = h.mul(h).mul(h).mul(h);
  const n: any = h4.mul(
    vec3(
      dot(a, hash2(i)),
      dot(b, hash2(i.add(o))),
      dot(c, hash2(i.add(vec2(1, 1)))),
    ),
  );
  return dot(n, vec3(70));
});

/**
 * Counter-scrolling wind, ported verbatim from grass.vert/flower.vert's
 * shared wind block (3-octave in the original).
 *
 * Returns a vec4 packing the world-space XZ offset plus the
 * (wind1+wind2)/2 "WindInfluence" used for shimmer in the fragment
 * shaders — `.x`/`.y` are the offset, `.z` is the influence.
 *
 * `heightInfluence` is the caller's y²-style bend factor (quadratic — tips
 * sway, roots stay planted) and `variationSeed` breaks per-instance
 * uniformity (grass: windPhase; flowers: instanceRand * 2π).
 *
 * `octaveCount` is a plain JS number, not a TSL node: it's read once, at
 * material-build time, to decide which `simplexNoise()` calls even get
 * added to the shader graph — the low device tier's "2 octaves instead of
 * 3" (plan 5.4) needs wind3 to not exist in the compiled shader at all, not
 * just be branched around at runtime. Because of that this has to be a
 * factory (`makeWind(2 | 3)`) rather than a single `Fn` taking octaveCount
 * as one more argument — `Fn`'s parameters are shader-graph inputs, which
 * would turn octaveCount into a runtime value and defeat the point.
 */
const makeWind = (octaveCount: 2 | 3) =>
  Fn(
    ([instanceOffset, windSpeed, windStrength, heightInfluence, variationSeed]: [
      any,
      any,
      any,
      any,
      any,
    ]) => {
      const windUV: any = instanceOffset.xz
        .mul(0.5)
        .add(time.mul(windSpeed).mul(vec2(0.6, 0.4)));

      const wind1: any = simplexNoise(windUV).mul(0.5).add(0.5);
      const wind2: any = simplexNoise(windUV.mul(2.5).add(time.mul(0.8)))
        .mul(0.5)
        .add(0.5);

      let windNoise: any;
      if (octaveCount >= 3) {
        const wind3: any = simplexNoise(windUV.mul(0.8).sub(time.mul(0.3)))
          .mul(0.5)
          .add(0.5);
        windNoise = wind1.mul(0.5).add(wind2.mul(0.3)).add(wind3.mul(0.2)).sub(0.5);
      } else {
        // 2-octave: redistribute wind3's 0.2 weight across the remaining
        // two so the total amplitude stays roughly the same.
        windNoise = wind1.mul(0.6).add(wind2.mul(0.4)).sub(0.5);
      }

      let windDirection: any = vec2(
        windNoise.mul(windStrength).mul(heightInfluence),
        windNoise.mul(windStrength).mul(0.6).mul(heightInfluence),
      );

      const variation: any = sin(variationSeed).mul(43758.5453).fract();
      windDirection = windDirection.mul(variation.mul(0.4).add(0.8));

      const windInfluence: any = wind1.add(wind2).mul(0.5);

      return vec4(windDirection.x, windDirection.y, windInfluence, 0);
    },
  );

export const computeWind = makeWind(3);
export const computeWindLowTier = makeWind(2);
