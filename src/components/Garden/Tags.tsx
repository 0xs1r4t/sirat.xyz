import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthenticSansCondensed } from "@/fonts/font-config";

interface TagsProps {
  tags: string[];
  /** Render plain chips (no links) for the aria-hidden garden tooltip. */
  visualOnly?: boolean;
}

const Tags = ({ tags, visualOnly = false }: TagsProps) => {
  const chipClass = cn(
    "tags list-none inline-block px-2 mr-3 my-2 py-0.5 bg-muted-100 text-foreground rounded-md hover:ring-2 hover:ring-link hover:ring-inset",
    AuthenticSansCondensed.className
  );

  return (
    <ul className="flex flex-row flex-wrap">
      {tags.map((tag: string) => (
        <li key={tag} className="list-none">
          {visualOnly ? (
            <span className={chipClass}>{tag}</span>
          ) : (
            <Link
              href={`/garden?tag=${tag}`}
              aria-label={`posts tagged ${tag}`}
              className={chipClass}
            >
              {tag}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Tags;
