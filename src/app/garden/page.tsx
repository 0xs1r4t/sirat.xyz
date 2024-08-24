import React, { Fragment } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getPublishedPages /* getAllPages */,
  getPagesByProps,
} from "@/lib/notion";
import isoToNormalDate from "@/lib/date";

import Heading from "@/components/Heading";
import Search from "@/components/Garden/Search";
import Summary from "@/components/Garden/Summary";

export const metadata: Metadata = {
  title: "🌐🌼 digital garden",
};

const Page = async ({
  searchParams,
}: {
  searchParams?: {
    q?: string;
  };
}) => {
  let pages = await getPublishedPages();

  // If no blogs are published, then display a message??
  // if (pages.length == 0) {
  // return <NoPostSummary />;
  // }

  const content: string = searchParams?.q || "";
  if (content != "") {
    pages = await getPagesByProps(content);
  }

  if (!pages) notFound();

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
        created_at: isoToNormalDate(page.created_time as any),
        updated_at: isoToNormalDate(page.last_edited_time as any),
      } as PostSummary)
  );

  return (
    <Fragment>
      <Heading title="MY DIGITAL GARDEN" />{" "}
      <Search placeholder="🔍 Search this garden 🦗" />
      <Summary summary={garden} />
    </Fragment>
  );
};

export default Page;
