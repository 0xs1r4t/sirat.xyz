"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GardenPost } from "@/lib/garden/meadow";
import PostTooltip from "@/graphics/Garden/PostTooltip";

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
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none h-svh w-svw"
    >
      <Scene
        posts={posts}
        reducedMotion={reducedMotion}
        tooltipRef={tooltipRef}
        onHoverPost={onHoverPost}
      />
      <PostTooltip ref={tooltipRef} post={hoveredPost} />
    </div>
  );
};

export default Garden;
