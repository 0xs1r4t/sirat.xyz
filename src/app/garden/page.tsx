import React, { Fragment } from "react";
import { getPublishedPosts, searchPosts, getPostsByTag } from "@/lib/markdown";
import Heading from "@/components/Heading";
import Search from "@/components/Garden/Search";
import Summary from "@/components/Garden/Summary";
import NoPostSummary from "@/components/Garden/NoPostSummary";

export const metadata = {
  title: "digital garden",
};

interface Props {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;

  let posts = await getPublishedPosts();

  if (params?.q) {
    posts = await searchPosts(params.q);
  }

  if (params?.tag) {
    posts = await getPostsByTag(params.tag);
  }

  const title = "My Digital Garden.";
  const styles = "lowercase";
  // const styles="font-authentic-sans-condensed";

  const status = `${posts.length} ${posts.length === 1 ? "post" : "posts"}${
    params?.q ? ` matching "${params.q}"` : ""
  }${params?.tag ? ` tagged ${params.tag}` : ""}`;

  return (
    <Fragment>
      <Heading title={title} styles={styles} />
      <Search placeholder="Search this garden" />
      <p role="status" className="sr-only">
        {status}
      </p>
      {posts.length === 0 ? (
        <NoPostSummary />
      ) : (
        <Summary summary={posts} garden={false} />
      )}
    </Fragment>
  );
};

export default Page;
