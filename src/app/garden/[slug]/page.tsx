import React, { Fragment } from "react";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/markdown";
import Post from "@/components/Garden/Post";
import ProgressBar from "@/components/Garden/ProgressBar";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Pre-renders every published post's slug at build time. */
export const generateStaticParams = async () => {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export const dynamic = "force-static";

/** Builds the post's page title/description from its frontmatter. */
export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
  };
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <Fragment>
      <ProgressBar>
        <Post post={post} />
      </ProgressBar>
    </Fragment>
  );
};

export default Page;
