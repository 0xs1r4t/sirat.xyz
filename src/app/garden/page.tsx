import React, { Fragment } from "react";

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getPublishedPages /* getAllPages */,
  getPagesByProps,
  getPagesByTag,
} from "@/lib/notion";
import { isoToNormalDate, isoToShortHandDate } from "@/lib/date";

import Heading from "@/components/Heading";
import Search from "@/components/Garden/Search";
import Summary from "@/components/Garden/Summary";
import NoPostSummary from "@/components/Garden/NoPostSummary";

export const metadata: Metadata = {
  title: "🌐🌼 digital garden",
};

type Props = {
  searchParams: Promise<{ q?: string; tag?: string }>;
};

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;

  let pages = await getPublishedPages();

  if (params?.q) {
    pages = await getPagesByProps(params.q);
  }

  if (params?.tag) {
    pages = await getPagesByTag(params.tag);
  }

  if (pages.length === 0) {
    return (
      <Fragment>
        <Heading title="MY DIGITAL GARDEN" />
        <Search placeholder="🔍 Search this garden 🦗" />
        <NoPostSummary />
      </Fragment>
    );
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
