import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { NotionRenderer } from "@notion-render/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import bookmarkPlugin from "@notion-render/bookmark-plugin";

import {
  notion,
  searchPagesByContent,
  getPublishedPages /* getAllPages */,
} from "@/lib/notion";
import { type Garden } from "@/lib/types";

import Search from "@/components/Search";
import Tags from "@/components/ui/Tags";

export const metadata: Metadata = {
  title: "🌐🌼 digital garden",
};

const GardenPage = async ({
  searchParams,
}: {
  searchParams?: {
    q?: string;
  };
}) => {
  let pages = await getPublishedPages();

  // If no blogs are published, then display a message??
  // if (pages.length == 0) {
  // }

  const content: string = searchParams?.q || "";
  if (content != "") {
    pages = await searchPagesByContent(content);
  }

  if (!pages) notFound();

  const notionRenderer = new NotionRenderer({ client: notion });
  notionRenderer.use(hljsPlugin({}));
  notionRenderer.use(bookmarkPlugin(undefined));

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
      } as Garden)
  );

  return (
    <main className="flex flex-col items-center justify-between p-10">
      <Link aria-label="home" href="/">
        🏡
      </Link>
      <h1>MY DIGITAL GARDEN</h1>
      <Search placeholder="🔍 Search this garden 🦗" />
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
    </main>
  );
};

export default GardenPage;
