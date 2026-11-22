import * as THREE from "three/webgpu";

/** Shared billboard quad, anchored at its base. */
export const makeQuad = (
  width: number,
  height: number,
): THREE.InstancedBufferGeometry => {
  const hw = width / 2;
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(
      // prettier-ignore
      new Float32Array([
        -hw, 0, 0,
         hw, 0, 0,
         hw, height, 0,
        -hw, height, 0,
      ]),
      3,
    ),
  );
  geo.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2),
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  return geo;
};
