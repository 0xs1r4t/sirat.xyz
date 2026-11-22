import React from "react";
import Link from "next/link";
import Tags from "@/components/Garden/Tags";
import Date from "@/components/Garden/Date";
import type { GardenPost } from "@/lib/garden/meadow";

interface SummaryProps {
  summary: GardenPost[];
  /** Garden mode is the visual hover tooltip inside an aria-hidden canvas. */
  garden: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
}

const Summary = ({ summary, garden, ref }: SummaryProps) => (
  <section
    ref={ref}
    role={garden ? undefined : "feed"}
    className={
      garden
        ? `pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
           z-40 w-60vw h-60vh rounded-md bg-background p-4 text-left
           transition-opacity duration-300
          ${summary.length > 0 ? "opacity-100" : "opacity-0"}`
        : "w-full max-w-2xl"
    }
  >
    {summary.map(({ title, description, tags, slug, createdAt }, index) => (
      <section
        key={slug}
        role={garden ? undefined : "article"}
        aria-posinset={garden ? undefined : index + 1}
        aria-setsize={garden ? undefined : summary.length}
        tabIndex={garden ? undefined : 0}
        aria-labelledby={garden ? undefined : slug}
        className={garden ? "" : "px-4 py-2 my-4 max-w-ch65 rounded-lg"}
      >
        <h2
          id={garden ? undefined : slug}
          className="text-4xl font-authentic-sans-condensed font-bold"
        >
          {garden ? (
            title
          ) : (
            <Link href={`/garden/${slug}`}>{title}</Link>
          )}
        </h2>
        {createdAt && <Date date={createdAt} />}
        <Tags tags={tags} visualOnly={garden} />
        <p>{description}</p>
      </section>
    ))}
  </section>
);

export default Summary;
