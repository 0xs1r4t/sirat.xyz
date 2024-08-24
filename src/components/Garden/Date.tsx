import React from "react";
import { cn } from "@/lib/utils";
import { AuthenticSansCondensed } from "@/fonts/font-config";

const Date = ({ date, label }: { date: string; label: string }) => (
  <div
    className={cn(
      "Dates list-none text-sm text-fuchsia-500",
      AuthenticSansCondensed.className
    )}
  >
    <span>{label} </span>
    <time>{date}</time>
  </div>
);

export default Date;
