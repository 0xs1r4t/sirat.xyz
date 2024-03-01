import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { NotionRenderer } from "@notion-render/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import bookmarkPlugin from "@notion-render/bookmark-plugin";

import { notion, getAllPages, getPublishedPages } from "@/lib/notion";
import { plants } from "@/lib/types";

export const metadata: Metadata = {
  title: "🌐🌼 digital garden",
};

const GardenPage = async () => {
  const pages = await getAllPages();
  // const pages = await getPublishedPages();
  if (!pages) notFound();

  const notionRenderer = new NotionRenderer({ client: notion });
  notionRenderer.use(hljsPlugin({}));
  notionRenderer.use(bookmarkPlugin(undefined));

  const garden = pages.map((page) => ({
    title: (page.properties.title as any).title[0].plain_text,
    description: (page.properties.description as any).rich_text[0]?.plain_text,
    tags: (page.properties.tags as any).multi_select.map(
      (tag: any) => tag.name
    ),
    slug: (page.properties.slug as any).rich_text[0]?.plain_text,
  }));

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl text-center">my digital garden</h1>
      <section role="feed">
        {garden.map(({ title, description, tags, slug }, index) => (
          <section
            key={slug}
            role="article"
            aria-posinset={index + 1}
            aria-setsize={garden.length}
            tabIndex={0}
            aria-labelledby={slug}
          >
            <h3>{title}</h3>
            <p>{description}</p>
            <ul className="flex flex-row">
              {tags.map((tag: string) => (
                <li className="tags" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
            <Link aria-label="patch" href={`/garden/${slug}`}>
              {plants[Math.floor(Math.random() * plants.length)]}
            </Link>
          </section>
        ))}
      </section>
    </main>
  );
};

export default GardenPage;
