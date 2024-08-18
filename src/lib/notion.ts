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

// get all pages, whether they are published or not
export const getAllPages = cache(() => {
  return notion.databases
    .query({
      database_id: NOTION_DATABASE_ID!,
    })
    .then((res) => res.results as Array<DatabaseObjectResponse>);
});

// get all published pages
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

// search content by a page's content
// https://developers.notion.com/reference/post-search
// notion searches all parent or child pages and databases that have been shared with an integration.
export const searchPagesByContent = cache((content: string) => {
  return notion
    .search({
      query: content,
      filter: {
        value: "page",
        property: "object",
      },
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    })
    .then((res) => res.results as Array<DatabaseObjectResponse>);
});

// search for pages that are published
// by their title, description, and tags
export const getPagesByProps = cache((q: string) => {
  return notion.databases
    .query({
      // filter_properties: ["title", "description", "tags"],
      filter: {
        or: [
          {
            property: "title",
            title: {
              contains: q,
            },
          },
          {
            property: "description",
            rich_text: {
              contains: q,
            },
          },
          {
            property: "tags",
            multi_select: {
              contains: q,
            },
          },
        ],
        and: [
          {
            property: "status",
            select: {
              equals: "published",
            },
          },
        ],
      },
      sorts: [{ direction: "descending", timestamp: "created_time" }],

      database_id: NOTION_DATABASE_ID!,
    })
    .then((res) => res.results as Array<DatabaseObjectResponse>);
});

// query a page by its slug
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

// get a page's content
export const getPageContent = cache((pageId: string) => {
  return notion.blocks.children
    .list({ block_id: pageId })
    .then((res) => res.results as BlockObjectResponse[]);
});
