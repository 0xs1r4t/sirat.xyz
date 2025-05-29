import React from "react";
import Link from "next/link";
import Tags from "@/components/Garden/Tags";
import Date from "@/components/Garden/Date";

const Summary = ({ summary }: { summary: PostSummary[] }) => {
  return (
    <section role="feed" className="w-full max-w-2xl">
      {summary.map(
        ({ title, description, tags, slug, created_at, updated_at }, index) => (
          <section
            key={slug}
            role="article"
            aria-posinset={index + 1}
            aria-setsize={summary.length}
            tabIndex={0}
            aria-labelledby={slug}
            className="px-4 py-2 my-4 max-w-[ch65] rounded-lg"
          >
            <Link aria-label="patch" href={`/garden/${slug}`}>
              <h1 className="text-4xl font-authentic-sans-condensed font-bold">
                {title}
              </h1>
              <span aria-hidden="true">{""}</span>
              <p>{description}</p>
              <Date date={created_at} />
            </Link>
            <Tags tags={tags} />
            <span aria-hidden="true">{""}</span>
          </section>
        )
      )}
    </section>
  );
};

export const NoPostSummary = () => {
  return <div>no posts here</div>;
};

export default Summary;
