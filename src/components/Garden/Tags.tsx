import React from "react";
import { cn } from "@/lib/utils";
import { AuthenticSansCondensed } from "@/fonts/font-config";

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <ul className="flex flex-row flex-wrap">
      {tags.map((tag: string) => (
        <li
          className={cn(
            "tags list-none px-2 mr-3 my-2 py-0.5 bg-muted-100 text-foreground rounded-md",
            AuthenticSansCondensed.className
          )}
          key={tag}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
};

export default Tags;
