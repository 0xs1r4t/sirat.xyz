import React from "react";
import Tags from "@/components/Garden/Tags";
import Date from "@/components/Garden/Date";

const SummaryAccordion = ({ summary }: { summary: Post }) => {
  return (
    <details className="not-prose rounded-lg px-4 py-2">
      <summary className="font-bold">tl;dr</summary>
      <section
        aria-label="patch"
        className="p-2 max-w-[ch65] rounded-lg text-base"
      >
        <p>{summary.description}</p>
        <span aria-label="hidden">{""}</span>
        <Date date={summary.created_at} label="Created on" />
        <Date date={summary.updated_at} label="Updated on" />
        <Tags tags={summary.tags} />
        <span aria-label="hidden">{""}</span>
      </section>
    </details>
  );
};

export default SummaryAccordion;
