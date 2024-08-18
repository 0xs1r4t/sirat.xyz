import React from "react";
import { cn } from "@/lib/utils";
import { AuthenticSansCondensed } from "@/fonts/font-config";

const Dates = ({
  created_at,
  updated_at,
}: {
  created_at: string;
  updated_at: string;
}) => {
  return (
    <ul className="flex flex-row flex-wrap items-center justify-center gap-2">
      <li
        className={cn(
          "Dates list-none px-2 mr-3 mb-2 py-0.5 bg-foreground text-background text-sm rounded-md",
          AuthenticSansCondensed.className
        )}
        key={created_at}
      >
        Created on {created_at}
      </li>
      <li
        className={cn(
          "Dates list-none px-2 mr-3 mb-2 py-0.5 bg-foreground text-background text-sm rounded-md",
          AuthenticSansCondensed.className
        )}
        key={updated_at}
      >
        Last edited on {updated_at}
      </li>
    </ul>
  );
};

export default Dates;
