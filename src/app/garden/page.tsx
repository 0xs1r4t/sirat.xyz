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
  getPagesByProps,
} from "@/lib/notion";

import Search from "@/components/Search";
import Garden from "@/components/Garden";

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
    pages = await getPagesByProps(content);
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

      <Garden garden={garden} />
    </main>
  );
};

export default GardenPage;
