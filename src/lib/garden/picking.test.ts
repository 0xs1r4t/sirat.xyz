import assert from "node:assert/strict";
import { test } from "node:test";

import { pickFlower, type FlowerHead } from "./picking.ts";

const head = (
  index: number,
  x: number,
  y: number,
  z: number,
): FlowerHead => ({ index, slug: `post-${index}`, x, y, z });

const ORIGIN = { x: 0, y: 0, z: 0 };
const FORWARD = { x: 0, y: 0, z: -1 };

test("returns the head the ray passes through", () => {
  const hit = pickFlower(ORIGIN, FORWARD, [head(0, 0, 0, -5)]);
  assert.equal(hit?.index, 0);
  assert.equal(hit?.slug, "post-0");
});

test("returns null when the ray misses every head", () => {
  assert.equal(pickFlower(ORIGIN, FORWARD, [head(0, 2, 0, -5)]), null);
});

test("ignores heads behind the camera", () => {
  assert.equal(pickFlower(ORIGIN, FORWARD, [head(0, 0, 0, 5)]), null);
});

test("returns the nearest of two hits", () => {
  const hit = pickFlower(ORIGIN, FORWARD, [
    head(0, 0, 0, -10),
    head(1, 0, 0, -5),
  ]);
  assert.equal(hit?.index, 1);
});

test("uses the hit radius as a sphere", () => {
  // Default radius is 0.55: 0.5 off-axis is inside, 0.6 is outside.
  assert.equal(pickFlower(ORIGIN, FORWARD, [head(0, 0.5, 0, -5)])?.index, 0);
  assert.equal(pickFlower(ORIGIN, FORWARD, [head(0, 0.6, 0, -5)]), null);
});

test("honours a custom radius", () => {
  assert.equal(
    pickFlower(ORIGIN, FORWARD, [head(0, 1, 0, -5)], 1.1)?.index,
    0,
  );
});
