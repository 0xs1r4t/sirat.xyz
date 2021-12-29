import { Client } from "@notionhq/client";
import slugify from "slugify";

import Meta from "@components/layout/Meta";
import Card from "@components/blog/Card";
import Json from "@components/blog/Json";
import Tag from "@components/blog/Tag";
import LinkBtn from "@components/blog/LinkBtn";

import customDate from "@lib/customDate";

const Blogs = ({ blogs, data }) => {
   return (
      <>
         <Meta title="blog" description="a list of my blog posts" />

         <h1>blog.</h1>
         <LinkBtn route="/">go back home!</LinkBtn>

         {blogs.map((blog) => (
            <Card key={blog.id}>
               <h2>{blog.title}</h2>
               <p>{blog.summary}</p>
               <p>created on: {customDate(blog.date)}</p>
               <p>last edited on: {customDate(blog.last_edit)}</p>
               <p>
                  tags:{" "}
                  {blog.tags.map((tag) => (
                     <Tag key={tag}>{tag}</Tag>
                  ))}
               </p>
               <LinkBtn route={`/blog/${slugify(blog.title).toLowerCase()}`}>
                  visit the blog
               </LinkBtn>
            </Card>
         ))}
         <Json>{JSON.stringify(data, null, 2)}</Json>
      </>
   );
};

export const getStaticProps = async () => {
   const notion = new Client({
      auth: process.env.NOTION_SECRET,
   });

   const data = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
   });

   const blogs = data.results.map((blog) => ({
      id: blog.id,
      title: blog.properties.Blogs.title[0].plain_text,
      summary: blog.properties.Summary.rich_text[0].plain_text,
      tags: blog.properties.Tags.multi_select.map((tag) => tag.name),
      date: blog.created_time,
      last_edit: blog.last_edited_time,
   }));

   return {
      props: {
         blogs,
         data,
      },
      revalidate: 10,
   };
};

export default Blogs;
