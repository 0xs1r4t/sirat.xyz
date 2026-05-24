import React from "react";
import { cn } from "@/lib/utils";

import { Filters } from "@/components/Filters";
import DitherMedia from "@/graphics/Dither/Media";

const Heading = ({
  title,
  children,
  styles,
  background,
  post,
}: {
  title: string;
  children?: React.ReactNode;
  styles?: string;
  background?: string | null;
  post?: boolean;
}) => {
  return (
    <div
      aria-label="page title"
      className={cn(
        "relative overflow-hidden rounded-xl",
        "text-6xl font-that-that-new-pixel italic font-bold text-center p-4 pb-4 not-prose lg:text-7xl",
        styles,
      )}
    >
      {/* Layer 0: dithered background media */}
      {background && (
        <>
          {/* SVG filters for color grading the background media */}
          <Filters />
          {/*  media with dithering */}
          <DitherMedia
            src={background}
            alt=""
            pattern="8x8"
            intensity={0.8}
            useTint={true}
            className="GradientMap absolute inset-0 w-full h-full"
          />
          {/*  edge vignette */}
          <div
            className="absolute inset-0 pointer-events-none z-0.5 transition-shadow duration-500 ease-in-out"
            style={{ boxShadow: "inset 0 0 30px 40px var(--color-background)" }}
            aria-hidden="true"
          />
        </>
      )}
      <>
        {post && (
          <span
            className="absolute inset-0 flex items-center justify-center
                 font-that-that-new-pixel italic leading-none
                 text-transparent text-stroke-muted-extra-thick glow-text
                 mix-blend-hard-light opacity-75 select-none pointer-events-none"
            aria-hidden="true"
          >
            {title}
          </span>
        )}

        <span
          className={cn(
            "relative z-[2] w-full text-center",
            post && "glow-text",
          )}
        >
          {title}
          {children ?? <span aria-hidden="true">{""}</span>}
        </span>
      </>
    </div>
  );
};

export default Heading;
