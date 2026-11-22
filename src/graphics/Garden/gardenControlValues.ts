/**
 * Live-tunable garden parameters consumed by Scene.tsx. Kept separate from
 * the sidebar schema/state (useGardenControls.ts) so the render tree depends
 * only on the values it actually consumes.
 */
export interface GardenControlValues {
  gridWidth: number;
  gridHeight: number;
  heightScale: number;
  octaves: number;
  frequency: number;
  grassDensity: number;
  tuftWidth: number;
  tuftHeight: number;
  slopeThreshold: number;
  windSpeed: number;
  windStrength: number;
  flowerWindSpeed: number;
  flowerWindStrength: number;
  flowerWidth: number;
  flowerHeight: number;
  fogNear: number;
  fogFar: number;
  treeCount: number;
  treeSize: number;
}
