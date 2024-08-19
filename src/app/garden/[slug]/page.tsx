import React from "react";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

import { NotionRenderer } from "@notion-render/client";
import prismPlugin from "@/lib/extensions/prism-plugin";

import { notion, getPageBySlug, getPageContent } from "@/lib/notion";
import isoToNormalDate from "@/lib/date";

import Post from "@/components/Garden/Post";
import ProgressBar from "@/components/Garden/ProgressBar";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const generateMetadata = async (
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const slug = params.slug;
  const post = await getPageBySlug(slug);
  if (!post) notFound();

  return {
    title: (post.properties.title as any).title[0].plain_text,
  };
};

const Page = async ({ params, searchParams }: Props) => {
  const post = await getPageBySlug(params.slug);
  if (!post) notFound();

  const content = await getPageContent(post.id);

  const notionRenderer = new NotionRenderer({ client: notion });
  notionRenderer.use(prismPlugin({})); // custom plugin for code syntax highlighting

  const title: string = (post.properties.title as any).title[0].plain_text;
  const description: string = (post.properties.description as any).rich_text[0]
    ?.plain_text;
  const tags: string[] = (post.properties.tags as any).multi_select.map(
    (tag: any) => tag.name
  );
  const html: string = await notionRenderer.render(...content);
  const created_at: string = isoToNormalDate(post.created_time as any);
  const updated_at: string = isoToNormalDate(post.last_edited_time as any);

  return (
    <main className="flex flex-col items-center justify-between px-10">
      <ProgressBar />
      <Post
        post={{
          title,
          description,
          tags,
          html,
          created_at,
          updated_at,
        }}
      />
    </main>
  );
};

export default Page;
