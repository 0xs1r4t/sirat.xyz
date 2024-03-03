import React from "react";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";

import { NotionRenderer } from "@notion-render/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import bookmarkPlugin from "@notion-render/bookmark-plugin";

import { notion, getPageBySlug, getPageContent } from "@/lib/notion";
import { AuthenticSansCondensed } from "@/fonts/font-config";
import { cn } from "@/lib/utils";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const generateMetadata = async (
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const slug = params.slug;
  const gardenPatch = await getPageBySlug(slug);
  if (!gardenPatch) notFound();

  return {
    title: "🌐🌼 " + (gardenPatch.properties.title as any).title[0].plain_text,
  };
};

const GardenSlug = async ({ params, searchParams }: Props) => {
  const gardenPatch = await getPageBySlug(params.slug);
  if (!gardenPatch) notFound();

  const content = await getPageContent(gardenPatch.id);

  const notionRenderer = new NotionRenderer({ client: notion });
  notionRenderer.use(hljsPlugin({}));
  notionRenderer.use(bookmarkPlugin(undefined));

  const title = (gardenPatch.properties.title as any).title[0].plain_text;
  const description = (gardenPatch.properties.description as any).rich_text[0]
    ?.plain_text;
  const tags = (gardenPatch.properties.tags as any).multi_select.map(
    (tag: any) => tag.name
  );
  const html = await notionRenderer.render(...content);

  return (
    <main className="flex flex-col items-center justify-between p-10">
      <Link aria-label="home" href="/">
        🏡
      </Link>
      <Link aria-label="garden" href="/garden">
        🌐🌼
      </Link>
      <article className="prose prose-neutral dark:prose-invert lg:prose-xl">
        <h1
          className={cn(
            "text-5xl text-center font-bold uppercase",
            AuthenticSansCondensed.className
          )}
        >
          {title}
        </h1>
        <p>{description}</p>
        <ul className="flex flex-row">
          {tags.map((tag: string) => (
            <li
              className={cn(
                "tags list-none px-2 mr-3  bg-neutral-950 dark:bg-neutral-50 text-white dark:text-black rounded-md",
                AuthenticSansCondensed.className
              )}
              key={tag}
            >
              {tag}
            </li>
          ))}
        </ul>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
};

export default GardenSlug;
