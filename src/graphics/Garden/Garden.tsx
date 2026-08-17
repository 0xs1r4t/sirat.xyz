"use client";

import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import type { GardenPost } from "@/lib/garden/meadow";
import Summary from "@/components/Garden/Summary";
import GardenControlsSidebar from "@/components/Garden/GardenControlsSidebar";
import { useGardenControls } from "@graphics/Garden/useGardenControls";

const Scene = dynamic(() => import("@/graphics/Garden/Scene"), {
  ssr: false,
  loading: () => null,
});

interface GardenProps {
  posts: GardenPost[];
}

const Garden = ({ posts }: GardenProps) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hoveredPost, setHoveredPost] = useState<GardenPost | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const { sliderValues, setValue, values: controls } = useGardenControls();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onHoverPost = useCallback((post: GardenPost | null) => {
    setHoveredPost(post);
  }, []);

  return (
    // Fragment, not a single wrapper: the sidebar must sit outside
    // #garden-canvas-root's pointer-events-none — nested inside it, its
    // PopOutButton/sliders would inherit that and be unclickable.
    <Fragment>
      <div
        aria-hidden="true"
        // Stable hook for the screenshot harness (scripts/garden-capture.mjs)
        // to select the garden's <canvas> specifically — the page also has
        // unrelated canvases (mouse trail, dither media).
        id="garden-canvas-root"
        className="fixed inset-0 z-0 pointer-events-none h-svh w-svw"
      >
        <Scene
          posts={posts}
          reducedMotion={reducedMotion}
          tooltipRef={tooltipRef}
          onHoverPost={onHoverPost}
          onFocusPost={(post) => {
            setHoveredPost(post);
            tooltipRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          controls={controls}
        />
        <Summary
          ref={tooltipRef}
          garden={true}
          summary={hoveredPost ? [hoveredPost] : []}
        />
      </div>
      <GardenControlsSidebar sliderValues={sliderValues} onChange={setValue} />
    </Fragment>
  );
};

export default Garden;
