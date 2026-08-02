// export default Summary;
import React from "react";
import Link from "next/link";
import Tags from "@/components/Garden/Tags";
import Date from "@/components/Garden/Date";
import type { GardenPost } from "@/lib/garden/meadow";

interface SummaryProps {
  summary: GardenPost[];
  garden: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
}

const Summary = ({ summary, garden, ref }: SummaryProps) => (
    <section
      ref={ref}
      role="feed"
      aria-live={garden ? "polite" : undefined}
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
          role="article"
          aria-posinset={index + 1}
          aria-setsize={summary.length}
          tabIndex={0}
          aria-labelledby={slug}
          className={garden ? "" : "px-4 py-2 my-4 max-w-ch65 rounded-lg"}
        >
          <Link aria-label="patch" href={`/garden/${slug}`}>
            <h2 className="text-4xl font-authentic-sans-condensed font-bold">
              {title}
            </h2>
          </Link>
          <span aria-hidden="true">{""}</span>
          {createdAt && <Date date={createdAt} />}
          <Tags tags={tags} />
          <span aria-hidden="true">{""}</span>
          <p>{description}</p>
        </section>
      ))}
    </section>
  );

/** Empty-state shown when a garden has no published posts yet. */
export const NoPostSummary = () => <div>no posts here</div>;

export default Summary;
