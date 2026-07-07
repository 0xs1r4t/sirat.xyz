"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import type { GardenPost } from "@/lib/garden/meadow";
import { cn } from "@/lib/utils";
import PostTooltip from "@graphics/Garden/PostTooltip";

// Lazy canvas boundary (web-terrain SceneLoader pattern): three.js never
// touches the server bundle or blocks first paint.
const Scene = dynamic(() => import("@graphics/Garden/Scene"), {
  ssr: false,
  loading: () => <div aria-hidden className="h-full w-full" />,
});

interface GardenProps {
  posts: GardenPost[];
}

/**
 * The digital garden stage. Default: transparent centerstage strip that
 * bleeds into the page. Immersive: full viewport + orbit controls, entered
 * ONLY via the explicit expand icon (never scroll-hijacked), exited via the
 * icon or Esc. Hovering a flower shows the post tooltip; clicking/tapping
 * navigates to /garden/[slug].
 */
const Garden = ({ posts }: GardenProps) => {
  const [immersive, setImmersive] = useState(false);
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

  // Esc exits immersive; lock page scroll while fullscreen.
  useEffect(() => {
    if (!immersive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImmersive(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [immersive]);

  const toggle = useCallback(() => setImmersive((v) => !v), []);
  const onHoverPost = useCallback(
    (post: GardenPost | null) => setHoveredPost(post),
    [],
  );

  return (
    <section
      aria-label={`digital garden — ${posts.length} posts growing as flowers; hover a flower for details, click to read`}
      className={cn(
        immersive
          ? "fixed inset-0 z-40 h-svh w-svw bg-background"
          : "relative left-1/2 w-screen -translate-x-1/2 h-[clamp(280px,50vh,520px)]",
      )}
    >
      <Scene
        posts={posts}
        immersive={immersive}
        reducedMotion={reducedMotion}
        tooltipRef={tooltipRef}
        onHoverPost={onHoverPost}
      />

      <PostTooltip ref={tooltipRef} post={hoveredPost} />

      {/* Explicit, small expand toggle — immersive is never scroll-triggered.
          44px tap target. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={
          immersive
            ? "exit immersive garden (Esc)"
            : "expand garden to full view"
        }
        aria-pressed={immersive}
        className={cn(
          "absolute right-3 z-50 inline-flex h-11 w-11 items-center justify-center",
          "rounded-md border-2 border-muted-200 bg-muted-100 text-foreground",
          "transition-transform duration-200 ease-out hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-muted-200",
          immersive ? "top-16" : "top-3",
        )}
      >
        {immersive ? (
          <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        )}
      </button>
    </section>
  );
};

export default Garden;
