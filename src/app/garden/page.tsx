import React, { Fragment } from "react";
import { getPublishedPosts, searchPosts, getPostsByTag } from "@/lib/markdown";
import Heading from "@/components/Heading";
import Search from "@/components/Garden/Search";
import Summary from "@/components/Garden/Summary";
import NoPostSummary from "@/components/Garden/NoPostSummary";

export const metadata = {
  title: "digital garden",
};

type Props = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;

  let posts = await getPublishedPosts();

  if (params?.q) {
    posts = await searchPosts(params.q);
  }

  if (params?.tag) {
    posts = await getPostsByTag(params.tag);
  }

  if (posts.length === 0) {
    return (
      <Fragment>
        <Heading title="MY DIGITAL GARDEN" />
        <Search placeholder="Search this garden" />
        <NoPostSummary />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Heading title="MY DIGITAL GARDEN" />
      <Search placeholder="Search this garden" />
      <Summary summary={posts} />
    </Fragment>
  );
};

export default Page;
