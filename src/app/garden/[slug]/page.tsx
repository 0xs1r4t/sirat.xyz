import React, { Fragment } from "react";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

import { NotionRenderer } from "@notion-render/client";
import prismPlugin from "@/lib/extensions/prism-plugin";
import videoPlugin from "@/lib/extensions/video-plugin";

import { notion, getPageBySlug, getPageContent } from "@/lib/notion";
import { isoToNormalDate } from "@/lib/date";

import Post from "@/components/Garden/Post";
// import ProgressBar from "@/components/Garden/ProgressBar";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const generateMetadata = async (
  props: { params: Props["params"]; searchParams: Props["searchParams"] },
  parent: ResolvingMetadata
): Promise<Metadata> => {
  const params = await props.params;
  const slug = params.slug;
  const post = await getPageBySlug(slug);
  if (!post) notFound();

  return {
    title: (post.properties.title as any).title[0].plain_text,
  };
};

const Page = async (props: Props) => {
  const params = await props.params;
  // const searchParams = await props.searchParams; // Use if needed

  const post = await getPageBySlug(params.slug);
  if (!post) notFound();

  const content = await getPageContent(post.id);

  const notionRenderer = new NotionRenderer({ client: notion });
  notionRenderer.use(prismPlugin({})); // custom plugin for code syntax highlighting
  notionRenderer.use(videoPlugin({})); // custom plugin to display videos

  const title: string = (post.properties.title as any).title[0].plain_text;
  const description: string = (post.properties.description as any).rich_text[0]
    ?.plain_text;
  const tags: string[] = (post.properties.tags as any).multi_select.map(
    (tag: any) => tag.name
  );
  const created_at = isoToNormalDate(post.created_time as any);
  const updated_at = isoToNormalDate(post.last_edited_time as any);
  const html: string = await notionRenderer.render(...content);

  return (
    <Fragment>
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
    </Fragment>
  );
};

export default Page;
