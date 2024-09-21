import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthenticSansCondensed } from "@/fonts/font-config";

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <ul className="flex flex-row flex-wrap">
      {tags.map((tag: string) => (
        <li
          key={tag}
          role="button"
          aria-label="tag"
          className={cn(
            "tags list-none px-2 mr-3 my-2 py-0.5 bg-muted-100 text-foreground rounded-md hover:ring-2 hover:ring-muted-200 hover:ring-inset",
            AuthenticSansCondensed.className
          )}
        >
          <Link href={`/garden?tag=${tag}`}>{tag}</Link>
        </li>
      ))}
    </ul>
  );
};

export default Tags;
