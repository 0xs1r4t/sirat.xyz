import React from "react";
import { cn } from "@/lib/utils";
const Heading = ({
  title,
  children,
  styles,
  background,
}: {
  title: string;
  children?: React.ReactNode;
  styles?: string;
  background?: string | null;
}) => {
  const isVideo = background && /\.(mp4|webm|ogg)$/i.test(background);

  return (
    <div
      aria-label="page title"
      className={cn(
        "relative overflow-hidden rounded-xl",
        "text-6xl font-that-that-new-pixel italic font-bold text-center p-4 pb-4 not-prose lg:text-7xl",
        styles,
      )}
    >
      {background && isVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay transition-colors duration-500 ease-in-out"
          src={background}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {background && !isVideo && (
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay transition-colors duration-500 ease-in-out"
          style={{ backgroundImage: `url(${background})` }}
          aria-hidden="true"
        />
      )}

      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none transition-shadow duration-500 ease-in-out"
        style={{
          boxShadow: "inset 0 0 30px 40px var(--color-background)",
        }}
        aria-hidden="true"
      />

      <span className="relative z-10">
        {title}
        {children ?? <span aria-hidden="true">{""}</span>}
      </span>
    </div>
  );
};

export default Heading;
