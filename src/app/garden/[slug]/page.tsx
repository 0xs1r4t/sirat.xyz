import React from "react";
import { notFound } from "next/navigation";

import { NotionRenderer } from "@notion-render/client";
import hljsPlugin from "@notion-render/hljs-plugin";
import bookmarkPlugin from "@notion-render/bookmark-plugin";

import { notion, getPageBySlug, getPageContent } from "@/lib/notion";

const GardenSlug = async ({ params }: { params: { slug: string } }) => {
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
    <main className="flex flex-col items-center justify-center min-h-screen">
      <article>
        <h1 className="text-3xl text-center">{title}</h1>
        <p>{description}</p>
        <ul className="flex flex-row">{tags}</ul>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
};

export default GardenSlug;