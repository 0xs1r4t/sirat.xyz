import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getPublishedPages /* getAllPages */,
  getPagesByProps,
} from "@/lib/notion";

import Search from "@/components/Garden/Search";
import Summary from "@/components/Garden/Summary";

export const metadata: Metadata = {
  title: "🌐🌼 digital garden",
};

const Page = async ({
  searchParams,
}: {
  searchParams?: {
    q?: string;
  };
}) => {
  let pages = await getPublishedPages();

  // If no blogs are published, then display a message??
  // if (pages.length == 0) {
  // return <NoPostSummary />;
  // }

  const content: string = searchParams?.q || "";
  if (content != "") {
    pages = await getPagesByProps(content);
  }

  if (!pages) notFound();

  const garden = pages.map(
    (page) =>
      ({
        title: (page.properties.title as any).title[0].plain_text,
        description: (page.properties.description as any).rich_text[0]
          ?.plain_text,
        tags: (page.properties.tags as any).multi_select.map(
          (tag: any) => tag.name
        ),
        slug: (page.properties.slug as any).rich_text[0]?.plain_text,
      } as PostSummary)
  );

  return (
    <main className="flex flex-col items-center justify-between px-10">
      <h1>MY DIGITAL GARDEN</h1>
      <Search placeholder="🔍 Search this garden 🦗" />

      <Summary summary={garden} />
    </main>
  );
};

export default Page;
