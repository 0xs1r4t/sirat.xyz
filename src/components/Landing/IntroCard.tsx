"use client";

import React, { useEffect, useState } from "react";

/**
 * The wireframe's description box under the garden. Rotates between short
 * snippets on each mount (plan §8). Content set is a placeholder — swap the
 * copy freely; the rotation mechanic stays.
 */
const SNIPPETS: { title: string; body: string }[] = [
  {
    title: "hi, i'm sirat 🌱",
    body: "this is my digital garden — every flower on the hill is a post. hover one to peek, click to wander in.",
  },
  {
    title: "currently growing",
    body: "porting my OpenGL terrain generator into this very hillside, one shader at a time.",
  },
  {
    title: "a note on tending gardens",
    body: "a garden isn't a blog: posts here are seedlings that get replanted, pruned, and occasionally bloom into evergreens.",
  },
];

const IntroCard = () => {
  // Pick after mount so SSR/client markup match (no hydration mismatch).
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    setIndex(Math.floor(Math.random() * SNIPPETS.length));
  }, []);

  const snippet = SNIPPETS[index ?? 0];

  return (
    <aside
      aria-label="about me and my work"
      className={`mt-4 w-full max-w-prose rounded-md border-2 border-muted-200 bg-background
        px-4 py-3 text-center transition-opacity duration-300
        ${index === null ? "opacity-0" : "opacity-100"}`}
    >
      <h2 className="font-heading text-lg font-bold text-foreground">
        {snippet.title}
      </h2>
      <p className="mt-1 text-sm text-foreground">{snippet.body}</p>
    </aside>
  );
};

export default IntroCard;
