import { cache } from "react";
import { Client } from "@notionhq/client";
import {
  BlockObjectResponse,
  PageObjectResponse,
  DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const NOTION_API_KEY = process.env.NOTION_SECRET_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

export const notion = new Client({
  auth: NOTION_API_KEY,
});

export const getAllPages = cache(() => {
  return notion.databases
    .query({
      database_id: NOTION_DATABASE_ID!,
    })
    .then((res) => res.results as Array<DatabaseObjectResponse>);
});

export const getPublishedPages = cache(() => {
  return notion.databases
    .query({
      filter: {
        property: "status",
        select: {
          equals: "published",
        },
      },
      database_id: NOTION_DATABASE_ID!,
    })
    .then((res) => res.results as Array<DatabaseObjectResponse>);
});

export const getPageContent = cache((pageId: string) => {
  return notion.blocks.children
    .list({ block_id: pageId })
    .then((res) => res.results as BlockObjectResponse[]);
});

export const getPageBySlug = cache((slug: string) => {
  return notion.databases
    .query({
      filter: {
        property: "slug",
        rich_text: {
          equals: slug,
        },
      },
      database_id: NOTION_DATABASE_ID!,
    })
    .then((res) => res.results[0] as PageObjectResponse);
});

export const searchPageByContent = cache((content: string) => {
  const searchQuery = content.replace(/ /g, "+");
  return notion
    .search({
      query: searchQuery,
      filter: {
        value: "database",
        property: "object",
      },
      sort: {
        direction: "ascending",
        timestamp: "last_edited_time",
      },
    })
    .then((res) => res.results as Array<DatabaseObjectResponse>);
});
