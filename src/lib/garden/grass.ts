import { mulberry32 } from "@/lib/garden/noise";
import {
  sampleHeight,
  sampleNormal,
  type TerrainData,
} from "@/lib/garden/terrain";

const CHUNK_SIZE = 8;

/** One chunk of grass instance roots and their per-blade wind phases. */
export interface GrassChunk {
  positions: Float32Array;
  windPhases: Float32Array;
  count: number;
}

/**
 * Slope-checked random scatter across the terrain slab, bucketed into
 * CHUNK_SIZE world-unit cells so each chunk becomes its own draw call with
 * its own bounding sphere (plan item 5.1 — chunked frustum culling). Port
 * of web-terrain's generatePositions.
 */
export const generateGrassChunks = (
  count: number,
  td: TerrainData,
  seed: number,
  slopeThreshold: number,
): GrassChunk[] => {
  const rng = mulberry32(seed);
  const hw = td.width / 2;
  const hh = td.height / 2;
  const buckets = new Map<
    string,
    { positions: number[]; phases: number[] }
  >();

  let placed = 0;
  for (let i = 0; i < count * 2 && placed < count; i++) {
    const wx = rng() * td.width - hw;
    const wz = rng() * td.height - hh;
    const wy = sampleHeight(td, wx, wz);
    if (wy <= -999) continue;

    const [, ny] = sampleNormal(td, wx, wz);
    if (ny <= slopeThreshold) continue;

    const key = `${Math.floor(wx / CHUNK_SIZE)},${Math.floor(wz / CHUNK_SIZE)}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { positions: [], phases: [] };
      buckets.set(key, bucket);
    }
    bucket.positions.push(wx, wy, wz);
    bucket.phases.push(rng() * Math.PI * 2);
    placed++;
  }

  return Array.from(buckets.values()).map((b) => ({
    positions: new Float32Array(b.positions),
    windPhases: new Float32Array(b.phases),
    count: b.positions.length / 3,
  }));
};
