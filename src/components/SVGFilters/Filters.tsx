import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import "./filters.css";

export const NeonPinkImageFilter = ({
  url,
  h,
  w,
  alt,
  styles,
}: {
  url: string;
  h: number;
  w: number;
  alt: string;
  styles?: string;
}) => {
  return (
    <>
      <Image
        src={url}
        height={h}
        width={w}
        alt={`heat map - ${alt}`}
        className={cn(`Pink dark:Neon ${styles ? styles : ""}`)}
        unoptimized={true}
        loading="lazy"
        objectFit="cover"
      />
      <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
        <filter id="neon-lemon" color-interpolation-filters="sRGB">
          <feComponentTransfer>
            <feFuncR
              type="table"
              tableValues="0.345  0.325  0.871  0.788  0.659"
            />
            <feFuncG
              type="table"
              tableValues="0.176  0.298  0.373  0.686  0.886"
            />
            <feFuncB
              type="table"
              tableValues="0.431  0.651  0.717  0.482  0.702"
            />
          </feComponentTransfer>
        </filter>

        <filter id="pinky-pie" color-interpolation-filters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.612  0.851  0.921  0.839" />
            <feFuncG type="table" tableValues="0.078  0.35   0.769  0.973" />
            <feFuncB type="table" tableValues="0.706  0.973  0.973  0.816" />
          </feComponentTransfer>
        </filter>
      </svg>
    </>
  );
};
