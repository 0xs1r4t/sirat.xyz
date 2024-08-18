import React from "react";
import Link from "next/link";
import Tags from "@/components/Garden/Tags";

const Summary = ({ summary }: { summary: PostSummary[] }) => {
  return (
    <section role="feed" className="w-full max-w-2xl">
      {summary.map(({ title, description, tags, slug }, index) => (
        <section
          key={slug}
          role="article"
          aria-posinset={index + 1}
          aria-setsize={summary.length}
          tabIndex={0}
          aria-labelledby={slug}
          className="px-4 py-2 my-4"
        >
          <Link aria-label="patch" href={`/garden/${slug}`}>
            <h2>{title}</h2>
            <p>{description}</p>
            <Tags tags={tags} />
          </Link>
        </section>
      ))}
    </section>
  );
};

export const NoPostSummary = () => {
  return <div>no posts here</div>;
};

export default Summary;
