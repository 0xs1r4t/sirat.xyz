import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { NotionRenderer } from "@notion-render/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import bookmarkPlugin from "@notion-render/bookmark-plugin";

import { notion, searchPagesByContent, getAllPages } from "@/lib/notion";
import { plants } from "@/lib/types";
import { AuthenticSansCondensed } from "@/fonts/font-config";
import { cn } from "@/lib/utils";

import Search from "@/components/Search";

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
  let pages = await getAllPages();

  const content: string = searchParams?.q || "";
  if (content != "") {
    pages = await searchPagesByContent(content);
  }

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
    <main className="flex flex-col items-center justify-between p-10">
      <Link aria-label="home" href="/">
        🏡
      </Link>
      <h1
        className={cn(
          "text-5xl text-center font-bold",
          AuthenticSansCondensed.className
        )}
      >
        MY DIGITAL GARDEN
      </h1>
      <Search placeholder="🔍 Search this garden 🦗" />
      <section role="feed">
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
            <h2
              className={cn(
                "text-xl font-bold",
                AuthenticSansCondensed.className
              )}
            >
              {title}
            </h2>
            <p>{description}</p>
            <ul className="flex flex-row">
              {tags.map((tag: string) => (
                <li
                  className={cn(
                    "tags list-none px-2 mr-3 py-0.5 bg-neutral-950 dark:bg-neutral-50 text-white dark:text-black rounded-md",
                    AuthenticSansCondensed.className
                  )}
                  key={tag}
                >
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
