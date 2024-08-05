import React from "react";
import Link from "next/link";
import Tags from "@/components/Tags";

const Garden = ({ garden }: { garden: Garden[] }) => {
  return (
    <section role="feed" className="w-full max-w-2xl">
      {garden.map(({ title, description, tags, slug }, index) => (
        <section
          key={slug}
          role="article"
          aria-posinset={index + 1}
          aria-setsize={garden.length}
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

export const NoGarden = () => {
  return <div>no blog posts here</div>;
};

export default Garden;
