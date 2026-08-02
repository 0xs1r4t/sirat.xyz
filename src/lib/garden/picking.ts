/**
 * Flower hover/click picking.
 *
 * The garden's shaders billboard and offset instances in the vertex stage,
 * so three's built-in Raycaster can't see where flowers actually are.
 * Instead each flower gets an invisible hit-sphere around its head, and we
 * intersect the pointer ray with those directly. Pure math — no three
 * objects — so it's unit-testable and runs on both pointermove (desktop
 * hover) and pointerdown (mobile: a single tap resolves hover before the
 * click fires — plan §7/§10.5).
 */
import type { FlowerPlacement } from "@/lib/garden/meadow";

/** Plain xyz triple — deliberately not a THREE.Vector3, so picking stays unit-testable. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** A flower's clickable hit-sphere center, with the post it belongs to. */
export interface FlowerHead extends Vec3 {
  index: number;
  slug: string;
}

/** World-space centers of every flower's head (the clickable blossom). */
export const flowerHeads = (
  placements: FlowerPlacement[],
  // flowerHeight: number,
): FlowerHead[] =>
  placements.map((p, index) => ({
    index,
    slug: p.slug,
    x: p.x,
    y: p.y, // + flowerHeight * 0.72, // blossom sits near the top of the quad
    z: p.z,
  }));

/**
 * Nearest ray↔sphere hit, or null.
 * `radius` is generous (≈ the whole blossom plus margin) — the 3D
 * equivalent of a 44px tap target.
 */
export const pickFlower = (
  origin: Vec3,
  dir: Vec3, // must be normalized
  heads: FlowerHead[],
  radius = 0.55,
): FlowerHead | null => {
  let best: FlowerHead | null = null;
  let bestT = Infinity;
  const r2 = radius * radius;

  for (const head of heads) {
    const ox = head.x - origin.x;
    const oy = head.y - origin.y;
    const oz = head.z - origin.z;

    // Project head center onto the ray
    const t = ox * dir.x + oy * dir.y + oz * dir.z;
    if (t < 0) continue; // behind the camera

    const cx = ox - dir.x * t;
    const cy = oy - dir.y * t;
    const cz = oz - dir.z * t;
    const d2 = cx * cx + cy * cy + cz * cz;

    if (d2 <= r2 && t < bestT) {
      bestT = t;
      best = head;
    }
  }
  return best;
};

/** Same hit-test as {@link pickFlower}, for the tap/click path. */
export const pickFlowerOnClick = (
  origin: Vec3,
  dir: Vec3,
  heads: FlowerHead[],
  radius = 0.55,
): FlowerHead | null => pickFlower(origin, dir, heads, radius);
