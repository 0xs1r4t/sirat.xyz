"use client";

import type { ReactNode } from "react";
import { useGardenControls } from "@graphics/Garden/Controls";
import type { GardenControlValues } from "@graphics/Garden/gardenControlValues";

// Split into its own module so Scene.tsx can load it via next/dynamic —
// Leva (and its UI bundle) only reaches visitors who are actually in debug
// mode, instead of shipping to every hero-page load.
export default function LevaGardenControls({
  render,
}: {
  render: (controls: GardenControlValues) => ReactNode;
}) {
  return <>{render(useGardenControls())}</>;
}
