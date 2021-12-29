import { Client } from "@notionhq/client";
import slugify from "slugify";

import Meta from "@components/layout/Meta";
import Card from "@components/blog/Card";
import Json from "@components/blog/Json";
import Tag from "@components/blog/Tag";
import LinkBtn from "@components/blog/LinkBtn";

import customDate from "@lib/customDate";

const Blog = ({ blog, text }) => {
   return (
      <>
         <Meta title={blog.title} description={blog.summary} />
         <h1>Blog</h1>
         <LinkBtn route="/blog">Go back !</LinkBtn>
         <h2>Blog Metadata</h2>
         <Card>
            <h2>{blog.title}</h2>
            <p>{blog.summary}</p>
            <p>
               Date: {customDate(blog.date)} (Last Edit: {customDate(blog.last_edit)})
            </p>
            <p>
               tags:{" "}
               {blog.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
               ))}
            </p>
         </Card>
         <Json>{JSON.stringify(blog, null, 2)}</Json>
         <h2>Blog Data</h2>
         <Json>{JSON.stringify(text, null, 2)}</Json>
      </>
   );
};

export const getStaticPaths = async () => {
   const notion = new Client({
      auth: process.env.NOTION_SECRET,
   });

   const data = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
   });

   const paths = [];

   data.results.forEach((result) => {
      if (result.object === "page") {
         paths.push({
            params: {
               slug: slugify(result.properties.Blogs.title[0].plain_text).toLowerCase(),
            },
         });
      }
   });

   return {
      paths,
      fallback: false,
   };
};

export const getStaticProps = async ({ params: { slug } }) => {
   const notion = new Client({
      auth: process.env.NOTION_SECRET,
   });

   const data = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
   });

   // retrieve page data
   const blog = data.results.find((result) => {
      if (result.object === "page") {
         const title = result.properties.Blogs.title[0].plain_text;
         const resultSlug = slugify(title).toLowerCase();
         return resultSlug === slug;
      }
      return false;
   });

   /*
   const blog = await notion.pages.retrieve({
      page_id: id,
   });
   */

   // retreive block data
   const text = await notion.blocks.children.list({
      block_id: blog.id,
      page_size: 50,
   });

   const title = blog.properties.Blogs.title[0].plain_text;
   const summary = blog.properties.Summary.rich_text[0].plain_text;
   const tags = blog.properties.Tags.multi_select.map((tag) => tag.name);
   const date = blog.created_time;
   const last_edit = blog.last_edited_time;

   return {
      props: {
         blog: {
            title,
            summary,
            tags,
            date,
            last_edit,
         },
         text,
      },
      revalidate: 10,
   };
};

export default Blog;
