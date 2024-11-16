import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import "../styles/filters.css";

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
        className={cn(`GradientMap ${styles ? styles : ""}`)}
        unoptimized={true}
        loading="lazy"
        style={{ objectFit: "cover" }}
      />
      <NeonPinkFilter />
    </>
  );
};

export const NeonPinkFilter = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
      <filter id="neon-lemon" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.35  0.33  0.87  0.79  0.92" />
          <feFuncG type="table" tableValues="0.18  0.3   0.37  0.69  0.95" />
          <feFuncB type="table" tableValues="0.43  0.65  0.72  0.48  0.84" />
        </feComponentTransfer>
      </filter>

      <filter id="pinky-pie" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.35  0.85  0.92  0.84" />
          <feFuncG type="table" tableValues="0.18  0.35  0.77  0.97" />
          <feFuncB type="table" tableValues="0.43  0.97  0.97  0.82" />
        </feComponentTransfer>
      </filter>

      <filter id="neopolitan" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.33  0.96  1     1" />
          <feFuncG type="table" tableValues="0.17  0.53  0.8   0.96" />
          <feFuncB type="table" tableValues="0.14  0.90  0.93  0.88" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
};
