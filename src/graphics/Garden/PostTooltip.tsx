"use client";

import React, { forwardRef } from "react";
import type { GardenPost } from "@/lib/garden/meadow";

interface PostTooltipProps {
  post: GardenPost | null;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Themed tooltip for the hovered flower — title, date, tag chips, one-line
 * description (plan §7). Position is driven imperatively by Scene's
 * world→screen projection (this element's transform), so it tracks the
 * flower through wind and camera drift without re-rendering React.
 * pointer-events-none so it never steals hover from the canvas beneath it.
 */
const PostTooltip = forwardRef<HTMLDivElement, PostTooltipProps>(
  function PostTooltip({ post }, ref) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute left-0 top-0 z-40 w-60 rounded-md
          border-2 border-muted-200 bg-background p-3 text-left shadow-lg
          transition-opacity duration-150
          ${post ? "opacity-100" : "opacity-0"}`}
      >
        {post && (
          <>
            <h3 className="font-heading text-base font-bold leading-snug text-foreground">
              {post.title}
            </h3>
            <p className="mt-0.5 text-xs text-foreground/70">
              {formatDate(post.createdAt)}
            </p>
            {post.tags.length > 0 && (
              <ul className="mt-1.5 flex flex-wrap gap-1" aria-label="tags">
                {post.tags.slice(0, 4).map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm bg-muted-100 px-1.5 py-0.5 text-[11px] leading-tight text-foreground"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {post.description && (
              <p className="mt-1.5 line-clamp-1 text-xs text-foreground">
                {post.description}
              </p>
            )}
          </>
        )}
      </div>
    );
  },
);

export default PostTooltip;
